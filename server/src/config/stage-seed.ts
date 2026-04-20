import { StageConfigModel, StageDifficulty } from '../models/stage-config.model';
import { HeroConfigModel } from '../models/hero-config.model';
import { BattleUnit } from '../battle/types';

/**
 * 初始化副本配置数据
 */
export async function seedStageConfigs() {
  const count = await StageConfigModel.countDocuments();
  if (count > 0) {
    console.log(`📊 副本配置已存在 (${count}条)，跳过初始化`);
    return;
  }

  const stages = [
    // 第一章：废墟边缘
    {
      id: 'stage_1_1', name: '废墟入口', chapter: 1, stage: 1, difficulty: StageDifficulty.EASY,
      description: '踏入末日废墟的第一步', requiredLevel: 1, staminaCost: 5,
      enemies: [
        { heroId: 'hero_red_3_001', level: 1, position: 1 },
        { heroId: 'hero_blue_3_001', level: 1, position: 2 },
      ],
      rewards: { exp: 80, gold: 150, items: [] },
    },
    {
      id: 'stage_1_2', name: '暗巷伏击', chapter: 1, stage: 2, difficulty: StageDifficulty.EASY,
      description: '暗处传来异响...', requiredLevel: 1, staminaCost: 5,
      enemies: [
        { heroId: 'hero_red_3_001', level: 2, position: 1 },
        { heroId: 'hero_yellow_3_001', level: 2, position: 2 },
        { heroId: 'hero_blue_3_001', level: 2, position: 3 },
      ],
      rewards: { exp: 100, gold: 200, items: [] },
    },
    {
      id: 'stage_1_3', name: '废墟守卫', chapter: 1, stage: 3, difficulty: StageDifficulty.NORMAL,
      description: '精英守卫拦住了去路', requiredLevel: 3, staminaCost: 8,
      enemies: [
        { heroId: 'hero_green_4_001', level: 5, position: 1 },
        { heroId: 'hero_red_3_001', level: 4, position: 2 },
        { heroId: 'hero_blue_3_001', level: 4, position: 3 },
      ],
      rewards: { exp: 150, gold: 300, items: [{ id: 'fragment_red_3', count: 5 }] },
    },
    {
      id: 'stage_1_5', name: '废墟首领·烈焰战神', chapter: 1, stage: 5, difficulty: StageDifficulty.HARD,
      description: '第一章Boss战！', requiredLevel: 5, staminaCost: 10,
      enemies: [
        { heroId: 'hero_red_5_001', level: 8, position: 1 },
        { heroId: 'hero_red_4_001', level: 6, position: 2 },
        { heroId: 'hero_green_4_001', level: 6, position: 3 },
      ],
      rewards: { exp: 300, gold: 500, items: [{ id: 'fragment_red_4', count: 3 }] },
    },

    // 第二章：黑暗深处
    {
      id: 'stage_2_1', name: '地下通道', chapter: 2, stage: 1, difficulty: StageDifficulty.NORMAL,
      description: '黑暗中的通道，危机四伏', requiredLevel: 8, staminaCost: 8,
      enemies: [
        { heroId: 'hero_blue_4_001', level: 8, position: 1 },
        { heroId: 'hero_red_4_001', level: 8, position: 2 },
        { heroId: 'hero_yellow_3_001', level: 7, position: 3 },
      ],
      rewards: { exp: 200, gold: 400, items: [] },
    },
    {
      id: 'stage_2_3', name: '冰封大厅', chapter: 2, stage: 3, difficulty: StageDifficulty.HARD,
      description: '刺骨的寒意中隐藏着强大的敌人', requiredLevel: 12, staminaCost: 10,
      enemies: [
        { heroId: 'hero_blue_5_001', level: 12, position: 1 },
        { heroId: 'hero_blue_4_001', level: 10, position: 2 },
        { heroId: 'hero_green_4_001', level: 10, position: 3 },
      ],
      rewards: { exp: 350, gold: 600, items: [{ id: 'fragment_blue_4', count: 3 }] },
    },
    {
      id: 'stage_2_5', name: '暗影领主降临', chapter: 2, stage: 5, difficulty: StageDifficulty.HELL,
      description: '第二章Boss！暗系力量觉醒', requiredLevel: 15, staminaCost: 12,
      enemies: [
        { heroId: 'hero_dark_5_001', level: 18, position: 1 },
        { heroId: 'hero_blue_4_001', level: 15, position: 2 },
        { heroId: 'hero_red_4_001', level: 15, position: 3 },
        { heroId: 'hero_yellow_3_001', level: 14, position: 4 },
      ],
      rewards: { exp: 500, gold: 800, items: [{ id: 'fragment_dark_5', count: 2 }] },
    },

    // 第三章：光明试炼
    {
      id: 'stage_3_1', name: '圣光走廊', chapter: 3, stage: 1, difficulty: StageDifficulty.HARD,
      description: '光与暗的交界处', requiredLevel: 20, staminaCost: 10,
      enemies: [
        { heroId: 'hero_light_5_001', level: 22, position: 1 },
        { heroId: 'hero_green_5_001', level: 20, position: 2 },
        { heroId: 'hero_yellow_5_001', level: 20, position: 3 },
      ],
      rewards: { exp: 400, gold: 700, items: [{ id: 'fragment_light_5', count: 1 }] },
    },
    {
      id: 'stage_3_5', name: '终焉·创世之神', chapter: 3, stage: 5, difficulty: StageDifficulty.HELL,
      description: '最终Boss！神系力量降临', requiredLevel: 30, staminaCost: 15,
      enemies: [
        { heroId: 'hero_god_5_001', level: 35, position: 1 },
        { heroId: 'hero_dark_5_001', level: 30, position: 2 },
        { heroId: 'hero_light_5_001', level: 30, position: 3 },
        { heroId: 'hero_red_5_002', level: 28, position: 4 },
        { heroId: 'hero_blue_5_001', level: 28, position: 5 },
      ],
      rewards: { exp: 800, gold: 1500, items: [{ id: 'fragment_god_5', count: 1 }] },
    },
  ];

  await StageConfigModel.insertMany(stages);
  console.log(`✅ 初始化 ${stages.length} 个副本关卡`);
}

