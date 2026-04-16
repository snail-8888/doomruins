import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // 服务器配置
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    gamePort: parseInt(process.env.GAME_PORT || '2567', 10),
  },

  // 数据库配置
  database: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/doomruins',
    redisUri: process.env.REDIS_URI || 'redis://localhost:6379',
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // 游戏配置
  game: {
    name: process.env.GAME_NAME || '末日废墟',
    maxHeroesPerTeam: parseInt(process.env.MAX_HEROES_PER_TEAM || '6', 10),
    maxBattleTurns: parseInt(process.env.MAX_BATTLE_TURNS || '30', 10),
  },
};

export default config;
