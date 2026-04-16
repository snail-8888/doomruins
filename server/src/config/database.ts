import mongoose from 'mongoose';
import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

// MongoDB 连接
export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database.mongodbUri);
    logger.info('✅ MongoDB 连接成功');

    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB 连接错误:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB 连接断开');
    });
  } catch (error) {
    logger.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
};

// Redis 连接
export const createRedisClient = (): Redis => {
  const redis = new Redis(config.database.redisUri);

  redis.on('connect', () => {
    logger.info('✅ Redis 连接成功');
  });

  redis.on('error', (err) => {
    logger.error('Redis 连接错误:', err);
  });

  return redis;
};

// 导出默认的 Redis 客户端
export const redisClient = createRedisClient();
