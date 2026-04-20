/**
 * 伤害计算器
 * 处理所有伤害/治疗/暴击/破甲/护盾的逻辑
 */

import { BattleUnit, DamageResult, StatusEffect, StatusEffectType } from './types';

export class DamageCalculator {
  /**
   * 计算物理伤害
   */
  static calcDamage(attacker: BattleUnit, defender: BattleUnit, coefficient: number): DamageResult {
    // 基础伤害 = 攻击力 * 系数
    let baseDamage = attacker.atk * coefficient;

    // 破甲计算：实际防御 = 防御 * (1 - 破甲率)
    const effectiveDef = defender.def * (1 - attacker.armorPen);

    // 伤害减免 = 防御 / (防御 + 600) — 防御收益递减公式
    const reductionRate = effectiveDef / (effectiveDef + 600);

    // 实际伤害 = 基础伤害 * (1 - 减免率)
    let damage = Math.floor(baseDamage * (1 - reductionRate));

    // 暴击判定
    const isCritical = Math.random() < attacker.critRate;
    if (isCritical) {
      damage = Math.floor(damage * attacker.critDamage);
    }

    // 随机浮动 ±5%
    const fluctuation = 0.95 + Math.random() * 0.1;
    damage = Math.floor(damage * fluctuation);

    // 最低伤害为1
    damage = Math.max(1, damage);

    // 护盾吸收
    let blockedAmount = 0;
    let isBlocked = false;
    const shieldEffect = defender.statusEffects.find(
      e => e.type === StatusEffectType.SHIELD
    );
    if (shieldEffect && shieldEffect.value && shieldEffect.value > 0) {
      isBlocked = true;
      if (shieldEffect.value >= damage) {
        blockedAmount = damage;
        shieldEffect.value -= damage;
        damage = 0;
      } else {
        blockedAmount = shieldEffect.value;
        damage -= shieldEffect.value;
        shieldEffect.value = 0;
      }
    }

    // 免疫判定
    const immuneEffect = defender.statusEffects.find(
      e => e.type === StatusEffectType.IMMUNE
    );
    if (immuneEffect) {
      blockedAmount = damage;
      damage = 0;
      isBlocked = true;
      immuneEffect.duration = 0; // 消耗免疫
    }

    return { damage, isCritical, isBlocked, blockedAmount, actualDamage: damage };
  }

  /**
   * 计算治疗量
   */
  static calcHeal(healer: BattleUnit, target: BattleUnit, coefficient: number): number {
    let heal = Math.floor(healer.atk * coefficient);

    // 随机浮动
    heal = Math.floor(heal * (0.95 + Math.random() * 0.1));

    // 不超过最大生命值
    const missingHp = target.maxHp - target.hp;
    heal = Math.min(heal, missingHp);

    return Math.max(0, heal);
  }

  /**
   * 应用伤害到单位
   */
  static applyDamage(unit: BattleUnit, damage: number): boolean {
    unit.hp = Math.max(0, unit.hp - damage);
    if (unit.hp <= 0) {
      unit.isAlive = false;
      return true; // 已阵亡
    }
    return false;
  }

  /**
   * 应用治疗到单位
   */
  static applyHeal(unit: BattleUnit, heal: number): void {
    unit.hp = Math.min(unit.maxHp, unit.hp + heal);
  }

  /**
   * 获取单位实际属性（含Buff/Debuff）
   */
  static getEffectiveStat(unit: BattleUnit, stat: string): number {
    let base = (unit as any)[stat] || 0;

    for (const effect of unit.statusEffects) {
      if (effect.stat === stat) {
        if (effect.percent) {
          base *= (1 + effect.percent);
        }
        if (effect.value) {
          base += effect.value;
        }
      }
    }

    return Math.floor(base);
  }

  /**
   * 判断是否可以行动（非晕眩/冰冻）
   */
  static canAct(unit: BattleUnit): { canAct: boolean; reason?: string } {
    const stunEffect = unit.statusEffects.find(
      e => e.type === StatusEffectType.STUN && e.duration > 0
    );
    if (stunEffect) return { canAct: false, reason: '晕眩' };

    const freezeEffect = unit.statusEffects.find(
      e => e.type === StatusEffectType.FREEZE && e.duration > 0
    );
    if (freezeEffect) return { canAct: false, reason: '冰冻' };

    return { canAct: true };
  }

  /**
   * 判断是否可以使用技能（非沉默）
   */
  static canUseSkill(unit: BattleUnit): { canUse: boolean; reason?: string } {
    const silenceEffect = unit.statusEffects.find(
      e => e.type === StatusEffectType.SILENCE && e.duration > 0
    );
    if (silenceEffect) return { canUse: false, reason: '沉默' };

    return { canUse: true };
  }

  /**
   * 处理持续伤害效果（毒/燃烧/流血）
   */
  static processDoT(unit: BattleUnit): { damage: number; type: string } | null {
    const dotTypes = [StatusEffectType.POISON, StatusEffectType.BURN, StatusEffectType.BLEED];
    const dotEffect = unit.statusEffects.find(e => dotTypes.includes(e.type) && e.duration > 0);

    if (!dotEffect || !dotEffect.value) return null;

    const damage = dotEffect.value;
    DamageCalculator.applyDamage(unit, damage);

    return { damage, type: dotEffect.type };
  }

  /**
   * 减少所有效果的持续回合
   */
  static tickStatusEffects(unit: BattleUnit): void {
    for (let i = unit.statusEffects.length - 1; i >= 0; i--) {
      unit.statusEffects[i].duration--;
      if (unit.statusEffects[i].duration <= 0) {
        unit.statusEffects.splice(i, 1);
      }
    }
  }

  /**
   * 减少技能冷却
   */
  static tickSkillCooldowns(unit: BattleUnit): void {
    for (const skill of unit.skills) {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    }
  }
}
