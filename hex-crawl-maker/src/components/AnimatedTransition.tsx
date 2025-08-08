/**
 * Animated transition wrapper for smooth mode changes and hex reveals
 */

import React, { useEffect, useState } from 'react';
import './AnimatedTransition.css';

interface AnimatedTransitionProps {
  isVisible: boolean;
  type?: 'fade' | 'slide' | 'scale' | 'reveal';
  duration?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
  onTransitionComplete?: () => void;
}

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  isVisible,
  type = 'fade',
  duration = 300,
  delay = 0,
  direction = 'up',
  children,
  className = '',
  onTransitionComplete,
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    isVisible ? 'entered' : 'exited'
  );

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setAnimationState('entering');
      
      const enterTimer = setTimeout(() => {
        setAnimationState('entered');
        onTransitionComplete?.();
      }, delay + duration);

      return () => clearTimeout(enterTimer);
    } else {
      setAnimationState('exiting');
      
      const exitTimer = setTimeout(() => {
        setAnimationState('exited');
        setShouldRender(false);
        onTransitionComplete?.();
      }, duration);

      return () => clearTimeout(exitTimer);
    }
  }, [isVisible, duration, delay, onTransitionComplete]);

  if (!shouldRender) return null;

  const transitionClasses = [
    'animated-transition',
    `animated-transition--${type}`,
    `animated-transition--${direction}`,
    `animated-transition--${animationState}`,
    className,
  ].filter(Boolean).join(' ');

  const style = {
    '--transition-duration': `${duration}ms`,
    '--transition-delay': `${delay}ms`,
  } as React.CSSProperties;

  return (
    <div className={transitionClasses} style={style}>
      {children}
    </div>
  );
};

// Hook for managing multiple animated elements
export const useAnimatedList = (items: any[], staggerDelay = 50) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const newVisibleItems = new Set<number>();
    
    items.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * staggerDelay);
    });

    return () => {
      setVisibleItems(new Set());
    };
  }, [items, staggerDelay]);

  return visibleItems;
};

// Component for animating hex reveals
interface HexRevealAnimationProps {
  isRevealed: boolean;
  coordinate: { q: number; r: number };
  children: React.ReactNode;
  delay?: number;
}

export const HexRevealAnimation: React.FC<HexRevealAnimationProps> = ({
  isRevealed,
  coordinate,
  children,
  delay = 0,
}) => {
  // Calculate staggered delay based on distance from origin
  const distance = Math.abs(coordinate.q) + Math.abs(coordinate.r);
  const calculatedDelay = delay + (distance * 100);

  return (
    <AnimatedTransition
      isVisible={isRevealed}
      type="reveal"
      duration={400}
      delay={calculatedDelay}
      className="hex-reveal-animation"
    >
      {children}
    </AnimatedTransition>
  );
};