import mongoose, { Document, Schema } from 'mongoose';

export enum SkillType {
  DAMAGE = 'damage', HEAL = 'heal', BUFF = 'buff',
  DEBUFF = 'debuff', CONTROL = 'control', SUMMON = 'summon',
}

export enum TargetType {
  SELF = 'self', ENEMY_SINGLE = 'enemy_single', ENEMY_ALL = 'enemy_all',
  ENEMY_RANDOM = 'enemy_random', ALLY_SINGLE = 'ally_single',
  ALLY_ALL = 'ally_all', ALLY_LOWEST_HP = 'ally_lowest_hp', ALL = 'all',
}

export enum ControlType {
  STUN = 'stun', SILENCE = 'silence', FREEZE = 'freeze',
  POISON = 'poison', BURN = 'burn', BLEED = 'bleed',
}

export interface ISkillConfig extends Document {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  cooldown: number;
  initialCooldown: number;
  effects: [{
    type: SkillType;
    target: TargetType;
    value?: { base: number; coefficient: number; formula?: string };
    control?: { type: ControlType; duration: number; chance: number };
    buff?: { stat: string; value: number; percent: number; duration: number };
  }];
  animation: { cast: string; hit: string; sound: string };
  isActive: boolean;
}

const SkillConfigSchema = new Schema<ISkillConfig>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: Object.values(SkillType), required: true },
    cooldown: { type: Number, default: 0 },
    initialCooldown: { type: Number, default: 0 },
    effects: [{
      type: { type: String, enum: Object.values(SkillType), required: true },
      target: { type: String, enum: Object.values(TargetType), required: true },
      value: { base: Number, coefficient: Number, formula: String },
      control: { type: { type: String, enum: Object.values(ControlType) }, duration: Number, chance: Number },
      buff: { stat: String, value: Number, percent: Number, duration: Number },
    }],
    animation: {
      cast: { type: String, default: '' },
      hit: { type: String, default: '' },
      sound: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'skill_configs' }
);

export const SkillConfigModel = mongoose.model<ISkillConfig>('SkillConfig', SkillConfigSchema);
