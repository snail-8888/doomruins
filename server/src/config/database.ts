import mongoose from 'mongoose';
import { config } from './index';

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database.mongodbUri);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => console.error('MongoDB 错误:', err));
  mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB 断开连接'));
};
