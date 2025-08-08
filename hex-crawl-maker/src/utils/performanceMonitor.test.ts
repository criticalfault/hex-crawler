import { vi, beforeEach, afterEach } from 'vitest';
import PerformanceMonitor, { performanceMonitor, measureExecutionTime } from './performanceMonitor';

// Mock performance.now
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    },
  },
  writable: true,
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn();
global.requestAnimationFrame = mockRequestAnimationFrame;

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    monitor = new PerformanceMonitor();
    mockPerformanceNow.mockReturnValue(0);
  });

  afterEach(() => {
    monitor.stopMonitoring();
  });

  describe('measureRender', () => {
    it('should measure render time correctly', () => {
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(16); // End time

      const result = monitor.measureRender(() => 'test result', 100);

      expect(result).toBe('test result');
      
      const stats = monitor.getStats();
      expect(stats.averageRenderTime).toBe(16);
      expect(stats.maxRenderTime).toBe(16);
    });

    it('should track multiple render measurements', () => {
      mockPerformanceNow
        .mockReturnValueOnce(0).mockReturnValueOnce(10) // First measurement: 10ms
        .mockReturnValueOnce(20).mockReturnValueOnce(35); // Second measurement: 15ms

      monitor.measureRender(() => 'result1', 50);
      monitor.measureRender(() => 'result2', 75);

      const stats = monitor.getStats();
      expect(stats.averageRenderTime).toBe(12.5); // (10 + 15) / 2
      expect(stats.maxRenderTime).toBe(15);
    });

    it('should generate warnings for slow renders', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(50); // 50ms render time (exceeds 16ms threshold)

      monitor.measureRender(() => 'slow result', 100);

      const stats = monitor.getStats();
      expect(stats.warnings).toHaveLength(1);
      expect(stats.warnings[0]).toContain('Render time 50.00ms exceeds threshold');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Performance Warning'));
      
      consoleSpy.mockRestore();
    });

    it('should warn about large hex counts', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10);

      monitor.measureRender(() => 'result', 15000); // Exceeds 10000 threshold

      const stats = monitor.getStats();
      expect(stats.warnings).toHaveLength(1);
      expect(stats.warnings[0]).toContain('Hex count 15000 exceeds recommended maximum');
      
      consoleSpy.mockRestore();
    });
  });

  describe('measureAsyncRender', () => {
    it('should measure async render time correctly', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(25); // End time

      const asyncOperation = () => Promise.resolve('async result');
      const result = await monitor.measureAsyncRender(asyncOperation, 200);

      expect(result).toBe('async result');
      
      const stats = monitor.getStats();
      expect(stats.averageRenderTime).toBe(25);
    });
  });

  describe('getStats', () => {
    it('should return default stats when no measurements exist', () => {
      const stats = monitor.getStats();

      expect(stats.averageRenderTime).toBe(0);
      expect(stats.maxRenderTime).toBe(0);
      expect(stats.averageFPS).toBe(0);
      expect(stats.currentMemoryUsage).toBe(50); // 50MB from mock
      expect(stats.warnings).toEqual([]);
    });

    it('should calculate correct statistics', () => {
      mockPerformanceNow
        .mockReturnValueOnce(0).mockReturnValueOnce(10)
        .mockReturnValueOnce(20).mockReturnValueOnce(40)
        .mockReturnValueOnce(50).mockReturnValueOnce(60);

      monitor.measureRender(() => {}, 100); // 10ms
      monitor.measureRender(() => {}, 100); // 20ms
      monitor.measureRender(() => {}, 100); // 10ms

      const stats = monitor.getStats();
      expect(stats.averageRenderTime).toBeCloseTo(13.33, 1);
      expect(stats.maxRenderTime).toBe(20);
    });
  });

  describe('getOptimizationSuggestions', () => {
    it('should suggest optimizations for slow renders', () => {
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(50); // Slow render

      monitor.measureRender(() => {}, 100);

      const suggestions = monitor.getOptimizationSuggestions();
      expect(suggestions).toContain(
        'Consider reducing hex grid size or implementing level-of-detail rendering'
      );
    });

    it('should suggest optimizations for large grids', () => {
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10);

      monitor.measureRender(() => {}, 2000); // Large grid

      const suggestions = monitor.getOptimizationSuggestions();
      expect(suggestions).toContain(
        'Large grid detected. Consider implementing viewport culling to only render visible hexes'
      );
    });

    it('should suggest memory optimizations', () => {
      // Mock high memory usage
      Object.defineProperty(global, 'performance', {
        value: {
          now: mockPerformanceNow,
          memory: {
            usedJSHeapSize: 150 * 1024 * 1024, // 150MB (exceeds 100MB threshold)
          },
        },
        writable: true,
      });

      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10);

      monitor.measureRender(() => {}, 100);

      const suggestions = monitor.getOptimizationSuggestions();
      expect(suggestions).toContain(
        'High memory usage detected. Consider implementing hex culling for large grids'
      );
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics and warnings', () => {
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(50); // Generate warning

      monitor.measureRender(() => {}, 100);

      let stats = monitor.getStats();
      expect(stats.averageRenderTime).toBe(50);
      expect(stats.warnings).toHaveLength(1);

      monitor.clearMetrics();

      stats = monitor.getStats();
      expect(stats.averageRenderTime).toBe(0);
      expect(stats.warnings).toHaveLength(0);
    });
  });

  describe('monitoring lifecycle', () => {
    it('should start and stop monitoring', () => {
      expect(monitor['isMonitoring']).toBe(false);

      monitor.startMonitoring();
      expect(monitor['isMonitoring']).toBe(true);
      expect(mockRequestAnimationFrame).toHaveBeenCalled();

      monitor.stopMonitoring();
      expect(monitor['isMonitoring']).toBe(false);
    });
  });

  describe('custom thresholds', () => {
    it('should use custom thresholds', () => {
      const customMonitor = new PerformanceMonitor({
        maxRenderTime: 5, // Very strict threshold
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10); // 10ms exceeds 5ms threshold

      customMonitor.measureRender(() => {}, 100);

      const stats = customMonitor.getStats();
      expect(stats.warnings).toHaveLength(1);
      expect(stats.warnings[0]).toContain('exceeds threshold of 5ms');
      
      consoleSpy.mockRestore();
    });
  });
});

describe('measureExecutionTime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  it('should measure and log slow function execution', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(15); // 15ms execution time

    const slowFunction = (x: number) => x * 2;
    const measuredFunction = measureExecutionTime(slowFunction, 'slowFunction');

    const result = measuredFunction(5);

    expect(result).toBe(10);
    expect(consoleSpy).toHaveBeenCalledWith('slowFunction execution time: 15.00ms');
    
    consoleSpy.mockRestore();
  });

  it('should not log fast function execution', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(5); // 5ms execution time (under 10ms threshold)

    const fastFunction = (x: number) => x * 2;
    const measuredFunction = measureExecutionTime(fastFunction, 'fastFunction');

    measuredFunction(5);

    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});

describe('global performanceMonitor', () => {
  it('should be available as singleton', () => {
    expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor);
  });
});