/**
 * 回合制战斗引擎
 * 核心战斗逻辑：回合排序、技能选择、效果执行、胜负判定
 */

import { v4 as uuidv4 } from 'uuid';
import {
  BattleUnit, BattleConfig, BattleResult, BattleTurn, BattleAction,
  BattleRewards, SkillEffectConfig, StatusEffectType
} from './types';
import { DamageCalculator } from './damage-calculator';
import { SkillExecutor } from './skill-executor';
import { PlayerHeroModel } from '../models/player-hero.model';
import { HeroConfigModel } from '../models/hero-config.model';
import { SkillConfigModel } from '../models/skill-config.model';

export class BattleEngine {
  private units: BattleUnit[] = [];
  private turns: BattleTurn[] = [];
  private currentTurn = 0;
  private maxTurns: number;
  private battleId: string;
  private startTime: number;
  private skillExecutor!: SkillExecutor;
  private skillCache: Map<string, SkillEffectConfig[]> = new Map();

  constructor(config: BattleConfig) {
    this.maxTurns = config.maxTurns || 30;
    this.battleId = uuidv4();
    this.startTime = Date.now();
  }

  /**
   * 从数据库加载玩家英雄，创建战斗单位
   */
  static async createPlayerUnits(
    uid: string,
    heroInstanceIds: string[],
    team: 'attacker' | 'defender'
  ): Promise<BattleUnit[]> {
    const units: BattleUnit[] = [];

    for (let i = 0; i < heroInstanceIds.length; i++) {
      const instanceId = heroInstanceIds[i];
      const playerHero = await PlayerHeroModel.findOne({ uid, instanceId });
      if (!playerHero) continue;

      const heroConfig = await HeroConfigModel.findOne({ id: playerHero.heroId });
      if (!heroConfig) continue;

      // 加载技能信息
      const skills = [];
      for (const skillId of heroConfig.skills) {
        const skillConfig = await SkillConfigModel.findOne({ id: skillId });
        if (skillConfig) {
          skills.push({
            id: skillConfig.id,
            name: skillConfig.name,
            currentCooldown: skillConfig.initialCooldown || 0,
            maxCooldown: skillConfig.cooldown || 0,
          });
        }
      }

      units.push({
        instanceId: playerHero.instanceId,
        heroId: playerHero.heroId,
        team,
        position: i + 1,
        name: heroConfig.name,
        faction: heroConfig.faction,
        heroClass: heroConfig.heroClass,
        quality: heroConfig.quality,
        isAlive: true,
        hp: playerHero.stats.hp,
        maxHp: playerHero.stats.maxHp,
        atk: playerHero.stats.atk,
        def: playerHero.stats.def,
        spd: playerHero.stats.spd,
        critRate: playerHero.stats.critRate,
        critDamage: playerHero.stats.critDamage,
        armorPen: playerHero.stats.armorPen,
        skills,
        statusEffects: [],
      });
    }

    return units;
  }

  /**
   * 执行完整战斗
   */
  async execute(attackerUnits: BattleUnit[], defenderUnits: BattleUnit[]): Promise<BattleResult> {
    this.units = [...attackerUnits, ...defenderUnits];
    this.skillExecutor = new SkillExecutor(this.units);

    // 预加载技能配置
    await this.preloadSkills();

    // 战斗循环
    while (this.currentTurn < this.maxTurns) {
      this.currentTurn++;
      const turn = this.executeTurn();

      if (turn) {
        this.turns.push(turn);
      }

      // 检查胜负
      const winner = this.checkWinner();
      if (winner) {
        return this.buildResult(winner);
      }
    }

    // 回合用尽，防守方获胜
    return this.buildResult('defender');
  }

  /**
   * 预加载技能配置到缓存
   */
  private async preloadSkills(): Promise<void> {
    const allSkillIds = this.units.flatMap(u => u.skills.map(s => s.id));
    const uniqueIds = [...new Set(allSkillIds)];

    const configs = await SkillConfigModel.find({ id: { $in: uniqueIds } });
    for (const config of configs) {
      this.skillCache.set(config.id, config.effects as SkillEffectConfig[]);
    }
  }

  /**
   * 执行一个回合
   */
  private executeTurn(): BattleTurn | null {
    const actions: BattleAction[] = [];

    // 处理持续伤害
    this.processDoTEffects(actions);

    // 按速度排序
    const sortedUnits = this.getAliveUnits().sort((a, b) => {
      const spdA = DamageCalculator.getEffectiveStat(a, 'spd');
      const spdB = DamageCalculator.getEffectiveStat(b, 'spd');
      if (spdA !== spdB) return spdB - spdA;
      return a.team === 'attacker' ? -1 : 1; // 同速进攻方优先
    });

    // 每个单位行动
    for (const unit of sortedUnits) {
      if (!unit.isAlive) continue;

      const action = this.executeUnitAction(unit);
      if (action) {
        actions.push(action);

        // 检查胜负
        if (this.checkWinner()) break;
      }
    }

    // 回合结束处理
    this.endTurn();

    if (actions.length === 0) return null;

    return { turnNumber: this.currentTurn, actions };
  }

