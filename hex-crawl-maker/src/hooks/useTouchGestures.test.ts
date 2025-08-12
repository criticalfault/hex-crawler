/**
 * Tests for useTouchGestures hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTouchGestures } from './useTouchGestures';

// Mock touch utilities
vi.mock('../utils/touchUtils', () => ({
  getTouchPoints: vi.fn(),
  getDistance: vi.fn(),
  getCenter: vi.fn(),
  isTap: vi.fn(),
  isLongPress: vi.fn(),
  triggerHapticFeedback: vi.fn()
}));

import {
  getTouchPoints,
  getDistance,
  getCenter,
  isTap,
  isLongPress,
  triggerHapticFeedback
} from '../utils/touchUtils';

const mockGetTouchPoints = getTouchPoints as any;
const mockGetDistance = getDistance as any;
const mockGetCenter = getCenter as any;
const mockIsTap = isTap as any;
const mockIsLongPress = isLongPress as any;
const mockTriggerHapticFeedback = triggerHapticFeedback as any;

describe('useTouchGestures', () => {
  const mockHandlers = {
    onTap: vi.fn(),
    onLongPress: vi.fn(),
    onPinchStart: vi.fn(),
    onPinchMove: vi.fn(),
    onPinchEnd: vi.fn(),
    onPanStart: vi.fn(),
    onPanMove: vi.fn(),
    onPanEnd: vi.fn(),
    onSwipe: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTouchGestures(mockHandlers));

    expect(result.current.isPanning).toBe(false);
    expect(result.current.isPinching).toBe(false);
    expect(result.current.gestureState.isActive).toBe(false);
  });

  describe('single touch gestures', () => {
    it('should handle tap gesture', () => {
      mockGetTouchPoints.mockReturnValue([{ x: 100, y: 100, identifier: 1 }]);
      mockIsTap.mockReturnValue(true);

      const { result } = renderHook(() => useTouchGestures(mockHandlers));

      const mockEvent = {
        touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      // Touch start
      act(() => {
        result.current.onTouchStart(mockEvent);
      });

      expect(result.current.gestureState.isActive).toBe(true);

      // Touch end (tap)
      const endEvent = {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchEnd(endEvent);
      });

      expect(mockHandlers.onTap).toHaveBeenCalledWith({ x: 100, y: 100, identifier: 1 });
      expect(mockTriggerHapticFeedback).toHaveBeenCalledWith('light');
    });

    it('should handle long press gesture', () => {
      mockGetTouchPoints.mockReturnValue([{ x: 100, y: 100, identifier: 1 }]);

      const { result } = renderHook(() => useTouchGestures(mockHandlers));

      const mockEvent = {
        touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      // Touch start
      act(() => {
        result.current.onTouchStart(mockEvent);
      });

      // Advance time to trigger long press
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockHandlers.onLongPress).toHaveBeenCalledWith({ x: 100, y: 100, identifier: 1 });
      expect(mockTriggerHapticFeedback).toHaveBeenCalledWith('medium');
    });

    it('should handle pan gesture', () => {
      mockGetTouchPoints
        .mockReturnValueOnce([{ x: 100, y: 100, identifier: 1 }])
        .mockReturnValueOnce([{ x: 120, y: 110, identifier: 1 }]);

      const { result } = renderHook(() => useTouchGestures(mockHandlers));

      // Touch start
      const startEvent = {
        touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchStart(startEvent);
      });

      expect(mockHandlers.onPanStart).toHaveBeenCalledWith({ x: 100, y: 100, identifier: 1 });

      // Touch move
      const moveEvent = {
        touches: [{ clientX: 120, clientY: 110, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchMove(moveEvent);
      });

      expect(mockHandlers.onPanMove).toHaveBeenCalledWith(
        { x: 120, y: 110, identifier: 1 },
        { x: 20, y: 10 }
      );
    });
  });

  describe('two touch gestures', () => {
    it('should handle pinch gesture', () => {
      const touch1 = { x: 100, y: 100, identifier: 1 };
      const touch2 = { x: 200, y: 200, identifier: 2 };
      
      mockGetTouchPoints.mockReturnValue([touch1, touch2]);
      mockGetDistance.mockReturnValue(100);
      mockGetCenter.mockReturnValue({ x: 150, y: 150 });

      const { result } = renderHook(() => useTouchGestures(mockHandlers));

      const mockEvent = {
        touches: [
          { clientX: 100, clientY: 100, identifier: 1 },
          { clientX: 200, clientY: 200, identifier: 2 }
        ],
        preventDefault: vi.fn()
      } as any;

      // Touch start (pinch start)
      act(() => {
        result.current.onTouchStart(mockEvent);
      });

      expect(result.current.isPinching).toBe(true);
      expect(mockHandlers.onPinchStart).toHaveBeenCalledWith({ x: 150, y: 150 }, 100);

      // Touch move (pinch move)
      mockGetDistance.mockReturnValue(150); // Increased distance
      mockGetCenter.mockReturnValue({ x: 155, y: 155 });

      act(() => {
        result.current.onTouchMove(mockEvent);
      });

      expect(mockHandlers.onPinchMove).toHaveBeenCalledWith(
        { x: 155, y: 155 },
        1.5, // scale = 150/100
        150
      );
    });

    it('should handle pinch end', () => {
      const touch1 = { x: 100, y: 100, identifier: 1 };
      const touch2 = { x: 200, y: 200, identifier: 2 };
      
      mockGetTouchPoints
        .mockReturnValueOnce([touch1, touch2])
        .mockReturnValueOnce([touch1]); // One finger lifted

      const { result } = renderHook(() => useTouchGestures(mockHandlers));

      // Start pinch
      const startEvent = {
        touches: [
          { clientX: 100, clientY: 100, identifier: 1 },
          { clientX: 200, clientY: 200, identifier: 2 }
        ],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchStart(startEvent);
      });

      // End pinch (one finger lifted)
      const endEvent = {
        touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchEnd(endEvent);
      });

      expect(mockHandlers.onPinchEnd).toHaveBeenCalled();
      expect(result.current.isPinching).toBe(false);
    });
  });

  describe('swipe gesture', () => {
    it('should detect horizontal swipe', () => {
      const startTouch = { x: 100, y: 100, identifier: 1 };
      const endTouch = { x: 200, y: 105, identifier: 1 };

      mockGetTouchPoints.mockReturnValue([startTouch]);
      mockIsTap.mockReturnValue(false);

      const { result } = renderHook(() => useTouchGestures(mockHandlers));

      // Touch start
      const startEvent = {
        touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchStart(startEvent);
      });

      // Touch end (swipe)
      const endEvent = {
        touches: [],
        changedTouches: [{ clientX: 200, clientY: 105, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchEnd(endEvent);
      });

      expect(mockHandlers.onSwipe).toHaveBeenCalledWith('right', expect.any(Number));
    });

    it('should detect vertical swipe', () => {
      const startTouch = { x: 100, y: 100, identifier: 1 };
      const endTouch = { x: 105, y: 200, identifier: 1 };

      mockGetTouchPoints.mockReturnValue([startTouch]);
      mockIsTap.mockReturnValue(false);

      const { result } = renderHook(() => useTouchGestures(mockHandlers));

      // Touch start
      const startEvent = {
        touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchStart(startEvent);
      });

      // Touch end (swipe)
      const endEvent = {
        touches: [],
        changedTouches: [{ clientX: 105, clientY: 200, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchEnd(endEvent);
      });

      expect(mockHandlers.onSwipe).toHaveBeenCalledWith('down', expect.any(Number));
    });
  });

  describe('gesture options', () => {
    it('should respect disabled gestures', () => {
      const { result } = renderHook(() => 
        useTouchGestures(mockHandlers, { enableTap: false })
      );

      mockGetTouchPoints.mockReturnValue([{ x: 100, y: 100, identifier: 1 }]);
      mockIsTap.mockReturnValue(true);

      const mockEvent = {
        touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchStart(mockEvent);
      });

      const endEvent = {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchEnd(endEvent);
      });

      expect(mockHandlers.onTap).not.toHaveBeenCalled();
    });

    it('should use custom thresholds', () => {
      const { result } = renderHook(() => 
        useTouchGestures(mockHandlers, { longPressDuration: 1000 })
      );

      mockGetTouchPoints.mockReturnValue([{ x: 100, y: 100, identifier: 1 }]);

      const mockEvent = {
        touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        preventDefault: vi.fn()
      } as any;

      act(() => {
        result.current.onTouchStart(mockEvent);
      });

      // Advance time less than custom threshold
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockHandlers.onLongPress).not.toHaveBeenCalled();

      // Advance time to meet custom threshold
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockHandlers.onLongPress).toHaveBeenCalled();
    });
  });
});