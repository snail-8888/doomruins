import mongoose, { Document, Schema } from 'mongoose';

// 副本难度
export enum StageDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  HELL = 'hell',
}

// 副本关卡配置
export interface IStageConfig extends Document {
  id: string;
  name: string;
  chapter: number;         // 章节
  stage: number;           // 关卡号
  difficulty: StageDifficulty;
  description: string;
  requiredLevel: number;   // 最低等级要求

  // 敌方阵容
  enemies: {
    heroId: string;        // 英雄配置ID
    level: number;         // 敌人等级
    position: number;      // 站位1-6
  }[];

  // 奖励
  rewards: {
    exp: number;
    gold: number;
    items: { id: string; count: number }[];
  };

  // 体力消耗
  staminaCost: number;

  isActive: boolean;
}

const StageConfigSchema = new Schema<IStageConfig>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    chapter: { type: Number, required: true },
    stage: { type: Number, required: true },
    difficulty: { type: String, enum: Object.values(StageDifficulty), default: StageDifficulty.NORMAL },
    description: { type: String, default: '' },
    requiredLevel: { type: Number, default: 1 },

    enemies: [{
      heroId: { type: String, required: true },
      level: { type: Number, default: 1 },
      position: { type: Number, default: 1 },
    }],

    rewards: {
      exp: { type: Number, default: 100 },
      gold: { type: Number, default: 200 },
      items: [{ id: String, count: Number }],
    },

    staminaCost: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'stage_configs' }
);

StageConfigSchema.index({ chapter: 1, stage: 1 });

export const StageConfigModel = mongoose.model<IStageConfig>('StageConfig', StageConfigSchema);
