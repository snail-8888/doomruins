import { UserModel } from '../models/user.model';

export class UserService {
  async getUserInfo(uid: string) {
    const user = await UserModel.findOne({ uid });
    if (!user) throw new Error('用户不存在');
    return {
      uid: user.uid, nickname: user.nickname, avatar: user.avatar,
      level: user.level, exp: user.exp, vip: user.vip, currency: user.currency,
    };
  }

  async updateNickname(uid: string, nickname: string) {
    const result = await UserModel.updateOne({ uid }, { nickname });
    if (result.matchedCount === 0) throw new Error('用户不存在');
  }

  async updateAvatar(uid: string, avatar: string) {
    const result = await UserModel.updateOne({ uid }, { avatar });
    if (result.matchedCount === 0) throw new Error('用户不存在');
  }

  async updateCurrency(uid: string, currency: Record<string, number>) {
    const user = await UserModel.findOne({ uid });
    if (!user) throw new Error('用户不存在');
    Object.assign(user.currency, currency);
    await user.save();
    return user.currency;
  }
}
