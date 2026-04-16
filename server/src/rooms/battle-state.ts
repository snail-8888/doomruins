import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';

/**
 * 战斗单位状态
 */
export class BattleUnitState extends Schema {
  @type('string') instanceId: string = '';
  @type('string') heroId: string = '';
  @type('string') team: string = ''; // 'attacker' | 'defender'
  @type('number') position: number = 0;

  // 当前属性
  @type('number') hp: number = 1000;
  @type('number') maxHp: number = 1000;
  @type('number') atk: number = 100;
  @type('number') def: number = 50;
  @type('number') spd: number = 100;
  @type('number') critRate: number = 0.05;
  @type('number') critDamage: number = 1.5;
  @type('number') armorPen: number = 0;

  // 技能冷却
  @type(['number']) skillCooldowns: ArraySchema<number> = new ArraySchema<number>();

  // 状态效果
  @type({ map: 'number' }) statusEffects: MapSchema<number> = new MapSchema<number>();

  // 是否存活
  @type('boolean') isAlive: boolean = true;
}

/**
 * 战斗行动记录
 */
export class BattleActionState extends Schema {
  @type('string') actorId: string = '';
  @type('string') skillId: string = '';
  @type(['string']) targetIds: ArraySchema<string> = new ArraySchema<string>();
  @type('number') turnNumber: number = 0;
}

/**
 * 战斗房间状态
 */
export class BattleRoomState extends Schema {
  // 战斗ID
  @type('string') battleId: string = '';

  // 当前回合数
  @type('number') currentTurn: number = 0;

  // 最大回合数
  @type('number') maxTurns: number = 30;

  // 当前行动单位
  @type('string') currentActorId: string = '';

  // 战斗单位
  @type({ map: BattleUnitState }) units: MapSchema<BattleUnitState> = new MapSchema<BattleUnitState>();

  // 行动顺序
  @type(['string']) actionOrder: ArraySchema<string> = new ArraySchema<string>();

  // 战斗状态：'waiting' | 'preparing' | 'fighting' | 'finished'
  @type('string') battleStatus: string = 'waiting';

  // 胜者：'attacker' | 'defender' | 'draw' | ''
  @type('string') winner: string = '';
}
