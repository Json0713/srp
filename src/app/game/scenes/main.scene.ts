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
import { GameHudSnapshot, InputMode } from '../../core/models/game-data.model';

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

  private readonly playerSpeed = 300; // Pixels per second
  private readonly playerSize = 32;
  private readonly interactDistance = 54;
  private readonly cameraLerp = 0.14; // Smooth Magic Survival style camera follow damping

  private environmentGraphics!: GameObjects.Graphics;
  private resourceGraphics!: GameObjects.Graphics;
  private proximityGraphics!: GameObjects.Graphics;
  private compassGraphics!: GameObjects.Graphics;
  private interactFeedbackText!: GameObjects.Text;
  private promptText!: GameObjects.Text;

  private chunkManager!: ChunkManager;
  private currentSectorLabel = 'SEC +0:+0';
  private nearestResourceId: string | null = null;
  private facingVector = { x: 0, y: 1 };

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
      this.inputMode = data;
      this.isPointerDown = false;
      this.activePointer = null;
      this.updateInputUI();
    }
  };

  private readonly onResize = (_gameSize: Structs.Size): void => {
    this.drawActiveChunks(this.chunkManager.getActiveChunks());
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

    // 1. Initialize True-RNG Per-Run Chunk Manager (normal 2-chunk radius = 5x5 grid around player)
    this.chunkManager = new ChunkManager(generateRunSeed(), CHUNK_SIZE, 2);

    // 2. World-Space Graphics Layers (Depth-ordered for 2.5D presentation)
    this.environmentGraphics = this.add.graphics().setDepth(1);
    this.resourceGraphics = this.add.graphics().setDepth(3);
    this.proximityGraphics = this.add.graphics().setDepth(4);
    this.compassGraphics = this.add.graphics().setDepth(5);

    // 3. Player Entity Spawned at Origin Chunk (0,0) Center with Smooth Camera Follow
    const startX = Math.round(CHUNK_SIZE * 0.5);
    const startY = Math.round(CHUNK_SIZE * 0.5);

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

    // Center camera on player and smoothly follow across unbounded chunks (Magic Survival style)
    this.cameras.main.centerOn(startX, startY);
    this.cameras.main.startFollow(this.player, false, this.cameraLerp, this.cameraLerp);

    // 4. Stream Initial Active Chunks Around Spawn
    const initialWindow = this.chunkManager.updateActiveWindow({ x: startX, y: startY }, true);
    this.currentSectorLabel = initialWindow.currentChunk.sectorLabel;
    this.drawActiveChunks(initialWindow.activeChunks);
    this.drawResources();
    this.drawSporeCompass();

    // 5. World-space Prompts & Floating Harvest Feedback
    this.promptText = this.add
      .text(0, 0, '[E] HARVEST', {
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
        fontSize: '14px',
        color: '#fbbf24',
        fontStyle: 'bold',
        backgroundColor: 'rgba(8, 12, 18, 0.85)',
        padding: { x: 6, y: 3 }
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

    // 7. Registry Synchronization & Mobile UI
    const storedMode = this.registry.get('inputMode');
    this.inputMode = storedMode === 'mobile' ? 'mobile' : 'pc';
    this.registry.events.on('changedata-inputMode', this.onRegistryChange);

    this.createMobileUI();
    this.updateInputUI();

    // 8. Viewport Resize & Cleanup Listeners
    this.scale.on('resize', this.onResize);
    this.events.once('shutdown', () => this.cleanupListeners());
    this.events.once('destroy', () => this.cleanupListeners());

    this.emitHudSnapshot();
  }

  private cleanupListeners(): void {
    this.registry.events.off('changedata-inputMode', this.onRegistryChange);
    this.scale.off('resize', this.onResize);
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

    // Enable concurrent multi-touch for simultaneous joystick movement + action button press
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

      // Only left-side touches claim the movement joystick
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
    if (this.inputMode !== 'mobile') return;

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

      // Chunk base surface
      this.environmentGraphics.fillStyle(0x0b1119, 1);
      this.environmentGraphics.fillRect(worldX, worldY, CHUNK_SIZE, CHUNK_SIZE);

      // Pre-computed 2.5D tile features
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

      // Subtle tactical grid inside chunk
      this.environmentGraphics.lineStyle(1, 0x1e293b, 0.32);
      for (let gx = 0; gx <= CHUNK_SIZE; gx += 64) {
        this.environmentGraphics.lineBetween(worldX + gx, worldY, worldX + gx, worldY + CHUNK_SIZE);
      }
      for (let gy = 0; gy <= CHUNK_SIZE; gy += 64) {
        this.environmentGraphics.lineBetween(worldX, worldY + gy, worldX + CHUNK_SIZE, worldY + gy);
      }

      // Subtle sector chunk boundary frame
      this.environmentGraphics.lineStyle(1, 0x22c55e, 0.14);
      this.environmentGraphics.strokeRect(worldX, worldY, CHUNK_SIZE, CHUNK_SIZE);

      // 2.5D Decorative Containment Rubble / Monoliths for parallax-like scrolling depth
      for (const prop of chunk.props) {
        // Ground shadow
        this.environmentGraphics.fillStyle(0x000000, 0.45);
        this.environmentGraphics.fillEllipse(
          prop.x,
          prop.y + prop.height * 0.55,
          prop.width + 8,
          10
        );

        // 2.5D Extruded base & top cap
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

  private drawResources(): void {
    this.resourceGraphics.clear();
    const activeResources: ResourceState[] = this.chunkManager.getActiveResources();

    for (const res of activeResources) {
      const { x, y } = res.position;

      // 2.5D Ground Shadow
      this.resourceGraphics.fillStyle(0x000000, 0.5);
      this.resourceGraphics.fillEllipse(x, y + 12, 34, 14);

      if (res.collected) {
        // Depleted husk (preserved across chunk unload/reload)
        this.resourceGraphics.fillStyle(0x1e293b, 1);
        this.resourceGraphics.fillCircle(x, y, 14);
        this.resourceGraphics.lineStyle(1.5, 0x475569, 0.7);
        this.resourceGraphics.strokeCircle(x, y, 14);
      } else {
        // Active Biomass Spire Node
        this.resourceGraphics.fillStyle(0x14532d, 1);
        this.resourceGraphics.fillCircle(x, y, 16);
        this.resourceGraphics.lineStyle(2, 0x22c55e, 0.9);
        this.resourceGraphics.strokeCircle(x, y, 16);

        // Glowing Parasitic Spores
        this.resourceGraphics.fillStyle(0xf59e0b, 1);
        this.resourceGraphics.fillCircle(x - 5, y - 4, 3.5);
        this.resourceGraphics.fillCircle(x + 6, y - 2, 3);
        this.resourceGraphics.fillStyle(0xef4444, 1);
        this.resourceGraphics.fillCircle(x - 1, y + 6, 3.5);
      }
    }
  }

  /**
   * Draws a subtle directional bio-radar arc around the operator pointing toward the nearest
   * unharvested Biomass Spire in the active chunk window so exploration feels guided.
   */
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

    // Hide compass when already within harvest range
    if (dist <= this.interactDistance) return;

    const angle = Math.atan2(dy, dx);
    const radius = 32;
    const tipX = this.player.x + Math.cos(angle) * (radius + 6);
    const tipY = this.player.y + Math.sin(angle) * (radius + 6);
    const leftX = this.player.x + Math.cos(angle - 0.22) * radius;
    const leftY = this.player.y + Math.sin(angle - 0.22) * radius;
    const rightX = this.player.x + Math.cos(angle + 0.22) * radius;
    const rightY = this.player.y + Math.sin(angle + 0.22) * radius;

    this.compassGraphics.fillStyle(0x4ade80, 0.75);
    this.compassGraphics.fillTriangle(tipX, tipY, leftX, leftY, rightX, rightY);
  }

  private drawProximityIndicator(): void {
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

    this.proximityGraphics.lineStyle(2, 0x4ade80, 0.85);
    this.proximityGraphics.strokeCircle(target.position.x, target.position.y, 24);

    if (this.promptText) {
      this.promptText.setText(this.inputMode === 'pc' ? '[E] HARVEST' : 'TAP [E] HARVEST');
      this.promptText.setPosition(target.position.x, target.position.y - 26);
      this.promptText.setVisible(true);
    }
  }

  private showInteractFeedback(x: number, y: number): void {
    this.interactFeedbackText.setPosition(x, y - 24);
    this.interactFeedbackText.setVisible(true);

    this.time.delayedCall(900, () => {
      this.interactFeedbackText.setVisible(false);
    });
  }

  private updatePlayerPosition(x: number, y: number): void {
    this.player.setPosition(x, y);
    this.playerShadow.setPosition(x, y + 14);
    this.playerVisor.setPosition(x + this.facingVector.x * 7, y + this.facingVector.y * 7);
  }

  private emitHudSnapshot(): void {
    const snapshot: GameHudSnapshot = {
      resourcesCollected: this.chunkManager.getTotalCollectedCount(),
      totalResources: this.chunkManager.getDiscoveredResourcesCount(),
      nearbyInteractable: this.nearestResourceId !== null,
      sectorLabel: this.currentSectorLabel
    };
    this.game.events.emit('hud-update', snapshot);
  }

  override update(_time: number, delta: number): void {
    if (!this.player) return;

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

    if (wantsInteract && this.nearestResourceId) {
      const collected = this.chunkManager.collectResource(this.nearestResourceId);
      if (collected) {
        this.drawResources();
        this.drawSporeCompass();
        this.showInteractFeedback(collected.position.x, collected.position.y);
        this.emitHudSnapshot();
      }
    }

    const prevX = this.player.x;
    const prevY = this.player.y;

    // Unbounded world movement (camera follows centered player across chunks)
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

    // Stream chunks when crossing chunk boundaries; preserve unloaded chunks in ChunkManager memory
    const chunkUpdate = this.chunkManager.updateActiveWindow(newPos);
    if (chunkUpdate.changed) {
      this.currentSectorLabel = chunkUpdate.currentChunk.sectorLabel;
      this.drawActiveChunks(chunkUpdate.activeChunks);
      this.drawResources();
      this.emitHudSnapshot();
    }

    if (moved) {
      this.drawSporeCompass();
    }

    // Check proximity changes against active chunk resources
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
  }
}
