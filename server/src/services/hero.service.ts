import { v4 as uuidv4 } from 'uuid';
import { HeroConfigModel, HeroFaction, HeroClass, HeroQuality } from '../models/hero-config.model';
import { PlayerHeroModel } from '../models/player-hero.model';

export class HeroService {
  /**
   * 获取所有英雄配置
   */
  async getAllHeroConfigs() {
    return HeroConfigModel.find({ isActive: true });
  }

  /**
   * 获取单个英雄配置
   */
  async getHeroConfig(heroId: string) {
    return HeroConfigModel.findOne({ id: heroId, isActive: true });
  }

  /**
   * 获取玩家所有英雄
   */
  async getPlayerHeroes(uid: string) {
    const heroes = await PlayerHeroModel.find({ uid });

    // 获取英雄配置
    const heroIds = heroes.map((h) => h.heroId);
    const configs = await HeroConfigModel.find({ id: { $in: heroIds } });
    const configMap = new Map(configs.map((c) => [c.id, c]));

    // 合并数据
    return heroes.map((hero) => ({
      ...hero.toObject(),
      config: configMap.get(hero.heroId),
    }));
  }

  /**
   * 获取玩家单个英雄
   */
  async getPlayerHero(uid: string, instanceId: string) {
    const hero = await PlayerHeroModel.findOne({ uid, instanceId });

    if (!hero) {
      return null;
    }

    // 获取英雄配置
    const config = await this.getHeroConfig(hero.heroId);

    return {
      ...hero.toObject(),
      config,
    };
  }

  /**
   * 召唤英雄（碎片合成）
   */
  async summonHero(uid: string, heroId: string) {
    // 获取英雄配置
    const config = await this.getHeroConfig(heroId);

    if (!config) {
      throw new Error('英雄不存在');
    }

    // TODO: 检查碎片是否足够

    // 计算初始属性
    const stats = this.calculateHeroStats(config, 1);

    // 创建英雄实例
    const instanceId = uuidv4();
    const hero = await PlayerHeroModel.create({
      uid,
      instanceId,
      heroId,
      level: 1,
      star: 0,
      stats,
      equipment: {
        weapon: null,
        armor: null,
        accessory: null,
      },
      skillLevels: config.skills.map(() => 1),
      exp: 0,
    });

    return {
      instanceId: hero.instanceId,
      heroId: hero.heroId,
      level: hero.level,
    };
  }

  /**
   * 英雄升级
   */
  async levelUpHero(uid: string, instanceId: string, useItems: any[]) {
    const hero = await PlayerHeroModel.findOne({ uid, instanceId });

    if (!hero) {
      throw new Error('英雄不存在');
    }

    // 获取英雄配置
    const config = await this.getHeroConfig(hero.heroId);

    if (!config) {
      throw new Error('英雄配置不存在');
    }

    // TODO: 计算经验值增加

    // 模拟升级
    hero.level += 1;
    hero.stats = this.calculateHeroStats(config, hero.level);
    await hero.save();

    return {
      instanceId: hero.instanceId,
      level: hero.level,
      stats: hero.stats,
    };
  }

  /**
   * 计算英雄属性
   */
  private calculateHeroStats(config: any, level: number) {
    const { baseStats, growth } = config;

    return {
      hp: Math.floor(baseStats.hp + growth.hp * (level - 1)),
      maxHp: Math.floor(baseStats.hp + growth.hp * (level - 1)),
      atk: Math.floor(baseStats.atk + growth.atk * (level - 1)),
      def: Math.floor(baseStats.def + growth.def * (level - 1)),
      spd: Math.floor(baseStats.spd + growth.spd * (level - 1)),
      critRate: baseStats.critRate,
      critDamage: baseStats.critDamage,
      armorPen: baseStats.armorPen,
    };
  }
}
