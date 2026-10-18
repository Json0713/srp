export interface MovementInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  vectorX?: number;
  vectorY?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Bounds {
  width: number;
  height: number;
}

export function calculatePlayerMovement(
  currentPosition: Position,
  input: MovementInput,
  speed: number,
  deltaMs: number,
  playerSize: { width: number; height: number },
  worldBounds: Bounds
): Position {
  let moveX = 0;
  let moveY = 0;

  if (input.vectorX !== undefined || input.vectorY !== undefined) {
    moveX = input.vectorX ?? 0;
    moveY = input.vectorY ?? 0;
    const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
    if (magnitude > 1) {
      moveX /= magnitude;
      moveY /= magnitude;
    }
  } else {
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;

    if (moveX !== 0 && moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= length;
      moveY /= length;
    }
  }

  const step = speed * (deltaMs / 1000);
  let newX = currentPosition.x + moveX * step;
  let newY = currentPosition.y + moveY * step;

  const halfWidth = playerSize.width / 2;
  const halfHeight = playerSize.height / 2;

  if (newX < halfWidth) newX = halfWidth;
  if (newX > worldBounds.width - halfWidth) newX = worldBounds.width - halfWidth;
  if (newY < halfHeight) newY = halfHeight;
  if (newY > worldBounds.height - halfHeight) newY = worldBounds.height - halfHeight;

  return { x: newX, y: newY };
}
