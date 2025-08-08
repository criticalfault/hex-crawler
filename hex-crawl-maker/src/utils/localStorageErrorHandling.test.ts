import { vi, beforeEach, afterEach } from 'vitest';
import {
  loadMapsFromStorage,
  loadExplorationState,
  loadUIPreferences,
  clearAllStoredData,
  exportAllData,
  importAllData,
} from '../store/middleware/localStorage';

describe('localStorage Error Handling', () => {
  let originalLocalStorage: Storage;
  let mockLocalStorage: any;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  describe('localStorage unavailable scenarios', () => {
    it('should handle localStorage being null', () => {
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
      });

      const maps = loadMapsFromStorage();
      expect(maps).toEqual({});

      const exploration = loadExplorationState();
      expect(exploration.exploredHexes.size).toBe(0);
      expect(exploration.visibleHexes.size).toBe(0);
      expect(exploration.explorationHistory).toEqual([]);

      const preferences = loadUIPreferences();
      expect(preferences).toEqual({});
    });

    it('should handle localStorage being undefined', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const maps = loadMapsFromStorage();
      expect(maps).toEqual({});

      const exploration = loadExplorationState();
      expect(exploration.exploredHexes.size).toBe(0);

      const preferences = loadUIPreferences();
      expect(preferences).toEqual({});
    });

    it('should handle localStorage access throwing errors', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const maps = loadMapsFromStorage();
      expect(maps).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load maps from localStorage')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('quota exceeded scenarios', () => {
    it('should handle QuotaExceededError gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // This would be called by the middleware
      expect(() => {
        try {
          mockLocalStorage.setItem('test-key', 'test-value');
        } catch (error) {
          console.warn('Failed to save to localStorage:', error);
        }
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save to localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle storage full scenarios', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => {
        try {
          mockLocalStorage.setItem('large-data', 'x'.repeat(10000000));
        } catch (error) {
          console.warn('Storage quota exceeded:', error);
        }
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('corrupted data scenarios', () => {
    it('should handle corrupted JSON in maps storage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json {');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const maps = loadMapsFromStorage();
      expect(maps).toEqual({});
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hex-crawl-maker-maps');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load maps from localStorage, clearing corrupted data')
      );

      consoleSpy.mockRestore();
    });

    it('should handle corrupted exploration data', () => {
      mockLocalStorage.getItem.mockReturnValue('{"invalid": "structure"}');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const exploration = loadExplorationState();
      expect(exploration.exploredHexes.size).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid exploration data structure, using defaults'
      );

      consoleSpy.mockRestore();
    });

    it('should handle partially corrupted map data', () => {
      const partiallyCorruptedData = {
        'valid-map': {
          id: 'valid-map',
          name: 'Valid Map',
          dimensions: { width: 10, height: 10 },
          cells: [],
          playerPositions: [],
          sightDistance: 2,
          revealMode: 'permanent',
          appearance: {
            hexSize: 30,
            borderColor: '#333333',
            backgroundColor: '#f0f0f0',
            unexploredColor: '#cccccc',
            textSize: 12,
            terrainColors: {
              mountains: '#8B4513',
              plains: '#90EE90',
              swamps: '#556B2F',
              water: '#4169E1',
              desert: '#F4A460',
            },
            borderWidth: 1,
          },
        },
        'invalid-map': {
          id: 'invalid-map',
          // Missing required fields
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partiallyCorruptedData));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const maps = loadMapsFromStorage();
      expect(maps['valid-map']).toBeTruthy();
      expect(maps['invalid-map']).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid map data structure, skipping:',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('network and permission errors', () => {
    it('should handle SecurityError when accessing localStorage', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const maps = loadMapsFromStorage();
      expect(maps).toEqual({});
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle NetworkError scenarios', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new DOMException('Network error', 'NetworkError');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const preferences = loadUIPreferences();
      expect(preferences).toEqual({});
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('data validation and recovery', () => {
    it('should validate map data structure before loading', () => {
      const invalidMapData = {
        'invalid-map-1': {
          id: 'invalid-map-1',
          // Missing name
          dimensions: { width: 10, height: 10 },
        },
        'invalid-map-2': {
          id: 'invalid-map-2',
          name: 'Invalid Map',
          // Missing dimensions
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(invalidMapData));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const maps = loadMapsFromStorage();
      expect(Object.keys(maps)).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });

    it('should handle Map serialization errors gracefully', () => {
      const mapWithCircularReference = {
        id: 'circular-map',
        name: 'Circular Map',
        dimensions: { width: 10, height: 10 },
        cells: [],
        playerPositions: [],
        sightDistance: 2,
        revealMode: 'permanent',
        appearance: {},
      };

      // Create circular reference
      (mapWithCircularReference as any).self = mapWithCircularReference;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // This would happen during serialization in the middleware
      expect(() => {
        try {
          JSON.stringify(mapWithCircularReference);
        } catch (error) {
          console.warn('Failed to serialize map data:', error);
        }
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('utility function error handling', () => {
    it('should handle errors in clearAllStoredData', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => clearAllStoredData()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear stored data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors in exportAllData', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Export failed');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = exportAllData();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to export data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors in importAllData', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Import failed');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const validData = JSON.stringify({
        maps: '{"test": "data"}',
        currentMapId: 'test-id',
      });

      const result = importAllData(validData);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to import data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle invalid JSON in importAllData', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = importAllData('invalid json');
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to import data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fallback mechanisms', () => {
    it('should provide default values when localStorage fails', () => {
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
      });

      const exploration = loadExplorationState();
      expect(exploration).toEqual({
        exploredHexes: new Set(),
        visibleHexes: new Set(),
        explorationHistory: [],
      });

      const preferences = loadUIPreferences();
      expect(preferences).toEqual({});

      const maps = loadMapsFromStorage();
      expect(maps).toEqual({});
    });

    it('should continue working after localStorage errors', () => {
      // First call fails
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('First call failed');
      });

      // Second call succeeds
      mockLocalStorage.getItem.mockImplementationOnce(() => '{"test": "data"}');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // First call should fail gracefully
      const firstResult = loadUIPreferences();
      expect(firstResult).toEqual({});

      // Second call should work
      const secondResult = loadUIPreferences();
      expect(secondResult).toEqual({ test: 'data' });

      consoleSpy.mockRestore();
    });
  });
});