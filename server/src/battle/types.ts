/**
 * 战斗系统 - 核心类型定义
 */

// ===== 战斗单位 =====
export interface BattleUnit {
  instanceId: string;
  heroId: string;
  team: 'attacker' | 'defender';
  position: number;       // 1-6
  name: string;
  faction: string;
  heroClass: string;
  quality: number;
  isAlive: boolean;

  // 当前属性
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  critDamage: number;
  armorPen: number;

  // 技能状态
  skills: BattleSkill[];

  // 状态效果列表
  statusEffects: StatusEffect[];
}

export interface BattleSkill {
  id: string;
  name: string;
  currentCooldown: number;
  maxCooldown: number;
}

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  stat?: string;
  value?: number;
  percent?: number;
  duration: number;      // 剩余回合数
  sourceUnitId: string;
  isDebuff: boolean;
}

export enum StatusEffectType {
  // 控制类
  STUN = 'stun',
  SILENCE = 'silence',
  FREEZE = 'freeze',
  // 持续伤害
  POISON = 'poison',
  BURN = 'burn',
  BLEED = 'bleed',
  // 增益/减益
  BUFF_STAT = 'buff_stat',
  DEBUFF_STAT = 'debuff_stat',
  // 护盾
  SHIELD = 'shield',
  IMMUNE = 'immune',
  // 特殊
  CLEANSE = 'cleanse',
}

// ===== 战斗行动 =====
export interface BattleAction {
  turnNumber: number;
  actorId: string;
  actorName: string;
  skillId: string;
  skillName: string;
  targets: ActionTarget[];
  skipped?: boolean;
  skipReason?: string;
}

export interface ActionTarget {
  targetId: string;
  targetName: string;
  damage?: number;
  heal?: number;
  isCritical?: boolean;
  effects?: string[];
  killed?: boolean;
}

// ===== 战斗回合 =====
export interface BattleTurn {
  turnNumber: number;
  actions: BattleAction[];
}

// ===== 战斗结果 =====
export interface BattleResult {
  battleId: string;
  winner: 'attacker' | 'defender' | 'draw';
  totalTurns: number;
  turns: BattleTurn[];
  rewards?: BattleRewards;
  duration: number; // 毫秒
}

export interface BattleRewards {
  exp: number;
  gold: number;
  items: { id: string; name: string; count: number }[];
}

// ===== 战斗配置 =====
export interface BattleConfig {
  maxTurns: number;
  battleType: 'pve' | 'pvp_arena';
  stageId?: string;       // PVE副本ID
  attackerTeam: string[]; // 英雄instanceId数组
  defenderTeam: BattleUnit[]; // 防守方单位（PVE为怪物，PVP为玩家英雄）
}

// ===== 伤害计算结果 =====
export interface DamageResult {
  damage: number;
  isCritical: boolean;
  isBlocked: boolean;
  blockedAmount: number;
  actualDamage: number;
}

// ===== 技能效果配置（从数据库读取） =====
export interface SkillEffectConfig {
  type: string;
  target: string;
  value?: { base: number; coefficient: number; formula?: string };
  control?: { type: string; duration: number; chance: number };
  buff?: { stat: string; value: number; percent: number; duration: number };
  special?: { type: string; params: any };
}
