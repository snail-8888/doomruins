/**
 * 事件管理器 - 全局事件系统
 * 用于模块间解耦通信
 */

type EventCallback = (...args: any[]) => void;

interface EventListener {
    callback: EventCallback;
    target: any;
    once: boolean;
}

export class EventMgr {
    private static _instance: EventMgr | null = null;
    private _events: Map<string, EventListener[]> = new Map();

    public static get instance(): EventMgr {
        if (!EventMgr._instance) {
            EventMgr._instance = new EventMgr();
        }
        return EventMgr._instance;
    }

    /**
     * 监听事件
     */
    public on(event: string, callback: EventCallback, target?: any): void {
        this.addListener(event, callback, target, false);
    }

    /**
     * 监听一次
     */
    public once(event: string, callback: EventCallback, target?: any): void {
        this.addListener(event, callback, target, true);
    }

    /**
     * 取消监听
     */
    public off(event: string, callback: EventCallback, target?: any): void {
        const listeners = this._events.get(event);
        if (!listeners) return;

        const index = listeners.findIndex(
            (l) => l.callback === callback && (target === undefined || l.target === target)
        );

        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * 触发事件
     */
    public emit(event: string, ...args: any[]): void {
        const listeners = this._events.get(event);
        if (!listeners || listeners.length === 0) return;

        // 复制一份，防止回调中修改数组
        const copy = [...listeners];

        for (const listener of copy) {
            try {
                listener.callback.call(listener.target, ...args);
            } catch (error) {
                console.error(`事件回调执行错误 [${event}]:`, error);
            }
        }

        // 移除一次性监听
        for (let i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i].once) {
                listeners.splice(i, 1);
            }
        }
    }

    /**
     * 清除所有事件
     */
    public clear(): void {
        this._events.clear();
    }

    private addListener(event: string, callback: EventCallback, target: any, once: boolean): void {
        if (!this._events.has(event)) {
            this._events.set(event, []);
        }

        this._events.get(event)!.push({
            callback,
            target,
            once,
        });
    }
}

// 全局事件常量
export const GameEvents = {
    // 用户事件
    USER_LOGIN: 'user:login',
    USER_LOGOUT: 'user:logout',
    USER_UPDATE: 'user:update',

    // 英雄事件
    HERO_GET: 'hero:get',
    HERO_LEVEL_UP: 'hero:levelUp',
    HERO_EQUIP: 'hero:equip',

    // 战斗事件
    BATTLE_START: 'battle:start',
    BATTLE_TURN: 'battle:turn',
    BATTLE_ACTION: 'battle:action',
    BATTLE_END: 'battle:end',

    // 网络事件
    NET_CONNECTED: 'net:connected',
    NET_DISCONNECTED: 'net:disconnected',
    NET_ERROR: 'net:error',
};
