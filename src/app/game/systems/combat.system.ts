export type ParasiteKind = 'rupter' | 'buglin';

export type ParasiteVariant = 'standard' | 'toxic-green' | 'crimson-red' | 'aberrant-violet';

export interface ParasiteEnemy {
  id: string;
  kind: ParasiteKind;
  variant: ParasiteVariant;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  radius: number;
  hitFlashTimer: number;
  facingAngle: number;
  corrosive?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  speed: number;
  distanceTraveled: number;
  maxDistance: number;
  radius: number;
  active: boolean;
}

export interface WeaponStats {
  cooldownMs: number;
  damage: number;
  range: number;
  speed: number;
  burstCount: number;
}

export interface HitEvent {
  enemyId: string;
  damage: number;
  x: number;
  y: number;
  killed: boolean;
  enemy: ParasiteEnemy;
}

export interface DropItem {
  kind: 'exp-blue' | 'exp-violet' | 'exp-orange' | 'rp-coin' | 'biomass';
  baseValue: number;
}

export interface CorrosionStatusResult {
  remainingTimer: number;
  tickTimer: number;
  damageToApply: number;
  isExpired: boolean;
}

/**
 * Finds the nearest alive enemy within weapon engagement range.
 */
export function findNearestEnemy(
  playerPos: { x: number; y: number },
  enemies: ParasiteEnemy[],
  maxRange: number
): ParasiteEnemy | null {
  let nearest: ParasiteEnemy | null = null;
  let minDistanceSq = maxRange * maxRange;

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;

    const dx = enemy.x - playerPos.x;
    const dy = enemy.y - playerPos.y;
    const distSq = dx * dx + dy * dy;

    if (distSq <= minDistanceSq) {
      minDistanceSq = distSq;
      nearest = enemy;
    }
  }

  return nearest;
}

/**
 * Calculates current weapon attributes scaled by survival skill upgrades.
 */
export function calculateWeaponStats(pulseOverclockRank = 0): WeaponStats {
  const rank = Math.max(0, pulseOverclockRank);
  return {
    cooldownMs: Math.max(220, Math.round(650 * Math.pow(0.88, rank))),
    damage: 18 + rank * 5,
    range: 380 + rank * 24,
    speed: 560 + rank * 30,
    burstCount: 1 + (rank >= 3 ? 1 : 0)
  };
}

/**
 * Instantiates an auto-aim projectile aimed directly at the target location.
 */
export function createProjectile(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  stats: { damage: number; speed: number; range: number },
  customId?: string
): Projectile {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const len = Math.hypot(dx, dy) || 1;
  const vx = (dx / len) * stats.speed;
  const vy = (dy / len) * stats.speed;

  return {
    id: customId ?? `proj-${Math.random().toString(36).slice(2, 9)}`,
    x: startX,
    y: startY,
    vx,
    vy,
    damage: stats.damage,
    speed: stats.speed,
    distanceTraveled: 0,
    maxDistance: stats.range,
    radius: 5,
    active: true
  };
}

/**
 * Updates all active projectiles, evaluates circle-circle collisions with alive enemies,
 * applies damage and hit flashes, and returns hit records.
 */
export function updateProjectiles(
  projectiles: Projectile[],
  enemies: ParasiteEnemy[],
  delta: number
): { remainingProjectiles: Projectile[]; hits: HitEvent[] } {
  const dt = delta / 1000;
  const remainingProjectiles: Projectile[] = [];
  const hits: HitEvent[] = [];

  for (const proj of projectiles) {
    if (!proj.active) continue;

    const stepDist = proj.speed * dt;
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.distanceTraveled += stepDist;

    if (proj.distanceTraveled >= proj.maxDistance) {
      proj.active = false;
      continue;
    }

    let hasCollided = false;
    for (const enemy of enemies) {
      if (enemy.hp <= 0) continue;

      const dx = proj.x - enemy.x;
      const dy = proj.y - enemy.y;
      const combinedRadius = proj.radius + enemy.radius;

      if (dx * dx + dy * dy <= combinedRadius * combinedRadius) {
        enemy.hp = Math.max(0, enemy.hp - proj.damage);
        enemy.hitFlashTimer = 110;
        proj.active = false;
        hasCollided = true;

        hits.push({
          enemyId: enemy.id,
          damage: proj.damage,
          x: proj.x,
          y: proj.y,
          killed: enemy.hp <= 0,
          enemy
        });
        break;
      }
    }

    if (!hasCollided && proj.active) {
      remainingProjectiles.push(proj);
    }
  }

  return { remainingProjectiles, hits };
}

