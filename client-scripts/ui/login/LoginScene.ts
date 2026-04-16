/**
 * 登录场景控制器
 */

import { _decorator, Component, Node, EditBox, Button, Label, director } from 'cc';
import { HttpClient, ApiPaths } from '../net/HttpClient';
import { UserModel } from '../model/UserModel';
import { EventMgr, GameEvents } from '../core/EventMgr';

const { ccclass, property } = _decorator;

@ccclass('LoginScene')
export class LoginScene extends Component {
    @property(EditBox)
    nicknameInput: EditBox | null = null;

    @property(Button)
    loginBtn: Button | null = null;

    @property(Button)
    guestBtn: Button | null = null;

    @property(Label)
    statusLabel: Label | null = null;

    onLoad() {
        // 初始化 HTTP 客户端
        HttpClient.instance.init('http://localhost:3000');

        // 绑定按钮事件
        this.loginBtn?.node.on(Button.EventType.CLICK, this.onLoginClick, this);
        this.guestBtn?.node.on(Button.EventType.CLICK, this.onGuestClick, this);
    }

    start() {
        // 检查是否已登录
        this.checkAutoLogin();
    }

    /**
     * 检查自动登录
     */
    private async checkAutoLogin() {
        const token = UserModel.instance.token;
        if (token) {
            this.showStatus('正在自动登录...');

            const response = await HttpClient.instance.get(ApiPaths.AUTH_VERIFY);
            if (response.success) {
                this.onLoginSuccess();
            } else {
                this.showStatus('请重新登录');
            }
        }
    }

    /**
     * 登录按钮点击
     */
    private async onLoginClick() {
        this.showStatus('正在登录...');

        // 获取设备信息
        const platform = this.getPlatform();
        const deviceId = this.getDeviceId();

        const response = await HttpClient.instance.post(ApiPaths.AUTH_LOGIN, {
            platform,
            deviceId,
        });

        if (response.success) {
            HttpClient.instance.setToken(response.data!.token);
            UserModel.instance.setInfo(response.data!);
            this.onLoginSuccess();
        } else {
            // 登录失败，尝试注册
            await this.register();
        }
    }

    /**
     * 注册
     */
    private async register() {
        this.showStatus('正在注册...');

        const platform = this.getPlatform();
        const deviceId = this.getDeviceId();
        const nickname = this.nicknameInput?.string || `玩家${Date.now().toString().slice(-6)}`;

        const response = await HttpClient.instance.post(ApiPaths.AUTH_REGISTER, {
            platform,
            deviceId,
            nickname,
        });

        if (response.success) {
            HttpClient.instance.setToken(response.data!.token);
            UserModel.instance.setInfo(response.data!);
            this.onLoginSuccess();
        } else {
            this.showStatus(response.error || '注册失败');
        }
    }

    /**
     * 游客登录按钮点击
     */
    private async onGuestClick() {
        this.showStatus('正在以游客身份登录...');

        const response = await HttpClient.instance.post(ApiPaths.AUTH_GUEST);

        if (response.success) {
            HttpClient.instance.setToken(response.data!.token);
            UserModel.instance.setInfo(response.data!);
            this.onLoginSuccess();
        } else {
            this.showStatus(response.error || '登录失败');
        }
    }

    /**
     * 登录成功
     */
    private onLoginSuccess() {
        this.showStatus('登录成功！');
        EventMgr.instance.emit(GameEvents.USER_LOGIN, UserModel.instance.info);

        // 延迟跳转
        this.scheduleOnce(() => {
            director.loadScene('Main');
        }, 1);
    }

    /**
     * 显示状态
     */
    private showStatus(text: string) {
        if (this.statusLabel) {
            this.statusLabel.string = text;
        }
    }

    /**
     * 获取平台标识
     */
    private getPlatform(): string {
        // 根据运行环境返回平台标识
        // 可根据实际需要扩展
        return 'web';
    }

    /**
     * 获取设备ID
     */
    private getDeviceId(): string {
        let deviceId = sys.localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            sys.localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }
}
