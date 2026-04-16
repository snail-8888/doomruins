import mongoose, { Document, Schema } from 'mongoose';

// 用户文档接口
export interface IUser extends Document {
  uid: string;
  nickname: string;
  avatar: string;
  account: {
    platform: string;
    deviceId: string;
    lastLogin: Date;
    createdAt: Date;
  };
  currency: {
    gold: number;
    diamond: number;
    beer: number;
    treasureMap: number;
    blackWater: number;
    monthlyCoin: number;
    blackCrystal: number;
  };
  vip: {
    level: number;
    exp: number;
    perks: string[];
  };
  level: number;
  exp: number;
  bagCapacity: {
    heroes: number;
    items: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 用户 Schema
const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    nickname: { type: String, required: true, maxlength: 20 },
    avatar: { type: String, default: '' },

    account: {
      platform: { type: String, required: true },
      deviceId: { type: String, required: true },
      lastLogin: { type: Date, default: Date.now },
      createdAt: { type: Date, default: Date.now },
    },

    currency: {
      gold: { type: Number, default: 10000 },
      diamond: { type: Number, default: 100 },
      beer: { type: Number, default: 0 },
      treasureMap: { type: Number, default: 0 },
      blackWater: { type: Number, default: 0 },
      monthlyCoin: { type: Number, default: 0 },
      blackCrystal: { type: Number, default: 0 },
    },

    vip: {
      level: { type: Number, default: 0 },
      exp: { type: Number, default: 0 },
      perks: [{ type: String }],
    },

    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },

    bagCapacity: {
      heroes: { type: Number, default: 100 },
      items: { type: Number, default: 500 },
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// 创建索引
UserSchema.index({ 'account.platform': 1, 'account.deviceId': 1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);
