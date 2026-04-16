import mongoose, { Document, Schema } from 'mongoose';

// 技能类型枚举
export enum SkillType {
  DAMAGE = 'damage',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  CONTROL = 'control',
  SUMMON = 'summon',
}

// 目标类型枚举
export enum TargetType {
  SELF = 'self',
  ENEMY_SINGLE = 'enemy_single',
  ENEMY_ALL = 'enemy_all',
  ENEMY_RANDOM = 'enemy_random',
  ALLY_SINGLE = 'ally_single',
  ALLY_ALL = 'ally_all',
  ALLY_LOWEST_HP = 'ally_lowest_hp',
  ALL = 'all',
}

// 控制效果枚举
export enum ControlType {
  STUN = 'stun',
  SILENCE = 'silence',
  FREEZE = 'freeze',
  POISON = 'poison',
  BURN = 'burn',
  BLEED = 'bleed',
}

// 技能效果值接口
interface ISkillValue {
  base: number;
  coefficient: number;
  formula?: string;
}

// 控制效果接口
interface IControlEffect {
  type: ControlType;
  duration: number;
  chance: number;
}

// Buff效果接口
interface IBuffEffect {
  stat: string;
  value: number;
  percent: number;
  duration: number;
}

// 技能效果接口
interface ISkillEffect {
  type: SkillType;
  target: TargetType;
  value?: ISkillValue;
  control?: IControlEffect;
  buff?: IBuffEffect;
  special?: {
    type: string;
    params: Record<string, unknown>;
  };
}

// 动画配置接口
interface IAnimation {
  cast: string;
  hit: string;
  sound: string;
}

// 触发条件接口
interface ICondition {
  type: string;
  params: Record<string, unknown>;
}

// 技能配置文档接口
export interface ISkillConfig extends Document {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  cooldown: number;
  initialCooldown: number;
  effects: ISkillEffect[];
  animation: IAnimation;
  condition?: ICondition;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 技能配置 Schema
const SkillConfigSchema = new Schema<ISkillConfig>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: Object.values(SkillType), required: true },

    cooldown: { type: Number, default: 0 },
    initialCooldown: { type: Number, default: 0 },

    effects: [
      {
        type: { type: String, enum: Object.values(SkillType), required: true },
        target: { type: String, enum: Object.values(TargetType), required: true },
        value: {
          base: Number,
          coefficient: Number,
          formula: String,
        },
        control: {
          type: { type: String, enum: Object.values(ControlType) },
          duration: Number,
          chance: Number,
        },
        buff: {
          stat: String,
          value: Number,
          percent: Number,
          duration: Number,
        },
        special: {
          type: String,
          params: Schema.Types.Mixed,
        },
      },
    ],

    animation: {
      cast: { type: String, default: '' },
      hit: { type: String, default: '' },
      sound: { type: String, default: '' },
    },

    condition: {
      type: { type: String },
      params: Schema.Types.Mixed,
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'skill_configs',
  }
);

export const SkillConfigModel = mongoose.model<ISkillConfig>('SkillConfig', SkillConfigSchema);
