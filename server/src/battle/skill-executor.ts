/**
 * 技能执行器
 * 解析技能配置，执行各种效果，支持自定义公式
 */

import { BattleUnit, SkillEffectConfig, ActionTarget, StatusEffect, StatusEffectType } from './types';
import { DamageCalculator } from './damage-calculator';
import { v4 as uuidv4 } from 'uuid';

export class SkillExecutor {
  private units: Map<string, BattleUnit>;

  constructor(units: BattleUnit[]) {
    this.units = new Map(units.map(u => [u.instanceId, u]));
  }

  /**
   * 选择技能目标
   */
  selectTargets(actor: BattleUnit, targetType: string, allUnits: BattleUnit[]): BattleUnit[] {
    const aliveUnits = allUnits.filter(u => u.isAlive);
    const allies = aliveUnits.filter(u => u.team === actor.team);
    const enemies = aliveUnits.filter(u => u.team !== actor.team);

    switch (targetType) {
      case 'self':
        return [actor];

      case 'enemy_single':
        // 优先攻击对位，其次随机
        return enemies.length > 0 ? [enemies[0]] : [];

      case 'enemy_all':
        return enemies;

      case 'enemy_random':
        // 随机选择1个
        if (enemies.length === 0) return [];
        const idx = Math.floor(Math.random() * enemies.length);
        return [enemies[idx]];

      case 'ally_single':
        return allies.length > 0 ? [allies[0]] : [];

      case 'ally_all':
        return allies;

      case 'ally_lowest_hp':
        const sorted = [...allies].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
        return sorted.length > 0 ? [sorted[0]] : [];

      case 'all':
        return aliveUnits;

      default:
        return [];
    }
  }

