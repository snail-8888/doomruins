import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const userService = new UserService();

// GET /api/user/info
router.get('/info', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = await userService.getUserInfo(req.user!.uid);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// PUT /api/user/nickname
router.put('/nickname', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { nickname } = req.body;
    if (!nickname || nickname.length > 20) {
      res.status(400).json({ success: false, error: '昵称不能为空且不超过20字符' });
      return;
    }
    await userService.updateNickname(req.user!.uid, nickname);
    res.json({ success: true, message: '昵称修改成功' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
