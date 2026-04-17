import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/user.model';
import { generateToken } from '../utils/auth';

export class AuthService {
  async register(params: { platform: string; deviceId: string; nickname?: string; password?: string }) {
    const { platform, deviceId, nickname, password } = params;

    // 检查是否已存在
    const existing = await UserModel.findOne({ platform, deviceId });
    if (existing) {
      return this.login({ platform, deviceId, password });
    }

    const uid = uuidv4();
    const user = await UserModel.create({
      uid,
      nickname: nickname || `玩家${uid.slice(0, 6)}`,
      platform,
      deviceId,
      password: password || undefined,
      lastLogin: new Date(),
    });

    const token = generateToken({ uid, platform });
    return { uid, nickname: user.nickname, token, isNewUser: true };
  }

  async login(params: { platform: string; deviceId: string; password?: string }) {
    const { platform, deviceId } = params;
    const user = await UserModel.findOne({ platform, deviceId });
    if (!user) throw new Error('用户不存在，请先注册');

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ uid: user.uid, platform });
    return { uid: user.uid, nickname: user.nickname, token, isNewUser: false, level: user.level, currency: user.currency };
  }

  async guestLogin() {
    const uid = uuidv4();
    const user = await UserModel.create({
      uid,
      nickname: `游客${uid.slice(0, 6)}`,
      platform: 'guest',
      deviceId: `guest_${Date.now()}`,
      lastLogin: new Date(),
    });

    const token = generateToken({ uid, platform: 'guest' });
    return { uid, nickname: user.nickname, token, isNewUser: true };
  }

  async bindAccount(uid: string, params: { platform: string; deviceId: string; nickname?: string; password?: string }) {
    const user = await UserModel.findOne({ uid });
    if (!user) throw new Error('用户不存在');

    if (user.platform !== 'guest') throw new Error('仅支持游客账号绑定');

    user.platform = params.platform;
    user.deviceId = params.deviceId;
    if (params.nickname) user.nickname = params.nickname;
    if (params.password) user.password = params.password;
    await user.save();

    const token = generateToken({ uid, platform: params.platform });
    return { uid, nickname: user.nickname, token };
  }
}
