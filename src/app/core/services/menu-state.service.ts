import { Injectable, computed, signal } from '@angular/core';
import { OperatorItem, SelectionItem, ShopModulePreview, ZoneItem } from '../models/game-data.model';

export type { SelectionItem, OperatorItem, ZoneItem } from '../models/game-data.model';

@Injectable({ providedIn: 'root' })
export class MenuStateService {
  readonly operators: OperatorItem[] = [
    {
      id: 'survivor',
      code: 'OP-01',
      title: 'Survivor',
      description: 'Standard Issue containment operative trained for frontline biomass extraction and sustained survival.',
      icon: '🛡️',
      locked: false,
      badge: 'ACTIVE DUTY',
      role: 'Vanguard Containment',
      weapon: 'Pulse Carbine // Auto-Burst',
      passiveTrait: 'Bio-Filter Rig (+15% Spore Resistance)',
      attributes: [
        { label: 'Vitality', value: 80, max: 100 },
        { label: 'Mobility', value: 75, max: 100 },
        { label: 'Bio-Resist', value: 70, max: 100 }
      ]
    },
    {
      id: 'ranger',
      code: 'OP-02',
      title: 'Ranger',
      description: 'Long range specialist equipped with high-velocity kinetic optics and rapid reconnaissance thrusters.',
      icon: '🎯',
      locked: true,
      badge: 'CLASSIFIED',
      unlockRequirement: 'Requires 250 SRP Coins (Phase 4)',
      role: 'Marksman Recon',
      weapon: 'Rail Rifle // Piercing Beam',
      passiveTrait: 'Target Lock (+25% Critical Range)',
      attributes: [
        { label: 'Vitality', value: 55, max: 100 },
        { label: 'Mobility', value: 95, max: 100 },
        { label: 'Bio-Resist', value: 60, max: 100 }
      ]
    }
  ];

  readonly zones: ZoneItem[] = [
    {
      id: 'sector7',
      code: 'ZN-07',
      title: 'Sector 7',
      description: 'Initial infection site. Overrun research perimeter with dormant biomass nodes and low-tier assimilated hosts.',
      icon: '☣️',
      locked: false,
      badge: 'THREAT LVL I',
      threatLevel: 'Level I — Low Containment Breach',
      infestationDensity: 'Moderate Spore Density',
      environmentType: 'Quarantine Perimeter'
    },
    {
      id: 'hive',
      code: 'ZN-09',
      title: 'The Hive',
      description: 'High density outbreak epicenter. Deep subterranean flesh-network teeming with evolved parasitic forms.',
      icon: '🩸',
      locked: true,
      badge: 'THREAT LVL IV',
      unlockRequirement: 'Clear Sector 7 Outbreak Protocol',
      threatLevel: 'Level IV — Total Assimilation',
      infestationDensity: 'Extreme Parasitic Swarm',
      environmentType: 'Subterranean Flesh Core'
    }
  ];

  readonly shopPreviews: ShopModulePreview[] = [
    {
      id: 'exo-plating',
      title: 'Chitin Exo-Plating',
      category: 'SURVIVAL RIG',
      description: 'Reinforces operator armor against parasitic contact damage.',
      cost: 100
    },
    {
      id: 'spore-harvester',
      title: 'Magnetic Spore Extractor',
      category: 'UTILITY',
      description: 'Expands interaction and orb collection radius by 25%.',
      cost: 150
    },
    {
      id: 'adrenaline-injector',
      title: 'Combat Stims Mk.II',
      category: 'MOBILITY',
      description: 'Increases base movement speed during swarm surges.',
      cost: 200
    }
  ];

  readonly srpCoins = signal<number>(0);
  readonly selectedOperatorId = signal<string>('survivor');
  readonly selectedZoneId = signal<string>('sector7');

  readonly selectedOperator = computed<OperatorItem>(
    () => this.operators.find((op) => op.id === this.selectedOperatorId()) ?? this.operators[0]
  );

  readonly selectedZone = computed<ZoneItem>(
    () => this.zones.find((zone) => zone.id === this.selectedZoneId()) ?? this.zones[0]
  );

  setOperator(id: string): void {
    const op = this.operators.find((o) => o.id === id);
    if (op && !op.locked) {
      this.selectedOperatorId.set(id);
    }
  }

  setZone(id: string): void {
    const zone = this.zones.find((z) => z.id === id);
    if (zone && !zone.locked) {
      this.selectedZoneId.set(id);
    }
  }

  getSelectedOperator(): OperatorItem {
    return this.selectedOperator();
  }

  getSelectedZone(): ZoneItem {
    return this.selectedZone();
  }
}

