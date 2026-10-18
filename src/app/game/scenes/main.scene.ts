import { Scene, GameObjects, Types, Input, Math as PhaserMath, Structs } from 'phaser';
import { calculatePlayerMovement, MovementInput } from '../systems/movement.system';
import {
  findNearestInteractableResource,
  ResourceState
} from '../systems/interaction.system';
import { calculateJoystickVector } from '../systems/input.system';
import {
  CHUNK_SIZE,
  ChunkData,
  ChunkManager,
  generateRunSeed
} from '../systems/chunk.system';
import {
  applyExpGain,
  calculateBiomassSpireReward,
  calculateExpRequired,
  calculateOrbExpValue,
  updateMagnetPickups
} from '../systems/progression.system';
import {
  ParasiteEnemy,
  Projectile,
  calculateParasiteSpawnBatch,
  calculateWeaponStats,
  checkPlayerContactDamage,
  createProjectile,
  findNearestEnemy,
  rollParasiteDrops,
  spawnParasite,
  updateParasites,
  updatePlayerCorrosion,
  updateProjectiles
} from '../systems/combat.system';
import { FieldPickupItem, GameHudSnapshot, InputMode, PersistedSessionV1 } from '../../core/models/game-data.model';

interface WasdKeys {
  W: Input.Keyboard.Key;
  A: Input.Keyboard.Key;
  S: Input.Keyboard.Key;
  D: Input.Keyboard.Key;
}

export class MainScene extends Scene {
  private playerShadow!: GameObjects.Ellipse;
  private player!: GameObjects.Rectangle;
  private playerVisor!: GameObjects.Rectangle;

  private cursors?: Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: WasdKeys;
  private interactKey?: Input.Keyboard.Key;

  private playerSpeed = 300; // Pixels per second
  private readonly playerSize = 32;
  private readonly interactDistance = 54;
  private readonly cameraLerp = 0.14;

  // Magic Survival proximity magnet parameters for EXP Orbs & RP Coins
  private magnetRadius = 78;
  private readonly collectRadius = 22;
  private readonly magnetSpeed = 460;

  // Combat & Health State (Magic Survival & Scape and Run: Parasites inspired)
  private playerHp = 100;
  private playerMaxHp = 100;
  private invulnerabilityTimer = 0;
  private playerCorrosionTimer = 0;
  private playerCorrosionTickTimer = 0;
  private enemiesEliminated = 0;
  private pulseWeaponRank = 0;
  private weaponTimer = 0;
  private spawnTimer = 0;
  private activeEnemies: ParasiteEnemy[] = [];
  private activeProjectiles: Projectile[] = [];

  private environmentGraphics!: GameObjects.Graphics;
  private pickupGraphics!: GameObjects.Graphics;
  private resourceGraphics!: GameObjects.Graphics;
  private proximityGraphics!: GameObjects.Graphics;
  private compassGraphics!: GameObjects.Graphics;
  private enemyGraphics!: GameObjects.Graphics;
  private projectileGraphics!: GameObjects.Graphics;
  private interactFeedbackText!: GameObjects.Text;
  private promptText!: GameObjects.Text;
  private damageTextPool: GameObjects.Text[] = [];

  private chunkManager!: ChunkManager;
  private currentSectorLabel = 'SEC +0:+0';
  private nearestResourceId: string | null = null;
  private facingVector = { x: 0, y: 1 };

  // In-run progression state (always starts at 0 on a new run; banked only on Abort/Death)
  private elapsedSeconds = 0;
  private autosaveTimer = 0;
  private playerLevel = 1;
  private currentExp = 0;
  private expToNextLevel = calculateExpRequired(1);
  private runBiomass = 0;
  private runRpCoins = 0;
  private pendingLevelUps = 0;

  private inputMode: InputMode = 'pc';
  private joystickBase!: GameObjects.Graphics;
  private joystickThumb!: GameObjects.Graphics;
  private interactButton!: GameObjects.Graphics;
  private interactButtonText!: GameObjects.Text;

  private isPointerDown = false;
  private pointerX = 0;
  private pointerY = 0;
  private interactRequested = false;
  private activePointer: Input.Pointer | null = null;

  private readonly onRegistryChange = (_parent: unknown, key: string, data: unknown): void => {
    if (key === 'inputMode' && (data === 'pc' || data === 'mobile')) {
      this.applyInputMode(data);
    }
  };

  private readonly onDirectInputModeChange = (mode: unknown): void => {
    if (mode === 'pc' || mode === 'mobile') {
      this.applyInputMode(mode);
    }
  };

  private readonly onSkillSelected = (skillId: unknown): void => {
    if (this.pendingLevelUps > 0) {
      this.pendingLevelUps -= 1;
    }
    if (skillId === 'passive-magnet-coil') {
      this.magnetRadius += 18;
    } else if (skillId === 'passive-servo-boost') {
      this.playerSpeed = Math.round(this.playerSpeed * 1.08);
    } else if (skillId === 'power-pulse-overclock') {
      this.pulseWeaponRank += 1;
    }
    this.emitHudSnapshot();
  };

  private readonly onSceneResume = (): void => {
    const storedMode = this.registry.get('inputMode');
    if (storedMode === 'pc' || storedMode === 'mobile') {
      this.applyInputMode(storedMode);
    }
  };

  private readonly onResize = (_gameSize: Structs.Size): void => {
    this.drawActiveChunks(this.chunkManager.getActiveChunks());
    this.drawPickups();
    this.drawResources();
    this.drawProximityIndicator();
    if (this.inputMode === 'mobile') {
      this.drawMobileUI();
    }
  };

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#090d14');

    const resumeSession = this.registry.get('resumeSession') as PersistedSessionV1 | null;
    const defaultSpawnX = Math.round(CHUNK_SIZE * 0.5);
    const defaultSpawnY = Math.round(CHUNK_SIZE * 0.5);

