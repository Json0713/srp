# Project Parasite — Game Encyclopedia & Codex Registry (`CODEX.md`)

## 1. Overview & Purpose

This document is the canonical **Game Handbook & Encyclopedia Registry** for **Project Parasite (`srp`)**. It serves two synchronized purposes:

1. **Developer & AI Agent Reference:** Tracks every item, resource, parasite threat, power/skill, operator, and zone in the game, along with its implementation status and unlock condition.
2. **Player In-Game Codex (`/codex`):** Powers the in-game Encyclopedia ("Codex") UI where players inspect records they have been granted/unlocked during gameplay.

---

## 2. Discovery & Visibility Rules

Every Codex record has one of three visibility states (`CodexStatus`):

| Status | Meaning | Player UI Behavior |
| :--- | :--- | :--- |
| **`discovered`** | Granted to the player at start or unlocked via an in-game action. | Full dossier, lore, telemetry stats, and icon are visible. |
| **`undiscovered`** | Implemented in the current build, but not yet obtained/encountered by the player. | Title and lore are redacted (`[UNDISCOVERED RECORD]`). Only the code and **Unlock Hint** are shown until granted in-game. |
| **`development`** | Planned for an upcoming milestone (e.g., Phase 3A Parasites, Phase 3B Skills). | Marked with `[UNDER DEVELOPMENT — PHASE X]`. Shows blueprint classification and planned role without misrepresenting it as active gameplay. |

> **Mandatory Synchronization Rule:** Whenever a new item, resource, parasite, power, operator, or zone is added or updated in gameplay code, both this `.agents/context/CODEX.md` handbook and `src/app/core/services/codex.service.ts` **must** be updated together.

---

## 3. Category I — Items & Biomass (`items`)

| ID | Code | Title | Default Status | Grant / Unlock Condition | Phase | Summary & Telemetry |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `raw-biomass` | `ITM-01` | **Raw Biomass Spore** | `undiscovered` | Granted automatically when the player harvests a Biomass Spire node (`E`) in `MainScene`. | Phase 1 / 2B (Active) | Luminescent parasitic spore cluster harvested from dormant spires. Primary survival catalyst. |
| `srp-coin` | `ITM-02` | **SRP Bio-Credit** | `development` | Dropped by elite assimilated hosts and loot chests. | Phase 3C / 4A (Planned) | Standardized containment currency used in the Research Lab to synthesize Bio-Research upgrades and Rig Cosmetics. |
| `chitin-shard` | `ITM-03` | **Hardened Chitin Shard** | `development` | Harvested from eliminated Rupter and Assimilated husks. | Phase 3A (Planned) | Dense exoskeletal plating used for field armor reinforcement and crafting. |
| `containment-chest` | `ITM-04` | **Bio-Containment Cache** | `development` | Dropped by boss parasites upon elimination. | Phase 3C (Planned) | High-security supply cache containing randomized session buffs and SRP Bio-Credits. |

---

## 4. Category II — Parasite Bestiary (`parasites`)

*Inspired by Minecraft's **Scape and Run: Parasites** mod. Currently registered as `development` placeholders until Milestone 3A (Basic Combat & Enemy Behavior).*

| ID | Code | Title | Default Status | Threat Tier | Phase | Behavioral Blueprint |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `parasite-rupter` | `PRS-01` | **Rupter (Crawler)** | `development` | Tier I — Scout | Phase 3A (Planned) | Fast, six-legged arthropod parasite that relentlessly pursues the operator in packs and leaps into melee range. |
| `parasite-assimilated` | `PRS-02` | **Assimilated Human** | `development` | Tier I — Host | Phase 3A (Planned) | Former containment personnel overtaken by parasitic neural tendrils. Advances steadily in large waves. |
| `parasite-bogle` | `PRS-03` | **Volatile Spore Carrier** | `development` | Tier II — Mutated | Phase 3B (Planned) | Bloated biomass host that ruptures on proximity, releasing toxic spore clouds across the arena. |
| `parasite-longarms` | `PRS-04` | **Adapted Longarms** | `development` | Tier III — Apex Boss | Phase 3C (Planned) | Towering, heavily armored evolved parasite with extended scythe limbs. Drops Bio-Containment Caches. |

