import { Room, Client } from '@colyseus/core';
import { BattleRoomState, BattleUnitState } from './battle-state';
import { v4 as uuidv4 } from 'uuid';

interface JoinOptions {
  heroInstanceIds: string[];
  team: 'attacker' | 'defender';
}

/**
 * 战斗房间
 */
export class BattleRoom extends Room<BattleRoomState> {
  maxClients = 2; // 1v1 或合作PVE

  // 玩家准备状态
  private playerReady: Map<string, boolean> = new Map();

  onCreate(options: any) {
    console.log('战斗房间创建:', this.roomId);

    this.setState(new BattleRoomState());
    this.state.battleId = uuidv4();
    this.state.maxTurns = options.maxTurns || 30;

    // 处理玩家准备
    this.onMessage('ready', (client) => {
      this.playerReady.set(client.sessionId, true);
      console.log(`玩家 ${client.sessionId} 已准备`);

      // 检查是否所有人都准备了
      if (this.playerReady.size === this.maxClients) {
        this.startBattle();
      }
    });

    // 处理战斗行动
    this.onMessage('action', (client, data: { skillId: string; targetIds: string[] }) => {
      if (this.state.battleStatus !== 'fighting') {
        return;
      }

      // 检查是否轮到该玩家
      if (this.state.currentActorId !== client.sessionId) {
        client.send('error', { message: '还没轮到你' });
        return;
      }

      this.executeAction(client.sessionId, data.skillId, data.targetIds);
    });

    // 处理跳过回合
    this.onMessage('skip', (client) => {
      if (this.state.battleStatus !== 'fighting') {
        return;
      }

      if (this.state.currentActorId !== client.sessionId) {
        return;
      }

      this.nextTurn();
    });
  }

  onJoin(client: Client, options: JoinOptions) {
    console.log(`玩家 ${client.sessionId} 加入战斗`);

    // TODO: 从数据库加载英雄数据，创建战斗单位
    // 这里先用模拟数据
    const unit = new BattleUnitState();
    unit.instanceId = client.sessionId;
    unit.heroId = options.heroInstanceIds[0] || 'hero_001';
    unit.team = options.team || 'attacker';
    unit.position = 1;
    unit.hp = 1000;
    unit.maxHp = 1000;
    unit.atk = 100;
    unit.def = 50;
    unit.spd = 100 + Math.random() * 50; // 随机速度用于测试
    unit.isAlive = true;

    this.state.units.set(client.sessionId, unit);

    // 广播玩家加入
    this.broadcast('playerJoined', {
      sessionId: client.sessionId,
      team: options.team,
    });
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`玩家 ${client.sessionId} 离开战斗`);

    // 标记为掉线
    const unit = this.state.units.get(client.sessionId);
    if (unit) {
      unit.isAlive = false;
    }

    // 广播玩家离开
    this.broadcast('playerLeft', { sessionId: client.sessionId });

    // 如果战斗中有人离开，对方获胜
    if (this.state.battleStatus === 'fighting') {
      const otherPlayer = [...this.state.units.keys()].find(
        (id) => id !== client.sessionId && this.state.units.get(id)?.isAlive
      );

      if (otherPlayer) {
        const winnerTeam = this.state.units.get(otherPlayer)?.team;
        this.endBattle(winnerTeam || 'attacker');
      }
    }
  }

  /**
   * 开始战斗
   */
  private startBattle() {
    console.log('战斗开始');

    this.state.battleStatus = 'fighting';
    this.state.currentTurn = 1;

    // 根据速度排序行动顺序
    const units = Array.from(this.state.units.values());
    units.sort((a, b) => b.spd - a.spd);

    this.state.actionOrder.clear();
    units.forEach((unit) => {
      this.state.actionOrder.push(unit.instanceId);
    });

    // 设置第一个行动单位
    this.state.currentActorId = this.state.actionOrder[0];

    // 广播战斗开始
    this.broadcast('battleStart', {
      turn: 1,
      actionOrder: this.state.actionOrder,
      currentActor: this.state.currentActorId,
    });
  }

  /**
   * 执行行动
   */
  private executeAction(actorId: string, skillId: string, targetIds: string[]) {
    const actor = this.state.units.get(actorId);
    if (!actor || !actor.isAlive) {
      return;
    }

    console.log(`执行行动: ${actorId} 使用 ${skillId} 攻击 ${targetIds.join(',')}`);

    // TODO: 实现实际的技能效果计算
    // 这里简化处理：直接造成伤害
    for (const targetId of targetIds) {
      const target = this.state.units.get(targetId);
      if (target && target.isAlive) {
        // 简化的伤害计算
        const damage = Math.max(1, actor.atk - target.def * 0.5);
        const finalDamage = Math.floor(damage * (0.9 + Math.random() * 0.2));

        target.hp = Math.max(0, target.hp - finalDamage);

        if (target.hp <= 0) {
          target.isAlive = false;
        }

        // 广播伤害结果
        this.broadcast('damage', {
          actorId,
          targetId,
          skillId,
          damage: finalDamage,
          remainingHp: target.hp,
          isDead: !target.isAlive,
        });
      }
    }

    // 检查战斗是否结束
    if (this.checkBattleEnd()) {
      return;
    }

    // 下一个回合
    this.nextTurn();
  }

  /**
   * 下一个回合
   */
  private nextTurn() {
    // 找到下一个存活的单位
    let nextIndex = this.state.actionOrder.indexOf(this.state.currentActorId) + 1;

    // 循环查找
    while (nextIndex < this.state.actionOrder.length) {
      const nextUnitId = this.state.actionOrder[nextIndex];
      const nextUnit = this.state.units.get(nextUnitId);

      if (nextUnit && nextUnit.isAlive) {
        // 更新当前行动单位
        this.state.currentActorId = nextUnitId;

        // 如果回到第一个，回合数+1
        if (nextIndex === 0) {
          this.state.currentTurn++;
        }

        break;
      }

      nextIndex++;

      // 如果到了末尾，从头开始
      if (nextIndex >= this.state.actionOrder.length) {
        nextIndex = 0;
        this.state.currentTurn++;
      }
    }

    // 检查回合数限制
    if (this.state.currentTurn > this.state.maxTurns) {
      // 回合数用尽，防守方获胜
      this.endBattle('defender');
      return;
    }

    // 广播回合更新
    this.broadcast('turnUpdate', {
      turn: this.state.currentTurn,
      currentActor: this.state.currentActorId,
    });
  }

  /**
   * 检查战斗是否结束
   */
  private checkBattleEnd(): boolean {
    const attackerAlive = Array.from(this.state.units.values()).some(
      (u) => u.team === 'attacker' && u.isAlive
    );

    const defenderAlive = Array.from(this.state.units.values()).some(
      (u) => u.team === 'defender' && u.isAlive
    );

    if (!attackerAlive) {
      this.endBattle('defender');
      return true;
    }

    if (!defenderAlive) {
      this.endBattle('attacker');
      return true;
    }

    return false;
  }

  /**
   * 结束战斗
   */
  private endBattle(winner: 'attacker' | 'defender' | 'draw') {
    console.log(`战斗结束，胜者: ${winner}`);

    this.state.battleStatus = 'finished';
    this.state.winner = winner;

    // 广播战斗结束
    this.broadcast('battleEnd', {
      winner,
      turns: this.state.currentTurn,
    });

    // 5秒后自动关闭房间
    setTimeout(() => {
      this.disconnect();
    }, 5000);
  }
}