    if (resumeSession && resumeSession.isActive) {
      this.elapsedSeconds = Math.max(0, Number(resumeSession.elapsedSeconds) || 0);
      this.playerLevel = Math.max(1, Number(resumeSession.level) || 1);
      this.currentExp = Math.max(0, Number(resumeSession.currentExp) || 0);
      this.expToNextLevel =
        Math.max(100, Number(resumeSession.expToNextLevel)) ||
        calculateExpRequired(this.playerLevel);
      this.runBiomass = Math.max(0, Number(resumeSession.runBiomass) || 0);
      this.runRpCoins = Math.max(0, Number(resumeSession.runRpCoins) || 0);
      this.pendingLevelUps = Math.max(0, Number(resumeSession.pendingLevelUps) || 0);
      this.playerHp = typeof resumeSession.playerHp === 'number' ? resumeSession.playerHp : 100;
      this.playerMaxHp = typeof resumeSession.playerMaxHp === 'number' ? resumeSession.playerMaxHp : 100;
      this.enemiesEliminated = typeof resumeSession.enemiesEliminated === 'number' ? resumeSession.enemiesEliminated : 0;

      const skills = resumeSession.chosenSkills ?? {};
      const magnetRanks = Math.max(0, Number(skills['passive-magnet-coil']) || 0);
      const speedRanks = Math.max(0, Number(skills['passive-servo-boost']) || 0);
      this.pulseWeaponRank = Math.max(0, Number(skills['power-pulse-overclock']) || 0);
      this.magnetRadius = 78 + magnetRanks * 18;
      this.playerSpeed = Math.round(300 * Math.pow(1.08, speedRanks));

      this.chunkManager = new ChunkManager(
        resumeSession.runSeed || generateRunSeed(),
        CHUNK_SIZE,
        2
      );
      this.chunkManager.restoreCollectedState(
        resumeSession.collectedResourceIds ?? [],
        resumeSession.collectedPickupIds ?? []
      );
    } else {
      // Fresh deployment: Biomass, RP Coins, and Combat counters start at fresh baseline
      this.elapsedSeconds = 0;
      this.playerLevel = 1;
      this.currentExp = 0;
      this.expToNextLevel = calculateExpRequired(1);
      this.runBiomass = 0;
      this.runRpCoins = 0;
      this.pendingLevelUps = 0;
      this.playerHp = 100;
      this.playerMaxHp = 100;
      this.invulnerabilityTimer = 0;
      this.enemiesEliminated = 0;
      this.pulseWeaponRank = 0;
      this.weaponTimer = 0;
      this.spawnTimer = 0;
      this.activeEnemies = [];
      this.activeProjectiles = [];
      this.playerSpeed = 300;
      this.magnetRadius = 78;
      this.chunkManager = new ChunkManager(generateRunSeed(), CHUNK_SIZE, 2);
    }

    this.autosaveTimer = 0;

    // 2. World-Space Graphics Layers (Depth-ordered for 2.5D presentation)
    this.environmentGraphics = this.add.graphics().setDepth(1);
    this.pickupGraphics = this.add.graphics().setDepth(2);
    this.resourceGraphics = this.add.graphics().setDepth(3);
    this.proximityGraphics = this.add.graphics().setDepth(4);
    this.compassGraphics = this.add.graphics().setDepth(5);
    this.enemyGraphics = this.add.graphics().setDepth(6.5);
    this.projectileGraphics = this.add.graphics().setDepth(9);

    this.damageTextPool = [];
    for (let i = 0; i < 20; i++) {
      const txt = this.add
        .text(0, 0, '', {
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#fef08a',
          fontStyle: 'bold',
          stroke: '#080c12',
          strokeThickness: 3
        })
        .setOrigin(0.5, 0.5)
        .setDepth(12)
        .setVisible(false);
      this.damageTextPool.push(txt);
    }

    // 3. Player Entity Spawned at Origin or Restored Position with Smooth Camera Follow
    const startX =
      resumeSession && resumeSession.isActive && typeof resumeSession.playerX === 'number'
        ? resumeSession.playerX
        : defaultSpawnX;
    const startY =
      resumeSession && resumeSession.isActive && typeof resumeSession.playerY === 'number'
        ? resumeSession.playerY
        : defaultSpawnY;

    this.playerShadow = this.add
      .ellipse(startX, startY + 14, 30, 12, 0x000000, 0.55)
      .setDepth(6);
    this.player = this.add
      .rectangle(startX, startY, this.playerSize, this.playerSize, 0x22c55e)
      .setDepth(7);
    this.player.setStrokeStyle(2, 0x86efac);
    this.playerVisor = this.add
      .rectangle(startX, startY + 8, 16, 6, 0x052e16)
      .setDepth(8);

    this.cameras.main.centerOn(startX, startY);
    this.cameras.main.startFollow(this.player, false, this.cameraLerp, this.cameraLerp);

    // 4. Stream Initial Active Chunks Around Spawn
    const initialWindow = this.chunkManager.updateActiveWindow({ x: startX, y: startY }, true);
    this.currentSectorLabel = initialWindow.currentChunk.sectorLabel;
    this.drawActiveChunks(initialWindow.activeChunks);
    this.drawPickups();
    this.drawResources();
    this.drawSporeCompass();

