import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { connectMongoDB } from './config/database';
import { logger } from './utils/logger';

// 路由
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import heroRoutes from './routes/hero.routes';

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/hero', heroRoutes);

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('未处理的错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectMongoDB();

    // 启动 HTTP 服务器
    app.listen(config.server.port, () => {
      logger.info(`🚀 HTTP 服务器运行在 http://localhost:${config.server.port}`);
      logger.info(`🎮 游戏环境: ${config.server.nodeEnv}`);
    });
  } catch (error) {
    logger.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;
