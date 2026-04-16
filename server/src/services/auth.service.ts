import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/user.model';
import { generateToken } from '../utils/auth';

interface RegisterParams {
  platform: string;
  deviceId: string;
  nickname: string;
}

interface LoginParams {
  platform: string;
  deviceId: string;
}

export class AuthService {
  /**
   * 用户注册
   */
  async register(params: RegisterParams) {
    const { platform, deviceId, nickname } = params;

    // 检查是否已存在
    const existingUser = await UserModel.findOne({
      'account.platform': platform,
      'account.deviceId': deviceId,
    });

    if (existingUser) {
      // 如果已存在，直接登录
      return this.login({ platform, deviceId });
    }

    // 创建新用户
    const uid = uuidv4();
    const user = await UserModel.create({
      uid,
      nickname,
      account: {
        platform,
        deviceId,
        lastLogin: new Date(),
        createdAt: new Date(),
      },
    });

    // 生成 Token
    const token = generateToken({ uid, platform });

    return {
      uid,
      nickname: user.nickname,
      token,
      isNewUser: true,
    };
  }

  /**
   * 用户登录
   */
  async login(params: LoginParams) {
    const { platform, deviceId } = params;

    // 查找用户
    const user = await UserModel.findOne({
      'account.platform': platform,
      'account.deviceId': deviceId,
    });

    if (!user) {
      throw new Error('用户不存在，请先注册');
    }

    // 更新最后登录时间
    user.account.lastLogin = new Date();
    await user.save();

    // 生成 Token
    const token = generateToken({ uid: user.uid, platform });

    return {
      uid: user.uid,
      nickname: user.nickname,
      token,
      isNewUser: false,
    };
  }

  /**
   * 游客登录
   */
  async guestLogin() {
    const uid = uuidv4();
    const platform = 'guest';
    const deviceId = `guest_${Date.now()}`;

    // 创建游客用户
    const user = await UserModel.create({
      uid,
      nickname: `游客${uid.slice(0, 6)}`,
      account: {
        platform,
        deviceId,
        lastLogin: new Date(),
        createdAt: new Date(),
      },
    });

    // 生成 Token
    const token = generateToken({ uid, platform });

    return {
      uid,
      nickname: user.nickname,
      token,
      isNewUser: true,
    };
  }
}