/**
 * 创建敌人战斗单位（从配置生成）
 */
export async function createEnemyUnits(stageId: string): Promise<BattleUnit[]> {
  const stage = await StageConfigModel.findOne({ id: stageId, isActive: true });
  if (!stage) throw new Error('副本不存在');

  const units: BattleUnit[] = [];

  for (const enemy of stage.enemies) {
    const heroConfig = await HeroConfigModel.findOne({ id: enemy.heroId });
    if (!heroConfig) continue;

    // 根据等级计算属性
    const level = enemy.level;
    const stats = {
      hp: heroConfig.baseStats.hp + heroConfig.growth.hp * (level - 1),
      maxHp: heroConfig.baseStats.hp + heroConfig.growth.hp * (level - 1),
      atk: heroConfig.baseStats.atk + heroConfig.growth.atk * (level - 1),
      def: heroConfig.baseStats.def + heroConfig.growth.def * (level - 1),
      spd: heroConfig.baseStats.spd + heroConfig.growth.spd * (level - 1),
      critRate: heroConfig.baseStats.critRate,
      critDamage: heroConfig.baseStats.critDamage,
      armorPen: heroConfig.baseStats.armorPen,
    };

    // 加载技能
    const skills = [];
    for (const skillId of heroConfig.skills) {
      const { SkillConfigModel } = await import('../models/skill-config.model');
      const skillConfig = await SkillConfigModel.findOne({ id: skillId });
      if (skillConfig) {
        skills.push({
          id: skillConfig.id,
          name: skillConfig.name,
          currentCooldown: skillConfig.initialCooldown || 0,
          maxCooldown: skillConfig.cooldown || 0,
        });
      }
    }

    units.push({
      instanceId: `enemy_${stageId}_${enemy.position}`,
      heroId: enemy.heroId,
      team: 'defender',
      position: enemy.position,
      name: heroConfig.name,
      faction: heroConfig.faction,
      heroClass: heroConfig.heroClass,
      quality: heroConfig.quality,
      isAlive: true,
      ...stats,
      skills,
      statusEffects: [],
    });
  }

  return units;
}
