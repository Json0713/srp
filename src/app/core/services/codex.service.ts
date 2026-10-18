import { Injectable, computed, signal } from '@angular/core';
import { CodexCategory, CodexEntry } from '../models/game-data.model';

@Injectable({ providedIn: 'root' })
export class CodexService {
  private readonly storageKey = 'srp_codex_unlocked';
  private readonly defaultUnlockedIds = ['phase-1-fallout', 'op-survivor', 'zone-sector7'];

  private readonly baseCatalog: CodexEntry[] = [
    // Category I: Items & Biomass
    {
      id: 'raw-biomass',
      code: 'ITM-01',
      title: 'Raw Biomass Spore',
      category: 'items',
      status: 'undiscovered',
      icon: '🧪',
      classification: 'Bio-Resource // Catalyst',
      summary: 'Luminescent parasitic spore cluster harvested from dormant spires.',
      description:
        'Extracted directly from Sector 7 Biomass Spire nodes. Contains high-density cellular energy used to sustain containment rigs and study parasitic adaptation.',
      unlockHint: 'Harvest a Biomass Spire node in Sector 7 (press E or tap Harvest near a node) to grant this record.',
      phaseTag: 'PHASE 1 // THE FALLOUT',
      stats: [
        { label: 'Yield per Spire', value: '+1 Biomass Unit' },
        { label: 'Extraction Range', value: '54 px Proximity' },
        { label: 'Origin Sector', value: 'Sector 7 Perimeter' }
      ]
    },
    {
      id: 'srp-coin',
      code: 'ITM-02',
      title: 'SRP Bio-Credit',
      category: 'items',
      status: 'development',
      icon: '🪙',
      classification: 'Meta-Currency // Encrypted Token',
      summary: 'Standardized containment currency used in the Research Lab.',
      description:
        'Awarded for neutralizing high-threat assimilated hosts and securing Bio-Containment Caches. Used to synthesize Bio-Research upgrades, rig cosmetics, and operator unlocks.',
      unlockHint: 'Planned for Phase 2C & Phase 3A (Currency Drops & Persistence).',
      phaseTag: 'PHASE 2C / 3A',
      stats: [
        { label: 'Persistence', value: 'Local Encrypted Save' },
        { label: 'Primary Use', value: 'Bio-Research & Rig Cosmetics' }
      ]
    },
    {
      id: 'chitin-shard',
      code: 'ITM-03',
      title: 'Hardened Chitin Shard',
      category: 'items',
      status: 'development',
      icon: '🦴',
      classification: 'Material // Exoskeleton',
      summary: 'Dense exoskeletal plating recovered from eliminated Rupter husks.',
      description:
        'Formed through rapid calcium-silicate mutation inside parasitic hosts. Can be synthesized into protective armor plating during extended runs.',
      unlockHint: 'Planned for Phase 2A: The Assimilation (Parasite Combat drops).',
      phaseTag: 'PHASE 2A // THE ASSIMILATION',
      stats: [
        { label: 'Drop Source', value: 'Rupter / Assimilated Host' },
        { label: 'Rarity Tier', value: 'Common Field Drop' }
      ]
    },
    {
      id: 'containment-chest',
      code: 'ITM-04',
      title: 'Bio-Containment Cache',
      category: 'items',
      status: 'development',
      icon: '📦',
      classification: 'Supply Drop // Elite Loot',
      summary: 'High-security supply cache dropped by apex parasitic threats.',
      description:
        'Contains emergency combat stimulants, experimental weapon modules, and SRP Bio-Credits governed by rarity probability tables.',
      unlockHint: 'Planned for Phase 2C: The Assimilation (Boss Encounters & Loot Chests).',
      phaseTag: 'PHASE 2C // THE ASSIMILATION',
      stats: [
        { label: 'Drop Source', value: 'Apex Boss Elimination' },
        { label: 'Reward Tiers', value: 'Standard / Rare / Relic' }
      ]
    },

    // Category II: Parasite Bestiary (Scape and Run: Parasites inspired)
    {
      id: 'parasite-rupter',
      code: 'PRS-01',
      title: 'Rupter (Crawler)',
      category: 'parasites',
      status: 'development',
      icon: '🕷️',
      classification: 'Tier I Parasite // Scout',
      summary: 'Fast, six-legged arthropod parasite that hunts operators in packs.',
      description:
        'The earliest mobile stage of a Scape and Run outbreak. Rupters rely on swarm velocity to overwhelm isolated targets and infect organic matter on contact.',
      unlockHint: 'Planned for Phase 2A: The Assimilation (Basic Combat & Enemy Behavior).',
      phaseTag: 'PHASE 2A // THE ASSIMILATION',
      stats: [
        { label: 'Threat Level', value: 'Tier I — Low/Swarm' },
        { label: 'Behavior', value: 'Direct Pursuit & Leap' },
        { label: 'Weakness', value: 'Kinetic Burst Fire' }
      ]
    },
    {
      id: 'parasite-assimilated',
      code: 'PRS-02',
      title: 'Assimilated Human',
      category: 'parasites',
      status: 'development',
      icon: '🧟',
      classification: 'Tier I Parasite // Infected Host',
      summary: 'Former containment personnel overtaken by parasitic neural tendrils.',
      description:
        'Once a host is compromised, the parasite rewires motor functions and mutates the torso into a jagged maw. Advances relentlessly in coordinated waves.',
      unlockHint: 'Planned for Phase 2A: The Assimilation (Basic Combat & Enemy Behavior).',
      phaseTag: 'PHASE 2A // THE ASSIMILATION',
      stats: [
        { label: 'Threat Level', value: 'Tier I — Sustained Wave' },
        { label: 'Vitality', value: 'Moderate' },
        { label: 'Drop', value: 'XP Orbs & Biomass' }
      ]
    },
    {
      id: 'parasite-bogle',
      code: 'PRS-03',
      title: 'Volatile Spore Carrier',
      category: 'parasites',
      status: 'development',
      icon: '🦠',
      classification: 'Tier II Parasite // Mutated Hazard',
      summary: 'Bloated biomass host that ruptures into toxic spore clouds on proximity.',
      description:
        'Pressurized sacs along its carapace detonate when breached, forcing operators to maintain distance and prioritize ranged elimination.',
      unlockHint: 'Planned for Phase 2B: The Assimilation (Wave Escalation).',
      phaseTag: 'PHASE 2B // THE ASSIMILATION',
      stats: [
        { label: 'Threat Level', value: 'Tier II — Area Hazard' },
        { label: 'Hazard Type', value: 'Corrosive Spore Burst' }
      ]
    },
    {
      id: 'parasite-longarms',
      code: 'PRS-04',
      title: 'Adapted Longarms',
      category: 'parasites',
      status: 'development',
      icon: '🦂',
      classification: 'Tier III Parasite // Apex Boss',
      summary: 'Towering, armored evolved parasite with elongated scythe limbs.',
      description:
        'A high-evolution horror born from sustained biomass accumulation. Capable of adapting to repeated damage types and guarding high-tier Bio-Containment Caches.',
      unlockHint: 'Planned for Phase 2C: The Assimilation (Boss Encounters).',
      phaseTag: 'PHASE 2C // THE ASSIMILATION',
      stats: [
        { label: 'Threat Level', value: 'Tier III — Boss Anomaly' },
        { label: 'Guaranteed Drop', value: 'Bio-Containment Cache' }
      ]
    },

    // Category III: Powers & Survival Skills (Magic Survival inspired)
    {
      id: 'power-pulse-overclock',
      code: 'PWR-01',
      title: 'Pulse Carbine Overclock',
      category: 'powers',
      status: 'development',
      icon: '⚡',
      classification: 'Active Weapon // Auto-Target',
      summary: 'High-frequency kinetic bursts that automatically lock onto the nearest threat.',
      description:
        'Standard containment firearm module. Upgrades increase projectile velocity, burst count, and piercing capability against dense parasite waves.',
      unlockHint: 'Planned for Phase 2A & 2B: The Assimilation (Auto-Attack & Level-Up Skills).',
      phaseTag: 'PHASE 2A / 2B',
      stats: [
        { label: 'Targeting', value: 'Nearest Host Signature' },
        { label: 'Max Evolution', value: 'Hyper-Velocity Rail Barrage' }
      ]
    },
    {
      id: 'power-spore-barrier',
      code: 'PWR-02',
      title: 'Bio-Repulsor Field',
      category: 'powers',
      status: 'development',
      icon: '🛡️',
      classification: 'Defensive Aura // Continuous',
      summary: 'Generates an electromagnetic containment ring that damages and slows nearby hosts.',
      description:
        'Inspired by Magic Survival electric zone fields. Deters fast Rupter packs from making direct contact with the operator.',
      unlockHint: 'Planned for Phase 2B: The Assimilation (Level-Up Skill Selection).',
      phaseTag: 'PHASE 2B // THE ASSIMILATION',
      stats: [
        { label: 'Area Effect', value: '360° Operator Aura' },
        { label: 'Secondary Effect', value: 'Knockback & Slow' }
      ]
    },
    {
      id: 'power-orbital-drone',
      code: 'PWR-03',
      title: 'Sentinel Micro-Drones',
      category: 'powers',
      status: 'development',
      icon: '🛰️',
      classification: 'Autonomous Orbit // Kinetic',
      summary: 'Deploys rotating perimeter drones that slice through surrounding swarms.',
      description:
        'Each skill level adds additional orbital drones and increases rotational speed, forming a lethal perimeter blade ring.',
      unlockHint: 'Planned for Phase 2B: The Assimilation (Level-Up Skill Selection).',
      phaseTag: 'PHASE 2B // THE ASSIMILATION',
      stats: [
        { label: 'Orbit Count', value: '2 – 6 Autonomous Units' },
        { label: 'Damage Type', value: 'Continuous Contact Slash' }
      ]
    },
    {
      id: 'power-thermal-purge',
      code: 'PWR-04',
      title: 'Thermal Incineration Wave',
      category: 'powers',
      status: 'development',
      icon: '🔥',
      classification: 'Area Eradication // Cooldown',
      summary: 'Periodically unleashes a high-temperature shockwave that purges biomass.',
      description:
        'Designed to sterilize extreme parasite density. Incinerates Tier I crawlers and leaves a temporary scorched containment zone.',
      unlockHint: 'Planned for Phase 2B: The Assimilation (Level-Up Skill Selection).',
      phaseTag: 'PHASE 2B // THE ASSIMILATION',
      stats: [
        { label: 'Trigger', value: 'Periodic Pulse Cooldown' },
        { label: 'Element', value: 'Thermal Sterilization' }
      ]
    },

    // Category IV: Field Archive (Outbreak Phases, Operators & Sectors)
    {
      id: 'phase-1-fallout',
      code: 'PHS-01',
      title: 'Phase 1: The Fallout',
      category: 'archive',
      status: 'discovered',
      icon: '☢️',
      classification: 'Outbreak Season // Active Phase',
      summary: 'Initial containment collapse at Sector 7 and frontline biomass extraction.',
      description:
        'The inaugural outbreak phase of Project Parasite. Containment operatives deploy into the Sector 7 perimeter to harvest dormant Biomass Spire nodes, calibrate cross-device rigs, and establish the Field Codex and Research Lab baseline.',
      unlockHint: 'Granted upon initial protocol activation.',
      phaseTag: 'PHASE 1 // THE FALLOUT',
      stats: [
        { label: 'Season Status', value: 'Active Now (Phase 1)' },
        { label: 'Active Sector', value: 'Sector 7 Perimeter' },
        { label: 'Primary Objective', value: 'Biomass Spire Extraction' }
      ]
    },
    {
      id: 'phase-2-assimilation',
      code: 'PHS-02',
      title: 'Phase 2: The Assimilation',
      category: 'archive',
      status: 'development',
      icon: '🦠',
      classification: 'Outbreak Season // Upcoming Phase',
      summary: 'Parasitic swarm awakening, wave combat, and survival power evolution.',
      description:
        'Dormant spores mutate into pursuing Rupters, Assimilated Humans,Volatile Spore Carriers, and Adapted Longarms bosses. Introduces auto-targeting weapons, XP orbs, and randomized level-up survival skills.',
      unlockHint: 'Planned for Phase 2: The Assimilation.',
      phaseTag: 'PHASE 2 // THE ASSIMILATION',
      stats: [
        { label: 'Season Status', value: 'Upcoming (Phase 2)' },
        { label: 'Key Systems', value: 'Parasite Waves & Skill Evolution' }
      ]
    },
    {
      id: 'phase-3-synthesis',
      code: 'PHS-03',
      title: 'Phase 3: The Synthesis',
      category: 'archive',
      status: 'development',
      icon: '🧬',
      classification: 'Outbreak Season // Upcoming Phase',
      summary: 'Research Lab synthesis activation, Rig Cosmetics, and The Hive Core.',
      description:
        'Unlocks persistent SRP Bio-Credits, permanent Bio-Research rig upgrades, custom containment suit cosmetics, Operator Ranger requisition, and deep-core deployment into The Hive.',
      unlockHint: 'Planned for Phase 3: The Synthesis.',
      phaseTag: 'PHASE 3 // THE SYNTHESIS',
      stats: [
        { label: 'Season Status', value: 'Upcoming (Phase 3)' },
        { label: 'Key Systems', value: 'Research Lab & The Hive' }
      ]
    },
    {
      id: 'op-survivor',
      code: 'ARC-01',
      title: 'Operator: Survivor',
      category: 'archive',
      status: 'discovered',
      icon: '🛡️',
      classification: 'Containment Operative // Vanguard',
      summary: 'Standard Issue frontline operative equipped for sustained biomass extraction.',
      description:
        'Outfitted with a balanced Bio-Filter Rig and standard Pulse Carbine. Deployed as the primary responder to the Phase 1: The Fallout quarantine breach.',
      unlockHint: 'Granted upon initial protocol activation.',
      phaseTag: 'PHASE 1 // THE FALLOUT',
      stats: [
        { label: 'Vitality Rating', value: '80 / 100' },
        { label: 'Mobility Rating', value: '75 / 100' },
        { label: 'Passive Protocol', value: '+15% Spore Resistance' }
      ]
    },
    {
      id: 'zone-sector7',
      code: 'ARC-02',
      title: 'Sector 7 Perimeter',
      category: 'archive',
      status: 'discovered',
      icon: '☣️',
      classification: 'Infestation Zone // Threat Level I',
      summary: 'Initial outbreak site containing active Biomass Spire nodes.',
      description:
        'An overrun research perimeter where parasitic spores first breached containment during Phase 1: The Fallout. Features dormant Biomass Spires that must be harvested by field operators.',
      unlockHint: 'Granted upon initial protocol activation.',
      phaseTag: 'PHASE 1 // THE FALLOUT',
      stats: [
        { label: 'Threat Level', value: 'Level I — Low Breach' },
        { label: 'World Topology', value: 'Unbounded 512px Sector Chunks' },
        { label: 'Node Density', value: '1–3 Biomass Spires / Chunk' }
      ]
    },
    {
      id: 'op-ranger',
      code: 'ARC-03',
      title: 'Operator: Ranger',
      category: 'archive',
      status: 'development',
      icon: '🎯',
      classification: 'Containment Operative // Recon',
      summary: 'Long-range specialist equipped with kinetic optics and rapid thrusters.',
      description:
        'Trades heavy armor plating for superior movement velocity and long-distance piercing firepower.',
      unlockHint: 'Planned for Phase 3A: The Synthesis (Character Unlocking via SRP Bio-Credits).',
      phaseTag: 'PHASE 3A // THE SYNTHESIS',
      stats: [
        { label: 'Vitality Rating', value: '55 / 100' },
        { label: 'Mobility Rating', value: '95 / 100' },
        { label: 'Unlock Cost', value: '250 SRP Bio-Credits' }
      ]
    },
    {
      id: 'zone-hive',
      code: 'ARC-04',
      title: 'The Hive Core',
      category: 'archive',
      status: 'development',
      icon: '🩸',
      classification: 'Infestation Zone // Threat Level IV',
      summary: 'Subterranean flesh-network and high-density outbreak epicenter.',
      description:
        'Deep beneath Sector 7 lies the primary parasitic nexus. Populated by evolved hosts and Adapted apex threats.',
      unlockHint: 'Planned for Phase 3: The Synthesis (Sector Expansion).',
      phaseTag: 'PHASE 3 // THE SYNTHESIS',
      stats: [
        { label: 'Threat Level', value: 'Level IV — Total Assimilation' },
        { label: 'Biome Type', value: 'Subterranean Flesh Core' }
      ]
    }
  ];