/**
 * Moves alive parasites towards the player while applying separation forces
 * so parasites do not occupy the identical pixel coordinate.
 */
export function updateParasites(
  enemies: ParasiteEnemy[],
  playerPos: { x: number; y: number },
  delta: number
): ParasiteEnemy[] {
  const dt = delta / 1000;
  const aliveEnemies = enemies.filter((e) => e.hp > 0);

  for (let i = 0; i < aliveEnemies.length; i++) {
    const e = aliveEnemies[i];

    // Primary vector: towards player
    const toPlayerX = playerPos.x - e.x;
    const toPlayerY = playerPos.y - e.y;
    const distToPlayer = Math.hypot(toPlayerX, toPlayerY) || 1;

    // Off-screen retention: If the player moves too fast away (distToPlayer > 1400px),
    // reposition the parasite into the outer render perimeter (760-920px) so it continues pursuing
    if (distToPlayer > 1400) {
      const wrapAngle = Math.random() * Math.PI * 2;
      const wrapDist = 760 + Math.random() * 160;
      e.x = Math.round(playerPos.x + Math.cos(wrapAngle) * wrapDist);
      e.y = Math.round(playerPos.y + Math.sin(wrapAngle) * wrapDist);
      e.facingAngle = Math.atan2(playerPos.y - e.y, playerPos.x - e.x);
      continue;
    }

    let dirX = toPlayerX / distToPlayer;
    let dirY = toPlayerY / distToPlayer;

    e.facingAngle = Math.atan2(toPlayerY, toPlayerX);

    // Secondary vector: gentle flocking separation from neighboring parasites
    for (let j = 0; j < aliveEnemies.length; j++) {
      if (i === j) continue;
      const other = aliveEnemies[j];
      const sepX = e.x - other.x;
      const sepY = e.y - other.y;
      const sepDist = Math.hypot(sepX, sepY);
      const minDistance = e.radius * 2.1;

      if (sepDist > 0 && sepDist < minDistance) {
        const force = (1 - sepDist / minDistance) * 0.45;
        dirX += (sepX / sepDist) * force;
        dirY += (sepY / sepDist) * force;
      }
    }

    const len = Math.hypot(dirX, dirY) || 1;
    e.x += (dirX / len) * e.speed * dt;
    e.y += (dirY / len) * e.speed * dt;
    e.hitFlashTimer = Math.max(0, e.hitFlashTimer - delta);
  }

  return aliveEnemies;
}

/**
 * Evaluates contact collision between parasites and the player.
 * Inflicts contact damage, triggers invulnerability frames, and checks for toxic corrosion.
 */
export function checkPlayerContactDamage(
  playerPos: { x: number; y: number },
  playerRadius: number,
  enemies: ParasiteEnemy[],
  invulnerabilityTimer: number,
  delta: number
): {
  damageTaken: number;
  nextInvulnerabilityTimer: number;
  hitSource?: ParasiteEnemy;
  inflictCorrosion?: boolean;
} {
  const nextInvulnerabilityTimer = Math.max(0, invulnerabilityTimer - delta);
  if (nextInvulnerabilityTimer > 0) {
    return { damageTaken: 0, nextInvulnerabilityTimer };
  }

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;

    const dx = enemy.x - playerPos.x;
    const dy = enemy.y - playerPos.y;
    const contactDistance = playerRadius + enemy.radius;

    if (dx * dx + dy * dy <= contactDistance * contactDistance) {
      return {
        damageTaken: enemy.damage,
        nextInvulnerabilityTimer: 650,
        hitSource: enemy,
        inflictCorrosion: !!enemy.corrosive
      };
    }
  }

  return { damageTaken: 0, nextInvulnerabilityTimer: 0 };
}

/**
 * Processes ongoing player bio-corrosion (poison) damage over time.
 * Ticks 1 second intervals for periodic damage.
 */
