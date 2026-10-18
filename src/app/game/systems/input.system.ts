export interface JoystickState {
  moveX: number;
  moveY: number;
  thumbX: number;
  thumbY: number;
}

export function calculateJoystickVector(
  baseX: number,
  baseY: number,
  pointerX: number,
  pointerY: number,
  maxRadius: number,
  deadzoneRadius: number
): JoystickState {
  const dx = pointerX - baseX;
  const dy = pointerY - baseY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  let moveX = 0;
  let moveY = 0;
  
  if (distance > deadzoneRadius) {
    moveX = dx / distance;
    moveY = dy / distance;
  }

  const thumbDistance = Math.min(distance, maxRadius);
  let thumbX = baseX;
  let thumbY = baseY;

  if (distance > 0) {
    thumbX += (dx / distance) * thumbDistance;
    thumbY += (dy / distance) * thumbDistance;
  }

  return { moveX, moveY, thumbX, thumbY };
}

