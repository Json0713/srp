import { Injectable, computed, inject, signal } from '@angular/core';
import {
  GamePhaseInfo,
  OperatorItem,
  PersistedProfileV1,
  ResearchNode,
  ResearchTrack,
  SelectionItem,
  SurvivalSkillOption,
  ZoneItem
} from '../models/game-data.model';
import { PersistenceService } from './persistence.service';

export type {
  SelectionItem,
  OperatorItem,
  ZoneItem,
  ResearchNode,
  ResearchTrack,
  GamePhaseInfo,
  SurvivalSkillOption
} from '../models/game-data.model';

@Injectable({ providedIn: 'root' })
export class MenuStateService {
  private readonly persistence = inject(PersistenceService);

  readonly gamePhases: GamePhaseInfo[] = [
    {
      id: 'phase-1-fallout',
      phaseNumber: 1,
      code: 'PHS-01',
      title: 'Phase 1: The Fallout',
      subtitle: 'Initial Containment Collapse & Biomass Extraction',
      badge: 'PHASE 1 // THE FALLOUT',
      status: 'active',
      summary:
        'Deploy into the overrun Sector 7 perimeter, collect EXP orbs and RP Coins, harvest rare Biomass Spires, and decrypt the Field Codex.'
    },
    {
      id: 'phase-2-assimilation',
      phaseNumber: 2,
      code: 'PHS-02',
      title: 'Phase 2: The Assimilation',
      subtitle: 'Parasite Swarm Escalation & Survival Powers',
      badge: 'PHASE 2 // THE ASSIMILATION',
      status: 'upcoming',
      summary:
        'Survive relentless Rupter and Assimilated Human waves, evolve active Magic Survival-style combat skills, and eliminate Apex Bosses.'
    },
    {
      id: 'phase-3-synthesis',
      phaseNumber: 3,
      code: 'PHS-03',
      title: 'Phase 3: The Synthesis',
      subtitle: 'Research Lab Evolution & The Hive Core',
      badge: 'PHASE 3 // THE SYNTHESIS',
      status: 'upcoming',
      summary:
        'Synthesize permanent Bio-Research upgrades and Rig Cosmetics using RP Coins and rare Biomass, requisition new operators, and breach The Hive.'
    }
  ];

  readonly currentPhase: GamePhaseInfo = this.gamePhases[0];

  readonly operators: OperatorItem[] = [
    {
      id: 'survivor',
      code: 'OP-01',
      title: 'Survivor',
      description:
        'Standard Issue containment operative trained for frontline biomass extraction and sustained survival.',
      icon: '🛡️',
      locked: false,
      badge: 'PHASE 1 ACTIVE',
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
      description:
        'Long range specialist equipped with high-velocity kinetic optics and rapid reconnaissance thrusters.',
      icon: '🎯',
      locked: true,
      badge: 'CLASSIFIED',
      unlockRequirement: 'Requires 250 RP Coins & 5 Biomass (Phase 3: The Synthesis)',
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
      description:
        'Initial infection site. Overrun research perimeter with rare Biomass Spires, scattered EXP orbs, and RP Coin caches.',
      icon: '☣️',
      locked: false,
      badge: 'PHASE 1 // THREAT I',
      threatLevel: 'Level I — Initial Fallout Perimeter',
      infestationDensity: 'Moderate Spore Density',
      environmentType: 'Quarantine Perimeter'
    },
    {
      id: 'hive',
      code: 'ZN-09',
      title: 'The Hive',
      description:
        'High density outbreak epicenter. Deep subterranean flesh-network teeming with evolved parasitic forms.',
      icon: '🩸',
      locked: true,
      badge: 'PHASE 3 // THREAT IV',
      unlockRequirement: 'Clear Sector 7 Outbreak Protocol (Phase 3: The Synthesis)',
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
      biomassCost: 2,
      phaseTag: 'PHASE 3B // THE SYNTHESIS'
    },
    {
      id: 'spore-extractor',
      code: 'RES-02',
      title: 'Magnetic Spore Extractor',
      track: 'upgrades',
      category: 'HARVEST TELEMETRY',
      icon: '🧲',
      description:
        'Calibrates electromagnetic field coils to pull nearby EXP Orbs and RP Coins from a wider magnetic pickup radius.',
      effectSummary: '+15% Magnet Pickup Radius per Rank',
      currentRank: 0,
      maxRank: 5,
      cost: 120,
      biomassCost: 2,
      phaseTag: 'PHASE 3B // THE SYNTHESIS'
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
      biomassCost: 3,
      phaseTag: 'PHASE 3B // THE SYNTHESIS'
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
      biomassCost: 4,
      phaseTag: 'PHASE 3B // THE SYNTHESIS'
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
      biomassCost: 5,
      phaseTag: 'PHASE 3C // THE SYNTHESIS'
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
      biomassCost: 8,
      phaseTag: 'PHASE 3C // THE SYNTHESIS'
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
      biomassCost: 4,
      phaseTag: 'PHASE 3C // THE SYNTHESIS'
    }
  ];