export function updatePlayerCorrosion(
  corrosionTimer: number,
  tickTimer: number,
  delta: number,
  dps = 3
): CorrosionStatusResult {
  if (corrosionTimer <= 0) {
    return { remainingTimer: 0, tickTimer: 0, damageToApply: 0, isExpired: true };
  }

  const remainingTimer = Math.max(0, corrosionTimer - delta);
  let nextTick = tickTimer + delta;
  let damageToApply = 0;

  if (nextTick >= 1000) {
    nextTick -= 1000;
    damageToApply = dps;
  }

  return {
    remainingTimer,
    tickTimer: remainingTimer > 0 ? nextTick : 0,
    damageToApply,
    isExpired: remainingTimer <= 0
  };
}

/**
 * Calculates parasite spawn spec based on elapsed mission time.
 */
export function rollParasiteSpawnSpec(
  elapsedSeconds: number,
  rng: () => number = Math.random
): { kind: ParasiteKind; variant: ParasiteVariant } {
  if (elapsedSeconds < 25) {
    // Early reconnaissance: mostly Buglins (larva) and standard obsidian Crawlers
    const roll = rng();
    if (roll < 0.65) {
      const isViolet = rng() < 0.12;
      return { kind: 'buglin', variant: isViolet ? 'aberrant-violet' : 'standard' };
    }
    return { kind: 'rupter', variant: 'standard' };
  } else if (elapsedSeconds < 75) {
    // Initial outbreak: introduce green toxic crawlers
    const roll = rng();
    if (roll < 0.45) {
      const isViolet = rng() < 0.15;
      return { kind: 'buglin', variant: isViolet ? 'aberrant-violet' : 'standard' };
    } else if (roll < 0.72) {
      return { kind: 'rupter', variant: 'standard' };
    } else if (roll < 0.88) {
      return { kind: 'rupter', variant: 'toxic-green' };
    } else {
      return { kind: 'rupter', variant: 'crimson-red' };
    }
  } else {
    // Sustained infestation: full spectrum
    const roll = rng();
    if (roll < 0.35) {
      const isViolet = rng() < 0.18;
      return { kind: 'buglin', variant: isViolet ? 'aberrant-violet' : 'standard' };
    } else if (roll < 0.60) {
      return { kind: 'rupter', variant: 'standard' };
    } else if (roll < 0.80) {
      return { kind: 'rupter', variant: 'toxic-green' };
    } else {
      return { kind: 'rupter', variant: 'crimson-red' };
    }
  }
}

/**
 * Spawns a parasite outside the player's immediate camera view,
 * safely out towards the outer render chunk boundary (default 720–960px).
 */
export function spawnParasite(
  playerX: number,
  playerY: number,
  minDistance = 720,
  maxDistance = 960,
  rng: () => number = Math.random,
  elapsedSeconds = 0,
  overrideSpec?: { kind: ParasiteKind; variant: ParasiteVariant },
  customId?: string,
  playerFacing?: { x: number; y: number }
): ParasiteEnemy {
  let angle = rng() * Math.PI * 2;
  if (
    playerFacing &&
    (Math.abs(playerFacing.x) > 0.05 || Math.abs(playerFacing.y) > 0.05) &&
    rng() < 0.5
  ) {
    const moveAngle = Math.atan2(playerFacing.y, playerFacing.x);
    angle = moveAngle + (rng() - 0.5) * Math.PI * 0.72;
  }
  const dist = minDistance + rng() * (maxDistance - minDistance);
  const x = Math.round(playerX + Math.cos(angle) * dist);
  const y = Math.round(playerY + Math.sin(angle) * dist);

  const spec = overrideSpec ?? rollParasiteSpawnSpec(elapsedSeconds, rng);

  if (spec.kind === 'buglin') {
    const isViolet = spec.variant === 'aberrant-violet';
    const hp = Math.round((isViolet ? 16 : 12) + Math.min(20, elapsedSeconds * 0.12));
    const speed = Math.round((isViolet ? 185 : 165) + Math.min(35, elapsedSeconds * 0.18));
    const damage = isViolet ? 8 : 6;
    const radius = isViolet ? 10 : 8;

    return {
      id: customId ?? `buglin-${Math.random().toString(36).slice(2, 9)}`,
      kind: 'buglin',
      variant: spec.variant,
      x,
      y,
      hp,
      maxHp: hp,
      speed,
      damage,
      radius,
      hitFlashTimer: 0,
      facingAngle: Math.atan2(playerY - y, playerX - x)
    };
  }

  // Rupter / Crawler
  const baseHp = 22 + Math.min(60, Math.floor(elapsedSeconds / 15) * 4);
  const baseSpeed = Math.round(115 + Math.min(45, elapsedSeconds * 0.2));

  let hp = baseHp;
  let speed = baseSpeed;
  let damage = 10;
  let corrosive = false;

  if (spec.variant === 'toxic-green') {
    hp = Math.round(baseHp * 0.95);
    speed = Math.round(baseSpeed * 0.96);
    damage = 8;
    corrosive = true;
  } else if (spec.variant === 'crimson-red') {
    hp = Math.round(baseHp * 1.35);
    speed = Math.round(baseSpeed * 1.15);
    damage = 18; // Heavy hitter!
  }

  return {
    id: customId ?? `rupter-${Math.random().toString(36).slice(2, 9)}`,
    kind: 'rupter',
    variant: spec.variant,
    x,
    y,
    hp,
    maxHp: hp,
    speed,
    damage,
    radius: 14,
    hitFlashTimer: 0,
    facingAngle: Math.atan2(playerY - y, playerX - x),
    corrosive
  };
}