  /**
   * 执行单位行动
   */
  private executeUnitAction(unit: BattleUnit): BattleAction | null {
    const action: BattleAction = {
      turnNumber: this.currentTurn,
      actorId: unit.instanceId,
      actorName: unit.name,
      skillId: '',
      skillName: '',
      targets: [],
    };

    // 检查是否可以行动
    const { canAct, reason } = DamageCalculator.canAct(unit);
    if (!canAct) {
      action.skipped = true;
      action.skipReason = reason;
      return action;
    }

    // 选择技能
    const skill = this.selectSkill(unit);
    if (!skill) {
      action.skipped = true;
      action.skipReason = '无可用技能';
      return action;
    }

    action.skillId = skill.id;
    action.skillName = skill.name;

    // 检查沉默（普通攻击不受沉默影响）
    const { canUse } = DamageCalculator.canUseSkill(unit);
    if (!canUse && skill.maxCooldown > 0) {
      // 被沉默，使用普通攻击
      action.skillId = 'normal_attack';
      action.skillName = '普通攻击';
      action.targets = this.executeNormalAttack(unit);
      return action;
    }

    // 执行技能效果
    const effectConfigs = this.skillCache.get(skill.id);
    if (effectConfigs && effectConfigs.length > 0) {
      action.targets = this.skillExecutor.executeSkill(unit, effectConfigs, this.getAliveUnits());
    } else {
      // 没有配置，使用普通攻击
      action.targets = this.executeNormalAttack(unit);
    }

    // 设置技能冷却
    if (skill.maxCooldown > 0) {
      skill.currentCooldown = skill.maxCooldown;
    }

    return action;
  }

  /**
   * 选择技能（AI逻辑）
   * 优先级：冷却完成的主动技能 > 普通攻击
   */
  private selectSkill(unit: BattleUnit): BattleUnit['skills'][0] | null {
    // 找冷却完成的技能（优先冷却时间长的，即大招优先）
    const availableSkills = unit.skills.filter(
      s => s.currentCooldown <= 0 && s.maxCooldown > 0
    );

    if (availableSkills.length > 0) {
      // 优先使用冷却最长的技能（大招）
      availableSkills.sort((a, b) => b.maxCooldown - a.maxCooldown);
      return availableSkills[0];
    }

    // 使用普通攻击（第一个技能或冷却为0的技能）
    const normalSkill = unit.skills.find(s => s.maxCooldown === 0);
    if (normalSkill) return normalSkill;

    // 所有技能在冷却，使用第一个
    return unit.skills[0] || null;
  }

  /**
   * 普通攻击
   */
  private executeNormalAttack(unit: BattleUnit) {
    const enemies = this.getAliveUnits().filter(u => u.team !== unit.team);
    if (enemies.length === 0) return [];

    const target = enemies[0];
    const dmgResult = DamageCalculator.calcDamage(unit, target, 1.0);
    const killed = DamageCalculator.applyDamage(target, dmgResult.actualDamage);

    return [{
      targetId: target.instanceId,
      targetName: target.name,
      damage: dmgResult.actualDamage,
      isCritical: dmgResult.isCritical,
      killed,
      effects: dmgResult.isCritical ? ['暴击'] : [],
    }];
  }

  /**
   * 处理持续伤害效果
   */
  private processDoTEffects(actions: BattleAction[]): void {
    for (const unit of this.getAliveUnits()) {
      const dotResult = DamageCalculator.processDoT(unit);
      if (dotResult) {
        actions.push({
          turnNumber: this.currentTurn,
          actorId: unit.instanceId,
          actorName: unit.name,
          skillId: 'dot',
          skillName: dotResult.type,
          targets: [{
            targetId: unit.instanceId,
            targetName: unit.name,
            damage: dotResult.damage,
            effects: [dotResult.type],
          }],
        });
      }
    }
  }

  /**
   * 回合结束处理
   */
  private endTurn(): void {
    for (const unit of this.getAliveUnits()) {
      DamageCalculator.tickStatusEffects(unit);
      DamageCalculator.tickSkillCooldowns(unit);
    }
  }

  /**
   * 获取存活单位
   */
  private getAliveUnits(): BattleUnit[] {
    return this.units.filter(u => u.isAlive);
  }

  /**
   * 检查胜负
   */
  private checkWinner(): 'attacker' | 'defender' | null {
    const attackerAlive = this.units.some(u => u.team === 'attacker' && u.isAlive);
    const defenderAlive = this.units.some(u => u.team === 'defender' && u.isAlive);

    if (!attackerAlive) return 'defender';
    if (!defenderAlive) return 'attacker';
    return null;
  }

  /**
   * 构建战斗结果
   */
  private buildResult(winner: 'attacker' | 'defender' | 'draw'): BattleResult {
    return {
      battleId: this.battleId,
      winner,
      totalTurns: this.currentTurn,
      turns: this.turns,
      duration: Date.now() - this.startTime,
    };
  }

  /**
   * 生成PVE奖励
   */
  static generatePVERewards(stageLevel: number): BattleRewards {
    return {
      exp: 50 + stageLevel * 20,
      gold: 100 + stageLevel * 50,
      items: [],
    };
  }
}
