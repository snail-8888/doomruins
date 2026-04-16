import mongoose, { Document, Schema } from 'mongoose';

// 枚举定义
export enum HeroFaction {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  LIGHT = 'light',
  DARK = 'dark',
  GOD = 'god',
}

export enum HeroClass {
  ASSASSIN = 'assassin',
  MAGE = 'mage',
  TANK = 'tank',
  WARRIOR = 'warrior',
  HEALER = 'healer',
}

export enum HeroQuality {
  THREE_STAR = 3,
  FOUR_STAR = 4,
  FIVE_STAR = 5,
}

// 基础属性接口
interface IBaseStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  critDamage: number;
  armorPen: number;
}

// 成长系数接口
interface IGrowth {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

// 外观资源接口
interface IAssets {
  model: string;
  icon: string;
  portrait: string;
}

// 获取方式接口
interface IObtain {
  fragments: number;
  sources: string[];
}

// 英雄配置文档接口
export interface IHeroConfig extends Document {
  id: string;
  name: string;
  faction: HeroFaction;
  heroClass: HeroClass;
  quality: HeroQuality;
  baseStats: IBaseStats;
  growth: IGrowth;
  skills: string[];
  assets: IAssets;
  obtain: IObtain;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 英雄配置 Schema
const HeroConfigSchema = new Schema<IHeroConfig>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    faction: { type: String, enum: Object.values(HeroFaction), required: true },
    heroClass: { type: String, enum: Object.values(HeroClass), required: true },
    quality: { type: Number, enum: [3, 4, 5], required: true },

    baseStats: {
      hp: { type: Number, default: 1000 },
      atk: { type: Number, default: 100 },
      def: { type: Number, default: 50 },
      spd: { type: Number, default: 100 },
      critRate: { type: Number, default: 0.05 },
      critDamage: { type: Number, default: 1.5 },
      armorPen: { type: Number, default: 0 },
    },

    growth: {
      hp: { type: Number, default: 10 },
      atk: { type: Number, default: 2 },
      def: { type: Number, default: 1 },
      spd: { type: Number, default: 0.5 },
    },

    skills: [{ type: String }],

    assets: {
      model: { type: String, default: '' },
      icon: { type: String, default: '' },
      portrait: { type: String, default: '' },
    },

    obtain: {
      fragments: { type: Number, default: 50 },
      sources: [{ type: String }],
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'hero_configs',
  }
);

// 创建索引
HeroConfigSchema.index({ faction: 1, heroClass: 1 });
HeroConfigSchema.index({ quality: 1 });

export const HeroConfigModel = mongoose.model<IHeroConfig>('HeroConfig', HeroConfigSchema);
