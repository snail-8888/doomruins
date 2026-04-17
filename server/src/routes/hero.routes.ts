import { Router, Request, Response } from 'express';
import { HeroConfigModel } from '../models/hero-config.model';
import { SkillConfigModel } from '../models/skill-config.model';
import { PlayerHeroModel } from '../models/player-hero.model';
import { authMiddleware } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/hero/config - 获取所有英雄配置
router.get('/config', async (req: Request, res: Response) => {
  try {
    const { faction, heroClass, quality } = req.query;
    const filter: any = { isActive: true };
    if (faction) filter.faction = faction;
    if (heroClass) filter.heroClass = heroClass;
    if (quality) filter.quality = Number(quality);

    const configs = await HeroConfigModel.find(filter);
    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/hero/config/:id - 获取单个英雄配置
router.get('/config/:id', async (req: Request, res: Response) => {
  try {
    const config = await HeroConfigModel.findOne({ id: req.params.id, isActive: true });
    if (!config) { res.status(404).json({ success: false, error: '英雄不存在' }); return; }
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/hero/list - 获取玩家英雄列表
router.get('/list', authMiddleware, async (req: Request, res: Response) => {
  try {
    const heroes = await PlayerHeroModel.find({ uid: req.user!.uid });
    res.json({ success: true, data: heroes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/hero/summon - 召唤英雄
router.post('/summon', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { heroId } = req.body;
    if (!heroId) { res.status(400).json({ success: false, error: '英雄ID不能为空' }); return; }

    const config = await HeroConfigModel.findOne({ id: heroId, isActive: true });
    if (!config) { res.status(404).json({ success: false, error: '英雄不存在' }); return; }

    const instanceId = uuidv4();
    const hero = await PlayerHeroModel.create({
      uid: req.user!.uid, instanceId, heroId, level: 1, star: 0,
      stats: {
        hp: config.baseStats.hp, maxHp: config.baseStats.hp,
        atk: config.baseStats.atk, def: config.baseStats.def, spd: config.baseStats.spd,
        critRate: config.baseStats.critRate, critDamage: config.baseStats.critDamage,
        armorPen: config.baseStats.armorPen,
      },
      skillLevels: config.skills.map(() => 1),
      exp: 0,
    });
    res.json({ success: true, data: { instanceId: hero.instanceId, heroId, level: 1 }, message: '召唤成功' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/skill/config - 获取所有技能配置
router.get('/skill/config', async (req: Request, res: Response) => {
  try {
    const configs = await SkillConfigModel.find({ isActive: true });
    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
