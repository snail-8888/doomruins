/**
 * WebSocket 客户端 - 基于 Colyseus
 * 用于实时对战通信
 */

import { Client, Room, Schema } from 'colyseus.js';
import { EventMgr, GameEvents } from '../core/EventMgr';

interface RoomOptions {
    heroInstanceIds: string[];
    team: 'attacker' | 'defender';
}

export class WebSocketClient {
    private static _instance: WebSocketClient | null = null;
    private _client: Client | null = null;
    private _currentRoom: Room | null = null;
    private _isConnected: boolean = false;

    public static get instance(): WebSocketClient {
        if (!WebSocketClient._instance) {
            WebSocketClient._instance = new WebSocketClient();
        }
        return WebSocketClient._instance;
    }

    /**
     * 初始化连接
     */
    public init(serverUrl: string): void {
        this._client = new Client(serverUrl);
        console.log('🔌 WebSocket 客户端初始化:', serverUrl);
    }

    /**
     * 加入或创建战斗房间
     */
    public async joinBattleRoom(options: RoomOptions): Promise<Room | null> {
        if (!this._client) {
            console.error('WebSocket 客户端未初始化');
            return null;
        }

        try {
            const room = await this._client.joinOrCreate('battle', options);
            this._currentRoom = room;
            this._isConnected = true;

            // 设置房间事件监听
            this.setupRoomListeners(room);

            console.log('🎮 加入战斗房间成功:', room.id);
            EventMgr.instance.emit(GameEvents.NET_CONNECTED);

            return room;
        } catch (error) {
            console.error('加入战斗房间失败:', error);
            EventMgr.instance.emit(GameEvents.NET_ERROR, error);
            return null;
        }
    }

    /**
     * 设置房间事件监听
     */
    private setupRoomListeners(room: Room): void {
        // 玩家加入
        room.onMessage('playerJoined', (message) => {
            console.log('👤 玩家加入:', message);
        });

        // 玩家离开
        room.onMessage('playerLeft', (message) => {
            console.log('👋 玩家离开:', message);
        });

        // 战斗开始
        room.onMessage('battleStart', (message) => {
            console.log('⚔️ 战斗开始:', message);
            EventMgr.instance.emit(GameEvents.BATTLE_START, message);
        });

        // 回合更新
        room.onMessage('turnUpdate', (message) => {
            console.log('🔄 回合更新:', message);
            EventMgr.instance.emit(GameEvents.BATTLE_TURN, message);
        });

        // 伤害事件
        room.onMessage('damage', (message) => {
            console.log('💥 伤害:', message);
            EventMgr.instance.emit(GameEvents.BATTLE_ACTION, message);
        });

        // 战斗结束
        room.onMessage('battleEnd', (message) => {
            console.log('🏆 战斗结束:', message);
            EventMgr.instance.emit(GameEvents.BATTLE_END, message);
        });

        // 错误
        room.onMessage('error', (message) => {
            console.error('❌ 房间错误:', message);
        });

        // 连接关闭
        room.onLeave((code) => {
            console.log('🚪 离开房间:', code);
            this._isConnected = false;
            EventMgr.instance.emit(GameEvents.NET_DISCONNECTED);
        });

        // 状态变化
        room.onStateChange((state) => {
            // 状态同步处理
            // console.log('📊 状态更新:', state);
        });
    }

    /**
     * 发送准备信号
     */
    public sendReady(): void {
        if (this._currentRoom) {
            this._currentRoom.send('ready');
        }
    }

    /**
     * 发送战斗行动
     */
    public sendAction(skillId: string, targetIds: string[]): void {
        if (this._currentRoom) {
            this._currentRoom.send('action', { skillId, targetIds });
        }
    }

    /**
     * 跳过回合
     */
    public sendSkip(): void {
        if (this._currentRoom) {
            this._currentRoom.send('skip');
        }
    }

    /**
     * 离开房间
     */
    public leaveRoom(): void {
        if (this._currentRoom) {
            this._currentRoom.leave();
            this._currentRoom = null;
        }
    }

    /**
     * 是否已连接
     */
    public get isConnected(): boolean {
        return this._isConnected;
    }

    /**
     * 获取当前房间
     */
    public get currentRoom(): Room | null {
        return this._currentRoom;
    }
}
