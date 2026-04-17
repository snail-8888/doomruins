import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const authService = new AuthService();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { platform, deviceId, nickname, password } = req.body;
    if (!platform || !deviceId) {
      res.status(400).json({ success: false, error: '平台和设备ID不能为空' });
      return;
    }
    const data = await authService.register({ platform, deviceId, nickname, password });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { platform, deviceId, password } = req.body;
    if (!platform || !deviceId) {
      res.status(400).json({ success: false, error: '平台和设备ID不能为空' });
      return;
    }
    const data = await authService.login({ platform, deviceId, password });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/auth/guest
router.post('/guest', async (req: Request, res: Response) => {
  try {
    const data = await authService.guestLogin();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/bind
router.post('/bind', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { platform, deviceId, nickname, password } = req.body;
    const data = await authService.bindAccount(uid, { platform, deviceId, nickname, password });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/auth/verify
router.get('/verify', authMiddleware, (req: Request, res: Response) => {
  res.json({ success: true, data: { uid: req.user!.uid, platform: req.user!.platform } });
});

export default router;
