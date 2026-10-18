import { Injectable, computed, inject, signal } from '@angular/core';
import { CodexCategory, CodexEntry, PersistedCodexV1 } from '../models/game-data.model';
import { PersistenceService } from './persistence.service';

@Injectable({ providedIn: 'root' })
export class CodexService {
  private readonly persistence = inject(PersistenceService);
  private readonly legacyStorageKey = 'srp_codex_unlocked';
  private readonly defaultUnlockedIds = ['phase-1-fallout', 'op-survivor', 'zone-sector7'];

  private readonly baseCatalog: CodexEntry[] = [
    // Category I: Items & Biomass
    {
      id: 'raw-biomass',
      code: 'ITM-01',
      title: 'Rare Biomass Crystal',
      category: 'items',
      status: 'undiscovered',
      icon: '🧪',
      classification: 'Apex Catalyst // Rare Resource',
      summary: 'High-value crystalline biomass core harvested from rare dormant spires.',
      description:
        'A rare, diamond-grade biological catalyst formed at high-density Sector 7 spires. Harvesting a Spire grants +1 Biomass, +100+ level-scaled EXP, and a cache of RP Coins for Research Lab synthesis.',
      unlockHint: 'Locate a rare Biomass Spire in Sector 7 and press E (or tap Harvest) to examine this record.',
      phaseTag: 'PHASE 1 // THE FALLOUT',
      stats: [
        { label: 'Biomass Yield', value: '+1 Rare Biomass' },
        { label: 'EXP Surge', value: '+100 Base EXP (Scales w/ Level & Time)' },
        { label: 'Currency Bonus', value: '+10 to +25 RP Coins' }
      ]
    },
    {
      id: 'rp-coin',
      code: 'ITM-02',
      title: 'RP Coin (Research Parasitic Coin)',
      category: 'items',
      status: 'undiscovered',
      icon: '🪙',
      classification: 'Meta-Currency // Field Token',
      summary: 'Standardized Research Parasitic Coin used in the Research Lab.',
      description:
        'Scattered across Sector 7 (80% field presence) and awarded when harvesting Biomass Spires. Automatically magnetized to the operator on close proximity and persisted to IndexedDB.',
      unlockHint: 'Walk near a golden RP Coin in Sector 7 to magnetize and collect it.',
      phaseTag: 'PHASE 1 // THE FALLOUT',
      stats: [
        { label: 'Field Spawn Rate', value: '80% Sector Presence' },
        { label: 'Acquisition', value: 'Proximity Auto-Magnet' },
        { label: 'Primary Use', value: 'Bio-Research & Rig Cosmetics' }
      ]
    },
    {
      id: 'exp-orb-blue',
      code: 'ITM-03',
      title: 'Common Blue EXP Spore',
      category: 'items',
      status: 'undiscovered',
      icon: '🔹',
      classification: 'In-Run Progression // 70% Common',
      summary: 'Azure bio-energy orb that fuels in-run operator level progression.',
      description:
        'Accounts for 70% of field EXP spores. Automatically magnetized toward the operator within close proximity. Grants 1–15 base EXP at Level 1 and scales upward as the operator levels up.',
      unlockHint: 'Walk near a Blue EXP Spore in Sector 7 to absorb it.',
      phaseTag: 'PHASE 1 // THE FALLOUT',
      stats: [
        { label: 'Distribution', value: '70% Common Spore' },
        { label: 'Base Yield (Lv.1)', value: '1 – 15 EXP (+Level Scaling)' }
      ]
    },
    {
      id: 'exp-orb-orange',
      code: 'ITM-04',
      title: 'Rare Orange EXP Core',
      category: 'items',
      status: 'undiscovered',
      icon: '🔶',
      classification: 'In-Run Progression // 30% Rare',
      summary: 'High-density amber bio-energy core that accelerates operator leveling.',
      description:
        'Accounts for 30% of field EXP spores. Emits a bright orange luminescence and grants 15–25 base EXP at Level 1, scaling upward with operator level to match ramping EXP requirements.',
      unlockHint: 'Walk near an Orange EXP Core in Sector 7 to absorb it.',
      phaseTag: 'PHASE 1 // THE FALLOUT',
      stats: [
        { label: 'Distribution', value: '30% Rare Spore' },
        { label: 'Base Yield (Lv.1)', value: '15 – 25 EXP (+Level Scaling)' }
      ]
    },
    {
      id: 'chitin-shard',
      code: 'ITM-05',
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
      code: 'ITM-06',
      title: 'Bio-Containment Cache',
      category: 'items',
      status: 'development',
      icon: '📦',
      classification: 'Supply Drop // Elite Loot',
      summary: 'High-security supply cache dropped by apex parasitic threats.',
      description:
        'Contains emergency combat stimulants, experimental weapon modules, and RP Coins governed by rarity probability tables.',
      unlockHint: 'Planned for Phase 2C: The Assimilation (Boss Encounters & Loot Chests).',
      phaseTag: 'PHASE 2C // THE ASSIMILATION',
      stats: [
        { label: 'Drop Source', value: 'Apex Boss Elimination' },
        { label: 'Reward Tiers', value: 'Standard / Rare / Relic' }
      ]
    },

    // Category II: Parasite Bestiary (Scape and Run: Parasites inspired)
    {
      id: 'parasite-buglin',
      code: 'PRS-00',
      title: 'Buglin (Larva)',
      category: 'parasites',
      status: 'undiscovered',
      icon: '🪱',
      classification: 'Tier 0 Parasite // Primitive Larva',
      summary: 'Swift, silverfish-like primitive arthropod that swarms ahead of larger hosts.',
      description:
        'The primary larval vector of an outbreak. Standard specimens feature deep pitch-black segmented bodies, while rare Aberrant Violet variants carry concentrated neural cores with guaranteed Orange EXP Core drops.',
      unlockHint: 'Eliminate a Buglin larva in Sector 7 to unlock this field record.',
      phaseTag: 'PHASE 1 // COMBAT',
      stats: [
        { label: 'Threat Level', value: 'Tier 0 — Swift Pest' },
        { label: 'Sub-Species', value: 'Obsidian Black (Common) / Violet (Rare)' },
        { label: 'Movement', value: 'Fast Wriggle & High Velocity' }
      ],
      variants: [
        {
          label: 'Obsidian Larva',
          icon: '🪱',
          color: '#94a3b8',
          tag: 'STANDARD',
          description: 'Baseline fast scout pest (6 DMG, 165 SPD).'
        },
        {
          label: 'Aberrant Violet',
          icon: '🔮',
          color: '#c084fc',
          tag: 'RARE SPECIMEN',
          description: 'Rare neural strain with high-value core drops (8 DMG, 185 SPD).'
        }
      ]
    },
    {
      id: 'parasite-rupter',
      code: 'PRS-01',
      title: 'Rupter (Crawler)',
      category: 'parasites',
      status: 'undiscovered',
      icon: '🕷️',
      classification: 'Tier I Parasite // Scout Crawler',
      summary: 'Arachnid-like parasite featuring Obsidian, Toxic Green, and Crimson variants.',
      description:
        'The primary mobile scout of the infestation. Standard Obsidian Crawlers hunt in packs. Toxic Green variants secrete corrosive acid that inflicts poison over time. Crimson Red variants sprint in a blood-frenzy and deal devastating direct contact damage.',
      unlockHint: 'Eliminate a Rupter parasite in Sector 7 to unlock this field record.',
      phaseTag: 'PHASE 1 // COMBAT',
      stats: [
        { label: 'Threat Level', value: 'Tier I — Pack Hunter' },
        { label: 'Color Classes', value: 'Black (Standard), Green (Poison), Red (Blooded)' },
        { label: 'Special Hazards', value: 'Bio-Corrosion DOT / Heavy Melee Damage' }
      ],
      variants: [
        {
          label: 'Obsidian Crawler',
          icon: '🕷️',
          color: '#94a3b8',
          tag: 'STANDARD',
          description: 'Balanced pack hunter (10 DMG, 115 SPD, 22 HP).'
        },
        {
          label: 'Toxic Green',
          icon: '☣️',
          color: '#4ade80',
          tag: 'CORROSIVE',
          description: 'Secretes venom inflicting Bio-Corrosion DOT (-3 HP/s, 8 DMG).'
        },
        {
          label: 'Crimson Blooded',
          icon: '🩸',
          color: '#f87171',
          tag: 'APEX HITTER',
          description: 'Frenzied blood sprint with devastating direct bite (18 DMG, 132 SPD).'
        }
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
        { label: 'Drop', value: 'EXP Orbs & RP Coins' }
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
      status: 'undiscovered',
      icon: '⚡',
      classification: 'Active Weapon // Auto-Target',
      summary: 'High-frequency kinetic bursts that automatically lock onto the nearest threat.',
      description:
        'Standard containment firearm module. Automatically locks onto the nearest parasite and unleashes plasma rounds.',
      unlockHint: 'Engage parasites using the auto-targeting Pulse Carbine during deployment.',
      phaseTag: 'PHASE 1 // COMBAT',
      stats: [
        { label: 'Targeting', value: 'Nearest Host Signature' },
        { label: 'Fire Mode', value: 'Automatic Pulse Bursts' },
        { label: 'Upgrade Effect', value: '+Fire Rate & Damage per Rank' }
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
        'The inaugural outbreak phase of Project Parasite. Containment operatives deploy into the Sector 7 perimeter to absorb EXP spores, collect RP Coins, harvest rare Biomass Spires, and establish the Field Codex and Research Lab baseline.',
      unlockHint: 'Examined upon initial protocol activation.',
      phaseTag: 'PHASE 1 // THE FALLOUT',
      stats: [
        { label: 'Season Status', value: 'Active Now (Phase 1)' },
        { label: 'Active Sector', value: 'Sector 7 Perimeter' },
        { label: 'Primary Objective', value: 'EXP Progression & Rare Biomass' }
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
        'Dormant spores mutate into pursuing Rupters, Assimilated Humans, Volatile Spore Carriers, and Adapted Longarms bosses. Activates combat damage for level-up survival skills.',
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
        'Unlocks Research Lab synthesis spending RP Coins and rare Biomass on permanent Bio-Research rig upgrades, custom containment suit cosmetics, Operator Ranger requisition, and deep-core deployment into The Hive.',
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
      unlockHint: 'Examined upon initial protocol activation.',
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
      summary: 'Initial outbreak site containing EXP spores, RP Coins, and rare Biomass Spires.',
      description:
        'An overrun research perimeter where parasitic spores first breached containment during Phase 1: The Fallout. Features unbounded 512px chunks with magnetic EXP spores, RP Coins, and rare Biomass Spires.',
      unlockHint: 'Examined upon initial protocol activation.',
      phaseTag: 'PHASE 1 // THE FALLOUT',
      stats: [
        { label: 'Threat Level', value: 'Level I — Low Breach' },
        { label: 'World Topology', value: 'Unbounded 512px Sector Chunks' },
        { label: 'Field Distribution', value: '70% Blue EXP / 30% Orange EXP / 80% RP Coins' }
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
      unlockHint: 'Planned for Phase 3A: The Synthesis (Character Unlocking via RP Coins & Biomass).',
      phaseTag: 'PHASE 3A // THE SYNTHESIS',
      stats: [
        { label: 'Vitality Rating', value: '55 / 100' },
        { label: 'Mobility Rating', value: '95 / 100' },
        { label: 'Unlock Cost', value: '250 RP Coins & 5 Biomass' }
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

  private readonly unlockedIds = signal<Set<string>>(this.loadInitialUnlockedIdsSync());

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

  constructor() {
    void this.hydrateFromIndexedDb();
  }

  private loadInitialUnlockedIdsSync(): Set<string> {
    const initial = new Set<string>(this.defaultUnlockedIds);

    const mirror = this.persistence.readMirrorSync<PersistedCodexV1>('codex_records');
    if (mirror && Array.isArray(mirror.unlockedIds)) {
      for (const item of mirror.unlockedIds) {
        if (typeof item === 'string') {
          initial.add(item);
        }
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(this.legacyStorageKey);
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
        // Ignore storage read errors
      }
    }

    return initial;
  }

  private async hydrateFromIndexedDb(): Promise<void> {
    const stored = await this.persistence.loadCodex();
    if (stored && Array.isArray(stored.unlockedIds)) {
      const merged = new Set<string>([...this.unlockedIds(), ...stored.unlockedIds]);
      this.unlockedIds.set(merged);
    } else {
      await this.persistence.saveCodex(Array.from(this.unlockedIds()));
    }
  }

  private saveUnlockedIds(ids: Set<string>): void {
    const arr = Array.from(ids);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(this.legacyStorageKey, JSON.stringify(arr));
      } catch {
        // Ignore storage quota errors
      }
    }
    void this.persistence.saveCodex(arr);
  }

  getEntriesByCategory(category: 'all' | CodexCategory): CodexEntry[] {
    const all = this.entries();
    if (category === 'all') {
      return all;
    }
    return all.filter((e) => e.category === category);
  }

  isUnlocked(id: string): boolean {
    return this.unlockedIds().has(id);
  }

  /**
   * Grants/unlocks a discoverable Codex entry when the player encounters or collects it in-game.
   * Returns the newly unlocked CodexEntry if this was the first time it was granted, or null if already unlocked.
   */
  unlockEntry(id: string): CodexEntry | null {
    const target = this.baseCatalog.find((e) => e.id === id);
    if (!target || target.status === 'development') {
      return null;
    }

    const current = this.unlockedIds();
    if (current.has(id)) {
      return null;
    }

    const updated = new Set<string>(current);
    updated.add(id);
    this.unlockedIds.set(updated);
    this.saveUnlockedIds(updated);

    return this.entries().find((e) => e.id === id) ?? null;
  }
}
