import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { createServer } from 'http';
import { config } from '../config';
import { connectMongoDB } from '../config/database';
import { logger } from '../utils/logger';
import { BattleRoom } from '../rooms/battle-room';

/**
 * 创建 Colyseus 游戏服务器
 */
const createGameServer = () => {
  // 创建 HTTP 服务器
  const httpServer = createServer();

  // 创建 WebSocket 传输层
  const transport = new WebSocketTransport({
    server: httpServer,
  });

  // 创建 Colyseus 服务器
  const gameServer = new Server({
    transport,
  });

  // 注册房间
  gameServer.define('battle', BattleRoom);

  return { gameServer, httpServer };
};

/**
 * 启动游戏服务器
 */
const startGameServer = async () => {
  try {
    // 连接数据库
    await connectMongoDB();

    const { gameServer, httpServer } = createGameServer();

    // 启动服务器
    gameServer.listen(config.server.gamePort);

    logger.info(`🎮 Colyseus 游戏服务器运行在 ws://localhost:${config.server.gamePort}`);
    logger.info(`📦 可用房间: battle`);
  } catch (error) {
    logger.error('启动游戏服务器失败:', error);
    process.exit(1);
  }
};

startGameServer();