  private readonly unlockedIds = signal<Set<string>>(this.loadUnlockedIds());

  readonly entries = computed<CodexEntry[]>(() => {
    const unlocked = this.unlockedIds();
    return this.baseCatalog.map((entry) => {
      if (entry.status === 'development') {
        return entry;
      }
      return {
        ...entry,
        status: unlocked.has(entry.id) ? 'discovered' : 'undiscovered'
      };
    });
  });

  readonly discoveredCount = computed<number>(
    () => this.entries().filter((e) => e.status === 'discovered').length
  );

  readonly discoverableTotal = computed<number>(
    () => this.entries().filter((e) => e.status !== 'development').length
  );

  readonly developmentCount = computed<number>(
    () => this.entries().filter((e) => e.status === 'development').length
  );

  private loadUnlockedIds(): Set<string> {
    const initial = new Set<string>(this.defaultUnlockedIds);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (typeof item === 'string') {
                initial.add(item);
              }
            }
          }
        }
      } catch {
        // Ignore corrupted or unavailable storage
      }
    }
    return initial;
  }

  private persistUnlockedIds(ids: Set<string>): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(this.storageKey, JSON.stringify(Array.from(ids)));
      } catch {
        // Ignore storage write errors
      }
    }
  }

  isUnlocked(id: string): boolean {
    return this.unlockedIds().has(id);
  }

  unlockEntry(id: string): CodexEntry | null {
    const target = this.baseCatalog.find((e) => e.id === id);
    if (!target || target.status === 'development') {
      return null;
    }

    if (this.unlockedIds().has(id)) {
      return null;
    }

    const updated = new Set(this.unlockedIds());
    updated.add(id);
    this.unlockedIds.set(updated);
    this.persistUnlockedIds(updated);

    return this.entries().find((e) => e.id === id) ?? null;
  }

  getEntriesByCategory(category: CodexCategory | 'all'): CodexEntry[] {
    const all = this.entries();
    if (category === 'all') {
      return all;
    }
    return all.filter((entry) => entry.category === category);
  }
}

