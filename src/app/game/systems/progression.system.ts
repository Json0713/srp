import { FieldPickupItem, SurvivalSkillOption } from '../../core/models/game-data.model';
import { Position } from './interaction.system';

export interface ExpProgressionState {
  level: number;
  currentExp: number;
  expToNextLevel: number;
  levelsGained: number;
}

export interface BiomassHarvestReward {
  biomass: number;
  exp: number;
  rpCoins: number;
}

export interface MagnetUpdateResult {
  collectedPickups: FieldPickupItem[];
  anyMoved: boolean;
}

/**
 * Calculates the EXP required to advance from `level` to `level + 1`.
 * Starts at 100 EXP at Level 1 and ramps smoothly every level.
 */
export function calculateExpRequired(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  if (safeLevel === 1) {
    return 100;
  }
  const lvlOffset = safeLevel - 1;
  return Math.round(100 + lvlOffset * 15 + Math.pow(lvlOffset, 1.35) * 6);
}

/**
 * Calculates the EXP granted by a Common Blue (95%) or Rare Glowing Violet (5%) orb,
 * scaling upward as the player levels up so orb values stay balanced with the EXP curve.
 * - Common Blue (Lv.1): 3 - 5 EXP (+1 per level above 1)
 * - Rare Glowing Violet (Lv.1): 8 - 12 EXP (+2 per level above 1)
 */
export function calculateOrbExpValue(
  kind: 'exp-blue' | 'exp-violet' | 'exp-orange',
  playerLevel: number,
  rngRoll: number = Math.random()
): number {
  const safeLevel = Math.max(1, Math.floor(playerLevel));
  const clampedRoll = Math.max(0, Math.min(0.9999, rngRoll));

  if (kind === 'exp-violet' || kind === 'exp-orange') {
    const baseViolet = 8 + Math.floor(clampedRoll * 5); // 8..12
    const levelScaling = (safeLevel - 1) * 2;
    return baseViolet + levelScaling;
  }

  const baseBlue = 3 + Math.floor(clampedRoll * 3); // 3..5
  const levelScaling = (safeLevel - 1) * 1;
  return baseBlue + levelScaling;
}

/**
 * Calculates the triple reward for harvesting a rare Biomass Spire:
 * 1) +1 Rare Biomass (Diamond-tier meta resource)
 * 2) +35 Base EXP (balanced with 3-5 EXP orb baseline, scales upward with elapsed run time, player level, and Phase)
 * 3) +10 to +25 RP Coins (Research Parasitic Coins)
 */
export function calculateBiomassSpireReward(
  playerLevel: number,
  elapsedSeconds: number,
  phaseNumber: number = 1,
  rngRoll: number = Math.random()
): BiomassHarvestReward {
  const safeLevel = Math.max(1, Math.floor(playerLevel));
  const safeSeconds = Math.max(0, elapsedSeconds);
  const safePhase = Math.max(1, phaseNumber);
  const clampedRoll = Math.max(0, Math.min(0.9999, rngRoll));

  const timeMultiplier = 1 + Math.floor(safeSeconds / 45) * 0.12;
  const levelMultiplier = 1 + (safeLevel - 1) * 0.12;
  const exp = Math.round(35 * timeMultiplier * levelMultiplier * safePhase);
  const rpCoins = 10 + Math.floor(clampedRoll * 16) + (safeLevel - 1) * 2;

  return {
    biomass: 1,
    exp,
    rpCoins
  };
}

/**
 * Applies gained EXP to the player's current progression state and resolves
 * one or more level-ups with exact carry-over EXP.
 */
export function applyExpGain(
  currentLevel: number,
  currentExp: number,
  expGained: number
): ExpProgressionState {
  let level = Math.max(1, Math.floor(currentLevel));
  let exp = Math.max(0, currentExp) + Math.max(0, Math.floor(expGained));
  let required = calculateExpRequired(level);
  let levelsGained = 0;

  while (exp >= required) {
    exp -= required;
    level += 1;
    levelsGained += 1;
    required = calculateExpRequired(level);
  }

  return {
    level,
    currentExp: exp,
    expToNextLevel: required,
    levelsGained
  };
}

/**
 * Magic Survival-inspired proximity magnet system for EXP Orbs and RP Coins.
 * Pickups within `magnetRadius` automatically lock onto the player and fly toward them
 * without requiring any button press, collecting on contact (`collectRadius`).
 */
export function updateMagnetPickups(
  playerPosition: Position,
  pickups: FieldPickupItem[],
  magnetRadius: number,
  collectRadius: number,
  magnetSpeed: number,
  deltaMs: number
): MagnetUpdateResult {
  const collectedPickups: FieldPickupItem[] = [];
  let anyMoved = false;
  const step = magnetSpeed * (Math.max(0, deltaMs) / 1000);

  for (const item of pickups) {
    if (item.collected) {
      continue;
    }

    const dx = playerPosition.x - item.x;
    const dy = playerPosition.y - item.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= collectRadius) {
      item.collected = true;
      item.magnetized = false;
      collectedPickups.push(item);
      anyMoved = true;
      continue;
    }

    if (item.magnetized || dist <= magnetRadius) {
      item.magnetized = true;
      anyMoved = true;

      if (dist <= step || dist === 0) {
        item.x = playerPosition.x;
        item.y = playerPosition.y;
        item.collected = true;
        item.magnetized = false;
        collectedPickups.push(item);
      } else {
        item.x += (dx / dist) * step;
        item.y += (dy / dist) * step;
      }
    }
  }

  return {
    collectedPickups,
    anyMoved
  };
}

/**
 * Selects `count` distinct random skills from the survival skill pool for the Level-Up modal.
 */
export function rollRandomSkillChoices(
  pool: SurvivalSkillOption[],
  count: number = 3,
  rng: () => number = Math.random
): SurvivalSkillOption[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy.slice(0, Math.min(count, copy.length));
}

