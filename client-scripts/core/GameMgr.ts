/**
 * 游戏管理器 - 单例模式
 * 负责游戏的整体生命周期管理
 */

import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameMgr')
export class GameMgr extends Component {
    private static _instance: GameMgr | null = null;

    public static get instance(): GameMgr {
        return GameMgr._instance!;
    }

    onLoad() {
        if (GameMgr._instance) {
            this.node.destroy();
            return;
        }
        GameMgr._instance = this;
        director.addPersistRootNode(this.node);
    }

    start() {
        console.log('🎮 游戏启动');
        this.initGame();
    }

    /**
     * 初始化游戏
     */
    private async initGame() {
        // 1. 初始化网络
        await this.initNetwork();

        // 2. 加载配置
        await this.loadConfigs();

        // 3. 检查登录状态
        await this.checkLogin();

        // 4. 进入游戏
        this.enterGame();
    }

    private async initNetwork() {
        console.log('📡 初始化网络...');
        // 网络初始化逻辑
    }

    private async loadConfigs() {
        console.log('📦 加载配置...');
        // 配置加载逻辑
    }

    private async checkLogin() {
        console.log('🔐 检查登录状态...');
        // 登录检查逻辑
    }

    private enterGame() {
        console.log('🎮 进入游戏');
        // 进入主场景
        director.loadScene('Main');
    }
}
