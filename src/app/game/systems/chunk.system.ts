import { FieldPickupItem, FieldPickupKind } from '../../core/models/game-data.model';
import { Position, ResourceState } from './interaction.system';

export const CHUNK_SIZE = 512;
export const TILE_SIZE = 32;
export const DEFAULT_RENDER_RADIUS = 1;
export const RARE_BIOMASS_SPAWN_CHANCE = 0.18; // 18% rare chance per outer chunk
export const RP_COIN_CHUNK_PRESENCE_CHANCE = 0.8; // 80% of chunks spawn RP Coins
export const COMMON_BLUE_EXP_RATIO = 0.7; // 70% Common Blue EXP Orbs, 30% Rare Orange EXP Cores

export type TileFeatureType = 'corrupted-patch' | 'moss-slate' | 'spore-fleck' | 'crimson-vein';

export interface ChunkTileFeature {
  type: TileFeatureType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ChunkProp {
  x: number;
  y: number;
  width: number;
  height: number;
  variant: 'monolith' | 'crate';
}

export interface ChunkCoords {
  chunkX: number;
  chunkY: number;
}

export interface ChunkData {
  key: string;
  chunkX: number;
  chunkY: number;
  worldX: number;
  worldY: number;
  sectorLabel: string;
  features: ChunkTileFeature[];
  props: ChunkProp[];
  resources: ResourceState[];
  pickups: FieldPickupItem[];
}

export interface ActiveChunkUpdateResult {
  changed: boolean;
  activeChunks: ChunkData[];
  currentChunk: ChunkCoords & { sectorLabel: string };
}

/**
 * Generates a fresh 32-bit unsigned integer seed using Web Crypto API (or Math.random fallback)
 * so every deployment/run generates a genuinely random, unpredictable world.
 */
export function generateRunSeed(): number {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0] || 1;
  }
  return Math.floor(Math.random() * 0xffffffff) >>> 0 || 1;
}

/**
 * Mixes the per-run true RNG seed with chunk coordinates (chunkX, chunkY)
 * into a fast Mulberry32 PRNG stream for that chunk.
 */
