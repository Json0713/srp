export type InputMode = 'pc' | 'mobile';

export type CodexCategory = 'items' | 'parasites' | 'powers' | 'archive';

export type CodexStatus = 'discovered' | 'undiscovered' | 'development';

export interface CodexStat {
  label: string;
  value: string;
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

export interface GameHudSnapshot {
  resourcesCollected: number;
  totalResources: number;
  nearbyInteractable: boolean;
}

