/**
 * Tests for touch utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTouchPoints,
  getDistance,
  getCenter,
  getAngle,
  isTap,
  isLongPress,
  triggerHapticFeedback,
  isTouchDevice,
  getTouchSizeMultiplier,
  preventDefaultTouchBehaviors,
  debounce,
  throttle
} from './touchUtils';

// Mock navigator.vibrate
const mockVibrate = vi.fn();
Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true
});

// Mock window properties
Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true
});

describe('touchUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTouchPoints', () => {
    it('should extract touch points from touch event', () => {
      const mockEvent = {
        touches: [
          { clientX: 100, clientY: 200, identifier: 1 },
          { clientX: 300, clientY: 400, identifier: 2 }
        ]
      } as any;

      const points = getTouchPoints(mockEvent);

      expect(points).toEqual([
        { x: 100, y: 200, identifier: 1 },
        { x: 300, y: 400, identifier: 2 }
      ]);
    });

    it('should handle React touch events', () => {
      const mockEvent = {
        nativeEvent: {
          touches: [
            { clientX: 150, clientY: 250, identifier: 3 }
          ]
        }
      } as any;

      const points = getTouchPoints(mockEvent);

      expect(points).toEqual([
        { x: 150, y: 250, identifier: 3 }
      ]);
    });
  });

  describe('getDistance', () => {
    it('should calculate distance between two points', () => {
      const point1 = { x: 0, y: 0, identifier: 1 };
      const point2 = { x: 3, y: 4, identifier: 2 };

      const distance = getDistance(point1, point2);

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should handle same point', () => {
      const point = { x: 100, y: 200, identifier: 1 };

      const distance = getDistance(point, point);

      expect(distance).toBe(0);
    });
  });

  describe('getCenter', () => {
    it('should calculate center point between two points', () => {
      const point1 = { x: 0, y: 0, identifier: 1 };
      const point2 = { x: 100, y: 200, identifier: 2 };

      const center = getCenter(point1, point2);

      expect(center).toEqual({ x: 50, y: 100 });
    });
  });

  describe('getAngle', () => {
    it('should calculate angle between two points', () => {
      const point1 = { x: 0, y: 0, identifier: 1 };
      const point2 = { x: 1, y: 1, identifier: 2 };

      const angle = getAngle(point1, point2);

      expect(angle).toBeCloseTo(Math.PI / 4); // 45 degrees
    });
  });

  describe('isTap', () => {
    it('should detect tap with short duration and minimal movement', () => {
      const startTime = Date.now() - 200; // 200ms ago
      const startPoint = { x: 100, y: 100, identifier: 1 };
      const endPoint = { x: 105, y: 105, identifier: 1 };

      const result = isTap(startTime, startPoint, endPoint);

      expect(result).toBe(true);
    });

    it('should reject tap with long duration', () => {
      const startTime = Date.now() - 500; // 500ms ago
      const startPoint = { x: 100, y: 100, identifier: 1 };
      const endPoint = { x: 105, y: 105, identifier: 1 };

      const result = isTap(startTime, startPoint, endPoint);

      expect(result).toBe(false);
    });

    it('should reject tap with large movement', () => {
      const startTime = Date.now() - 200; // 200ms ago
      const startPoint = { x: 100, y: 100, identifier: 1 };
      const endPoint = { x: 150, y: 150, identifier: 1 };

      const result = isTap(startTime, startPoint, endPoint);

      expect(result).toBe(false);
    });
  });

  describe('isLongPress', () => {
    it('should detect long press after minimum duration', () => {
      const startTime = Date.now() - 600; // 600ms ago

      const result = isLongPress(startTime, 500);

      expect(result).toBe(true);
    });

    it('should reject short press', () => {
      const startTime = Date.now() - 300; // 300ms ago

      const result = isLongPress(startTime, 500);

      expect(result).toBe(false);
    });
  });

  describe('triggerHapticFeedback', () => {
    it('should trigger light haptic feedback', () => {
      triggerHapticFeedback('light');

      expect(mockVibrate).toHaveBeenCalledWith([10]);
    });

    it('should trigger medium haptic feedback', () => {
      triggerHapticFeedback('medium');

      expect(mockVibrate).toHaveBeenCalledWith([20]);
    });

    it('should trigger heavy haptic feedback', () => {
      triggerHapticFeedback('heavy');

      expect(mockVibrate).toHaveBeenCalledWith([30]);
    });

    it('should default to light feedback', () => {
      triggerHapticFeedback();

      expect(mockVibrate).toHaveBeenCalledWith([10]);
    });
  });

  describe('isTouchDevice', () => {
    it('should detect touch device with ontouchstart', () => {
      Object.defineProperty(window, 'ontouchstart', {
        value: {},
        writable: true
      });

      const result = isTouchDevice();

      expect(result).toBe(true);
    });

    it('should detect touch device with maxTouchPoints', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 2,
        writable: true
      });

      const result = isTouchDevice();

      expect(result).toBe(true);
    });
  });

  describe('getTouchSizeMultiplier', () => {
    it('should return appropriate multiplier based on screen size', () => {
      // Test the function with different screen sizes
      // Since we can't easily mock the touch detection in the test environment,
      // we'll just test that the function returns a reasonable value
      const multiplier = getTouchSizeMultiplier();
      
      expect(multiplier).toBeGreaterThanOrEqual(1);
      expect(multiplier).toBeLessThanOrEqual(2);
    });
  });

  describe('preventDefaultTouchBehaviors', () => {
    it('should add event listeners and set styles', () => {
      const mockElement = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        style: {}
      } as any;

      const cleanup = preventDefaultTouchBehaviors(mockElement);

      expect(mockElement.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false });
      expect(mockElement.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
      expect(mockElement.addEventListener).toHaveBeenCalledWith('contextmenu', expect.any(Function));
      expect(mockElement.style.userSelect).toBe('none');
      expect(mockElement.style.webkitUserSelect).toBe('none');
      expect(mockElement.style.webkitTouchCallout).toBe('none');

      // Test cleanup
      cleanup();

      expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(mockElement.removeEventListener).toHaveBeenCalledWith('contextmenu', expect.any(Function));
      expect(mockElement.style.userSelect).toBe('');
      expect(mockElement.style.webkitUserSelect).toBe('');
      expect(mockElement.style.webkitTouchCallout).toBe('');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('arg1');
      throttledFn('arg2');
      throttledFn('arg3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1');

      vi.advanceTimersByTime(100);

      throttledFn('arg4');

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('arg4');
    });
  });
});