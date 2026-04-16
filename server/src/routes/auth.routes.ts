import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const authService = new AuthService();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { platform, deviceId, nickname } = req.body;

    if (!platform || !deviceId) {
      res.status(400).json({
        success: false,
        error: '平台和设备ID不能为空',
      });
      return;
    }

    const result = await authService.register({
      platform,
      deviceId,
      nickname: nickname || `玩家${Date.now().toString().slice(-6)}`,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '注册失败',
    });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { platform, deviceId } = req.body;

    if (!platform || !deviceId) {
      res.status(400).json({
        success: false,
        error: '平台和设备ID不能为空',
      });
      return;
    }

    const result = await authService.login({ platform, deviceId });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '登录失败',
    });
  }
});

/**
 * POST /api/auth/guest
 * 游客登录
 */
router.post('/guest', async (req: Request, res: Response) => {
  try {
    const result = await authService.guestLogin();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('游客登录错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '游客登录失败',
    });
  }
});

/**
 * GET /api/auth/verify
 * 验证Token
 */
router.get('/verify', authMiddleware, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      uid: req.user?.uid,
      platform: req.user?.platform,
    },
  });
});

export default router;
