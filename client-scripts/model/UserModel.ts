/**
 * 用户数据模型
 */

import { sys } from 'cc';

interface UserInfo {
    uid: string;
    nickname: string;
    avatar: string;
    level: number;
    exp: number;
    vip: {
        level: number;
        exp: number;
        perks: string[];
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
}

export class UserModel {
    private static _instance: UserModel | null = null;

    private _info: UserInfo | null = null;
    private _token: string = '';

    public static get instance(): UserModel {
        if (!UserModel._instance) {
            UserModel._instance = new UserModel();
        }
        return UserModel._instance;
    }

    /**
     * 获取用户信息
     */
    public get info(): UserInfo | null {
        return this._info;
    }

    /**
     * 设置用户信息
     */
    public setInfo(info: UserInfo): void {
        this._info = info;
    }

    /**
     * 获取 Token
     */
    public get token(): string {
        if (!this._token) {
            this._token = sys.localStorage.getItem('token') || '';
        }
        return this._token;
    }

    /**
     * 设置 Token
     */
    public setToken(token: string): void {
        this._token = token;
        sys.localStorage.setItem('token', token);
    }

    /**
     * 清除用户数据
     */
    public clear(): void {
        this._info = null;
        this._token = '';
        sys.localStorage.removeItem('token');
    }

    /**
     * 是否已登录
     */
    public get isLogin(): boolean {
        return !!this._info && !!this._token;
    }

    /**
     * 更新货币
     */
    public updateCurrency(currency: Partial<UserInfo['currency']>): void {
        if (this._info) {
            Object.assign(this._info.currency, currency);
        }
    }

    /**
     * 更新等级
     */
    public updateLevel(level: number, exp: number): void {
        if (this._info) {
            this._info.level = level;
            this._info.exp = exp;
        }
    }
}
