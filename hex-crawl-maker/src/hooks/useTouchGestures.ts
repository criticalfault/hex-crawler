/**
 * Custom hook for handling touch gestures
 */

import { useCallback, useRef, useState } from "react";
import {
  getTouchPoints,
  getDistance,
  getCenter,
  isTap,
  isLongPress,
  triggerHapticFeedback,
} from "../utils/touchUtils";
import type { TouchPoint, GestureState } from "../utils/touchUtils";

interface TouchGestureHandlers {
  onTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onPinchStart?: (center: { x: number; y: number }, distance: number) => void;
  onPinchMove?: (
    center: { x: number; y: number },
    scale: number,
    distance: number
  ) => void;
  onPinchEnd?: () => void;
  onPanStart?: (point: TouchPoint) => void;
  onPanMove?: (point: TouchPoint, delta: { x: number; y: number }) => void;
  onPanEnd?: () => void;
  onSwipe?: (
    direction: "left" | "right" | "up" | "down",
    velocity: number
  ) => void;
}

interface TouchGestureOptions {
  enablePinch?: boolean;
  enablePan?: boolean;
  enableTap?: boolean;
  enableLongPress?: boolean;
  enableSwipe?: boolean;
  longPressDuration?: number;
  tapMaxDistance?: number;
  tapMaxDuration?: number;
  swipeMinDistance?: number;
  swipeMaxTime?: number;
  panThreshold?: number;
}

const defaultOptions: TouchGestureOptions = {
  enablePinch: true,
  enablePan: true,
  enableTap: true,
  enableLongPress: true,
  enableSwipe: true,
  longPressDuration: 500,
  tapMaxDistance: 10,
  tapMaxDuration: 300,
  swipeMinDistance: 50,
  swipeMaxTime: 300,
  panThreshold: 5,
};

export function useTouchGestures(
  handlers: TouchGestureHandlers,
  options: TouchGestureOptions = {}
) {
  const opts = { ...defaultOptions, ...options };

  const gestureState = useRef<GestureState>({
    isActive: false,
    startTime: 0,
  });

  const touchStart = useRef<TouchPoint[]>([]);
  const lastTouchMove = useRef<TouchPoint[]>([]);
  const longPressTimer = useRef<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isPinching, setIsPinching] = useState(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touches = getTouchPoints(event);
      touchStart.current = touches;
      lastTouchMove.current = touches;

      gestureState.current = {
        isActive: true,
        startTime: Date.now(),
      };

      if (touches.length === 1 && opts.enableTap) {
        // Single touch - potential tap or long press
        if (opts.enableLongPress && handlers.onLongPress) {
          longPressTimer.current = setTimeout(() => {
            if (gestureState.current.isActive) {
              triggerHapticFeedback("medium");
              handlers.onLongPress!(touches[0]);
              clearLongPressTimer();
            }
          }, opts.longPressDuration);
        }

        if (opts.enablePan && handlers.onPanStart) {
          handlers.onPanStart(touches[0]);
        }
      } else if (touches.length === 2 && opts.enablePinch) {
        // Two touches - pinch gesture
        clearLongPressTimer();
        const distance = getDistance(touches[0], touches[1]);
        const center = getCenter(touches[0], touches[1]);

        gestureState.current.startDistance = distance;
        gestureState.current.startCenter = center;
        gestureState.current.currentDistance = distance;
        gestureState.current.currentCenter = center;
        gestureState.current.scale = 1;

        setIsPinching(true);

        if (handlers.onPinchStart) {
          handlers.onPinchStart(center, distance);
        }
      }

      // Prevent default to avoid scrolling/zooming
      event.preventDefault();
    },
    [handlers, opts, clearLongPressTimer]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!gestureState.current.isActive) return;

      const touches = getTouchPoints(event);
      const prevTouches = lastTouchMove.current;
      lastTouchMove.current = touches;

      if (touches.length === 1 && prevTouches.length === 1) {
        // Single touch movement
        const currentTouch = touches[0];
        const startTouch = touchStart.current[0];
        const prevTouch = prevTouches[0];

        if (startTouch) {
          const totalDistance = getDistance(startTouch, currentTouch);

          // Clear long press if moved too far
          if (totalDistance > opts.tapMaxDistance!) {
            clearLongPressTimer();
          }

          // Handle panning
          if (
            opts.enablePan &&
            handlers.onPanMove &&
            totalDistance > opts.panThreshold!
          ) {
            if (!isPanning) {
              setIsPanning(true);
            }

            const delta = {
              x: currentTouch.x - prevTouch.x,
              y: currentTouch.y - prevTouch.y,
            };

            handlers.onPanMove(currentTouch, delta);
          }
        }
      } else if (
        touches.length === 2 &&
        prevTouches.length === 2 &&
        isPinching
      ) {
        // Two touch movement - pinch/zoom
        const currentDistance = getDistance(touches[0], touches[1]);
        const currentCenter = getCenter(touches[0], touches[1]);

        if (gestureState.current.startDistance) {
          const scale = currentDistance / gestureState.current.startDistance;

          gestureState.current.currentDistance = currentDistance;
          gestureState.current.currentCenter = currentCenter;
          gestureState.current.scale = scale;

          if (handlers.onPinchMove) {
            handlers.onPinchMove(currentCenter, scale, currentDistance);
          }
        }
      }

      event.preventDefault();
    },
    [handlers, opts, isPanning, isPinching, clearLongPressTimer]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const touches = getTouchPoints(event);
      const endTime = Date.now();

      clearLongPressTimer();

      if (touchStart.current.length === 1 && touches.length === 0) {
        // Single touch ended
        const startTouch = touchStart.current[0];
        const endTouch = lastTouchMove.current[0] || startTouch;

        if (isPanning && handlers.onPanEnd) {
          handlers.onPanEnd();
          setIsPanning(false);
        }

        // Check for tap
        if (opts.enableTap && handlers.onTap && !isPanning) {
          if (
            isTap(
              gestureState.current.startTime,
              startTouch,
              endTouch,
              opts.tapMaxDuration,
              opts.tapMaxDistance
            )
          ) {
            triggerHapticFeedback("light");
            handlers.onTap(endTouch);
          }
        }

        // Check for swipe
        if (opts.enableSwipe && handlers.onSwipe && !isPanning) {
          const duration = endTime - gestureState.current.startTime;
          const distance = getDistance(startTouch, endTouch);

          if (
            duration <= opts.swipeMaxTime! &&
            distance >= opts.swipeMinDistance!
          ) {
            const deltaX = endTouch.x - startTouch.x;
            const deltaY = endTouch.y - startTouch.y;
            const velocity = distance / duration;

            let direction: "left" | "right" | "up" | "down";

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              direction = deltaX > 0 ? "right" : "left";
            } else {
              direction = deltaY > 0 ? "down" : "up";
            }

            handlers.onSwipe(direction, velocity);
          }
        }
      } else if (isPinching && touches.length < 2) {
        // Pinch gesture ended
        if (handlers.onPinchEnd) {
          handlers.onPinchEnd();
        }
        setIsPinching(false);
      }

      // Reset state if no touches remain
      if (touches.length === 0) {
        gestureState.current.isActive = false;
        setIsPanning(false);
        setIsPinching(false);
      }

      event.preventDefault();
    },
    [handlers, opts, isPanning, isPinching, clearLongPressTimer]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isPanning,
    isPinching,
    gestureState: gestureState.current,
  };
}
