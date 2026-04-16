/**
 * HTTP 客户端
 * 封装所有 HTTP 请求
 */

import { sys } from 'cc';

interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}

interface Response<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export class HttpClient {
    private static _instance: HttpClient | null = null;
    private _baseUrl: string = '';
    private _token: string = '';

    public static get instance(): HttpClient {
        if (!HttpClient._instance) {
            HttpClient._instance = new HttpClient();
        }
        return HttpClient._instance;
    }

    /**
     * 初始化
     */
    public init(baseUrl: string): void {
        this._baseUrl = baseUrl;
    }

    /**
     * 设置 Token
     */
    public setToken(token: string): void {
        this._token = token;
        // 保存到本地存储
        sys.localStorage.setItem('token', token);
    }

    /**
     * 获取 Token
     */
    public getToken(): string {
        if (!this._token) {
            this._token = sys.localStorage.getItem('token') || '';
        }
        return this._token;
    }

    /**
     * GET 请求
     */
    public async get<T>(url: string, params?: Record<string, any>): Promise<Response<T>> {
        const fullUrl = this.buildUrl(url, params);
        return this.request<T>(fullUrl, { method: 'GET' });
    }

    /**
     * POST 请求
     */
    public async post<T>(url: string, body?: any): Promise<Response<T>> {
        const fullUrl = this._baseUrl + url;
        return this.request<T>(fullUrl, { method: 'POST', body });
    }

    /**
     * PUT 请求
     */
    public async put<T>(url: string, body?: any): Promise<Response<T>> {
        const fullUrl = this._baseUrl + url;
        return this.request<T>(fullUrl, { method: 'PUT', body });
    }

    /**
     * DELETE 请求
     */
    public async delete<T>(url: string): Promise<Response<T>> {
        const fullUrl = this._baseUrl + url;
        return this.request<T>(fullUrl, { method: 'DELETE' });
    }

    /**
     * 通用请求方法
     */
    private async request<T>(url: string, config: RequestConfig): Promise<Response<T>> {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open(config.method, url, true);
            xhr.timeout = config.timeout || 10000;

            // 设置请求头
            xhr.setRequestHeader('Content-Type', 'application/json');
            if (this._token) {
                xhr.setRequestHeader('Authorization', `Bearer ${this._token}`);
            }

            // 自定义请求头
            if (config.headers) {
                for (const [key, value] of Object.entries(config.headers)) {
                    xhr.setRequestHeader(key, value);
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (error) {
                        resolve({ success: false, error: '响应解析失败' });
                    }
                } else if (xhr.status === 401) {
                    // Token 过期，跳转登录
                    this.handleTokenExpired();
                    resolve({ success: false, error: '登录已过期' });
                } else {
                    resolve({ success: false, error: `请求失败: ${xhr.status}` });
                }
            };

            xhr.onerror = () => {
                resolve({ success: false, error: '网络错误' });
            };

            xhr.ontimeout = () => {
                resolve({ success: false, error: '请求超时' });
            };

            // 发送请求
            if (config.body) {
                xhr.send(JSON.stringify(config.body));
            } else {
                xhr.send();
            }
        });
    }

    /**
     * 构建带参数的 URL
     */
    private buildUrl(url: string, params?: Record<string, any>): string {
        let fullUrl = this._baseUrl + url;
        if (params && Object.keys(params).length > 0) {
            const query = Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            fullUrl += `?${query}`;
        }
        return fullUrl;
    }

    /**
     * 处理 Token 过期
     */
    private handleTokenExpired(): void {
        this._token = '';
        sys.localStorage.removeItem('token');
        // 触发登出事件
        // EventMgr.instance.emit(GameEvents.USER_LOGOUT);
    }
}

// API 路径常量
export const ApiPaths = {
    // 认证
    AUTH_REGISTER: '/api/auth/register',
    AUTH_LOGIN: '/api/auth/login',
    AUTH_GUEST: '/api/auth/guest',
    AUTH_VERIFY: '/api/auth/verify',

    // 用户
    USER_INFO: '/api/user/info',
    USER_NICKNAME: '/api/user/nickname',
    USER_AVATAR: '/api/user/avatar',

    // 英雄
    HERO_CONFIG: '/api/hero/config',
    HERO_LIST: '/api/hero/list',
    HERO_DETAIL: '/api/hero',
    HERO_SUMMON: '/api/hero/summon',
    HERO_LEVEL_UP: '/api/hero/levelUp',
};
