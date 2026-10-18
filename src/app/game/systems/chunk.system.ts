import { Position, ResourceState } from './interaction.system';

export const CHUNK_SIZE = 512;
export const TILE_SIZE = 32;
export const DEFAULT_RENDER_RADIUS = 1; // 3x3 chunk window (1536x1536 px) around the centered player

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
  const propCount = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < propCount; i++) {
    const px = Math.round(worldX + 56 + rng() * (chunkSize - 112));
    const py = Math.round(worldY + 56 + rng() * (chunkSize - 112));
    const distFromOrigin = Math.hypot(px - chunkSize * 0.5, py - chunkSize * 0.5);
    if (chunkX === 0 && chunkY === 0 && distFromOrigin < 96) {
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

  // 3. Randomly spawn Biomass Spire resource nodes inside the chunk
  // Origin chunk (0,0) guarantees 2-3 spires near the starting drop zone; outer chunks roll 1-3 spires
  const isOriginChunk = chunkX === 0 && chunkY === 0;
  const minSpires = isOriginChunk ? 2 : 1;
  const maxExtra = isOriginChunk ? 2 : 3;
  const spireCount = minSpires + Math.floor(rng() * maxExtra);
  const margin = 64;
  const minSpacing = 92;

  for (let i = 0; i < spireCount; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 8 && !placed; attempt++) {
      const rx = Math.round(worldX + margin + rng() * (chunkSize - margin * 2));
      const ry = Math.round(worldY + margin + rng() * (chunkSize - margin * 2));

      // Keep center of origin chunk (0,0) clear where the operator spawns at (256, 256)
      if (isOriginChunk && Math.hypot(rx - chunkSize * 0.5, ry - chunkSize * 0.5) < 76) {
        continue;
      }

      const tooClose = resources.some(
        (existing) => Math.hypot(existing.position.x - rx, existing.position.y - ry) < minSpacing
      );

      if (!tooClose) {
        resources.push({
          id: `spire_${chunkX}_${chunkY}_${i}`,
          position: { x: rx, y: ry },
          collected: false
        });
        placed = true;
      }
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
    resources
  };
}

/**
 * Manages active chunk streaming and Minecraft-style chunk persistence in memory for a run.
 * Chunks outside the render radius are unloaded from rendering, but their state (including
 * harvested vs. unharvested Biomass Spires) is preserved in `discoveredChunks` when the player returns.
 */
export class ChunkManager {
  readonly runSeed: number;
  readonly chunkSize: number;
  readonly renderRadius: number;

  private readonly discoveredChunks = new Map<string, ChunkData>();
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
        this.totalCollected += 1;
        return updated;
      }
    }
    return null;
  }
}