  readonly survivalSkills: SurvivalSkillOption[] = [
    {
      id: 'power-pulse-overclock',
      code: 'PWR-01',
      title: 'Pulse Carbine Overclock',
      icon: '⚡',
      category: 'ACTIVE WEAPON // PLACEHOLDER',
      description: 'High-frequency kinetic bursts that lock onto the nearest parasitic signature.',
      effectPerLevel: '+15% Burst Fire Rate (Active in Phase 2)',
      phaseTag: 'PHASE 2 PREVIEW'
    },
    {
      id: 'power-spore-barrier',
      code: 'PWR-02',
      title: 'Bio-Repulsor Field',
      icon: '🛡️',
      category: 'DEFENSIVE AURA // PLACEHOLDER',
      description: 'Generates an electromagnetic containment ring around the operator.',
      effectPerLevel: '+20% Aura Radius & Slow (Active in Phase 2)',
      phaseTag: 'PHASE 2 PREVIEW'
    },
    {
      id: 'power-orbital-drone',
      code: 'PWR-03',
      title: 'Sentinel Micro-Drones',
      icon: '🛰️',
      category: 'AUTONOMOUS ORBIT // PLACEHOLDER',
      description: 'Deploys rotating perimeter blade drones around the operator.',
      effectPerLevel: '+1 Orbital Drone Unit (Active in Phase 2)',
      phaseTag: 'PHASE 2 PREVIEW'
    },
    {
      id: 'power-thermal-purge',
      code: 'PWR-04',
      title: 'Thermal Incineration Wave',
      icon: '🔥',
      category: 'AREA ERADICATION // PLACEHOLDER',
      description: 'Periodically unleashes a high-temperature shockwave across nearby tiles.',
      effectPerLevel: '+18% Thermal Wave Area (Active in Phase 2)',
      phaseTag: 'PHASE 2 PREVIEW'
    },
    {
      id: 'passive-magnet-coil',
      code: 'PAS-01',
      title: 'Electromagnetic Field Coil',
      icon: '🧲',
      category: 'FIELD UTILITY // ACTIVE BONUS',
      description: 'Amplifies the suit magnet array to pull EXP Orbs and RP Coins from farther away.',
      effectPerLevel: '+18 px Magnet Pickup Radius (Active Now)',
      phaseTag: 'PHASE 1 ACTIVE'
    },
    {
      id: 'passive-servo-boost',
      code: 'PAS-02',
      title: 'Overclocked Leg Servos',
      icon: '💨',
      category: 'MOBILITY AUGMENT // ACTIVE BONUS',
      description: 'Routes auxiliary bio-power to leg actuators for faster sector traversal.',
      effectPerLevel: '+8% Operator Move Speed (Active Now)',
      phaseTag: 'PHASE 1 ACTIVE'
    }
  ];

  readonly rpCoins = signal<number>(0);
  /** Alias preserved for backward compatibility */
  readonly srpCoins = this.rpCoins;
  readonly biomass = signal<number>(0);

  readonly selectedOperatorId = signal<string>('survivor');
  readonly selectedZoneId = signal<string>('sector7');
  readonly researchRanks = signal<Record<string, number>>({});

  readonly selectedOperator = computed<OperatorItem>(
    () => this.operators.find((op) => op.id === this.selectedOperatorId()) ?? this.operators[0]
  );

  readonly selectedZone = computed<ZoneItem>(
    () => this.zones.find((zone) => zone.id === this.selectedZoneId()) ?? this.zones[0]
  );

  constructor() {
    this.loadSyncBackup();
    void this.hydrateFromIndexedDb();
  }

  private loadSyncBackup(): void {
    const mirror = this.persistence.readMirrorSync<PersistedProfileV1>('meta_profile');
    if (mirror) {
      this.applyProfileState(mirror);
    }
  }

  private async hydrateFromIndexedDb(): Promise<void> {
    const profile = await this.persistence.loadProfile();
    if (profile) {
      this.applyProfileState(profile);
    } else {
      await this.persistProfile();
    }
  }

  private applyProfileState(profile: PersistedProfileV1): void {
    this.rpCoins.set(Math.max(0, Number(profile.rpCoins) || 0));
    this.biomass.set(Math.max(0, Number(profile.totalBiomass) || 0));
    if (profile.selectedOperatorId && this.operators.some((o) => o.id === profile.selectedOperatorId)) {
      this.selectedOperatorId.set(profile.selectedOperatorId);
    }
    if (profile.selectedZoneId && this.zones.some((z) => z.id === profile.selectedZoneId)) {
      this.selectedZoneId.set(profile.selectedZoneId);
    }
    if (profile.researchRanks && typeof profile.researchRanks === 'object') {
      this.researchRanks.set({ ...profile.researchRanks });
    }
  }

  private async persistProfile(): Promise<void> {
    await this.persistence.saveProfile({
      rpCoins: this.rpCoins(),
      totalBiomass: this.biomass(),
      selectedOperatorId: this.selectedOperatorId(),
      selectedZoneId: this.selectedZoneId(),
      unlockedOperatorIds: ['survivor'],
      unlockedZoneIds: ['sector7'],
      researchRanks: this.researchRanks()
    });
  }

  addRunRewards(biomassDelta: number, rpCoinsDelta: number): void {
    if (biomassDelta <= 0 && rpCoinsDelta <= 0) {
      return;
    }
    if (biomassDelta > 0) {
      this.biomass.update((v) => v + biomassDelta);
    }
    if (rpCoinsDelta > 0) {
      this.rpCoins.update((v) => v + rpCoinsDelta);
    }
    void this.persistProfile();
  }

  setOperator(id: string): void {
    const op = this.operators.find((o) => o.id === id);
    if (op && !op.locked) {
      this.selectedOperatorId.set(id);
      void this.persistProfile();
    }
  }

  setZone(id: string): void {
    const zone = this.zones.find((z) => z.id === id);
    if (zone && !zone.locked) {
      this.selectedZoneId.set(id);
      void this.persistProfile();
    }
  }

  getResearchByTrack(track: ResearchTrack): ResearchNode[] {
    const ranks = this.researchRanks();
    return this.researchNodes
      .filter((node) => node.track === track)
      .map((node) => ({
        ...node,
        currentRank: ranks[node.id] ?? node.currentRank
      }));
  }

  getSelectedOperator(): OperatorItem {
    return this.selectedOperator();
  }

  getSelectedZone(): ZoneItem {
    return this.selectedZone();
  }
}
