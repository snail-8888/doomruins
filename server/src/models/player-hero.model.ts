import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayerHero extends Document {
  uid: string;
  instanceId: string;
  heroId: string;
  level: number;
  star: number;
  stats: {
    hp: number; maxHp: number; atk: number; def: number; spd: number;
    critRate: number; critDamage: number; armorPen: number;
  };
  equipment: { weapon: string | null; armor: string | null; accessory: string | null };
  skillLevels: number[];
  exp: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerHeroSchema = new Schema<IPlayerHero>(
  {
    uid: { type: String, required: true, index: true },
    instanceId: { type: String, required: true, unique: true },
    heroId: { type: String, required: true, index: true },
    level: { type: Number, default: 1 },
    star: { type: Number, default: 0 },
    stats: {
      hp: { type: Number, default: 1000 }, maxHp: { type: Number, default: 1000 },
      atk: { type: Number, default: 100 }, def: { type: Number, default: 50 },
      spd: { type: Number, default: 100 }, critRate: { type: Number, default: 0.05 },
      critDamage: { type: Number, default: 1.5 }, armorPen: { type: Number, default: 0 },
    },
    equipment: {
      weapon: { type: String, default: null },
      armor: { type: String, default: null },
      accessory: { type: String, default: null },
    },
    skillLevels: [{ type: Number }],
    exp: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'player_heroes' }
);

PlayerHeroSchema.index({ uid: 1, heroId: 1 });

export const PlayerHeroModel = mongoose.model<IPlayerHero>('PlayerHero', PlayerHeroSchema);
