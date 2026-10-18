# Project Parasite — Field Codex & Game Encyclopedia (`CODEX.md`)

## 1. Purpose & Governance

This file is the canonical **Game Encyclopedia & Field Codex Registry** for **Project Parasite (`srp`)**.
It serves two synchronized roles:

1. **Developer & Agent Reference:** Every game phase, item, resource, parasite, survival power, operator, sector, and Research Lab node in the game is cataloged here with its ID, classification, grant condition, and Game Phase tag.
2. **In-Game Player Encyclopedia (`/codex`):** The Angular `CodexService` (`src/app/core/services/codex.service.ts`) and `Codex` screen (`src/app/screens/codex/codex.ts`) mirror this registry.

### Mandatory Synchronization Rule
Whenever a new item, parasite, power, operator, sector, or research node is added or updated in the codebase:
- Update `.agents/context/CODEX.md`.
- Update `CodexService` (`src/app/core/services/codex.service.ts`) and/or `MenuStateService` (`src/app/core/services/menu-state.service.ts`).
- Ensure any newly implemented gameplay item has a deterministic in-game grant trigger (`codexService.grantEntry('<id>')`).

---

## 2. Official Outbreak Phase Registry (Game Seasons)

| Phase ID | Code | Official Title | Subtitle | Status | Season Overview |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `phase-1-fallout` | `PHS-01` | **Phase 1: The Fallout** | *Initial Containment Collapse & Biomass Extraction* | **ACTIVE** | Frontline deployment into the overrun Sector 7 perimeter to harvest dormant Biomass Spire nodes, decrypt the Field Codex, and establish the Research Lab baseline. |
| `phase-2-assimilation` | `PHS-02` | **Phase 2: The Assimilation** | *Parasite Swarm Escalation & Survival Powers* | **UPCOMING** | Dormant spores mutate into pursuing Rupters, Assimilated Humans, Volatile Spore Carriers, and Adapted Longarms bosses. Introduces auto-attack weapons, XP orbs, and randomized level-up skills. |
| `phase-3-synthesis` | `PHS-03` | **Phase 3: The Synthesis** | *Research Lab Evolution & The Hive Core* | **UPCOMING** | Unlocks persistent SRP Bio-Credits, permanent Bio-Research rig upgrades, custom Rig Cosmetics, Operator Ranger requisition, and deep-core deployment into The Hive. |

---

## 3. Visibility & Grant States (`CodexStatus`)

- **`discovered` (Granted):** The player has obtained, encountered, or unlocked this entry during gameplay. Full lore, telemetry stats, and behavioral notes are visible in the player's Field Codex (`📘`).
- **`undiscovered` (Locked / Encrypted):** The feature exists in the active build, but the player has not yet triggered its grant condition in-game. The UI masks the full description and displays the **Unlock Hint**.
- **`development` (Upcoming Phase Blueprint):** Planned content for **Phase 2: The Assimilation** or **Phase 3: The Synthesis**. Displayed in the Codex with a phase badge so players and developers can preview upcoming *Scape and Run: Parasites* and *Magic Survival* systems.

---

## 4. Category I — Items & Biomass (`items`)

