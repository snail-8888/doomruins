import mongoose from 'mongoose';
import { HeroConfigModel, HeroFaction, HeroClass, HeroQuality } from '../models/hero-config.model';
import { SkillConfigModel, SkillType, TargetType, ControlType } from '../models/skill-config.model';

/**
 * 初始化英雄配置数据
 */
async function seedHeroConfigs() {
  const count = await HeroConfigModel.countDocuments();
  if (count > 0) {
    console.log(`📊 英雄配置已存在 (${count}条)，跳过初始化`);
    return;
  }

  const heroes = [
    // ===== 五星英雄 =====
    { id: 'hero_red_5_001', name: '烈焰战神', faction: HeroFaction.RED, heroClass: HeroClass.WARRIOR, quality: HeroQuality.FIVE_STAR,
      baseStats: { hp: 12000, atk: 850, def: 600, spd: 115, critRate: 0.15, critDamage: 1.8, armorPen: 0.1 },
      growth: { hp: 120, atk: 17, def: 12, spd: 0.6 }, skills: ['skill_fire_slash', 'skill_battle_cry', 'skill_flame_shield'], description: '红系五星战士，擅长近战输出' },

    { id: 'hero_blue_5_001', name: '寒冰法师', faction: HeroFaction.BLUE, heroClass: HeroClass.MAGE, quality: HeroQuality.FIVE_STAR,
      baseStats: { hp: 8000, atk: 1100, def: 350, spd: 108, critRate: 0.12, critDamage: 2.0, armorPen: 0.15 },
      growth: { hp: 80, atk: 22, def: 7, spd: 0.5 }, skills: ['skill_ice_storm', 'skill_frost_nova', 'skill_blizzard'], description: '蓝系五星法师，群体控制输出' },

    { id: 'hero_green_5_001', name: '生命守护', faction: HeroFaction.GREEN, heroClass: HeroClass.HEALER, quality: HeroQuality.FIVE_STAR,
      baseStats: { hp: 10000, atk: 600, def: 550, spd: 120, critRate: 0.08, critDamage: 1.5, armorPen: 0 },
      growth: { hp: 100, atk: 12, def: 11, spd: 0.7 }, skills: ['skill_heal_all', 'skill_purify', 'skill_nature_blessing'], description: '绿系五星奶妈，强力治疗' },

    { id: 'hero_yellow_5_001', name: '雷电刺客', faction: HeroFaction.YELLOW, heroClass: HeroClass.ASSASSIN, quality: HeroQuality.FIVE_STAR,
      baseStats: { hp: 7500, atk: 1200, def: 300, spd: 140, critRate: 0.25, critDamage: 2.2, armorPen: 0.2 },
      growth: { hp: 75, atk: 24, def: 6, spd: 0.8 }, skills: ['skill_thunder_strike', 'skill_shadow_step', 'skill_lightning_blade'], description: '黄系五星刺客，高暴击单体输出' },

    { id: 'hero_red_5_002', name: '熔岩巨兽', faction: HeroFaction.RED, heroClass: HeroClass.TANK, quality: HeroQuality.FIVE_STAR,
      baseStats: { hp: 18000, atk: 500, def: 900, spd: 85, critRate: 0.05, critDamage: 1.5, armorPen: 0 },
      growth: { hp: 180, atk: 10, def: 18, spd: 0.3 }, skills: ['skill_lava_armor', 'skill_volcano_shield', 'skill_magma_slam'], description: '红系五星坦克，超强防御' },

    // ===== 光/暗/神特殊系 =====
    { id: 'hero_light_5_001', name: '圣光天使', faction: HeroFaction.LIGHT, heroClass: HeroClass.HEALER, quality: HeroQuality.FIVE_STAR,
      baseStats: { hp: 11000, atk: 750, def: 600, spd: 125, critRate: 0.1, critDamage: 1.6, armorPen: 0 },
      growth: { hp: 110, atk: 15, def: 12, spd: 0.7 }, skills: ['skill_holy_light', 'skill_resurrection', 'skill_divine_shield'], description: '光系五星奶妈，复活技能' },

    { id: 'hero_dark_5_001', name: '暗影领主', faction: HeroFaction.DARK, heroClass: HeroClass.MAGE, quality: HeroQuality.FIVE_STAR,
      baseStats: { hp: 9000, atk: 1300, def: 400, spd: 118, critRate: 0.18, critDamage: 2.1, armorPen: 0.2 },
      growth: { hp: 90, atk: 26, def: 8, spd: 0.6 }, skills: ['skill_dark_bolt', 'skill_shadow_curse', 'skill_void_explosion'], description: '暗系五星法师，强力单体输出' },

    { id: 'hero_god_5_001', name: '创世之神', faction: HeroFaction.GOD, heroClass: HeroClass.WARRIOR, quality: HeroQuality.FIVE_STAR,
      baseStats: { hp: 15000, atk: 1100, def: 700, spd: 130, critRate: 0.2, critDamage: 2.0, armorPen: 0.15 },
      growth: { hp: 150, atk: 22, def: 14, spd: 0.7 }, skills: ['skill_creation_slash', 'skill_apocalypse', 'skill_god_fury'], description: '神系五星战士，最强英雄' },

    // ===== 四星英雄 =====
    { id: 'hero_red_4_001', name: '火焰战士', faction: HeroFaction.RED, heroClass: HeroClass.WARRIOR, quality: HeroQuality.FOUR_STAR,
      baseStats: { hp: 8000, atk: 550, def: 400, spd: 100, critRate: 0.1, critDamage: 1.6, armorPen: 0.05 },
      growth: { hp: 80, atk: 11, def: 8, spd: 0.5 }, skills: ['skill_fire_slash', 'skill_battle_cry'], description: '红系四星战士' },

    { id: 'hero_blue_4_001', name: '冰霜法师', faction: HeroFaction.BLUE, heroClass: HeroClass.MAGE, quality: HeroQuality.FOUR_STAR,
      baseStats: { hp: 6000, atk: 700, def: 250, spd: 95, critRate: 0.08, critDamage: 1.7, armorPen: 0.1 },
      growth: { hp: 60, atk: 14, def: 5, spd: 0.4 }, skills: ['skill_ice_storm', 'skill_frost_nova'], description: '蓝系四星法师' },

    { id: 'hero_green_4_001', name: '森林守卫', faction: HeroFaction.GREEN, heroClass: HeroClass.TANK, quality: HeroQuality.FOUR_STAR,
      baseStats: { hp: 12000, atk: 350, def: 650, spd: 80, critRate: 0.05, critDamage: 1.5, armorPen: 0 },
      growth: { hp: 120, atk: 7, def: 13, spd: 0.3 }, skills: ['skill_nature_blessing', 'skill_thorn_armor'], description: '绿系四星坦克' },

    // ===== 三星英雄 =====
    { id: 'hero_red_3_001', name: '新手战士', faction: HeroFaction.RED, heroClass: HeroClass.WARRIOR, quality: HeroQuality.THREE_STAR,
      baseStats: { hp: 5000, atk: 350, def: 250, spd: 90, critRate: 0.05, critDamage: 1.5, armorPen: 0 },
      growth: { hp: 50, atk: 7, def: 5, spd: 0.4 }, skills: ['skill_fire_slash'], description: '红系三星战士' },

    { id: 'hero_blue_3_001', name: '学徒法师', faction: HeroFaction.BLUE, heroClass: HeroClass.MAGE, quality: HeroQuality.THREE_STAR,
      baseStats: { hp: 4000, atk: 450, def: 180, spd: 88, critRate: 0.05, critDamage: 1.5, armorPen: 0.05 },
      growth: { hp: 40, atk: 9, def: 3, spd: 0.4 }, skills: ['skill_ice_storm'], description: '蓝系三星法师' },

    { id: 'hero_yellow_3_001', name: '猎手', faction: HeroFaction.YELLOW, heroClass: HeroClass.ASSASSIN, quality: HeroQuality.THREE_STAR,
      baseStats: { hp: 3500, atk: 500, def: 150, spd: 110, critRate: 0.12, critDamage: 1.7, armorPen: 0.08 },
      growth: { hp: 35, atk: 10, def: 3, spd: 0.5 }, skills: ['skill_thunder_strike'], description: '黄系三星刺客' },
  ];

  await HeroConfigModel.insertMany(heroes);
  console.log(`✅ 初始化 ${heroes.length} 个英雄配置`);
}

