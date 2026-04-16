import mongoose, { Document, Schema } from 'mongoose';
import { HeroFaction, HeroClass, HeroQuality } from './hero-config.model';

// 装备槽位
interface IEquipmentSlots {
  weapon: string | null;
  armor: string | null;
  accessory: string | null;
}

// 英雄属性
interface IHeroStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  critDamage: number;
  armorPen: number;
}

// 玩家英雄实例文档接口
export interface IPlayerHero extends Document {
  uid: string;                    // 所属用户ID
  instanceId: string;             // 实例唯一ID
  heroId: string;                 // 英雄配置ID
  level: number;                  // 等级
  star: number;                   // 星级（突破）
  stats: IHeroStats;              // 计算后的属性
  equipment: IEquipmentSlots;     // 装备槽
  skillLevels: number[];          // 技能等级
  exp: number;                    // 经验值
  createdAt: Date;
  updatedAt: Date;
}

// 玩家英雄 Schema
const PlayerHeroSchema = new Schema<IPlayerHero>(
  {
    uid: { type: String, required: true, index: true },
    instanceId: { type: String, required: true, unique: true },
    heroId: { type: String, required: true, index: true },

    level: { type: Number, default: 1 },
    star: { type: Number, default: 0 },

    stats: {
      hp: { type: Number, default: 1000 },
      maxHp: { type: Number, default: 1000 },
      atk: { type: Number, default: 100 },
      def: { type: Number, default: 50 },
      spd: { type: Number, default: 100 },
      critRate: { type: Number, default: 0.05 },
      critDamage: { type: Number, default: 1.5 },
      armorPen: { type: Number, default: 0 },
    },

    equipment: {
      weapon: { type: String, default: null },
      armor: { type: String, default: null },
      accessory: { type: String, default: null },
    },

    skillLevels: [{ type: Number }],

    exp: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'player_heroes',
  }
);

// 创建索引
PlayerHeroSchema.index({ uid: 1, heroId: 1 });

export const PlayerHeroModel = mongoose.model<IPlayerHero>('PlayerHero', PlayerHeroSchema);