---

## 5. Category III — Powers & Survival Skills (`powers`)

*Inspired by **Magic Survival**. Currently registered as `development` placeholders until Milestone 3B (XP, Orbs, and Level-Up Skills).*

| ID | Code | Title | Default Status | Archetype | Phase | Skill Blueprint |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `power-pulse-overclock` | `PWR-01` | **Pulse Carbine Overclock** | `development` | Primary Weapon | Phase 3A / 3B (Planned) | Rapid-fire kinetic bursts that automatically target the nearest parasitic signature. |
| `power-spore-barrier` | `PWR-02` | **Bio-Repulsor Field** | `development` | Defensive Aura | Phase 3B (Planned) | Generates a pulsing electromagnetic ring around the operator that damages and slows nearby parasites. |
| `power-orbital-drone` | `PWR-03` | **Sentinel Micro-Drones** | `development` | Autonomous Orbit | Phase 3B (Planned) | Deploys rotating containment drones that slice through incoming Rupter swarms. |
| `power-thermal-purge` | `PWR-04` | **Thermal Incineration Wave** | `development` | Area Eradication | Phase 3B (Planned) | Periodically unleashes a high-temperature shockwave that purges surrounding biomass and hosts. |

---

## 6. Category IV — Field Archive: Operators & Sectors (`archive`)

| ID | Code | Title | Default Status | Grant / Unlock Condition | Phase | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `op-survivor` | `ARC-01` | **Operator: Survivor** | `discovered` | Granted by default on initial boot. | Phase 2A (Active) | Vanguard containment operative equipped with a Pulse Carbine and Bio-Filter Rig. |
| `zone-sector7` | `ARC-02` | **Sector 7 Perimeter** | `discovered` | Granted by default on initial boot. | Phase 2A (Active) | Initial quarantine breach site containing active Biomass Spire nodes. |
| `op-ranger` | `ARC-03` | **Operator: Ranger** | `development` | Unlockable via SRP Bio-Credits in Phase 4A. | Phase 4A (Planned) | High-mobility marksman specialist equipped with a piercing Rail Rifle. |
| `zone-hive` | `ARC-04` | **The Hive Core** | `development` | Unlockable after clearing Sector 7. | Phase 3 / 4 (Planned) | Subterranean flesh-network and high-density outbreak epicenter. |

---

## 7. Research Lab Registry (`/research` — Bio-Research & Rig Cosmetics)

Managed by `MenuStateService.researchNodes` (`src/app/core/services/menu-state.service.ts`) and rendered in `src/app/screens/research/research.ts`.

| ID | Code | Track | Title | Max Rank | Cost (SRP) | Phase | Effect Summary |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `chitin-plating` | `RES-01` | `upgrades` | **Chitin Exo-Plating** | 5 | 100 | `DEV PHASE 4B` | `+6% Damage Reduction per Rank` |
| `spore-extractor` | `RES-02` | `upgrades` | **Magnetic Spore Extractor** | 5 | 120 | `DEV PHASE 4B` | `+15% Harvest & Orb Radius per Rank` |
| `combat-stims` | `RES-03` | `upgrades` | **Adrenaline Stims Mk.II** | 5 | 150 | `DEV PHASE 4B` | `+4% Base Move Speed per Rank` |
| `neural-overclock` | `RES-04` | `upgrades` | **Neural Targeting Link** | 5 | 180 | `DEV PHASE 4B` | `-5% Skill Cooldown per Rank` |
| `suit-hazmat-gold` | `COS-01` | `cosmetics` | **Aegis Hazmat Mk.IV** | 1 | 300 | `DEV PHASE 4C` | `Visual Override: Golden Visor & Trim` |
| `suit-crimson-carapace` | `COS-02` | `cosmetics` | **Assimilated Carapace Rig** | 1 | 450 | `DEV PHASE 4C` | `Visual Override: Parasitic Crimson Aura` |
| `trail-spore-wake` | `COS-03` | `cosmetics` | **Bioluminescent Spore Wake** | 1 | 250 | `DEV PHASE 4C` | `Visual Override: Emerald Footstep Particles` |