export function createChunkRng(runSeed: number, chunkX: number, chunkY: number): () => number {
  let state = (runSeed ^ Math.imul(chunkX, 374761393) ^ Math.imul(chunkY, 668265263)) >>> 0;
  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function worldToChunkCoords(
  worldX: number,
  worldY: number,
  chunkSize: number = CHUNK_SIZE
): ChunkCoords {
  return {
    chunkX: Math.floor(worldX / chunkSize) || 0,
    chunkY: Math.floor(worldY / chunkSize) || 0
  };
}

export function getChunkKey(chunkX: number, chunkY: number): string {
  return `${chunkX},${chunkY}`;
}

export function formatSectorLabel(chunkX: number, chunkY: number): string {
  const sx = chunkX >= 0 ? `+${chunkX}` : `${chunkX}`;
  const sy = chunkY >= 0 ? `+${chunkY}` : `${chunkY}`;
  return `SEC ${sx}:${sy}`;
}

export function generateChunkData(
  runSeed: number,
  chunkX: number,
  chunkY: number,
  chunkSize: number = CHUNK_SIZE
): ChunkData {
  const rng = createChunkRng(runSeed, chunkX, chunkY);
  const worldX = chunkX * chunkSize;
  const worldY = chunkY * chunkSize;
  const features: ChunkTileFeature[] = [];
  const props: ChunkProp[] = [];
  const resources: ResourceState[] = [];
  const pickups: FieldPickupItem[] = [];

  // 1. Pre-compute 2.5D terrain tile features for this chunk
  for (let ty = 0; ty < chunkSize; ty += TILE_SIZE) {
    for (let tx = 0; tx < chunkSize; tx += TILE_SIZE) {
      const roll = rng();
      const wx = worldX + tx;
      const wy = worldY + ty;

      if (roll < 0.1) {
        features.push({
          type: 'corrupted-patch',
          x: wx,
          y: wy,
          width: TILE_SIZE,
          height: TILE_SIZE
        });
      } else if (roll < 0.2) {
        features.push({
          type: 'moss-slate',
          x: wx,
          y: wy,
          width: TILE_SIZE,
          height: TILE_SIZE
        });
      } else if (roll > 0.965) {
        const ox = Math.floor(rng() * 16) + 6;
        const oy = Math.floor(rng() * 16) + 6;
        features.push({
          type: 'spore-fleck',
          x: wx + ox,
          y: wy + oy,
          width: 6,
          height: 6
        });
      } else if (roll > 0.94 && roll <= 0.965) {
        const ox = Math.floor(rng() * 14) + 6;
        const oy = Math.floor(rng() * 18) + 6;
        features.push({
          type: 'crimson-vein',
          x: wx + ox,
          y: wy + oy,
          width: 10,
          height: 4
        });
      }
    }
  }

  // 2. Spawn 1-2 decorative 2.5D containment rubble props per chunk (avoiding origin spawn)
  const isOriginChunk = chunkX === 0 && chunkY === 0;
  const propCount = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < propCount; i++) {
    const px = Math.round(worldX + 56 + rng() * (chunkSize - 112));
    const py = Math.round(worldY + 56 + rng() * (chunkSize - 112));
    const distFromOrigin = Math.hypot(px - chunkSize * 0.5, py - chunkSize * 0.5);
    if (isOriginChunk && distFromOrigin < 96) {
      continue;
    }
    props.push({
      x: px,
      y: py,
      width: rng() > 0.5 ? 28 : 22,
      height: rng() > 0.5 ? 20 : 16,
      variant: rng() > 0.5 ? 'monolith' : 'crate'
    });
  }

  // 3. Rare Unlimited Biomass Spires (Diamond-tier high-value nodes)
  // Origin chunk spawns 1 guaranteed spire; outer chunks roll an 18% rare chance
  const shouldSpawnBiomassSpire = isOriginChunk || rng() < RARE_BIOMASS_SPAWN_CHANCE;
  if (shouldSpawnBiomassSpire) {
    const margin = 72;
    for (let attempt = 0; attempt < 8; attempt++) {
      const rx = Math.round(worldX + margin + rng() * (chunkSize - margin * 2));
      const ry = Math.round(worldY + margin + rng() * (chunkSize - margin * 2));

      if (isOriginChunk && Math.hypot(rx - chunkSize * 0.5, ry - chunkSize * 0.5) < 92) {
        continue;
      }

      resources.push({
        id: `spire_${chunkX}_${chunkY}_0`,
        position: { x: rx, y: ry },
        collected: false
      });
      break;
    }
  }

  // 4. Spawn Field EXP Orbs (70% Common Blue, 30% Rare Orange)
  const expOrbCount = 5 + Math.floor(rng() * 4); // 5 to 8 EXP orbs per chunk
  const orbMargin = 40;
  for (let i = 0; i < expOrbCount; i++) {
    const ox = Math.round(worldX + orbMargin + rng() * (chunkSize - orbMargin * 2));
    const oy = Math.round(worldY + orbMargin + rng() * (chunkSize - orbMargin * 2));

    if (isOriginChunk && Math.hypot(ox - chunkSize * 0.5, oy - chunkSize * 0.5) < 56) {
      continue;
    }

    const isCommonBlue = rng() < COMMON_BLUE_EXP_RATIO;
    const kind: FieldPickupKind = isCommonBlue ? 'exp-blue' : 'exp-orange';
    const baseValue = isCommonBlue
      ? 1 + Math.floor(rng() * 15) // 1..15 base EXP
      : 15 + Math.floor(rng() * 11); // 15..25 base EXP

    pickups.push({
      id: `orb_${chunkX}_${chunkY}_${i}`,
      kind,
      x: ox,
      y: oy,
      baseValue,
      collected: false
    });
  }

  // 5. Spawn Field RP Coins (80% chunk presence across the map)
  const shouldSpawnCoins = isOriginChunk || rng() < RP_COIN_CHUNK_PRESENCE_CHANCE;
  if (shouldSpawnCoins) {
    const coinCount = 2 + Math.floor(rng() * 3); // 2 to 4 coins
    for (let c = 0; c < coinCount; c++) {
      const cx = Math.round(worldX + orbMargin + rng() * (chunkSize - orbMargin * 2));
      const cy = Math.round(worldY + orbMargin + rng() * (chunkSize - orbMargin * 2));

      if (isOriginChunk && Math.hypot(cx - chunkSize * 0.5, cy - chunkSize * 0.5) < 56) {
        continue;
      }

      pickups.push({
        id: `coin_${chunkX}_${chunkY}_${c}`,
        kind: 'rp-coin',
        x: cx,
        y: cy,
        baseValue: 1 + Math.floor(rng() * 3), // 1..3 RP Coins
        collected: false
      });
    }
  }

  return {
    key: getChunkKey(chunkX, chunkY),
    chunkX,
    chunkY,
    worldX,
    worldY,
    sectorLabel: formatSectorLabel(chunkX, chunkY),
    features,
    props,
    resources,
    pickups
  };
}

/**
 * Manages active chunk streaming and Minecraft-style chunk persistence in memory for a run.
 * Chunks outside the render radius are unloaded from rendering, but their state (including
 * harvested Biomass Spires and collected EXP Orbs / RP Coins) is preserved in `discoveredChunks`.
 */
export class ChunkManager {
  readonly runSeed: number;
  readonly chunkSize: number;
  readonly renderRadius: number;

  private readonly discoveredChunks = new Map<string, ChunkData>();
  private readonly collectedResourceIds = new Set<string>();
  private readonly collectedPickupIds = new Set<string>();
  private activeChunks: ChunkData[] = [];
  private lastCenterChunk: ChunkCoords | null = null;
  private totalCollected = 0;

