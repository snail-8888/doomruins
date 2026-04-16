import { UserModel } from '../models/user.model';

export class UserService {
  /**
   * 获取用户信息
   */
  async getUserInfo(uid: string) {
    const user = await UserModel.findOne({ uid });

    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      uid: user.uid,
      nickname: user.nickname,
      avatar: user.avatar,
      level: user.level,
      exp: user.exp,
      vip: user.vip,
      currency: user.currency,
      bagCapacity: user.bagCapacity,
    };
  }

  /**
   * 修改昵称
   */
  async updateNickname(uid: string, nickname: string) {
    const result = await UserModel.updateOne({ uid }, { nickname });

    if (result.matchedCount === 0) {
      throw new Error('用户不存在');
    }
  }

  /**
   * 修改头像
   */
  async updateAvatar(uid: string, avatar: string) {
    const result = await UserModel.updateOne({ uid }, { avatar });

    if (result.matchedCount === 0) {
      throw new Error('用户不存在');
    }
  }

  /**
   * 更新货币
   */
  async updateCurrency(
    uid: string,
    currency: Partial<{
      gold: number;
      diamond: number;
      beer: number;
      treasureMap: number;
      blackWater: number;
      monthlyCoin: number;
      blackCrystal: number;
    }>
  ) {
    const user = await UserModel.findOne({ uid });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 更新货币
    Object.assign(user.currency, currency);
    await user.save();

    return user.currency;
  }
}
