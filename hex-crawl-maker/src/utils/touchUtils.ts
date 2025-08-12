/**
 * Touch utilities for mobile and touch device support
 */

export interface TouchPoint {
  x: number;
  y: number;
  identifier: number;
}

export interface GestureState {
  isActive: boolean;
  startTime: number;
  startDistance?: number;
  startCenter?: { x: number; y: number };
  currentDistance?: number;
  currentCenter?: { x: number; y: number };
  scale?: number;
  rotation?: number;
}

/**
 * Get touch points from a touch event
 */
export function getTouchPoints(event: TouchEvent | React.TouchEvent): TouchPoint[] {
  const touches = 'touches' in event ? event.touches : (event as React.TouchEvent).nativeEvent.touches;
  const touchArray: TouchPoint[] = [];
  for (let i = 0; i < touches.length; i++) {
    const touch = touches[i];
    touchArray.push({
      x: touch.clientX,
      y: touch.clientY,
      identifier: touch.identifier
    });
  }
  return touchArray;
}

/**
 * Calculate distance between two touch points
 */
export function getDistance(point1: TouchPoint, point2: TouchPoint): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate center point between two touch points
 */
export function getCenter(point1: TouchPoint, point2: TouchPoint): { x: number; y: number } {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2
  };
}

/**
 * Calculate angle between two touch points
 */
export function getAngle(point1: TouchPoint, point2: TouchPoint): number {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
}

/**
 * Detect if a touch event is a tap (short duration, minimal movement)
 */
export function isTap(
  startTime: number,
  startPoint: TouchPoint,
  endPoint: TouchPoint,
  maxDuration: number = 300,
  maxDistance: number = 10
): boolean {
  const duration = Date.now() - startTime;
  const distance = getDistance(startPoint, endPoint);
  return duration <= maxDuration && distance <= maxDistance;
}

/**
 * Detect if a touch event is a long press
 */
export function isLongPress(
  startTime: number,
  minDuration: number = 500
): boolean {
  return Date.now() - startTime >= minDuration;
}

/**
 * Trigger haptic feedback if supported
 */
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    navigator.vibrate(patterns[type]);
  }
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get touch-friendly size multiplier based on device
 */
export function getTouchSizeMultiplier(): number {
  if (!isTouchDevice()) return 1;
  
  // Larger multiplier for smaller screens
  const screenWidth = window.innerWidth;
  if (screenWidth < 480) return 1.5;
  if (screenWidth < 768) return 1.3;
  return 1.2;
}

/**
 * Prevent default touch behaviors that interfere with app
 */
export function preventDefaultTouchBehaviors(element: HTMLElement): () => void {
  const preventDefault = (e: Event) => {
    e.preventDefault();
  };

  // Prevent zoom on double tap
  element.addEventListener('touchstart', preventDefault, { passive: false });
  element.addEventListener('touchmove', preventDefault, { passive: false });
  
  // Prevent context menu on long press
  element.addEventListener('contextmenu', preventDefault);
  
  // Prevent text selection
  element.style.userSelect = 'none';
  (element.style as any).webkitUserSelect = 'none';
  (element.style as any).webkitTouchCallout = 'none';

  return () => {
    element.removeEventListener('touchstart', preventDefault);
    element.removeEventListener('touchmove', preventDefault);
    element.removeEventListener('contextmenu', preventDefault);
    element.style.userSelect = '';
    (element.style as any).webkitUserSelect = '';
    (element.style as any).webkitTouchCallout = '';
  };
}

/**
 * Debounce function for touch events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for touch events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}