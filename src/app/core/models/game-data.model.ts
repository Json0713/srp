export type InputMode = 'pc' | 'mobile';

export type CodexCategory = 'items' | 'parasites' | 'powers' | 'archive';

export type CodexStatus = 'discovered' | 'undiscovered' | 'development';

export interface CodexStat {
  label: string;
  value: string;
}

export interface CodexVariant {
  label: string;
  icon: string;
  color: string;
  tag: string;
  description: string;
}

export interface CodexEntry {
  id: string;
  code: string;
  title: string;
  category: CodexCategory;
  status: CodexStatus;
  icon: string;
  classification: string;
  summary: string;
  description: string;
  unlockHint: string;
  phaseTag: string;
  stats: CodexStat[];
  variants?: CodexVariant[];
}

export interface OperatorAttribute {
  label: string;
  value: number;
  max: number;
}

export interface SelectionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  locked: boolean;
  code?: string;
  badge?: string;
  unlockRequirement?: string;
}

export interface OperatorItem extends SelectionItem {
  role: string;
  weapon: string;
  passiveTrait: string;
  attributes: OperatorAttribute[];
}

export interface ZoneItem extends SelectionItem {
  threatLevel: string;
  infestationDensity: string;
  environmentType: string;
}

export type ResearchTrack = 'upgrades' | 'cosmetics';

export interface ResearchNode {
  id: string;
  code: string;
  title: string;
  track: ResearchTrack;
  category: string;
  icon: string;
  description: string;
  effectSummary: string;
  currentRank: number;
  maxRank: number;
  cost: number;
  biomassCost?: number;
  phaseTag: string;
}

export interface GamePhaseInfo {
  id: string;
  phaseNumber: number;
  code: string;
  title: string;
  subtitle: string;
  badge: string;
  status: 'active' | 'upcoming';
  summary: string;
}

export type FieldPickupKind = 'exp-blue' | 'exp-violet' | 'exp-orange' | 'rp-coin' | 'biomass';

export interface PersistedParasiteState {
  id: string;
  kind: 'rupter' | 'buglin';
  variant: 'standard' | 'toxic-green' | 'crimson-red' | 'aberrant-violet';
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

export interface FieldPickupItem {
  id: string;
  kind: FieldPickupKind;
  x: number;
  y: number;
  baseValue: number;
  collected: boolean;
  magnetized?: boolean;
}

export interface SurvivalSkillOption {
  id: string;
  code: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  effectPerLevel: string;
  phaseTag: string;
}

export interface GameHudSnapshot {
  playerHp?: number;
  playerMaxHp?: number;
  enemiesEliminated?: number;
  isCorroded?: boolean;
  corrosionSeconds?: number;
  resourcesCollected: number;
  totalResources: number;
  nearbyInteractable: boolean;
  sectorLabel?: string;
  runSeed?: number;
  playerX?: number;
  playerY?: number;
  elapsedSeconds?: number;
  playerSpeed?: number;
  magnetRadius?: number;
  level?: number;
  currentExp?: number;
  expToNextLevel?: number;
  runRpCoins?: number;
  runBiomass?: number;
  pendingLevelUps?: number;
  collectedResourceIds?: string[];
  collectedPickupIds?: string[];
  activeEnemies?: PersistedParasiteState[];
  lastBiomassReward?: {
    biomass: number;
    exp: number;
    rpCoins: number;
    timestamp: number;
  } | null;
}

/**
 * IndexedDB v1 Schema Contracts
 */
export interface PersistedProfileV1 {
  id: 'v1_profile';
  schemaVersion: 1;
  rpCoins: number;
  totalBiomass: number;
  selectedOperatorId: string;
  selectedZoneId: string;
  unlockedOperatorIds: string[];
  unlockedZoneIds: string[];
  researchRanks: Record<string, number>;
  updatedAt: number;
}

export interface PersistedCodexV1 {
  id: 'v1_codex';
  schemaVersion: 1;
  unlockedIds: string[];
  updatedAt: number;
}

export interface PersistedSettingsV1 {
  id: 'v1_settings';
  schemaVersion: 1;
  inputMode: InputMode;
  hasManualInputOverride: boolean;
  updatedAt: number;
}

export interface PersistedSessionV1 {
  id: 'v1_session';
  schemaVersion: 1;
  isActive?: boolean;
  operatorId?: string;
  zoneId?: string;
  runSeed: number;
  playerX?: number;
  playerY?: number;
  playerHp?: number;
  playerMaxHp?: number;
  enemiesEliminated?: number;
  elapsedSeconds?: number;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  runBiomass: number;
  runRpCoins: number;
  pendingLevelUps?: number;
  chosenSkills: Record<string, number>;
  collectedResourceIds?: string[];
  collectedPickupIds?: string[];
  activeEnemies?: PersistedParasiteState[];
  updatedAt: number;
}
