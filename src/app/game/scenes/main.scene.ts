import { Scene, GameObjects, Types, Input, Math as PhaserMath, Structs } from 'phaser';
import { calculatePlayerMovement, MovementInput } from '../systems/movement.system';
import {
  findNearestInteractableResource,
  tryCollectResource,
  ResourceState
} from '../systems/interaction.system';
import { calculateJoystickVector } from '../systems/input.system';
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

  private environmentGraphics!: GameObjects.Graphics;
  private resourceGraphics!: GameObjects.Graphics;
  private proximityGraphics!: GameObjects.Graphics;
  private interactFeedbackText!: GameObjects.Text;
  private promptText!: GameObjects.Text;

  private resources: ResourceState[] = [];
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

  private readonly onResize = (gameSize: Structs.Size): void => {
    const width = Math.max(320, gameSize.width);
    const height = Math.max(240, gameSize.height);
    this.clampEntitiesToViewport(width, height);
    this.drawEnvironment(width, height);
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
    const width = Math.max(320, this.scale.width);
    const height = Math.max(240, this.scale.height);

    this.cameras.main.setBackgroundColor('#090d14');

    // 1. Procedural 2.5D Dark-Biopunk Environment
    this.environmentGraphics = this.add.graphics();
    this.drawEnvironment(width, height);

    // 2. Biomass Spire Resource Nodes (scaled to fit both desktop and mobile landscape viewports)
    this.resources = this.createInitialResources(width, height);
    this.resourceGraphics = this.add.graphics();
    this.proximityGraphics = this.add.graphics();
    this.drawResources();

    // 3. Player Entity with 2.5D Drop Shadow & Directional Visor
    const startX = Math.round(width * 0.5);
    const startY = Math.round(height * 0.5);

    this.playerShadow = this.add.ellipse(startX, startY + 14, 30, 12, 0x000000, 0.55);
    this.player = this.add.rectangle(startX, startY, this.playerSize, this.playerSize, 0x22c55e);
    this.player.setStrokeStyle(2, 0x86efac);
    this.playerVisor = this.add.rectangle(startX, startY + 8, 16, 6, 0x052e16);

    // 4. World-space Prompts & Floating Harvest Feedback
    this.promptText = this.add.text(0, 0, '[E] HARVEST', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#4ade80',
      backgroundColor: 'rgba(8, 12, 18, 0.85)',
      padding: { x: 6, y: 3 }
    });
    this.promptText.setOrigin(0.5, 1);
    this.promptText.setVisible(false);

    this.interactFeedbackText = this.add.text(0, 0, '+1 BIOMASS', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#fbbf24',
      fontStyle: 'bold',
      backgroundColor: 'rgba(8, 12, 18, 0.85)',
      padding: { x: 6, y: 3 }
    });
    this.interactFeedbackText.setOrigin(0.5, 1);
    this.interactFeedbackText.setVisible(false);

    // 5. Keyboard Input Setup
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D') as WasdKeys;
      this.interactKey = this.input.keyboard.addKey('E');
    }

    // 6. Registry Synchronization & Mobile UI
    const storedMode = this.registry.get('inputMode');
    this.inputMode = storedMode === 'mobile' ? 'mobile' : 'pc';
    this.registry.events.on('changedata-inputMode', this.onRegistryChange);

    this.createMobileUI();
    this.updateInputUI();

    // 7. Viewport Resize & Cleanup Listeners
    this.scale.on('resize', this.onResize);
    this.events.once('shutdown', () => this.cleanupListeners());
    this.events.once('destroy', () => this.cleanupListeners());

    this.emitHudSnapshot();
  }

  private cleanupListeners(): void {
    this.registry.events.off('changedata-inputMode', this.onRegistryChange);
    this.scale.off('resize', this.onResize);
  }

  private createInitialResources(width: number, height: number): ResourceState[] {
    const padX = Math.max(64, Math.min(140, Math.round(width * 0.18)));
    const padY = Math.max(64, Math.min(110, Math.round(height * 0.22)));

    return [
      { id: 'bush1', position: { x: padX, y: padY }, collected: false },
      { id: 'bush2', position: { x: width - padX, y: padY }, collected: false },
      { id: 'bush3', position: { x: padX, y: height - padY }, collected: false },
      { id: 'bush4', position: { x: width - padX, y: height - padY }, collected: false }
    ];
  }

  private clampEntitiesToViewport(width: number, height: number): void {
    const margin = 48;
    this.resources = this.resources.map((res) => ({
      ...res,
      position: {
        x: PhaserMath.Clamp(res.position.x, margin, Math.max(margin, width - margin)),
        y: PhaserMath.Clamp(res.position.y, margin, Math.max(margin, height - margin))
      }
    }));

    if (this.player) {
      const clampedX = PhaserMath.Clamp(this.player.x, 16, Math.max(16, width - 16));
      const clampedY = PhaserMath.Clamp(this.player.y, 16, Math.max(16, height - 16));
      this.updatePlayerPosition(clampedX, clampedY);
    }
  }

  private getJoystickLayout(): { baseX: number; baseY: number; maxRadius: number; btnX: number; btnY: number; btnRadius: number } {
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
      const distToButton = PhaserMath.Distance.Between(pointer.x, pointer.y, layout.btnX, layout.btnY);

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

  private drawEnvironment(width: number, height: number): void {
    this.environmentGraphics.clear();
    this.environmentGraphics.fillStyle(0x0b1119, 1);
    this.environmentGraphics.fillRect(0, 0, width, height);

    const tileSize = 32;
    for (let y = 0; y < height; y += tileSize) {
      for (let x = 0; x < width; x += tileSize) {
        const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const rand = hash - Math.floor(hash);

        if (rand < 0.12) {
          // Corrupted biomass patch
          this.environmentGraphics.fillStyle(0x131d28, 1);
          this.environmentGraphics.fillRect(x, y, tileSize, tileSize);
        } else if (rand < 0.24) {
          // Mossy containment slate
          this.environmentGraphics.fillStyle(0x0f1918, 1);
          this.environmentGraphics.fillRect(x, y, tileSize, tileSize);
        } else if (rand > 0.96) {
          // Bioluminescent spore fleck
          this.environmentGraphics.fillStyle(0x1f4d33, 0.8);
          const ox = Math.floor((rand * 100) % 4) * 4 + 8;
          const oy = Math.floor((rand * 1000) % 4) * 4 + 8;
          this.environmentGraphics.fillRect(x + ox, y + oy, 6, 6);
        } else if (rand > 0.93 && rand <= 0.96) {
          // Crimson parasite vein
          this.environmentGraphics.fillStyle(0x451820, 0.75);
          this.environmentGraphics.fillRect(x + 10, y + 10, 8, 4);
        }
      }
    }

    // Subtle tactical grid overlay & world border
    this.environmentGraphics.lineStyle(1, 0x1e293b, 0.35);
    for (let x = 0; x <= width; x += 64) {
      this.environmentGraphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += 64) {
      this.environmentGraphics.lineBetween(0, y, width, y);
    }

    this.environmentGraphics.lineStyle(2, 0x22c55e, 0.28);
    this.environmentGraphics.strokeRect(2, 2, width - 4, height - 4);
  }

  private drawResources(): void {
    this.resourceGraphics.clear();

    for (const res of this.resources) {
      const { x, y } = res.position;

      // 2.5D Ground Shadow
      this.resourceGraphics.fillStyle(0x000000, 0.5);
      this.resourceGraphics.fillEllipse(x, y + 12, 34, 14);

      if (res.collected) {
        // Depleted husk
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

  private drawProximityIndicator(): void {
    this.proximityGraphics.clear();

    if (!this.nearestResourceId) {
      this.promptText?.setVisible(false);
      return;
    }

    const target = this.resources.find((r) => r.id === this.nearestResourceId);
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
    const collectedCount = this.resources.filter((r) => r.collected).length;
    const snapshot: GameHudSnapshot = {
      resourcesCollected: collectedCount,
      totalResources: this.resources.length,
      nearbyInteractable: this.nearestResourceId !== null
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

    if (wantsInteract) {
      const result = tryCollectResource(
        { x: this.player.x, y: this.player.y },
        this.resources,
        this.interactDistance
      );

      if (result.collectedId) {
        this.resources = result.updatedResources;
        this.drawResources();

        const collectedResource = this.resources.find((r) => r.id === result.collectedId);
        if (collectedResource) {
          this.showInteractFeedback(collectedResource.position.x, collectedResource.position.y);
        }
        this.emitHudSnapshot();
      }
    }

    const prevX = this.player.x;
    const prevY = this.player.y;

    const newPos = calculatePlayerMovement(
      { x: prevX, y: prevY },
      moveInput,
      this.playerSpeed,
      delta,
      { width: this.player.width, height: this.player.height },
      { width: this.scale.width, height: this.scale.height }
    );

    const dx = newPos.x - prevX;
    const dy = newPos.y - prevY;
    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      const len = Math.sqrt(dx * dx + dy * dy);
      this.facingVector = { x: dx / len, y: dy / len };
    }

    this.updatePlayerPosition(newPos.x, newPos.y);

    // Check proximity changes without dispatching unnecessary Angular updates
    const nearest = findNearestInteractableResource(
      newPos,
      this.resources,
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