    // 5. World-space Prompts & Floating Harvest Feedback
    this.promptText = this.add
      .text(0, 0, '[E] HARVEST BIOMASS', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#4ade80',
        backgroundColor: 'rgba(8, 12, 18, 0.85)',
        padding: { x: 6, y: 3 }
      })
      .setOrigin(0.5, 1)
      .setDepth(10)
      .setVisible(false);

    this.interactFeedbackText = this.add
      .text(0, 0, '+1 BIOMASS', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#fbbf24',
        fontStyle: 'bold',
        backgroundColor: 'rgba(8, 12, 18, 0.9)',
        padding: { x: 7, y: 4 }
      })
      .setOrigin(0.5, 1)
      .setDepth(11)
      .setVisible(false);

    // 6. Keyboard Input Setup
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D') as WasdKeys;
      this.interactKey = this.input.keyboard.addKey('E');
    }

    // 7. Dynamic Input Mode Synchronization & Mobile UI
    this.createMobileUI();
    const storedMode = this.registry.get('inputMode');
    this.applyInputMode(storedMode === 'mobile' ? 'mobile' : 'pc');

    this.registry.events.on('changedata-inputMode', this.onRegistryChange);
    this.registry.events.on('setdata', this.onRegistryChange);
    this.game.events.on('input-mode-changed', this.onDirectInputModeChange);
    this.game.events.on('skill-selected', this.onSkillSelected);
    this.events.on('resume', this.onSceneResume);

    // 8. Viewport Resize & Cleanup Listeners
    this.scale.on('resize', this.onResize);
    this.events.once('shutdown', () => this.cleanupListeners());
    this.events.once('destroy', () => this.cleanupListeners());

    this.emitHudSnapshot();
  }

  private cleanupListeners(): void {
    this.registry.events.off('changedata-inputMode', this.onRegistryChange);
    this.registry.events.off('setdata', this.onRegistryChange);
    this.game.events.off('input-mode-changed', this.onDirectInputModeChange);
    this.game.events.off('skill-selected', this.onSkillSelected);
    this.events.off('resume', this.onSceneResume);
    this.scale.off('resize', this.onResize);
  }

  private applyInputMode(mode: InputMode): void {
    this.inputMode = mode;
    this.isPointerDown = false;
    this.activePointer = null;
    this.updateInputUI();
    this.drawProximityIndicator();
  }

  private getJoystickLayout(): {
    baseX: number;
    baseY: number;
    maxRadius: number;
    btnX: number;
    btnY: number;
    btnRadius: number;
  } {
    const isCompactLandscape = this.scale.height <= 500;
    const margin = isCompactLandscape ? 78 : 104;
    const maxRadius = isCompactLandscape ? 48 : 58;
    const btnRadius = isCompactLandscape ? 34 : 40;

    return {
      baseX: margin,
      baseY: this.scale.height - margin,
      maxRadius,
      btnX: this.scale.width - margin,
      btnY: this.scale.height - margin,
      btnRadius
    };
  }

  private createMobileUI(): void {
    this.joystickBase = this.add.graphics();
    this.joystickThumb = this.add.graphics();
    this.interactButton = this.add.graphics();
    this.interactButtonText = this.add.text(0, 0, 'E', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#e6edf3',
      fontStyle: 'bold'
    });
    this.interactButtonText.setOrigin(0.5);

    this.joystickBase.setScrollFactor(0).setDepth(20);
    this.joystickThumb.setScrollFactor(0).setDepth(21);
    this.interactButton.setScrollFactor(0).setDepth(20);
    this.interactButtonText.setScrollFactor(0).setDepth(21);

    this.input.addPointer(2);

    this.input.on('pointerdown', (pointer: Input.Pointer) => {
      if (this.inputMode !== 'mobile') return;

      const layout = this.getJoystickLayout();
      const distToButton = PhaserMath.Distance.Between(
        pointer.x,
        pointer.y,
        layout.btnX,
        layout.btnY
      );

      if (distToButton <= layout.btnRadius + 16) {
        this.interactRequested = true;
        return;
      }

      if (!this.activePointer && pointer.x <= this.scale.width * 0.65) {
        this.activePointer = pointer;
        this.isPointerDown = true;
        this.pointerX = pointer.x;
        this.pointerY = pointer.y;
      }
    });

    this.input.on('pointermove', (pointer: Input.Pointer) => {
      if (this.isPointerDown && this.inputMode === 'mobile' && pointer === this.activePointer) {
        this.pointerX = pointer.x;
        this.pointerY = pointer.y;
      }
    });

    this.input.on('pointerup', (pointer: Input.Pointer) => {
      if (pointer === this.activePointer) {
        this.isPointerDown = false;
        this.activePointer = null;
        this.drawMobileUI();
      }
    });
  }

  private drawMobileUI(thumbX?: number, thumbY?: number): void {
    if (this.inputMode !== 'mobile' || !this.joystickBase) return;

    const { baseX, baseY, maxRadius, btnX, btnY, btnRadius } = this.getJoystickLayout();
    const canHarvest = this.nearestResourceId !== null;

    this.joystickBase.clear();
    this.joystickBase.fillStyle(0x080c12, 0.55);
    this.joystickBase.fillCircle(baseX, baseY, maxRadius);
    this.joystickBase.lineStyle(2, 0x4ade80, 0.45);
    this.joystickBase.strokeCircle(baseX, baseY, maxRadius);

    this.joystickThumb.clear();
    this.joystickThumb.fillStyle(0x22c55e, 0.8);
    this.joystickThumb.fillCircle(thumbX ?? baseX, thumbY ?? baseY, 24);
    this.joystickThumb.lineStyle(2, 0x86efac, 0.9);
    this.joystickThumb.strokeCircle(thumbX ?? baseX, thumbY ?? baseY, 24);

    this.interactButton.clear();
    this.interactButton.fillStyle(canHarvest ? 0x16a34a : 0x0e141f, canHarvest ? 0.85 : 0.65);
    this.interactButton.fillCircle(btnX, btnY, btnRadius);
    this.interactButton.lineStyle(2, canHarvest ? 0x4ade80 : 0x56657e, 0.85);
    this.interactButton.strokeCircle(btnX, btnY, btnRadius);
    this.interactButtonText.setPosition(btnX, btnY);
  }

  private updateInputUI(): void {
    if (!this.joystickBase) return;
    const isMobile = this.inputMode === 'mobile';
    this.joystickBase.setVisible(isMobile);
    this.joystickThumb.setVisible(isMobile);
    this.interactButton.setVisible(isMobile);
    this.interactButtonText.setVisible(isMobile);

    if (isMobile) {
      this.drawMobileUI();
    }
  }

  private drawActiveChunks(chunks: ChunkData[]): void {
    this.environmentGraphics.clear();

    for (const chunk of chunks) {
      const { worldX, worldY } = chunk;

      this.environmentGraphics.fillStyle(0x0b1119, 1);
      this.environmentGraphics.fillRect(worldX, worldY, CHUNK_SIZE, CHUNK_SIZE);

      for (const feat of chunk.features) {
        if (feat.type === 'corrupted-patch') {
          this.environmentGraphics.fillStyle(0x131d28, 1);
          this.environmentGraphics.fillRect(feat.x, feat.y, feat.width, feat.height);
        } else if (feat.type === 'moss-slate') {
          this.environmentGraphics.fillStyle(0x0f1918, 1);
          this.environmentGraphics.fillRect(feat.x, feat.y, feat.width, feat.height);
        } else if (feat.type === 'spore-fleck') {
          this.environmentGraphics.fillStyle(0x1f4d33, 0.85);
          this.environmentGraphics.fillRect(feat.x, feat.y, feat.width, feat.height);
        } else if (feat.type === 'crimson-vein') {
          this.environmentGraphics.fillStyle(0x451820, 0.78);
          this.environmentGraphics.fillRect(feat.x, feat.y, feat.width, feat.height);
        }
      }

      this.environmentGraphics.lineStyle(1, 0x1e293b, 0.32);
      for (let gx = 0; gx <= CHUNK_SIZE; gx += 64) {
        this.environmentGraphics.lineBetween(worldX + gx, worldY, worldX + gx, worldY + CHUNK_SIZE);
      }
      for (let gy = 0; gy <= CHUNK_SIZE; gy += 64) {
        this.environmentGraphics.lineBetween(worldX, worldY + gy, worldX + CHUNK_SIZE, worldY + gy);
      }

      this.environmentGraphics.lineStyle(1, 0x22c55e, 0.14);
      this.environmentGraphics.strokeRect(worldX, worldY, CHUNK_SIZE, CHUNK_SIZE);

      for (const prop of chunk.props) {
        this.environmentGraphics.fillStyle(0x000000, 0.45);
        this.environmentGraphics.fillEllipse(
          prop.x,
          prop.y + prop.height * 0.55,
          prop.width + 8,
          10
        );

        const bodyColor = prop.variant === 'monolith' ? 0x1e293b : 0x172536;
        const capColor = prop.variant === 'monolith' ? 0x334155 : 0x26384d;
        this.environmentGraphics.fillStyle(bodyColor, 1);
        this.environmentGraphics.fillRect(
          prop.x - prop.width * 0.5,
          prop.y - prop.height * 0.5,
          prop.width,
          prop.height
        );
        this.environmentGraphics.fillStyle(capColor, 1);
        this.environmentGraphics.fillRect(
          prop.x - prop.width * 0.5,
          prop.y - prop.height * 0.5 - 5,
          prop.width,
          6
        );
      }
    }
  }

  /**
   * Draws all uncollected Field Pickups (70% Blue EXP Orbs, 30% Orange EXP Cores, and 80% RP Coins)
   * inside the active chunk window.
   */
  private drawPickups(): void {
    this.pickupGraphics.clear();
    const pickups = this.chunkManager.getActivePickups();

    for (const item of pickups) {
      if (item.collected) continue;

      if (item.kind === 'exp-blue') {
        // Common Blue EXP Orb (70%)
        this.pickupGraphics.fillStyle(0x0284c7, 0.35);
        this.pickupGraphics.fillCircle(item.x, item.y, 8);
        this.pickupGraphics.fillStyle(0x38bdf8, 0.95);
        this.pickupGraphics.fillCircle(item.x, item.y, 4.5);
      } else if (item.kind === 'exp-orange') {
        // Rare Orange EXP Core (30%)
        this.pickupGraphics.fillStyle(0xea580c, 0.4);
        this.pickupGraphics.fillCircle(item.x, item.y, 10);
        this.pickupGraphics.fillStyle(0xfb923c, 1);
        this.pickupGraphics.fillCircle(item.x, item.y, 6);
        this.pickupGraphics.lineStyle(1.5, 0xfde047, 0.85);
        this.pickupGraphics.strokeCircle(item.x, item.y, 6);
      } else if (item.kind === 'rp-coin') {
        // Golden RP Coin (Research Parasitic Coin)
        this.pickupGraphics.fillStyle(0x000000, 0.4);
        this.pickupGraphics.fillEllipse(item.x, item.y + 5, 12, 5);
        this.pickupGraphics.fillStyle(0xf59e0b, 1);
        this.pickupGraphics.fillCircle(item.x, item.y, 6.5);
        this.pickupGraphics.lineStyle(1.5, 0xfef08a, 0.95);
        this.pickupGraphics.strokeCircle(item.x, item.y, 6.5);
      } else if (item.kind === 'biomass') {
        // Emerald Parasitic Biomass Capsule
        this.pickupGraphics.fillStyle(0x000000, 0.45);
        this.pickupGraphics.fillEllipse(item.x, item.y + 6, 14, 5);
        this.pickupGraphics.fillStyle(0x064e3b, 0.9);
        this.pickupGraphics.fillCircle(item.x, item.y, 7);
        this.pickupGraphics.fillStyle(0x10b981, 1);
        this.pickupGraphics.fillCircle(item.x, item.y, 4.5);
        this.pickupGraphics.fillStyle(0xa7f3d0, 1);
        this.pickupGraphics.fillCircle(item.x - 1.5, item.y - 1.5, 2);
        this.pickupGraphics.lineStyle(1.5, 0x34d399, 0.95);
        this.pickupGraphics.strokeCircle(item.x, item.y, 7);
      }
    }
  }

  private drawResources(): void {
    this.resourceGraphics.clear();
    const activeResources: ResourceState[] = this.chunkManager.getActiveResources();

    for (const res of activeResources) {
      if (res.collected) {
        // Harvested empty shell vanishes completely after 30 seconds
        if (this.elapsedSeconds - (res.collectedAtSeconds ?? 0) >= 30) {
          continue;
        }
      }

      const { x, y } = res.position;

      // 2.5D Ground Shadow
      this.resourceGraphics.fillStyle(0x000000, 0.5);
      this.resourceGraphics.fillEllipse(x, y + 12, 36, 14);

      if (res.collected) {
        this.resourceGraphics.fillStyle(0x1e293b, 1);
        this.resourceGraphics.fillCircle(x, y, 14);
        this.resourceGraphics.lineStyle(1.5, 0x475569, 0.7);
        this.resourceGraphics.strokeCircle(x, y, 14);
      } else {
        // Rare Diamond-Tier Biomass Spire Node
        this.resourceGraphics.fillStyle(0x064e3b, 1);
        this.resourceGraphics.fillCircle(x, y, 17);
        this.resourceGraphics.lineStyle(2.5, 0x34d399, 0.95);
        this.resourceGraphics.strokeCircle(x, y, 17);

        // Crystalline Biomass Core
        this.resourceGraphics.fillStyle(0x10b981, 1);
        this.resourceGraphics.fillCircle(x, y - 1, 7);
        this.resourceGraphics.fillStyle(0xa7f3d0, 1);
        this.resourceGraphics.fillCircle(x - 2, y - 3, 3);
      }
    }
  }

  private drawSporeCompass(): void {
    this.compassGraphics.clear();
    if (!this.player) return;

    const activeResources = this.chunkManager.getActiveResources();
    const nearest = findNearestInteractableResource(
      { x: this.player.x, y: this.player.y },
      activeResources,
      CHUNK_SIZE * 2.5
    );

    if (!nearest) return;

    const dx = nearest.position.x - this.player.x;
    const dy = nearest.position.y - this.player.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.interactDistance) return;

    const angle = Math.atan2(dy, dx);
    const radius = 32;
    const tipX = this.player.x + Math.cos(angle) * (radius + 6);
    const tipY = this.player.y + Math.sin(angle) * (radius + 6);
    const leftX = this.player.x + Math.cos(angle - 0.22) * radius;
    const leftY = this.player.y + Math.sin(angle - 0.22) * radius;
    const rightX = this.player.x + Math.cos(angle + 0.22) * radius;
    const rightY = this.player.y + Math.sin(angle + 0.22) * radius;

    this.compassGraphics.fillStyle(0x34d399, 0.8);
    this.compassGraphics.fillTriangle(tipX, tipY, leftX, leftY, rightX, rightY);
  }

  private drawProximityIndicator(): void {
    if (!this.proximityGraphics) return;
    this.proximityGraphics.clear();

    if (!this.nearestResourceId) {
      this.promptText?.setVisible(false);
      return;
    }

    const activeResources = this.chunkManager.getActiveResources();
    const target = activeResources.find((r) => r.id === this.nearestResourceId);
    if (!target || target.collected) {
      this.promptText?.setVisible(false);
      return;
    }

    this.proximityGraphics.lineStyle(2, 0x34d399, 0.9);
    this.proximityGraphics.strokeCircle(target.position.x, target.position.y, 25);

    if (this.promptText) {
      this.promptText.setText(
        this.inputMode === 'pc' ? '[E] HARVEST RARE BIOMASS' : 'TAP [E] HARVEST BIOMASS'
      );
      this.promptText.setPosition(target.position.x, target.position.y - 28);
      this.promptText.setVisible(true);
    }
  }

  private showInteractFeedback(x: number, y: number, message: string): void {
    this.interactFeedbackText.setText(message);
    this.interactFeedbackText.setPosition(x, y - 26);
    this.interactFeedbackText.setVisible(true);

    this.time.delayedCall(1200, () => {
      this.interactFeedbackText.setVisible(false);
    });
  }

  private updatePlayerPosition(x: number, y: number): void {
    this.player.setPosition(x, y);
    this.playerShadow.setPosition(x, y + 14);
    this.playerVisor.setPosition(x + this.facingVector.x * 7, y + this.facingVector.y * 7);
  }

  private grantExp(amount: number): void {
    const next = applyExpGain(this.playerLevel, this.currentExp, amount);
    this.playerLevel = next.level;
    this.currentExp = next.currentExp;
    this.expToNextLevel = next.expToNextLevel;

    if (next.levelsGained > 0) {
      this.pendingLevelUps += next.levelsGained;
    }
  }

  private emitHudSnapshot(
    lastBiomassReward: GameHudSnapshot['lastBiomassReward'] = null
  ): void {
    const isCorroded = this.playerCorrosionTimer > 0;
    const corrosionSeconds = Math.ceil(this.playerCorrosionTimer / 1000);

    const snapshot: GameHudSnapshot = {
      playerHp: this.playerHp,
      playerMaxHp: this.playerMaxHp,
      enemiesEliminated: this.enemiesEliminated,
      isCorroded,
      corrosionSeconds,
      resourcesCollected: this.runBiomass,
      totalResources: this.chunkManager.getDiscoveredResourcesCount(),
      nearbyInteractable: this.nearestResourceId !== null,
      sectorLabel: this.currentSectorLabel,
      runSeed: this.chunkManager.runSeed,
      playerX: this.player ? Math.round(this.player.x) : Math.round(CHUNK_SIZE * 0.5),
      playerY: this.player ? Math.round(this.player.y) : Math.round(CHUNK_SIZE * 0.5),
      elapsedSeconds: Math.round(this.elapsedSeconds),
      playerSpeed: this.playerSpeed,
      magnetRadius: this.magnetRadius,
      level: this.playerLevel,
      currentExp: this.currentExp,
      expToNextLevel: this.expToNextLevel,
      runRpCoins: this.runRpCoins,
      runBiomass: this.runBiomass,
      pendingLevelUps: this.pendingLevelUps,
      collectedResourceIds: this.chunkManager.getCollectedResourceIds(),
      collectedPickupIds: this.chunkManager.getCollectedPickupIds(),
      lastBiomassReward
    };
    this.game.events.emit('hud-update', snapshot);
  }

  private showDamageNumber(
    x: number,
    y: number,
    damage: number,
    isPlayer = false,
    colorOverride?: string
  ): void {
    let txt = this.damageTextPool.find((t) => !t.visible);
    if (!txt) {
      txt = this.damageTextPool[0];
      this.tweens.killTweensOf(txt);
    }

    txt.setText(isPlayer ? `-${damage} HP` : `-${damage}`);
    txt.setColor(colorOverride ?? (isPlayer ? '#ef4444' : '#fde047'));
    txt.setPosition(x, y - 10);
    txt.setAlpha(1);
    txt.setVisible(true);

    this.tweens.add({
      targets: txt,
      y: y - 36,
      alpha: 0,
      duration: 650,
      ease: 'Quad.easeOut',
      onComplete: () => {
        txt.setVisible(false);
      }
    });
  }

  private showDeathBurst(x: number, y: number, color = 0x7f1d1d): void {
    const burst = this.add.graphics().setDepth(6.2);
    burst.fillStyle(color, 0.85);
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 6 + Math.random() * 14;
      burst.fillCircle(
        x + Math.cos(angle) * dist,
        y + Math.sin(angle) * dist,
        3 + Math.random() * 2
      );
    }
    this.tweens.add({
      targets: burst,
      alpha: 0,
      duration: 450,
      onComplete: () => burst.destroy()
    });
  }

  /**
   * Renders Scape and Run: Parasites entities (Buglins & Crawlers/Rupters).
   * - Buglin: Silverfish-like wriggling larva (Standard Obsidian / Rare Violet).
   * - Rupter: 6-legged arachnid predator (Standard Obsidian, Toxic Green, Crimson Blooded).
   */
  private drawEnemies(time: number): void {
    this.enemyGraphics.clear();

    for (const enemy of this.activeEnemies) {
      if (enemy.hp <= 0) continue;

      const { x, y, facingAngle, hitFlashTimer, kind, variant } = enemy;
      const isFlashing = hitFlashTimer > 0;

      if (kind === 'buglin') {
        const isViolet = variant === 'aberrant-violet';

        // 1. Soft Ground Shadow
        this.enemyGraphics.fillStyle(0x000000, 0.4);
        this.enemyGraphics.fillEllipse(x, y + 6, 18, 7);

        // 2. Segmented undulating silverfish body
        const segColors = isFlashing
          ? [0xffffff, 0xffffff, 0xffffff, 0xffffff]
          : isViolet
            ? [0xa855f7, 0x9333ea, 0x7e22ce, 0x6b21a8]
            : [0x1e1e24, 0x16161c, 0x111116, 0x0a0a0e];

        const rimColor = isFlashing ? 0xffffff : isViolet ? 0xc084fc : 0x2e2e38;
        this.enemyGraphics.lineStyle(1, rimColor, 0.85);

        for (let s = 3; s >= 0; s--) {
          const wriggle = Math.sin(time * 0.024 + s * 0.9) * 2;
          const segDist = s * 3.5;
          const segRadius = (4 - s) * 1.5 + 2.5;

          const segX = x - Math.cos(facingAngle) * segDist + Math.sin(facingAngle) * wriggle;
          const segY = y - Math.sin(facingAngle) * segDist - Math.cos(facingAngle) * wriggle;

          this.enemyGraphics.fillStyle(segColors[s], 1);
          this.enemyGraphics.fillCircle(segX, segY, segRadius);
          this.enemyGraphics.strokeCircle(segX, segY, segRadius);
        }

        // Head & Whiskers
        const headX = x + Math.cos(facingAngle) * 4;
        const headY = y + Math.sin(facingAngle) * 4;

        this.enemyGraphics.lineStyle(1, isFlashing ? 0xffffff : isViolet ? 0xe9d5ff : 0x64748b, 0.8);
        const ant1 = facingAngle - 0.4;
        const ant2 = facingAngle + 0.4;
        this.enemyGraphics.lineBetween(headX, headY, headX + Math.cos(ant1) * 6, headY + Math.sin(ant1) * 6);
        this.enemyGraphics.lineBetween(headX, headY, headX + Math.cos(ant2) * 6, headY + Math.sin(ant2) * 6);

        // Eyes
        const eyeColor = isFlashing ? 0xffffff : isViolet ? 0xf3e8ff : 0xef4444;
        this.enemyGraphics.fillStyle(eyeColor, 1);
        this.enemyGraphics.fillCircle(headX, headY, 1.4);

        // Mini HP bar
        if (enemy.hp < enemy.maxHp) {
          const barW = 14;
          const barH = 2.5;
          const barX = x - barW / 2;
          const barY = y - 12;
          const healthPct = Math.max(0, enemy.hp / enemy.maxHp);
          this.enemyGraphics.fillStyle(0x450a0a, 0.85);
          this.enemyGraphics.fillRect(barX, barY, barW, barH);
          this.enemyGraphics.fillStyle(isViolet ? 0xa855f7 : 0x22c55e, 1);
          this.enemyGraphics.fillRect(barX, barY, barW * healthPct, barH);
        }
        continue;
      }

      // Rupter / Crawler
      // 1. 2.5D Soft Ground Shadow
      this.enemyGraphics.fillStyle(0x000000, 0.45);
      this.enemyGraphics.fillEllipse(x, y + 10, 24, 9);

      // 2. Variant Color Setup
      let bodyColor = 0x111116; // Default obsidian black
      let rimColor = 0x2e2e38;
      let legColor = 0x22222a;
      let eyeColor = 0xef4444;
      let mandibleColor = 0x7f1d1d;

      if (variant === 'toxic-green') {
        bodyColor = 0x0d1711; // Black with sickly green undertone
        rimColor = 0x22c55e;  // Neon acid green veins
        legColor = 0x14532d;
        eyeColor = 0x4ade80;  // Glowing lime eyes
        mandibleColor = 0x22c55e;
      } else if (variant === 'crimson-red') {
        bodyColor = 0x170709; // Black with dried blood undertone
        rimColor = 0xdc2626;  // Blood red veins
        legColor = 0x450a0a;
        eyeColor = 0xff1111;  // Fiery crimson eyes
        mandibleColor = 0xef4444;
      }

      if (isFlashing) {
        bodyColor = 0xffffff;
        rimColor = 0xffffff;
        legColor = 0xffffff;
        eyeColor = 0xffffff;
        mandibleColor = 0xffffff;
      }

      // 3. Spindly jointed legs (6 legs, animated crawling)
      this.enemyGraphics.lineStyle(2, legColor, 1);
      for (let legIdx = 0; legIdx < 6; legIdx++) {
        const side = legIdx < 3 ? -1 : 1;
        const legStep = (legIdx % 3) - 1; // -1, 0, 1
        const legAnim = Math.sin(time * 0.018 + legIdx * 1.2) * 4;

        const legBaseAngle = facingAngle + side * (Math.PI * 0.42);
        const kneeX = x + Math.cos(legBaseAngle) * 11 + Math.cos(facingAngle) * legStep * 5;
        const kneeY = y + Math.sin(legBaseAngle) * 11 + Math.sin(facingAngle) * legStep * 5;

        const tipX = kneeX + Math.cos(legBaseAngle) * 7 + legAnim;
        const tipY = kneeY + Math.sin(legBaseAngle) * 7;

        this.enemyGraphics.lineBetween(x, y, kneeX, kneeY);
        this.enemyGraphics.lineBetween(kneeX, kneeY, tipX, tipY);
      }

      // 4. Segmented Chitinous Carapace
      const abdX = x - Math.cos(facingAngle) * 5;
      const abdY = y - Math.sin(facingAngle) * 5;
      this.enemyGraphics.fillStyle(bodyColor, 1);
      this.enemyGraphics.lineStyle(1.5, rimColor, 1);
      this.enemyGraphics.fillEllipse(abdX, abdY, 15, 12);
      this.enemyGraphics.strokeEllipse(abdX, abdY, 15, 12);

      // Head / Thorax
      const headX = x + Math.cos(facingAngle) * 5;
      const headY = y + Math.sin(facingAngle) * 5;
      this.enemyGraphics.fillStyle(bodyColor, 1);
      this.enemyGraphics.fillCircle(headX, headY, 6.5);
      this.enemyGraphics.strokeCircle(headX, headY, 6.5);

      // Mandibles / Chelicerae
      this.enemyGraphics.lineStyle(2, mandibleColor, 1);
      const mAngle1 = facingAngle - 0.35;
      const mAngle2 = facingAngle + 0.35;
      this.enemyGraphics.lineBetween(
        headX,
        headY,
        headX + Math.cos(mAngle1) * 9,
        headY + Math.sin(mAngle1) * 9
      );
      this.enemyGraphics.lineBetween(
        headX,
        headY,
        headX + Math.cos(mAngle2) * 9,
        headY + Math.sin(mAngle2) * 9
      );

      // Glowing Eyes
      this.enemyGraphics.fillStyle(eyeColor, 1);
      const eyeOffsetX = Math.cos(facingAngle + Math.PI * 0.5) * 3;
      const eyeOffsetY = Math.sin(facingAngle + Math.PI * 0.5) * 3;
      this.enemyGraphics.fillCircle(
        headX + Math.cos(facingAngle) * 3 + eyeOffsetX,
        headY + Math.sin(facingAngle) * 3 + eyeOffsetY,
        1.8
      );
      this.enemyGraphics.fillCircle(
        headX + Math.cos(facingAngle) * 3 - eyeOffsetX,
        headY + Math.sin(facingAngle) * 3 - eyeOffsetY,
        1.8
      );

      // 5. Floating Mini Health Bar (only shown when damaged)
      if (enemy.hp < enemy.maxHp) {
        const barW = 20;
        const barH = 3;
        const barX = x - barW / 2;
        const barY = y - 18;
        const healthPct = Math.max(0, enemy.hp / enemy.maxHp);

        this.enemyGraphics.fillStyle(0x450a0a, 0.85);
        this.enemyGraphics.fillRect(barX, barY, barW, barH);
        this.enemyGraphics.fillStyle(
          variant === 'toxic-green' ? 0x22c55e : variant === 'crimson-red' ? 0xef4444 : 0x38bdf8,
          1
        );
        this.enemyGraphics.fillRect(barX, barY, barW * healthPct, barH);
        this.enemyGraphics.lineStyle(1, 0x000000, 0.6);
        this.enemyGraphics.strokeRect(barX, barY, barW, barH);
      }
    }
  }

  /**
   * Renders high-velocity plasma pulse projectiles with energetic cyan glow and trail.
   */
  private drawProjectiles(): void {
    this.projectileGraphics.clear();

    for (const proj of this.activeProjectiles) {
      if (!proj.active) continue;

      // Outer plasma aura
      this.projectileGraphics.fillStyle(0x0284c7, 0.45);
      this.projectileGraphics.fillCircle(proj.x, proj.y, 7);

      // Inner bright bolt
      this.projectileGraphics.fillStyle(0x38bdf8, 1);
      this.projectileGraphics.fillCircle(proj.x, proj.y, 4);

      // Trailing energy streak
      const speed = proj.speed || 560;
      const trailLen = 10;
      const normVx = proj.vx / speed;
      const normVy = proj.vy / speed;
      this.projectileGraphics.lineStyle(2.5, 0x38bdf8, 0.75);
      this.projectileGraphics.lineBetween(
        proj.x,
        proj.y,
        proj.x - normVx * trailLen,
        proj.y - normVy * trailLen
      );

      // Hot core
      this.projectileGraphics.fillStyle(0xffffff, 0.95);
      this.projectileGraphics.fillCircle(proj.x, proj.y, 2);
    }
  }

  override update(_time: number, delta: number): void {
    if (!this.player) return;

    this.elapsedSeconds += delta / 1000;
    this.autosaveTimer += delta;

    let moveInput: MovementInput = { left: false, right: false, up: false, down: false };
    let wantsInteract = false;

    if (this.inputMode === 'pc' && this.cursors && this.wasdKeys && this.interactKey) {
      if (Input.Keyboard.JustDown(this.interactKey)) {
        wantsInteract = true;
      }
      moveInput = {
        left: this.cursors.left.isDown || this.wasdKeys.A.isDown,
        right: this.cursors.right.isDown || this.wasdKeys.D.isDown,
        up: this.cursors.up.isDown || this.wasdKeys.W.isDown,
        down: this.cursors.down.isDown || this.wasdKeys.S.isDown
      };
    } else if (this.inputMode === 'mobile') {
      if (this.interactRequested) {
        wantsInteract = true;
        this.interactRequested = false;
      }

      if (this.isPointerDown) {
        const { baseX, baseY, maxRadius } = this.getJoystickLayout();
        const deadzone = 10;

        const joy = calculateJoystickVector(
          baseX,
          baseY,
          this.pointerX,
          this.pointerY,
          maxRadius,
          deadzone
        );

        moveInput = {
          left: joy.moveX < -0.3,
          right: joy.moveX > 0.3,
          up: joy.moveY < -0.3,
          down: joy.moveY > 0.3,
          vectorX: joy.moveX,
          vectorY: joy.moveY
        };

        this.drawMobileUI(joy.thumbX, joy.thumbY);
      }
    }

    // 1. Rare Biomass Spire Harvest (Grants +1 In-Run Biomass, +100+ Scaled EXP, and +In-Run RP Coins)
    if (wantsInteract && this.nearestResourceId) {
      const collected = this.chunkManager.collectResource(this.nearestResourceId, this.elapsedSeconds);
      if (collected) {
        const reward = calculateBiomassSpireReward(
          this.playerLevel,
          this.elapsedSeconds,
          1
        );

        this.runBiomass += reward.biomass;
        this.runRpCoins += reward.rpCoins;
        this.grantExp(reward.exp);

        this.drawResources();
        this.drawSporeCompass();

        // Ensure depleted shell vanishes after 30 seconds even if stationary
        this.time.delayedCall(30000, () => {
          this.drawResources();
        });

        this.showInteractFeedback(
          collected.position.x,
          collected.position.y,
          `+${reward.biomass} BIOMASS  +${reward.exp} EXP  +${reward.rpCoins} RP`
        );

        this.game.events.emit('codex-grant', 'raw-biomass');

        this.emitHudSnapshot({
          ...reward,
          timestamp: Date.now()
        });
      }
    }

    // 2. Unbounded Player Movement
    const prevX = this.player.x;
    const prevY = this.player.y;

    const newPos = calculatePlayerMovement(
      { x: prevX, y: prevY },
      moveInput,
      this.playerSpeed,
      delta,
      { width: this.player.width, height: this.player.height }
    );

    const dx = newPos.x - prevX;
    const dy = newPos.y - prevY;
    const moved = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01;

    if (moved) {
      const len = Math.sqrt(dx * dx + dy * dy);
      this.facingVector = { x: dx / len, y: dy / len };
    }

    this.updatePlayerPosition(newPos.x, newPos.y);

    // 3. Stream Chunks & Preserve Unloaded Chunk State in Memory
    const chunkUpdate = this.chunkManager.updateActiveWindow(newPos);
    if (chunkUpdate.changed) {
      this.currentSectorLabel = chunkUpdate.currentChunk.sectorLabel;
      this.drawActiveChunks(chunkUpdate.activeChunks);
      this.drawPickups();
      this.drawResources();
      this.emitHudSnapshot();
    }

    // 3B. Chunk Resource Regeneration after 1:30 mins (90s)
    const regenResult = this.chunkManager.updateChunkRegeneration(this.elapsedSeconds);
    if (regenResult.regenerated) {
      this.drawResources();
      this.drawPickups();
      this.drawSporeCompass();
      this.emitHudSnapshot();
    }

    // 4. Proximity Auto-Magnet for EXP Orbs (Blue/Orange), RP Coins & Parasitic Biomass
    const activePickups = this.chunkManager.getActivePickups();
    const magnetResult = updateMagnetPickups(
      newPos,
      activePickups,
      this.magnetRadius,
      this.collectRadius,
      this.magnetSpeed,
      delta
    );

    if (magnetResult.anyMoved) {
      this.drawPickups();
    }

    if (magnetResult.collectedPickups.length > 0) {
      let totalExpFromPickups = 0;
      let totalCoinsFromPickups = 0;

      for (const item of magnetResult.collectedPickups) {
        this.chunkManager.recordPickupCollected(item.id, this.elapsedSeconds);
        if (item.kind === 'exp-blue' || item.kind === 'exp-orange') {
          const normalizedRoll =
            item.kind === 'exp-blue'
              ? (item.baseValue - 1) / 15
              : (item.baseValue - 15) / 11;
          const scaledExp = calculateOrbExpValue(item.kind, this.playerLevel, normalizedRoll);
          totalExpFromPickups += scaledExp;
          this.game.events.emit(
            'codex-grant',
            item.kind === 'exp-blue' ? 'exp-orb-blue' : 'exp-orb-orange'
          );
        } else if (item.kind === 'rp-coin') {
          totalCoinsFromPickups += item.baseValue;
          this.game.events.emit('codex-grant', 'rp-coin');
        } else if (item.kind === 'biomass') {
          this.runBiomass += item.baseValue;
          this.game.events.emit('codex-grant', 'raw-biomass');
          this.showInteractFeedback(item.x, item.y, `+${item.baseValue} BIOMASS`);
        }
      }

      if (totalExpFromPickups > 0) {
        this.grantExp(totalExpFromPickups);
      }

      if (totalCoinsFromPickups > 0) {
        this.runRpCoins += totalCoinsFromPickups;
      }

      this.emitHudSnapshot();
    }

    if (moved) {
      this.drawSporeCompass();
    }

    // Periodic autosave checkpoint while moving/surviving
    if (this.autosaveTimer >= 2500) {
      this.autosaveTimer = 0;
      this.emitHudSnapshot();
    }

    // 5. Check Proximity to Rare Biomass Spires
    const nearest = findNearestInteractableResource(
      newPos,
      this.chunkManager.getActiveResources(),
      this.interactDistance
    );
    const nextNearestId = nearest?.id ?? null;

    if (nextNearestId !== this.nearestResourceId) {
      this.nearestResourceId = nextNearestId;
      this.drawProximityIndicator();
      if (this.inputMode === 'mobile') {
        this.drawMobileUI();
      }
      this.emitHudSnapshot();
    }

    // 6. Magic Survival Auto-Targeting & Auto-Attack Combat Loop
    // Player bio-corrosion (toxic green poison DOT) processing
    if (this.playerCorrosionTimer > 0) {
      const corrosionResult = updatePlayerCorrosion(
        this.playerCorrosionTimer,
        this.playerCorrosionTickTimer,
        delta,
        3
      );
      this.playerCorrosionTimer = corrosionResult.remainingTimer;
      this.playerCorrosionTickTimer = corrosionResult.tickTimer;

      if (corrosionResult.damageToApply > 0) {
        this.playerHp = Math.max(0, this.playerHp - corrosionResult.damageToApply);
        this.showDamageNumber(newPos.x, newPos.y, corrosionResult.damageToApply, true, '#4ade80');
        this.cameras.main.shake(80, 0.003);
        this.emitHudSnapshot();

        if (this.playerHp <= 0) {
          this.game.events.emit('player-defeated');
          return;
        }
      }
    }

    // Visual player status and invulnerability flicker
    if (this.invulnerabilityTimer > 0) {
      this.player.setAlpha(Math.sin(_time * 0.035) > 0 ? 0.35 : 0.95);
    } else {
      this.player.setAlpha(1);
    }

    if (this.playerCorrosionTimer > 0) {
      this.playerVisor.setFillStyle(0x16a34a); // sickly green visor while poisoned
    } else {
      this.playerVisor.setFillStyle(0x052e16); // normal dark emerald visor
    }

    // A. Parasite Wave Spawning Loop (Spawn safely outside camera view near max render perimeter: 720-960px)
    this.spawnTimer += delta;
    if (this.spawnTimer >= 1800) {
      this.spawnTimer = 0;
      const closeCount = this.activeEnemies.filter(
        (e) => e.hp > 0 && PhaserMath.Distance.Between(newPos.x, newPos.y, e.x, e.y) < 320
      ).length;
      const hpPct = Math.round((this.playerHp / Math.max(1, this.playerMaxHp)) * 100);

      const batchCount = calculateParasiteSpawnBatch(
        this.elapsedSeconds,
        this.activeEnemies.length,
        hpPct,
        closeCount
      );

      for (let i = 0; i < batchCount; i++) {
        const enemy = spawnParasite(
          newPos.x,
          newPos.y,
          720,
          960,
          Math.random,
          this.elapsedSeconds,
          undefined,
          undefined,
          this.facingVector
        );
        this.activeEnemies.push(enemy);
      }
    }

    // B. Pulse Carbine Auto-Aim Loop (Targets nearest parasite within range)
    const weaponStats = calculateWeaponStats(this.pulseWeaponRank);
    this.weaponTimer += delta;
    if (this.weaponTimer >= weaponStats.cooldownMs) {
      const targetEnemy = findNearestEnemy(newPos, this.activeEnemies, weaponStats.range);
      if (targetEnemy) {
        this.weaponTimer = 0;
        const proj = createProjectile(
          newPos.x,
          newPos.y,
          targetEnemy.x,
          targetEnemy.y,
          weaponStats
        );
        this.activeProjectiles.push(proj);
        this.game.events.emit('codex-grant', 'power-pulse-overclock');
      }
    }

    // C. Update Active Projectiles & Evaluate Enemy Impacts
    const { remainingProjectiles, hits } = updateProjectiles(
      this.activeProjectiles,
      this.activeEnemies,
      delta
    );
    this.activeProjectiles = remainingProjectiles;

    if (hits.length > 0) {
      for (const hit of hits) {
        this.showDamageNumber(hit.x, hit.y, hit.damage, false);

        if (hit.killed) {
          this.enemiesEliminated += 1;
          if (hit.enemy.kind === 'buglin') {
            this.game.events.emit('codex-grant', 'parasite-buglin');
          } else {
            this.game.events.emit('codex-grant', 'parasite-rupter');
          }

          let burstColor = 0x334155;
          if (hit.enemy.kind === 'buglin' && hit.enemy.variant === 'aberrant-violet') {
            burstColor = 0x9333ea;
          } else if (hit.enemy.variant === 'toxic-green') {
            burstColor = 0x16a34a;
          } else if (hit.enemy.variant === 'crimson-red') {
            burstColor = 0xdc2626;
          }

          this.showDeathBurst(hit.enemy.x, hit.enemy.y, burstColor);

          const drops = rollParasiteDrops(hit.enemy);
          for (const drop of drops) {
            const dropItem: FieldPickupItem = {
              id: 'drop-' + Math.random().toString(36).slice(2, 9),
              kind: drop.kind,
              x: hit.enemy.x + (Math.random() - 0.5) * 16,
              y: hit.enemy.y + (Math.random() - 0.5) * 16,
              baseValue: drop.baseValue,
              collected: false
            };
            this.chunkManager.addDropPickup(dropItem);
          }
          this.drawPickups();
        }
      }
    }

    // D. Update Alive Parasites Movement & Contact Damage to Player
    this.activeEnemies = updateParasites(this.activeEnemies, newPos, delta);

    const contactResult = checkPlayerContactDamage(
      newPos,
      this.playerSize * 0.45,
      this.activeEnemies,
      this.invulnerabilityTimer,
      delta
    );
    this.invulnerabilityTimer = contactResult.nextInvulnerabilityTimer;

    if (contactResult.inflictCorrosion) {
      this.playerCorrosionTimer = Math.max(this.playerCorrosionTimer, 3000);
      this.playerCorrosionTickTimer = 0;
    }

    if (contactResult.damageTaken > 0) {
      this.playerHp = Math.max(0, this.playerHp - contactResult.damageTaken);
      this.showDamageNumber(newPos.x, newPos.y, contactResult.damageTaken, true);
      this.cameras.main.shake(130, 0.007);
      this.emitHudSnapshot();

      if (this.playerHp <= 0) {
        this.game.events.emit('player-defeated');
        return;
      }
    }

    // E. World-Space Combat Graphics
    this.drawEnemies(_time);
    this.drawProjectiles();
  }
}
