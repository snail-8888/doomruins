import mongoose, { Document, Schema } from 'mongoose';

export enum HeroFaction {
  RED = 'red', BLUE = 'blue', GREEN = 'green', YELLOW = 'yellow',
  LIGHT = 'light', DARK = 'dark', GOD = 'god',
}

export enum HeroClass {
  ASSASSIN = 'assassin', MAGE = 'mage', TANK = 'tank',
  WARRIOR = 'warrior', HEALER = 'healer',
}

export enum HeroQuality {
  THREE_STAR = 3, FOUR_STAR = 4, FIVE_STAR = 5,
}

export interface IHeroConfig extends Document {
  id: string;
  name: string;
  faction: HeroFaction;
  heroClass: HeroClass;
  quality: HeroQuality;
  baseStats: {
    hp: number; atk: number; def: number; spd: number;
    critRate: number; critDamage: number; armorPen: number;
  };
  growth: { hp: number; atk: number; def: number; spd: number };
  skills: string[];
  description: string;
  isActive: boolean;
}

const HeroConfigSchema = new Schema<IHeroConfig>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    faction: { type: String, enum: Object.values(HeroFaction), required: true },
    heroClass: { type: String, enum: Object.values(HeroClass), required: true },
    quality: { type: Number, enum: [3, 4, 5], required: true },
    baseStats: {
      hp: { type: Number, default: 1000 }, atk: { type: Number, default: 100 },
      def: { type: Number, default: 50 }, spd: { type: Number, default: 100 },
      critRate: { type: Number, default: 0.05 }, critDamage: { type: Number, default: 1.5 },
      armorPen: { type: Number, default: 0 },
    },
    growth: {
      hp: { type: Number, default: 10 }, atk: { type: Number, default: 2 },
      def: { type: Number, default: 1 }, spd: { type: Number, default: 0.5 },
    },
    skills: [{ type: String }],
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'hero_configs' }
);

HeroConfigSchema.index({ faction: 1, heroClass: 1 });
HeroConfigSchema.index({ quality: 1 });

export const HeroConfigModel = mongoose.model<IHeroConfig>('HeroConfig', HeroConfigSchema);
