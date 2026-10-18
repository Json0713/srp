import { describe, it, expect } from 'vitest';
import { calculateJoystickVector } from './input.system';

describe('InputSystem', () => {
  describe('calculateJoystickVector', () => {
    it('should return zero movement within deadzone', () => {
      const result = calculateJoystickVector(100, 100, 105, 105, 50, 10);
      expect(result.moveX).toBe(0);
      expect(result.moveY).toBe(0);
    });

    it('should normalize movement outside deadzone', () => {
      const result = calculateJoystickVector(100, 100, 150, 100, 50, 10);
      expect(result.moveX).toBe(1);
      expect(result.moveY).toBe(0);
      expect(result.thumbX).toBe(150);
      expect(result.thumbY).toBe(100);
    });

    it('should constrain thumb within maxRadius', () => {
      const result = calculateJoystickVector(100, 100, 200, 100, 50, 10);
      expect(result.moveX).toBe(1);
      expect(result.moveY).toBe(0);
      expect(result.thumbX).toBe(150); // Constrained to 100 + 50
      expect(result.thumbY).toBe(100);
    });

    it('should calculate correct angles', () => {
      // 45 degrees down-right
      const result = calculateJoystickVector(100, 100, 150, 150, 50, 10);
      expect(result.moveX).toBeCloseTo(0.707, 3);
      expect(result.moveY).toBeCloseTo(0.707, 3);
    });
  });
});

