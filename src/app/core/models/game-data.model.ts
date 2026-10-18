export type InputMode = 'pc' | 'mobile';

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

export interface ShopModulePreview {
  id: string;
  title: string;
  category: string;
  description: string;
  cost: number;
}

export interface GameHudSnapshot {
  resourcesCollected: number;
  totalResources: number;
  nearbyInteractable: boolean;
}

