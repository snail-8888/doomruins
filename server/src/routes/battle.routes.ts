import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { BattleEngine } from '../battle/battle-engine';
import { StageConfigModel } from '../models/stage-config.model';
import { createEnemyUnits } from '../config/stage-seed';
import { UserModel } from '../models/user.model';

const router = Router();

// ======== PVE 副本 ========

// GET /api/battle/stages - 获取副本列表
router.get('/stages', async (req: Request, res: Response) => {
  try {
    const { chapter, difficulty } = req.query;
    const filter: any = { isActive: true };
    if (chapter) filter.chapter = Number(chapter);
    if (difficulty) filter.difficulty = difficulty;

    const stages = await StageConfigModel.find(filter).sort({ chapter: 1, stage: 1 });
    res.json({ success: true, data: stages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/battle/stages/:id - 获取副本详情
router.get('/stages/:id', async (req: Request, res: Response) => {
  try {
    const stage = await StageConfigModel.findOne({ id: req.params.id, isActive: true });
    if (!stage) { res.status(404).json({ success: false, error: '副本不存在' }); return; }
    res.json({ success: true, data: stage });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/battle/pve/start - 开始PVE战斗
router.post('/pve/start', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { stageId, heroInstanceIds } = req.body;

    if (!stageId || !heroInstanceIds || !Array.isArray(heroInstanceIds)) {
      res.status(400).json({ success: false, error: '参数不完整' });
      return;
    }

    if (heroInstanceIds.length < 1 || heroInstanceIds.length > 6) {
      res.status(400).json({ success: false, error: '英雄数量需在1-6之间' });
      return;
    }

    // 检查副本是否存在
    const stage = await StageConfigModel.findOne({ id: stageId, isActive: true });
    if (!stage) { res.status(404).json({ success: false, error: '副本不存在' }); return; }

    // 创建玩家战斗单位
    const attackerUnits = await BattleEngine.createPlayerUnits(uid, heroInstanceIds, 'attacker');
    if (attackerUnits.length === 0) {
      res.status(400).json({ success: false, error: '没有可用的英雄' });
      return;
    }

    // 创建敌方战斗单位
    const defenderUnits = await createEnemyUnits(stageId);
    if (defenderUnits.length === 0) {
      res.status(400).json({ success: false, error: '副本配置错误' });
      return;
    }

    // 执行战斗
    const engine = new BattleEngine({ maxTurns: 30, battleType: 'pve', stageId, attackerTeam: heroInstanceIds, defenderTeam: defenderUnits });
    const result = await engine.execute(attackerUnits, defenderUnits);

    // 发放奖励（胜利时）
    if (result.winner === 'attacker') {
      await UserModel.updateOne(
        { uid },
        {
          $inc: {
            'currency.gold': stage.rewards.gold,
            exp: stage.rewards.exp,
          },
        }
      );
      result.rewards = {
        exp: stage.rewards.exp,
        gold: stage.rewards.gold,
        items: stage.rewards.items.map(i => ({ id: i.id, name: i.id, count: i.count })),
      };
    }

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('PVE战斗错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/battle/pvp/arena - 竞技场挑战
router.post('/pvp/arena', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { attackerHeroIds, defenderHeroIds } = req.body;

    if (!attackerHeroIds || !defenderHeroIds) {
      res.status(400).json({ success: false, error: '请选择进攻和防守阵容' });
      return;
    }

    // 创建双方战斗单位（简化版：防守方也用玩家自己的英雄模拟）
    const attackerUnits = await BattleEngine.createPlayerUnits(uid, attackerHeroIds, 'attacker');

    // PVP防守方：创建模拟敌人
    const defenderUnits = await BattleEngine.createPlayerUnits(uid, defenderHeroIds, 'defender');

    if (attackerUnits.length === 0 || defenderUnits.length === 0) {
      res.status(400).json({ success: false, error: '阵容不完整' });
      return;
    }

    // 执行战斗
    const engine = new BattleEngine({ maxTurns: 30, battleType: 'pvp_arena', attackerTeam: attackerHeroIds, defenderTeam: defenderUnits });
    const result = await engine.execute(attackerUnits, defenderUnits);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('PVP战斗错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/battle/simulate - 快速模拟战斗（测试用）
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { attackerHeroes, defenderHeroes } = req.body;

    if (!attackerHeroes || !defenderHeroes) {
      res.status(400).json({ success: false, error: '请提供双方阵容' });
      return;
    }

    const { HeroConfigModel } = await import('../models/hero-config.model');
    const { SkillConfigModel } = await import('../models/skill-config.model');

    // 从配置创建战斗单位
    const createUnitsFromConfig = async (heroIds: string[], team: 'attacker' | 'defender') => {
      const units = [];
      for (let i = 0; i < heroIds.length; i++) {
        const config = await HeroConfigModel.findOne({ id: heroIds[i] });
        if (!config) continue;

        const skills = [];
        for (const skillId of config.skills) {
          const skillConfig = await SkillConfigModel.findOne({ id: skillId });
          if (skillConfig) {
            skills.push({
              id: skillConfig.id, name: skillConfig.name,
              currentCooldown: skillConfig.initialCooldown || 0,
              maxCooldown: skillConfig.cooldown || 0,
            });
          }
        }

        units.push({
          instanceId: `${team}_${i + 1}`, heroId: config.id, team, position: i + 1,
          name: config.name, faction: config.faction, heroClass: config.heroClass,
          quality: config.quality, isAlive: true,
          hp: config.baseStats.hp, maxHp: config.baseStats.hp,
          atk: config.baseStats.atk, def: config.baseStats.def, spd: config.baseStats.spd,
          critRate: config.baseStats.critRate, critDamage: config.baseStats.critDamage,
          armorPen: config.baseStats.armorPen,
          skills, statusEffects: [],
        });
      }
      return units;
    };

    const attackerUnits = await createUnitsFromConfig(attackerHeroes, 'attacker');
    const defenderUnits = await createUnitsFromConfig(defenderHeroes, 'defender');

    if (attackerUnits.length === 0 || defenderUnits.length === 0) {
      res.status(400).json({ success: false, error: '阵容配置错误' });
      return;
    }

    const engine = new BattleEngine({ maxTurns: 30, battleType: 'pvp_arena', attackerTeam: attackerHeroes, defenderTeam: defenderUnits });
    const result = await engine.execute(attackerUnits, defenderUnits);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('模拟战斗错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
