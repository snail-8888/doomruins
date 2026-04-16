# 末日废墟 - 项目启动指南

## ✅ 已创建的项目框架

### 服务端 (Node.js + Colyseus)

```
server/
├── src/
│   ├── config/
│   │   ├── index.ts           # 配置入口
│   │   └── database.ts        # 数据库连接
│   │
│   ├── models/
│   │   ├── user.model.ts      # 用户模型
│   │   ├── hero-config.model.ts   # 英雄配置模型
│   │   ├── skill-config.model.ts  # 技能配置模型
│   │   └── player-hero.model.ts   # 玩家英雄模型
│   │
│   ├── routes/
│   │   ├── auth.routes.ts     # 认证路由
│   │   ├── user.routes.ts     # 用户路由
│   │   └── hero.routes.ts     # 英雄路由
│   │
│   ├── services/
│   │   ├── auth.service.ts    # 认证服务
│   │   ├── user.service.ts    # 用户服务
│   │   └── hero.service.ts    # 英雄服务
│   │
│   ├── middlewares/
│   │   └── auth.ts            # JWT认证中间件
│   │
│   ├── rooms/
│   │   ├── battle-state.ts    # 战斗房间状态
│   │   └── battle-room.ts     # 战斗房间逻辑
│   │
│   ├── utils/
│   │   ├── logger.ts          # 日志工具
│   │   └── auth.ts            # 认证工具
│   │
│   ├── index.ts               # HTTP服务入口
│   └── game-server.ts         # 游戏服务入口
│
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env.example
└── .gitignore
```

### 客户端脚本示例 (Cocos Creator)

```
client-scripts/
├── core/
│   ├── GameMgr.ts             # 游戏管理器
│   └── EventMgr.ts            # 事件管理器
│
├── net/
│   ├── HttpClient.ts          # HTTP客户端
│   └── WebSocketClient.ts     # WebSocket客户端
│
├── model/
│   └── UserModel.ts           # 用户数据模型
│
└── ui/
    └── login/
        └── LoginScene.ts      # 登录场景控制器
```

### 其他配置文件

```
├── docker-compose.yml         # Docker编排
├── admin/package.json         # 管理后台配置
└── README.md                  # 项目说明
```

---

## 🚀 启动步骤

### 第一步：启动数据库服务

```bash
cd /workspace/doomruins
docker-compose up -d mongodb redis
```

### 第二步：安装服务端依赖

```bash
cd /workspace/doomruins/server
npm install
```

### 第三步：配置环境变量

```bash
cp .env.example .env
# 根据需要修改 .env 文件
```

### 第四步：启动服务端

```bash
# 开发模式（HTTP服务）
npm run dev

# 或者启动游戏服务（WebSocket）
# npm run dev -- src/game-server.ts
```

### 第五步：创建 Cocos Creator 项目

1. 打开 Cocos Dashboard
2. 安装 Cocos Creator 3.8.x
3. 创建新项目，选择 "Empty(3D)" 模板
4. 将 `client-scripts/` 目录中的文件复制到项目的 `assets/scripts/` 目录

---

## 📡 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| HTTP API | 3000 | REST API 服务 |
| WebSocket | 2567 | Colyseus 游戏服务 |
| MongoDB | 27017 | 数据库 |
| Redis | 6379 | 缓存服务 |

---

## 🧪 测试接口

### 健康检查
```bash
curl http://localhost:3000/health
```

### 游客登录
```bash
curl -X POST http://localhost:3000/api/auth/guest
```

### 获取用户信息（需要Token）
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/user/info
```

---

## 📋 下一步任务

1. **安装 Colyseus 客户端SDK**
   在 Cocos Creator 项目中：
   ```bash
   npm install colyseus.js
   ```

2. **创建场景**
   - Launch.scene - 启动场景
   - Login.scene - 登录场景
   - Main.scene - 主场景
   - Battle.scene - 战斗场景

3. **完善功能模块**
   - 英雄列表展示
   - 战斗场景实现
   - 技能动画系统

4. **初始化配置数据**
   - 创建英雄配置
   - 创建技能配置
   - 创建初始活动

---

## ⚠️ 注意事项

1. **Colyseus 版本**：服务端使用 0.15.x，客户端需匹配版本
2. **跨域问题**：开发时已配置 CORS，生产环境需调整
3. **Token 存储**：使用 localStorage 存储，注意安全性
4. **微信小程序**：需要适配 localStorage 和 WebSocket

---

## 🔗 相关文档

- [Cocos Creator 官方文档](https://docs.cocos.com/creator/manual/zh/)
- [Colyseus 官方文档](https://docs.colyseus.io/)
- [MongoDB 官方文档](https://www.mongodb.com/docs/)
