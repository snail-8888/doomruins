# 末日废墟 - 项目框架

> 跨平台卡牌对战游戏 - 第一阶段开发框架

---

## 📁 项目结构

```
doomruins/
├── server/                 # 后端服务
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # API路由
│   │   ├── services/      # 业务逻辑
│   │   ├── middlewares/   # 中间件
│   │   ├── rooms/         # Colyseus战斗房间
│   │   └── utils/         # 工具类
│   ├── package.json
│   └── tsconfig.json
│
├── admin/                  # 管理后台（Vue3）
│   └── package.json
│
├── client/                 # 客户端（Cocos Creator）
│   └── 见下方说明
│
├── docs/                   # 文档
│
├── docker-compose.yml      # Docker配置
└── README.md
```

---

## 🚀 快速开始

### 1. 环境准备

确保已安装以下工具：

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 20.0.0 | 运行环境 |
| MongoDB | >= 7.0 | 数据库 |
| Redis | >= 7.0 | 缓存服务 |
| Docker | 最新版 | 可选，用于一键启动依赖服务 |

### 2. 启动依赖服务

**方式一：使用 Docker（推荐）**

```bash
cd doomruins
docker-compose up -d mongodb redis
```

**方式二：本地安装**

请自行安装 MongoDB 和 Redis，并确保服务运行中。

### 3. 启动后端服务

```bash
# 进入服务端目录
cd doomruins/server

# 复制环境配置
cp .env.example .env

# 安装依赖
npm install

# 开发模式启动
npm run dev
```

服务启动后：
- HTTP API: http://localhost:3000
- WebSocket (游戏): ws://localhost:2567

### 4. 创建 Cocos Creator 客户端

1. 下载并安装 [Cocos Dashboard](https://www.cocos.com/creator-download)
2. 打开 Cocos Dashboard，安装 Cocos Creator 3.8.x
3. 创建新项目，选择 "Empty(3D)" 模板
4. 项目路径选择 `doomruins/client`

### 5. 客户端目录结构配置

在 Cocos Creator 中创建以下目录结构：

```
assets/
├── scenes/                 # 场景
│   ├── Launch.scene       # 启动场景
│   ├── Login.scene        # 登录场景
│   └── Main.scene         # 主场景
│
├── scripts/
│   ├── core/              # 核心框架
│   │   ├── GameMgr.ts
│   │   ├── EventMgr.ts
│   │   └── NetworkMgr.ts
│   │
│   ├── net/               # 网络模块
│   │   ├── HttpClient.ts
│   │   └── WebSocketClient.ts
│   │
│   ├── model/             # 数据模型
│   │   └── UserModel.ts
│   │
│   └── ui/                # UI脚本
│       ├── login/
│       └── main/
│
└── resources/
    └── configs/           # 配置文件
```

---

## 📡 API 文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/guest | 游客登录 |
| GET | /api/auth/verify | 验证Token |

### 用户接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/user/info | 获取用户信息 |
| PUT | /api/user/nickname | 修改昵称 |
| PUT | /api/user/avatar | 修改头像 |

### 英雄接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/hero/config | 获取所有英雄配置 |
| GET | /api/hero/config/:id | 获取单个英雄配置 |
| GET | /api/hero/list | 获取玩家英雄列表 |
| GET | /api/hero/:instanceId | 获取英雄详情 |
| POST | /api/hero/summon | 召唤英雄 |
| POST | /api/hero/levelUp | 英雄升级 |

---

## 🎮 Colyseus 房间

### 战斗房间 (battle)

**连接地址**: `ws://localhost:2567`

**加入房间**:
```typescript
import { Client } from 'colyseus.js';

const client = new Client('ws://localhost:2567');
const room = await client.joinOrCreate('battle', {
  heroInstanceIds: ['hero_001', 'hero_002'],
  team: 'attacker'
});
```

**房间事件**:
| 事件 | 说明 |
|------|------|
| playerJoined | 玩家加入 |
| playerLeft | 玩家离开 |
| battleStart | 战斗开始 |
| turnUpdate | 回合更新 |
| damage | 伤害事件 |
| battleEnd | 战斗结束 |

---

## 🗄️ 数据库模型

### 用户模型 (User)
- uid: 用户唯一ID
- nickname: 昵称
- currency: 货币信息
- vip: VIP信息
- level: 等级

### 英雄配置 (HeroConfig)
- id: 英雄ID
- name: 英雄名称
- faction: 系别（红/蓝/绿/黄/光/暗/神）
- heroClass: 职业（刺客/法师/坦克/战士/奶妈）
- quality: 品质（3/4/5星）
- baseStats: 基础属性
- growth: 成长系数
- skills: 技能列表

### 技能配置 (SkillConfig)
- id: 技能ID
- name: 技能名称
- type: 技能类型
- effects: 效果列表
- cooldown: 冷却回合

### 玩家英雄 (PlayerHero)
- instanceId: 实例ID
- heroId: 配置ID
- level: 等级
- stats: 当前属性
- equipment: 装备槽

---

## 🔧 开发命令

### 服务端

```bash
npm run dev      # 开发模式（热重载）
npm run build    # 编译生产代码
npm run start    # 生产模式运行
npm run lint     # 代码检查
```

### Docker

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 📋 下一步开发任务

1. **完善客户端框架**
   - 创建核心管理器（GameMgr, EventMgr, NetworkMgr）
   - 实现HTTP和WebSocket网络模块
   - 创建登录场景

2. **完善战斗系统**
   - 实现完整的技能执行逻辑
   - 添加AI控制
   - 实现战斗回放

3. **实现活动系统**
   - 啤酒活动
   - 宝图活动
   - 黑水活动

4. **开发管理后台**
   - 英雄配置管理
   - 技能可视化编辑器
   - 活动配置管理

---

## 📞 技术支持

如有问题，请查看技术方案文档：
- [第一阶段技术方案](./末日废墟_第一阶段技术方案.md)
