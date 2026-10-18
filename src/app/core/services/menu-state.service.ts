import { Injectable, computed, signal } from '@angular/core';
import { OperatorItem, ResearchNode, ResearchTrack, SelectionItem, ZoneItem } from '../models/game-data.model';

export type { SelectionItem, OperatorItem, ZoneItem, ResearchNode, ResearchTrack } from '../models/game-data.model';

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

  readonly researchNodes: ResearchNode[] = [
    // Track 1: Bio-Research (Magic Survival inspired meta-upgrades)
    {
      id: 'chitin-plating',
      code: 'RES-01',
      title: 'Chitin Exo-Plating',
      track: 'upgrades',
      category: 'DEFENSE SYNTHESIS',
      icon: '🛡️',
      description:
        'Synthesizes refined parasitic chitin into the operator rig, reducing contact damage from Rupter and Assimilated swarms.',
      effectSummary: '+6% Damage Reduction per Rank',
      currentRank: 0,
      maxRank: 5,
      cost: 100,
      phaseTag: 'DEV PHASE 4B'
    },
    {
      id: 'spore-extractor',
      code: 'RES-02',
      title: 'Magnetic Spore Extractor',
      track: 'upgrades',
      category: 'HARVEST TELEMETRY',
      icon: '🧲',
      description:
        'Calibrates electromagnetic field coils to pull nearby Biomass Spores and XP orbs from a wider radius.',
      effectSummary: '+15% Harvest & Orb Radius per Rank',
      currentRank: 0,
      maxRank: 5,
      cost: 120,
      phaseTag: 'DEV PHASE 4B'
    },
    {
      id: 'combat-stims',
      code: 'RES-03',
      title: 'Adrenaline Stims Mk.II',
      track: 'upgrades',
      category: 'MOBILITY AUGMENT',
      icon: '💉',
      description:
        'Injects micro-doses of purified bio-catalyst into leg servos, boosting base movement speed during outbreak surges.',
      effectSummary: '+4% Base Move Speed per Rank',
      currentRank: 0,
      maxRank: 5,
      cost: 150,
      phaseTag: 'DEV PHASE 4B'
    },
    {
      id: 'neural-overclock',
      code: 'RES-04',
      title: 'Neural Targeting Link',
      track: 'upgrades',
      category: 'WEAPON RESEARCH',
      icon: '⚡',
      description:
        'Accelerates weapon fire-control processors to reduce cooldown intervals across all equipped survival powers.',
      effectSummary: '-5% Skill Cooldown per Rank',
      currentRank: 0,
      maxRank: 5,
      cost: 180,
      phaseTag: 'DEV PHASE 4B'
    },

    // Track 2: Rig Cosmetics (Containment Suits & Visual Shaders)
    {
      id: 'suit-hazmat-gold',
      code: 'COS-01',
      title: 'Aegis Hazmat Mk.IV',
      track: 'cosmetics',
      category: 'OPERATOR RIG SKIN',
      icon: '✨',
      description:
        'High-visibility gold-foil radiation and bio-containment suit issued to senior Sector 7 research directors.',
      effectSummary: 'Visual Override: Golden Visor & Trim',
      currentRank: 0,
      maxRank: 1,
      cost: 300,
      phaseTag: 'DEV PHASE 4C'
    },
    {
      id: 'suit-crimson-carapace',
      code: 'COS-02',
      title: 'Assimilated Carapace Rig',
      track: 'cosmetics',
      category: 'OPERATOR RIG SKIN',
      icon: '🩸',
      description:
        'Experimental armor forged from Adapted Longarms tissue. Pulses with bioluminescent crimson veins in dark sectors.',
      effectSummary: 'Visual Override: Parasitic Crimson Aura',
      currentRank: 0,
      maxRank: 1,
      cost: 450,
      phaseTag: 'DEV PHASE 4C'
    },
    {
      id: 'trail-spore-wake',
      code: 'COS-03',
      title: 'Bioluminescent Spore Wake',
      track: 'cosmetics',
      category: 'MOVEMENT TRAIL',
      icon: '🧪',
      description:
        'Emits a harmless trail of glowing emerald containment particles behind the operator while moving.',
      effectSummary: 'Visual Override: Emerald Footstep Particles',
      currentRank: 0,
      maxRank: 1,
      cost: 250,
      phaseTag: 'DEV PHASE 4C'
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

  getResearchByTrack(track: ResearchTrack): ResearchNode[] {
    return this.researchNodes.filter((node) => node.track === track);
  }

  getSelectedOperator(): OperatorItem {
    return this.selectedOperator();
  }

  getSelectedZone(): ZoneItem {
    return this.selectedZone();
  }
}