| ID | Code | Title | Default Status | Grant / Unlock Condition | Game Phase | Summary & Telemetry |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `raw-biomass` | `ITM-01` | **Rare Biomass Crystal** | `undiscovered` | Granted automatically when the player harvests a rare Biomass Spire (`E`) in `MainScene`. | `PHASE 1 // THE FALLOUT` (Active) | Ultra-rare diamond-grade parasitic crystal (`18%` chunk spawn). Grants `+1 Biomass`, `+100+ EXP` (scaled by phase/time/level), and `+10–25 RP Coins`. |
| `rp-coin` | `ITM-02` | **RP Coin (Research Parasitic Coin)** | `undiscovered` | Granted automatically on proximity magnet pickup of a golden RP Coin or Biomass Spire harvest. | `PHASE 1 // THE FALLOUT` (Active) | Standardized Research Parasitic Coin (`80%` chunk presence) automatically drawn by the operator's magnetic extractor for Research Lab synthesis. |
| `exp-orb-blue` | `ITM-03` | **Common Blue EXP Spore** | `undiscovered` | Granted automatically on proximity magnet pickup of a blue EXP orb. | `PHASE 1 // THE FALLOUT` (Active) | Ambient cyan bio-luminescent spore (`70%` spawn ratio). Grants `1–15` base EXP and ramps upward (`+2 EXP/level`) alongside level requirements. |
| `exp-orb-orange` | `ITM-04` | **Rare Orange EXP Core** | `undiscovered` | Granted automatically on proximity magnet pickup of an orange EXP orb. | `PHASE 1 // THE FALLOUT` (Active) | High-density amber neural core (`30%` spawn ratio). Grants `15–25` base EXP and ramps upward (`+4 EXP/level`) alongside level requirements. |
| `chitin-shard` | `ITM-05` | **Hardened Chitin Shard** | `development` | Harvested from eliminated Rupter and Assimilated husks. | `PHASE 2A // THE ASSIMILATION` | Dense exoskeletal plating used for field armor reinforcement and crafting. |
| `containment-chest` | `ITM-06` | **Bio-Containment Cache** | `development` | Dropped by boss parasites upon elimination. | `PHASE 2C // THE ASSIMILATION` | High-security supply cache containing randomized session buffs and RP Coins. |

---

## 5. Category II — Parasite Bestiary (`parasites`)

*Inspired by Minecraft's **Scape and Run: Parasites** mod. Registered as `development` blueprints for **Phase 2: The Assimilation**.*

| ID | Code | Title | Default Status | Threat Tier | Game Phase | Behavioral Blueprint |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `parasite-rupter` | `PRS-01` | **Rupter (Crawler)** | `development` | Tier I — Scout | `PHASE 2A // THE ASSIMILATION` | Fast, six-legged arthropod parasite that relentlessly pursues the operator in packs and leaps into melee range. |
| `parasite-assimilated` | `PRS-02` | **Assimilated Human** | `development` | Tier I — Host | `PHASE 2A // THE ASSIMILATION` | Former containment personnel overtaken by parasitic neural tendrils. Advances steadily in large waves. |
| `parasite-bogle` | `PRS-03` | **Volatile Spore Carrier** | `development` | Tier II — Mutated | `PHASE 2B // THE ASSIMILATION` | Bloated biomass host that ruptures on proximity, releasing toxic spore clouds across the arena. |
| `parasite-longarms` | `PRS-04` | **Adapted Longarms** | `development` | Tier III — Apex Boss | `PHASE 2C // THE ASSIMILATION` | Towering, heavily armored evolved parasite with extended scythe limbs. Drops Bio-Containment Caches. |

---

## 6. Category III — Powers & Survival Skills (`powers`)

*Inspired by **Magic Survival**. Registered as `development` blueprints for **Phase 2: The Assimilation**.*

| ID | Code | Title | Default Status | Archetype | Game Phase | Skill Blueprint |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `power-pulse-overclock` | `PWR-01` | **Pulse Carbine Overclock** | `development` | Primary Weapon | `PHASE 2A / 2B` | Rapid-fire kinetic bursts that automatically target the nearest parasitic signature. |
| `power-spore-barrier` | `PWR-02` | **Bio-Repulsor Field** | `development` | Defensive Aura | `PHASE 2B // THE ASSIMILATION` | Generates a pulsing electromagnetic ring around the operator that damages and slows nearby parasites. |
| `power-orbital-drone` | `PWR-03` | **Sentinel Micro-Drones** | `development` | Autonomous Orbit | `PHASE 2B // THE ASSIMILATION` | Deploys rotating containment drones that slice through incoming Rupter swarms. |
| `power-thermal-purge` | `PWR-04` | **Thermal Incineration Wave** | `development` | Area Eradication | `PHASE 2B // THE ASSIMILATION` | Periodically unleashes a high-temperature shockwave that purges surrounding biomass and hosts. |

---

## 7. Category IV — Field Archive: Outbreak Phases, Operators & Sectors (`archive`)