  constructor(
    seed: number = generateRunSeed(),
    chunkSize: number = CHUNK_SIZE,
    renderRadius: number = DEFAULT_RENDER_RADIUS
  ) {
    this.runSeed = seed;
    this.chunkSize = chunkSize;
    this.renderRadius = renderRadius;
  }

  restoreCollectedState(resourceIds: string[] = [], pickupIds: string[] = []): void {
    for (const id of resourceIds) {
      this.collectedResourceIds.add(id);
    }
    for (const id of pickupIds) {
      this.collectedPickupIds.add(id);
    }
    this.totalCollected = this.collectedResourceIds.size;

    for (const chunk of this.discoveredChunks.values()) {
      this.applyCollectedFlagsToChunk(chunk);
    }
  }

  private applyCollectedFlagsToChunk(chunk: ChunkData): void {
    for (const res of chunk.resources) {
      if (this.collectedResourceIds.has(res.id)) {
        res.collected = true;
      }
    }
    for (const item of chunk.pickups) {
      if (this.collectedPickupIds.has(item.id)) {
        item.collected = true;
      }
    }
  }

  recordPickupCollected(pickupId: string): void {
    this.collectedPickupIds.add(pickupId);
  }

  getCollectedResourceIds(): string[] {
    return Array.from(this.collectedResourceIds);
  }

  getCollectedPickupIds(): string[] {
    return Array.from(this.collectedPickupIds);
  }

  updateActiveWindow(playerPosition: Position, forceRefresh = false): ActiveChunkUpdateResult {
    const center = worldToChunkCoords(playerPosition.x, playerPosition.y, this.chunkSize);
    const sectorLabel = formatSectorLabel(center.chunkX, center.chunkY);

    if (
      !forceRefresh &&
      this.lastCenterChunk &&
      this.lastCenterChunk.chunkX === center.chunkX &&
      this.lastCenterChunk.chunkY === center.chunkY
    ) {
      return {
        changed: false,
        activeChunks: this.activeChunks,
        currentChunk: { ...center, sectorLabel }
      };
    }

    this.lastCenterChunk = center;
    const nextActive: ChunkData[] = [];

    for (let dy = -this.renderRadius; dy <= this.renderRadius; dy++) {
      for (let dx = -this.renderRadius; dx <= this.renderRadius; dx++) {
        const cx = center.chunkX + dx;
        const cy = center.chunkY + dy;
        const key = getChunkKey(cx, cy);

        let chunk = this.discoveredChunks.get(key);
        if (!chunk) {
          chunk = generateChunkData(this.runSeed, cx, cy, this.chunkSize);
          this.applyCollectedFlagsToChunk(chunk);
          this.discoveredChunks.set(key, chunk);
        }
        nextActive.push(chunk);
      }
    }

    this.activeChunks = nextActive;

    return {
      changed: true,
      activeChunks: this.activeChunks,
      currentChunk: { ...center, sectorLabel }
    };
  }

  getActiveChunks(): ChunkData[] {
    return this.activeChunks;
  }

  getActiveResources(): ResourceState[] {
    const list: ResourceState[] = [];
    for (const chunk of this.activeChunks) {
      list.push(...chunk.resources);
    }
    return list;
  }

  getActivePickups(): FieldPickupItem[] {
    const list: FieldPickupItem[] = [];
    for (const chunk of this.activeChunks) {
      list.push(...chunk.pickups);
    }
    return list;
  }

  getDiscoveredChunkCount(): number {
    return this.discoveredChunks.size;
  }

  getDiscoveredResourcesCount(): number {
    let total = 0;
    for (const chunk of this.discoveredChunks.values()) {
      total += chunk.resources.length;
    }
    return total;
  }

  getTotalCollectedCount(): number {
    return this.totalCollected;
  }

  collectResource(resourceId: string): ResourceState | null {
    for (const chunk of this.activeChunks) {
      const idx = chunk.resources.findIndex((r) => r.id === resourceId);
      if (idx !== -1 && !chunk.resources[idx].collected) {
        const updated: ResourceState = {
          ...chunk.resources[idx],
          collected: true
        };
        chunk.resources[idx] = updated;
        this.collectedResourceIds.add(resourceId);
        this.totalCollected += 1;
        return updated;
      }
    }
    return null;
  }

  addDropPickup(pickup: FieldPickupItem): void {
    const coords = worldToChunkCoords(pickup.x, pickup.y, this.chunkSize);
    const key = getChunkKey(coords.chunkX, coords.chunkY);
    const chunk = this.discoveredChunks.get(key);
    if (chunk) {
      chunk.pickups.push(pickup);
    } else if (this.activeChunks.length > 0) {
      this.activeChunks[0].pickups.push(pickup);
    }
  }
}
