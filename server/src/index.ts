import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { connectMongoDB } from './config/database';
import { seedDatabase } from './config/seed';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import heroRoutes from './routes/hero.routes';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 静态文件（客户端Demo）
app.use(express.static('public'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    game: config.game.name,
    version: '1.0.0',
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/hero', heroRoutes);

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, error: '服务器内部错误' });
});

// 启动服务器
const start = async () => {
  try {
    await connectMongoDB();
    await seedDatabase();

    app.listen(config.server.port, () => {
      console.log('');
      console.log('🎮 ═══════════════════════════════════════');
      console.log(`   ${config.game.name} 服务器已启动`);
      console.log(`   环境: ${config.server.nodeEnv}`);
      console.log(`   HTTP: http://localhost:${config.server.port}`);
      console.log(`   客户端: http://localhost:${config.server.port}/index.html`);
      console.log('🎮 ═══════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
};

start();

export default app;
