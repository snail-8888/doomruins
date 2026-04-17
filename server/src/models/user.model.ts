import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  nickname: string;
  avatar: string;
  platform: string;
  deviceId: string;
  password?: string;
  currency: {
    gold: number;
    diamond: number;
    beer: number;
    treasureMap: number;
    blackWater: number;
    monthlyCoin: number;
    blackCrystal: number;
  };
  vip: { level: number; exp: number };
  level: number;
  exp: number;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    nickname: { type: String, required: true, maxlength: 20 },
    avatar: { type: String, default: '' },
    platform: { type: String, required: true },
    deviceId: { type: String, required: true },
    password: { type: String },

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
    },

    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'users' }
);

UserSchema.index({ platform: 1, deviceId: 1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);
