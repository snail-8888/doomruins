import { Router, Request, Response } from 'express';
import { HeroService } from '../services/hero.service';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const heroService = new HeroService();

/**
 * GET /api/hero/config
 * 获取所有英雄配置
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const configs = await heroService.getAllHeroConfigs();

    res.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    console.error('获取英雄配置错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取英雄配置失败',
    });
  }
});

/**
 * GET /api/hero/config/:id
 * 获取单个英雄配置
 */
router.get('/config/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await heroService.getHeroConfig(id);

    if (!config) {
      res.status(404).json({
        success: false,
        error: '英雄不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('获取英雄配置错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取英雄配置失败',
    });
  }
});

/**
 * GET /api/hero/list
 * 获取玩家英雄列表
 */
router.get('/list', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    const heroes = await heroService.getPlayerHeroes(uid);

    res.json({
      success: true,
      data: heroes,
    });
  } catch (error) {
    console.error('获取英雄列表错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取英雄列表失败',
    });
  }
});

/**
 * GET /api/hero/:instanceId
 * 获取英雄详情
 */
router.get('/:instanceId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.params;
    const uid = req.user?.uid;

    if (!uid) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    const hero = await heroService.getPlayerHero(uid, instanceId);

    if (!hero) {
      res.status(404).json({
        success: false,
        error: '英雄不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: hero,
    });
  } catch (error) {
    console.error('获取英雄详情错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取英雄详情失败',
    });
  }
});

/**
 * POST /api/hero/summon
 * 召唤英雄（碎片合成）
 */
router.post('/summon', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    const { heroId } = req.body;

    if (!uid) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    if (!heroId) {
      res.status(400).json({
        success: false,
        error: '英雄ID不能为空',
      });
      return;
    }

    const result = await heroService.summonHero(uid, heroId);

    res.json({
      success: true,
      data: result,
      message: '召唤成功',
    });
  } catch (error) {
    console.error('召唤英雄错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '召唤英雄失败',
    });
  }
});

/**
 * POST /api/hero/levelUp
 * 英雄升级
 */
router.post('/levelUp', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    const { instanceId, useItems } = req.body;

    if (!uid) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    const result = await heroService.levelUpHero(uid, instanceId, useItems);

    res.json({
      success: true,
      data: result,
      message: '升级成功',
    });
  } catch (error) {
    console.error('英雄升级错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '英雄升级失败',
    });
  }
});

export default router;