/**
 * Determines item drops when an enemy is eliminated.
 * Standard parasites have a 60% drop rate for EXP (95% Common Blue, 5% Rare Violet) and 60% for RP Coins.
 * Rare colored variants have a 50% drop rate for EXP (5% Rare Violet Core, remainder Common Blue), 50% for RP Coins, and 3% for Biomass.
 */
export function rollParasiteDrops(
  enemy: ParasiteEnemy,
  rng: () => number = Math.random
): DropItem[] {
  const drops: DropItem[] = [];
  const isRareColored =
    enemy.variant === 'aberrant-violet' ||
    enemy.variant === 'toxic-green' ||
    enemy.variant === 'crimson-red';

  if (isRareColored) {
    // Rare colored parasite: 50% chance for EXP (5% Rare Violet, remainder Common Blue), 50% chance for RP Coins, 3% chance for Biomass
    if (rng() < 0.5) {
      const isViolet = rng() < 0.05;
      drops.push({
        kind: isViolet ? 'exp-violet' : 'exp-blue',
        baseValue: isViolet
          ? (enemy.variant === 'crimson-red' ? 12 : 10)
          : (enemy.variant === 'crimson-red' ? 6 : 5)
      });
    }
    if (rng() < 0.5) {
      drops.push({
        kind: 'rp-coin',
        baseValue: 3 + Math.floor(rng() * 3) // 3..5 RP Coins
      });
    }
    if (rng() < 0.03) {
      drops.push({
        kind: 'biomass',
        baseValue: 1
      });
    }
  } else {
    // Standard baseline parasite (Buglin larva / Obsidian Crawler):
    // 60% chance to drop EXP (95% Blue, 5% Violet), 60% chance to drop RP Coins (3..5 RP Coins)
    if (rng() < 0.6) {
      const isViolet = rng() < 0.05;
      drops.push({
        kind: isViolet ? 'exp-violet' : 'exp-blue',
        baseValue: isViolet ? 10 : 3 + Math.floor(rng() * 3) // 3..5 base EXP
      });
    }
    if (rng() < 0.6) {
      drops.push({
        kind: 'rp-coin',
        baseValue: 3 + Math.floor(rng() * 3) // 3..5 RP Coins
      });
    }
  }

  return drops;
}

/**
 * Calculates adaptive, intelligent parasite wave batch size.
 * Throttles spawn pressure if player is critically wounded or heavily surrounded.
 */
export function calculateParasiteSpawnBatch(
  elapsedSeconds: number,
  currentEnemyCount: number,
  playerHpPercent = 100,
  closeEnemyCount = 0
): number {
  const baseCap = Math.min(32, 6 + Math.floor(elapsedSeconds / 10) * 2.5);

  let targetCap = baseCap;
  if (playerHpPercent < 35 || closeEnemyCount >= 6) {
    targetCap = Math.max(5, Math.floor(baseCap * 0.65));
  }

  if (currentEnemyCount >= targetCap) {
    return 0;
  }

  const deficit = Math.round(targetCap - currentEnemyCount);
  const maxBatch = elapsedSeconds < 35 ? 2 : elapsedSeconds < 85 ? 3 : 4;
  return Math.min(deficit, Math.max(1, maxBatch));
}