  /**
   * 执行技能
   */
  executeSkill(
    actor: BattleUnit,
    skillEffects: SkillEffectConfig[],
    allUnits: BattleUnit[]
  ): ActionTarget[] {
    const results: ActionTarget[] = [];

    for (const effect of skillEffects) {
      const targets = this.selectTargets(actor, effect.target, allUnits);

      for (const target of targets) {
        const result = this.executeEffect(actor, target, effect, allUnits);
        if (result) {
          results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * 执行单个效果
   */
  private executeEffect(
    actor: BattleUnit,
    target: BattleUnit,
    effect: SkillEffectConfig,
    allUnits: BattleUnit[]
  ): ActionTarget | null {
    const result: ActionTarget = {
      targetId: target.instanceId,
      targetName: target.name,
      effects: [],
    };

    switch (effect.type) {
      case 'damage':
        return this.executeDamage(actor, target, effect, result);

      case 'heal':
        return this.executeHeal(actor, target, effect, result);

      case 'control':
        return this.executeControl(actor, target, effect, result);

      case 'buff':
        return this.executeBuff(actor, target, effect, result);

      case 'debuff':
        return this.executeDebuff(actor, target, effect, result);

      default:
        return null;
    }
  }

  /**
   * 执行伤害效果
   */
  private executeDamage(
    actor: BattleUnit,
    target: BattleUnit,
    effect: SkillEffectConfig,
    result: ActionTarget
  ): ActionTarget {
    const coefficient = effect.value?.coefficient || 1.0;

    // 检查自定义公式
    if (effect.value?.formula) {
      const damage = this.evalFormula(effect.value.formula, actor, target);
      const killed = DamageCalculator.applyDamage(target, damage);
      result.damage = damage;
      result.isCritical = false;
      result.killed = killed;
      result.effects = ['伤害'];
      return result;
    }

    const dmgResult = DamageCalculator.calcDamage(actor, target, coefficient);
    const killed = DamageCalculator.applyDamage(target, dmgResult.actualDamage);

    result.damage = dmgResult.actualDamage;
    result.isCritical = dmgResult.isCritical;
    result.killed = killed;
    result.effects = dmgResult.isCritical ? ['暴击伤害'] : ['伤害'];

    if (dmgResult.isBlocked) {
      result.effects.push(`护盾吸收${dmgResult.blockedAmount}`);
    }

    return result;
  }

  /**
   * 执行治疗效果
   */
  private executeHeal(
    actor: BattleUnit,
    target: BattleUnit,
    effect: SkillEffectConfig,
    result: ActionTarget
  ): ActionTarget {
    const coefficient = effect.value?.coefficient || 0.3;

    // 复活类治疗（目标已阵亡时恢复部分血量）
    if (!target.isAlive && effect.value?.formula?.includes('maxHp')) {
      target.isAlive = true;
      const healAmount = Math.floor(target.maxHp * coefficient);
      target.hp = healAmount;
      result.heal = healAmount;
      result.effects = ['复活'];
      return result;
    }

    const healAmount = DamageCalculator.calcHeal(actor, target, coefficient);
    DamageCalculator.applyHeal(target, healAmount);

    result.heal = healAmount;
    result.effects = ['治疗'];

    return result;
  }

  /**
   * 执行控制效果
   */
  private executeControl(
    actor: BattleUnit,
    target: BattleUnit,
    effect: SkillEffectConfig,
    result: ActionTarget
  ): ActionTarget {
    if (!effect.control) return result;

    const chance = effect.control.chance || 1.0;
    const rolled = Math.random();

    if (rolled >= chance) {
      result.effects = ['抵抗'];
      return result;
    }

    const statusTypeMap: Record<string, StatusEffectType> = {
      stun: StatusEffectType.STUN,
      silence: StatusEffectType.SILENCE,
      freeze: StatusEffectType.FREEZE,
      poison: StatusEffectType.POISON,
      burn: StatusEffectType.BURN,
      bleed: StatusEffectType.BLEED,
    };

    const statusType = statusTypeMap[effect.control.type];
    if (!statusType) {
      result.effects = ['未知控制'];
      return result;
    }

    // 持续伤害类型的控制，附带伤害值
    let dotValue = 0;
    if (['poison', 'burn', 'bleed'].includes(effect.control.type)) {
      dotValue = Math.floor(actor.atk * 0.1 * effect.control.duration);
    }

    const statusEffect: StatusEffect = {
      id: uuidv4(),
      type: statusType,
      value: dotValue > 0 ? dotValue : undefined,
      duration: effect.control.duration,
      sourceUnitId: actor.instanceId,
      isDebuff: true,
    };

    target.statusEffects.push(statusEffect);

    const nameMap: Record<string, string> = {
      stun: '晕眩', silence: '沉默', freeze: '冰冻',
      poison: '中毒', burn: '燃烧', bleed: '流血',
    };

    result.effects = [nameMap[effect.control.type] || effect.control.type];

    return result;
  }

  /**
   * 执行增益效果
   */
  private executeBuff(
    actor: BattleUnit,
    target: BattleUnit,
    effect: SkillEffectConfig,
    result: ActionTarget
  ): ActionTarget {
    if (!effect.buff) return result;

    // 净化效果
    if (effect.buff.stat === 'cleanse') {
      const debuffCount = target.statusEffects.filter(e => e.isDebuff).length;
      target.statusEffects = target.statusEffects.filter(e => !e.isDebuff);
      result.effects = [`净化${debuffCount}个负面效果`];
      return result;
    }

    // 免疫效果
    if (effect.buff.stat === 'immune') {
      const statusEffect: StatusEffect = {
        id: uuidv4(),
        type: StatusEffectType.IMMUNE,
        value: effect.buff.value || 1,
        duration: effect.buff.duration,
        sourceUnitId: actor.instanceId,
        isDebuff: false,
      };
      target.statusEffects.push(statusEffect);
      result.effects = ['免疫'];
      return result;
    }

    // 护盾效果
    if (effect.buff.stat === 'shield') {
      const shieldValue = Math.floor(target.maxHp * (effect.buff.percent || 0.15));
      const statusEffect: StatusEffect = {
        id: uuidv4(),
        type: StatusEffectType.SHIELD,
        value: shieldValue,
        percent: effect.buff.percent,
        duration: effect.buff.duration,
        sourceUnitId: actor.instanceId,
        isDebuff: false,
      };
      target.statusEffects.push(statusEffect);
      result.effects = [`护盾${shieldValue}`];
      return result;
    }

    // 属性增益
    const statusEffect: StatusEffect = {
      id: uuidv4(),
      type: StatusEffectType.BUFF_STAT,
      stat: effect.buff.stat,
      value: effect.buff.value || 0,
      percent: effect.buff.percent || 0,
      duration: effect.buff.duration,
      sourceUnitId: actor.instanceId,
      isDebuff: false,
    };
    target.statusEffects.push(statusEffect);

    const statNameMap: Record<string, string> = {
      atk: '攻击力', def: '防御力', spd: '速度',
    };
    const statName = statNameMap[effect.buff.stat] || effect.buff.stat;
    const valueStr = effect.buff.percent
      ? `${(effect.buff.percent * 100).toFixed(0)}%`
      : `${effect.buff.value}`;
    result.effects = [`${statName}+${valueStr}(${effect.buff.duration}回合)`];

    return result;
  }

  /**
   * 执行减益效果
   */
  private executeDebuff(
    actor: BattleUnit,
    target: BattleUnit,
    effect: SkillEffectConfig,
    result: ActionTarget
  ): ActionTarget {
    if (!effect.buff) return result;

    const statusEffect: StatusEffect = {
      id: uuidv4(),
      type: StatusEffectType.DEBUFF_STAT,
      stat: effect.buff.stat,
      value: effect.buff.value || 0,
      percent: effect.buff.percent || 0,
      duration: effect.buff.duration,
      sourceUnitId: actor.instanceId,
      isDebuff: true,
    };
    target.statusEffects.push(statusEffect);

    result.effects = [`${effect.buff.stat}-${effect.buff.percent || effect.buff.value}`];
    return result;
  }

  /**
   * 执行自定义公式
   * 支持：atk, def, hp, maxHp, spd, critRate 等变量
   */
  private evalFormula(formula: string, actor: BattleUnit, target: BattleUnit): number {
    try {
      const vars: Record<string, number> = {
        atk: actor.atk,
        def: target.def,
        hp: target.hp,
        maxHp: target.maxHp,
        spd: actor.spd,
        critRate: actor.critRate,
        critDamage: actor.critDamage,
        armorPen: actor.armorPen,
        targetAtk: target.atk,
        targetDef: target.def,
        targetHp: target.hp,
        targetMaxHp: target.maxHp,
      };

      // 替换变量
      let expr = formula;
      for (const [key, value] of Object.entries(vars)) {
        expr = expr.replace(new RegExp(key, 'g'), String(value));
      }

      // 安全执行（仅允许数学运算）
      const result = Function('"use strict"; return (' + expr + ')')();
      return Math.floor(Math.max(1, result));
    } catch {
      return Math.floor(actor.atk);
    }
  }
}