/**
 * 初始化技能配置数据
 */
async function seedSkillConfigs() {
  const count = await SkillConfigModel.countDocuments();
  if (count > 0) {
    console.log(`📊 技能配置已存在 (${count}条)，跳过初始化`);
    return;
  }

  const skills = [
    // 战士技能
    { id: 'skill_fire_slash', name: '烈焰斩', description: '对敌方单体造成150%攻击力的火焰伤害',
      type: SkillType.DAMAGE, cooldown: 0, initialCooldown: 0,
      effects: [{ type: SkillType.DAMAGE, target: TargetType.ENEMY_SINGLE, value: { base: 0, coefficient: 1.5 } }],
      animation: { cast: 'slash_cast', hit: 'fire_hit', sound: 'slash_sound' } },

    { id: 'skill_battle_cry', name: '战吼', description: '提升己方全体攻击力20%，持续3回合',
      type: SkillType.BUFF, cooldown: 3, initialCooldown: 0,
      effects: [{ type: SkillType.BUFF, target: TargetType.ALLY_ALL, buff: { stat: 'atk', value: 0, percent: 0.2, duration: 3 } }],
      animation: { cast: 'buff_cast', hit: 'buff_hit', sound: 'buff_sound' } },

    { id: 'skill_flame_shield', name: '炎盾', description: '为自身添加护盾，吸收30%最大生命值伤害，持续2回合',
      type: SkillType.BUFF, cooldown: 4, initialCooldown: 0,
      effects: [{ type: SkillType.BUFF, target: TargetType.SELF, buff: { stat: 'shield', value: 0, percent: 0.3, duration: 2 } }],
      animation: { cast: 'shield_cast', hit: 'shield_hit', sound: 'shield_sound' } },

    // 法师技能
    { id: 'skill_ice_storm', name: '冰暴', description: '对敌方全体造成100%攻击力的冰霜伤害',
      type: SkillType.DAMAGE, cooldown: 2, initialCooldown: 0,
      effects: [{ type: SkillType.DAMAGE, target: TargetType.ENEMY_ALL, value: { base: 0, coefficient: 1.0 } }],
      animation: { cast: 'ice_cast', hit: 'ice_hit', sound: 'ice_sound' } },

    { id: 'skill_frost_nova', name: '霜冻新星', description: '对敌方单体造成120%攻击力伤害，25%概率冰冻1回合',
      type: SkillType.DAMAGE, cooldown: 3, initialCooldown: 0,
      effects: [
        { type: SkillType.DAMAGE, target: TargetType.ENEMY_SINGLE, value: { base: 0, coefficient: 1.2 } },
        { type: SkillType.CONTROL, target: TargetType.ENEMY_SINGLE, control: { type: ControlType.FREEZE, duration: 1, chance: 0.25 } },
      ],
      animation: { cast: 'frost_cast', hit: 'frost_hit', sound: 'frost_sound' } },

    { id: 'skill_blizzard', name: '暴风雪', description: '对敌方全体造成130%攻击力伤害，15%概率冰冻1回合',
      type: SkillType.DAMAGE, cooldown: 5, initialCooldown: 2,
      effects: [
        { type: SkillType.DAMAGE, target: TargetType.ENEMY_ALL, value: { base: 0, coefficient: 1.3 } },
        { type: SkillType.CONTROL, target: TargetType.ENEMY_ALL, control: { type: ControlType.FREEZE, duration: 1, chance: 0.15 } },
      ],
      animation: { cast: 'blizzard_cast', hit: 'blizzard_hit', sound: 'blizzard_sound' } },

    // 刺客技能
    { id: 'skill_thunder_strike', name: '雷霆一击', description: '对敌方单体造成180%攻击力伤害，暴击率额外增加20%',
      type: SkillType.DAMAGE, cooldown: 2, initialCooldown: 0,
      effects: [{ type: SkillType.DAMAGE, target: TargetType.ENEMY_SINGLE, value: { base: 0, coefficient: 1.8, formula: 'atk * 1.8 * (1 + critRate + 0.2)' } }],
      animation: { cast: 'thunder_cast', hit: 'thunder_hit', sound: 'thunder_sound' } },

    { id: 'skill_shadow_step', name: '暗影步', description: '闪避下次攻击，并提升自身速度30%持续2回合',
      type: SkillType.BUFF, cooldown: 4, initialCooldown: 0,
      effects: [{ type: SkillType.BUFF, target: TargetType.SELF, buff: { stat: 'spd', value: 0, percent: 0.3, duration: 2 } }],
      animation: { cast: 'shadow_cast', hit: 'shadow_hit', sound: 'shadow_sound' } },

    { id: 'skill_lightning_blade', name: '闪电刃', description: '对敌方随机3个目标各造成120%攻击力伤害',
      type: SkillType.DAMAGE, cooldown: 3, initialCooldown: 1,
      effects: [{ type: SkillType.DAMAGE, target: TargetType.ENEMY_RANDOM, value: { base: 0, coefficient: 1.2 } }],
      animation: { cast: 'lightning_cast', hit: 'lightning_hit', sound: 'lightning_sound' } },

    // 奶妈技能
    { id: 'skill_heal_all', name: '群体治疗', description: '恢复己方全体25%攻击力的生命值',
      type: SkillType.HEAL, cooldown: 2, initialCooldown: 0,
      effects: [{ type: SkillType.HEAL, target: TargetType.ALLY_ALL, value: { base: 0, coefficient: 0.25, formula: 'atk * 0.25' } }],
      animation: { cast: 'heal_cast', hit: 'heal_hit', sound: 'heal_sound' } },

    { id: 'skill_purify', name: '净化', description: '清除己方单体所有负面效果',
      type: SkillType.BUFF, cooldown: 3, initialCooldown: 0,
      effects: [{ type: SkillType.BUFF, target: TargetType.ALLY_SINGLE, buff: { stat: 'cleanse', value: 0, percent: 0, duration: 0 } }],
      animation: { cast: 'purify_cast', hit: 'purify_hit', sound: 'purify_sound' } },

    { id: 'skill_nature_blessing', name: '自然祝福', description: '恢复己方血量最低单位40%攻击力的生命值',
      type: SkillType.HEAL, cooldown: 1, initialCooldown: 0,
      effects: [{ type: SkillType.HEAL, target: TargetType.ALLY_LOWEST_HP, value: { base: 0, coefficient: 0.4 } }],
      animation: { cast: 'nature_cast', hit: 'nature_hit', sound: 'nature_sound' } },

    // 坦克技能
    { id: 'skill_lava_armor', name: '熔岩铠甲', description: '提升自身防御40%持续3回合',
      type: SkillType.BUFF, cooldown: 3, initialCooldown: 0,
      effects: [{ type: SkillType.BUFF, target: TargetType.SELF, buff: { stat: 'def', value: 0, percent: 0.4, duration: 3 } }],
      animation: { cast: 'armor_cast', hit: 'armor_hit', sound: 'armor_sound' } },

    { id: 'skill_volcano_shield', name: '火山之盾', description: '为己方全体添加护盾，吸收15%最大生命值伤害',
      type: SkillType.BUFF, cooldown: 4, initialCooldown: 1,
      effects: [{ type: SkillType.BUFF, target: TargetType.ALLY_ALL, buff: { stat: 'shield', value: 0, percent: 0.15, duration: 2 } }],
      animation: { cast: 'v_shield_cast', hit: 'v_shield_hit', sound: 'v_shield_sound' } },

    { id: 'skill_magma_slam', name: '岩浆猛击', description: '对敌方全体造成80%攻击力伤害',
      type: SkillType.DAMAGE, cooldown: 3, initialCooldown: 0,
      effects: [{ type: SkillType.DAMAGE, target: TargetType.ENEMY_ALL, value: { base: 0, coefficient: 0.8 } }],
      animation: { cast: 'magma_cast', hit: 'magma_hit', sound: 'magma_sound' } },

    // 光系技能
    { id: 'skill_holy_light', name: '圣光', description: '恢复己方全体30%攻击力的生命值',
      type: SkillType.HEAL, cooldown: 2, initialCooldown: 0,
      effects: [{ type: SkillType.HEAL, target: TargetType.ALLY_ALL, value: { base: 0, coefficient: 0.3 } }],
      animation: { cast: 'holy_cast', hit: 'holy_hit', sound: 'holy_sound' } },

    { id: 'skill_resurrection', name: '复活', description: '复活己方已阵亡英雄，恢复30%生命值',
      type: SkillType.HEAL, cooldown: 6, initialCooldown: 3,
      effects: [{ type: SkillType.HEAL, target: TargetType.ALLY_SINGLE, value: { base: 0, coefficient: 0.3, formula: 'maxHp * 0.3' } }],
      animation: { cast: 'res_cast', hit: 'res_hit', sound: 'res_sound' } },

    { id: 'skill_divine_shield', name: '神圣护盾', description: '为己方全体添加免疫1次伤害的护盾',
      type: SkillType.BUFF, cooldown: 5, initialCooldown: 2,
      effects: [{ type: SkillType.BUFF, target: TargetType.ALLY_ALL, buff: { stat: 'immune', value: 1, percent: 0, duration: 2 } }],
      animation: { cast: 'divine_cast', hit: 'divine_hit', sound: 'divine_sound' } },

    // 暗系技能
    { id: 'skill_dark_bolt', name: '暗影弹', description: '对敌方单体造成160%攻击力的暗影伤害',
      type: SkillType.DAMAGE, cooldown: 0, initialCooldown: 0,
      effects: [{ type: SkillType.DAMAGE, target: TargetType.ENEMY_SINGLE, value: { base: 0, coefficient: 1.6 } }],
      animation: { cast: 'dark_cast', hit: 'dark_hit', sound: 'dark_sound' } },

    { id: 'skill_shadow_curse', name: '暗影诅咒', description: '对敌方单体造成100%攻击力伤害，沉默2回合',
      type: SkillType.DAMAGE, cooldown: 3, initialCooldown: 0,
      effects: [
        { type: SkillType.DAMAGE, target: TargetType.ENEMY_SINGLE, value: { base: 0, coefficient: 1.0 } },
        { type: SkillType.CONTROL, target: TargetType.ENEMY_SINGLE, control: { type: ControlType.SILENCE, duration: 2, chance: 0.8 } },
      ],
      animation: { cast: 'curse_cast', hit: 'curse_hit', sound: 'curse_sound' } },

    { id: 'skill_void_explosion', name: '虚空爆炸', description: '对敌方全体造成140%攻击力伤害',
      type: SkillType.DAMAGE, cooldown: 5, initialCooldown: 2,
      effects: [{ type: SkillType.DAMAGE, target: TargetType.ENEMY_ALL, value: { base: 0, coefficient: 1.4 } }],
      animation: { cast: 'void_cast', hit: 'void_hit', sound: 'void_sound' } },

    // 神系技能
    { id: 'skill_creation_slash', name: '创世斩', description: '对敌方单体造成200%攻击力伤害',
      type: SkillType.DAMAGE, cooldown: 1, initialCooldown: 0,
      effects: [{ type: SkillType.DAMAGE, target: TargetType.ENEMY_SINGLE, value: { base: 0, coefficient: 2.0 } }],
      animation: { cast: 'creation_cast', hit: 'creation_hit', sound: 'creation_sound' } },

    { id: 'skill_apocalypse', name: '天启', description: '对敌方全体造成150%攻击力伤害，20%概率晕眩1回合',
      type: SkillType.DAMAGE, cooldown: 5, initialCooldown: 2,
      effects: [
        { type: SkillType.DAMAGE, target: TargetType.ENEMY_ALL, value: { base: 0, coefficient: 1.5 } },
        { type: SkillType.CONTROL, target: TargetType.ENEMY_ALL, control: { type: ControlType.STUN, duration: 1, chance: 0.2 } },
      ],
      animation: { cast: 'apoc_cast', hit: 'apoc_hit', sound: 'apoc_sound' } },

    { id: 'skill_god_fury', name: '神之怒', description: '对敌方随机目标造成5次100%攻击力伤害',
      type: SkillType.DAMAGE, cooldown: 4, initialCooldown: 1,
      effects: [{ type: SkillType.DAMAGE, target: TargetType.ENEMY_RANDOM, value: { base: 0, coefficient: 1.0 } }],
      animation: { cast: 'fury_cast', hit: 'fury_hit', sound: 'fury_sound' } },

    // 通用技能
    { id: 'skill_thorn_armor', name: '荆棘护甲', description: '提升自身防御30%持续3回合，受击时反弹10%伤害',
      type: SkillType.BUFF, cooldown: 3, initialCooldown: 0,
      effects: [{ type: SkillType.BUFF, target: TargetType.SELF, buff: { stat: 'def', value: 0, percent: 0.3, duration: 3 } }],
      animation: { cast: 'thorn_cast', hit: 'thorn_hit', sound: 'thorn_sound' } },
  ];

  await SkillConfigModel.insertMany(skills);
  console.log(`✅ 初始化 ${skills.length} 个技能配置`);
}

/**
 * 执行所有数据初始化
 */
export async function seedDatabase() {
  console.log('📦 开始初始化数据库配置数据...');
  try {
    await seedHeroConfigs();
    await seedSkillConfigs();
    console.log('✅ 数据库配置数据初始化完成');
  } catch (error) {
    console.error('❌ 数据初始化失败:', error);
  }
}
