import { calculatePlayerMovement, MovementInput, Position, Bounds } from './movement.system';

describe('Movement System', () => {
  const speed = 300; // pixels per second
  const playerSize = { width: 32, height: 32 };
  const worldBounds: Bounds = { width: 800, height: 600 };
  const center: Position = { x: 400, y: 300 };

  it('should not move if no input is provided', () => {
    const input: MovementInput = { left: false, right: false, up: false, down: false };
    const result = calculatePlayerMovement(center, input, speed, 1000, playerSize, worldBounds);
    expect(result.x).toBeCloseTo(400);
    expect(result.y).toBeCloseTo(300);
  });

  it('should move right correctly based on speed and delta', () => {
    const input: MovementInput = { left: false, right: true, up: false, down: false };
    const result = calculatePlayerMovement(center, input, speed, 100, playerSize, worldBounds);
    expect(result.x).toBeCloseTo(430);
    expect(result.y).toBeCloseTo(300);
  });

  it('should normalize diagonal movement to prevent moving faster', () => {
    const input: MovementInput = { left: false, right: true, up: false, down: true };
    const result = calculatePlayerMovement(center, input, speed, 1000, playerSize, worldBounds);

    const distance = Math.sqrt(Math.pow(result.x - 400, 2) + Math.pow(result.y - 300, 2));
    expect(distance).toBeCloseTo(300);
    expect(result.x).toBeCloseTo(400 + 212.132, 2);
    expect(result.y).toBeCloseTo(300 + 212.132, 2);
  });

  it('should support smooth analog vector movement for virtual joystick', () => {
    const input: MovementInput = {
      left: false,
      right: true,
      up: false,
      down: false,
      vectorX: 0.5,
      vectorY: 0
    };
    const result = calculatePlayerMovement(center, input, speed, 1000, playerSize, worldBounds);
    expect(result.x).toBeCloseTo(550);
    expect(result.y).toBeCloseTo(300);
  });

  it('should constrain the player to the world boundaries', () => {
    const input: MovementInput = { left: true, right: false, up: true, down: false };
    const result = calculatePlayerMovement(center, input, speed, 10000, playerSize, worldBounds);

    expect(result.x).toBeCloseTo(16);
    expect(result.y).toBeCloseTo(16);
  });

  it('should constrain the player to the bottom-right boundaries', () => {
    const input: MovementInput = { left: false, right: true, up: false, down: true };
    const result = calculatePlayerMovement(center, input, speed, 10000, playerSize, worldBounds);

    expect(result.x).toBeCloseTo(800 - 16);
    expect(result.y).toBeCloseTo(600 - 16);
  });
});
