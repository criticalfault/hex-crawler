/**
 * Performance monitoring utilities for the hex crawl maker
 */

import React from 'react';

interface PerformanceMetrics {
  renderTime: number;
  hexCount: number;
  memoryUsage?: number;
  fps?: number;
}

interface PerformanceThresholds {
  maxRenderTime: number; // milliseconds
  maxHexCount: number;
  maxMemoryUsage: number; // MB
  minFPS: number;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxRenderTime: 16, // 60 FPS target
  maxHexCount: 10000, // Large grid warning
  maxMemoryUsage: 100, // 100MB warning
  minFPS: 30, // Minimum acceptable FPS
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private warnings: string[] = [];
  private isMonitoring = false;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsHistory: number[] = [];

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.requestAnimationFrame();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Measure render performance for a specific operation
   */
  measureRender<T>(operation: () => T, hexCount: number): T {
    const startTime = performance.now();
    const result = operation();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    const metrics: PerformanceMetrics = {
      renderTime,
      hexCount,
      memoryUsage: this.getMemoryUsage(),
    };

    this.metrics.push(metrics);
    this.checkThresholds(metrics);

    return result;
  }

  /**
   * Measure async render performance
   */
  async measureAsyncRender<T>(
    operation: () => Promise<T>,
    hexCount: number
  ): Promise<T> {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    const metrics: PerformanceMetrics = {
      renderTime,
      hexCount,
      memoryUsage: this.getMemoryUsage(),
    };

    this.metrics.push(metrics);
    this.checkThresholds(metrics);

    return result;
  }

  /**
   * Get current performance statistics
   */
  getStats(): {
    averageRenderTime: number;
    maxRenderTime: number;
    averageFPS: number;
    currentMemoryUsage: number;
    warnings: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageRenderTime: 0,
        maxRenderTime: 0,
        averageFPS: 0,
        currentMemoryUsage: this.getMemoryUsage(),
        warnings: this.warnings,
      };
    }

    const renderTimes = this.metrics.map(m => m.renderTime);
    const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);
    const averageFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
      : 0;

    return {
      averageRenderTime,
      maxRenderTime,
      averageFPS,
      currentMemoryUsage: this.getMemoryUsage(),
      warnings: [...this.warnings],
    };
  }

  /**
   * Clear all metrics and warnings
   */
  clearMetrics(): void {
    this.metrics = [];
    this.warnings = [];
    this.fpsHistory = [];
  }

  /**
   * Get optimization suggestions based on current metrics
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const stats = this.getStats();

    if (stats.averageRenderTime > this.thresholds.maxRenderTime) {
      suggestions.push(
        'Consider reducing hex grid size or implementing level-of-detail rendering'
      );
    }

    if (stats.averageFPS < this.thresholds.minFPS) {
      suggestions.push(
        'Frame rate is low. Try reducing visual effects or grid complexity'
      );
    }

    if (stats.currentMemoryUsage > this.thresholds.maxMemoryUsage) {
      suggestions.push(
        'High memory usage detected. Consider implementing hex culling for large grids'
      );
    }

    const largeGridMetrics = this.metrics.filter(m => m.hexCount > 1000);
    if (largeGridMetrics.length > 0) {
      suggestions.push(
        'Large grid detected. Consider implementing viewport culling to only render visible hexes'
      );
    }

    return suggestions;
  }

  /**
   * Check if current performance meets thresholds
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      this.addWarning(
        `Render time ${metrics.renderTime.toFixed(2)}ms exceeds threshold of ${this.thresholds.maxRenderTime}ms`
      );
    }

    if (metrics.hexCount > this.thresholds.maxHexCount) {
      this.addWarning(
        `Hex count ${metrics.hexCount} exceeds recommended maximum of ${this.thresholds.maxHexCount}`
      );
    }

    if (metrics.memoryUsage && metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      this.addWarning(
        `Memory usage ${metrics.memoryUsage.toFixed(2)}MB exceeds threshold of ${this.thresholds.maxMemoryUsage}MB`
      );
    }
  }

  /**
   * Add a performance warning
   */
  private addWarning(warning: string): void {
    if (!this.warnings.includes(warning)) {
      this.warnings.push(warning);
      console.warn(`Performance Warning: ${warning}`);
    }
  }

  /**
   * Get current memory usage in MB
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  /**
   * Animation frame callback for FPS monitoring
   */
  private requestAnimationFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (deltaTime > 0) {
      const fps = 1000 / deltaTime;
      this.fpsHistory.push(fps);
      
      // Keep only last 60 FPS measurements (1 second at 60fps)
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }

      // Check FPS threshold
      if (fps < this.thresholds.minFPS) {
        this.addWarning(`Low FPS detected: ${fps.toFixed(1)} (threshold: ${this.thresholds.minFPS})`);
      }
    }

    this.lastFrameTime = currentTime;
    this.frameCount++;

    requestAnimationFrame(this.requestAnimationFrame);
  };
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for performance monitoring
 */
export const usePerformanceMonitor = () => {
  const [stats, setStats] = React.useState(performanceMonitor.getStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(performanceMonitor.getStats());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    measureRender: performanceMonitor.measureRender.bind(performanceMonitor),
    measureAsyncRender: performanceMonitor.measureAsyncRender.bind(performanceMonitor),
    getOptimizationSuggestions: performanceMonitor.getOptimizationSuggestions.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
    startMonitoring: performanceMonitor.startMonitoring.bind(performanceMonitor),
    stopMonitoring: performanceMonitor.stopMonitoring.bind(performanceMonitor),
  };
};

/**
 * Higher-order component for automatic performance monitoring
 */
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const renderCount = React.useRef(0);

    React.useEffect(() => {
      renderCount.current++;
      
      if (renderCount.current > 100) {
        console.warn(
          `Component ${componentName} has rendered ${renderCount.current} times. ` +
          'Consider optimizing with React.memo or useMemo.'
        );
      }
    });

    return React.createElement(WrappedComponent, { ...props, ref });
  });
};

/**
 * Utility function to measure function execution time
 */
export const measureExecutionTime = <T extends any[], R>(
  fn: (...args: T) => R,
  name: string
) => {
  return (...args: T): R => {
    const startTime = performance.now();
    const result = fn(...args);
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    if (executionTime > 10) { // Log if execution takes more than 10ms
      console.log(`${name} execution time: ${executionTime.toFixed(2)}ms`);
    }
    
    return result;
  };
};

export default PerformanceMonitor;