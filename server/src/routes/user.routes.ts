import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const userService = new UserService();

/**
 * GET /api/user/info
 * 获取用户信息
 */
router.get('/info', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    const user = await userService.getUserInfo(uid);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取用户信息失败',
    });
  }
});

/**
 * PUT /api/user/nickname
 * 修改昵称
 */
router.put('/nickname', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    const { nickname } = req.body;

    if (!uid) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    if (!nickname || nickname.length > 20) {
      res.status(400).json({
        success: false,
        error: '昵称不能为空且不能超过20个字符',
      });
      return;
    }

    await userService.updateNickname(uid, nickname);

    res.json({
      success: true,
      message: '昵称修改成功',
    });
  } catch (error) {
    console.error('修改昵称错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '修改昵称失败',
    });
  }
});

/**
 * PUT /api/user/avatar
 * 修改头像
 */
router.put('/avatar', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    const { avatar } = req.body;

    if (!uid) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    await userService.updateAvatar(uid, avatar);

    res.json({
      success: true,
      message: '头像修改成功',
    });
  } catch (error) {
    console.error('修改头像错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '修改头像失败',
    });
  }
});

export default router;