| ID | Code | Title | Default Status | Grant / Unlock Condition | Game Phase | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `phase-1-fallout` | `PHS-01` | **Phase 1: The Fallout** | `discovered` | Granted by default on initial boot. | `PHASE 1 // THE FALLOUT` (Active) | Inaugural outbreak season: Sector 7 containment collapse and Biomass Spire extraction. |
| `phase-2-assimilation` | `PHS-02` | **Phase 2: The Assimilation** | `development` | Planned for Phase 2 season activation. | `PHASE 2 // THE ASSIMILATION` | Parasitic swarm awakening, wave combat, and survival power evolution. |
| `phase-3-synthesis` | `PHS-03` | **Phase 3: The Synthesis** | `development` | Planned for Phase 3 season activation. | `PHASE 3 // THE SYNTHESIS` | Research Lab synthesis activation, Rig Cosmetics, and The Hive Core. |
| `op-survivor` | `ARC-01` | **Operator: Survivor** | `discovered` | Granted by default on initial boot. | `PHASE 1 // THE FALLOUT` (Active) | Vanguard containment operative equipped with a Pulse Carbine and Bio-Filter Rig. |
| `zone-sector7` | `ARC-02` | **Sector 7 Perimeter** | `discovered` | Granted by default on initial boot. | `PHASE 1 // THE FALLOUT` (Active) | Initial quarantine breach site containing active Biomass Spire nodes. |
| `op-ranger` | `ARC-03` | **Operator: Ranger** | `development` | Unlockable via SRP Bio-Credits in Phase 3A. | `PHASE 3A // THE SYNTHESIS` | High-mobility marksman specialist equipped with a piercing Rail Rifle. |
| `zone-hive` | `ARC-04` | **The Hive Core** | `development` | Unlockable after clearing Sector 7 in Phase 3. | `PHASE 3 // THE SYNTHESIS` | Subterranean flesh-network and high-density outbreak epicenter. |

---

## 8. Research Lab Registry (`/research` — Bio-Research & Rig Cosmetics)

Managed by `MenuStateService.researchNodes` (`src/app/core/services/menu-state.service.ts`) and rendered in `src/app/screens/research/research.ts`. Both `🧪 Biomass` and `🪙 RP Coins` are displayed in the top-right header of the Research Lab and persisted via IndexedDB `v1` (`PersistenceService`).

| ID | Code | Track | Title | Max Rank | Cost (`🪙 RP` + `🧪 BIO`) | Game Phase | Effect Summary |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `chitin-plating` | `RES-01` | `upgrades` | **Chitin Exo-Plating** | 5 | `100 RP` + `2 BIO` | `PHASE 3B // THE SYNTHESIS` | `+6% Damage Reduction per Rank` |
| `spore-extractor` | `RES-02` | `upgrades` | **Magnetic Spore Extractor** | 5 | `120 RP` + `2 BIO` | `PHASE 3B // THE SYNTHESIS` | `+15% Harvest & Orb Radius per Rank` |
| `combat-stims` | `RES-03` | `upgrades` | **Adrenaline Stims Mk.II** | 5 | `150 RP` + `3 BIO` | `PHASE 3B // THE SYNTHESIS` | `+4% Base Move Speed per Rank` |
| `neural-overclock` | `RES-04` | `upgrades` | **Neural Targeting Link** | 5 | `180 RP` + `4 BIO` | `PHASE 3B // THE SYNTHESIS` | `-5% Skill Cooldown per Rank` |
| `suit-hazmat-gold` | `COS-01` | `cosmetics` | **Aegis Hazmat Mk.IV** | 1 | `300 RP` + `5 BIO` | `PHASE 3C // THE SYNTHESIS` | `Visual Override: Golden Visor & Trim` |
| `suit-crimson-carapace` | `COS-02` | `cosmetics` | **Assimilated Carapace Rig** | 1 | `450 RP` + `8 BIO` | `PHASE 3C // THE SYNTHESIS` | `Visual Override: Parasitic Crimson Aura` |
| `trail-spore-wake` | `COS-03` | `cosmetics` | **Bioluminescent Spore Wake** | 1 | `250 RP` + `4 BIO` | `PHASE 3C // THE SYNTHESIS` | `Visual Override: Emerald Footstep Particles` |
