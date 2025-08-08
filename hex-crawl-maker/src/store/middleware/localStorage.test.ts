import { vi, beforeEach, afterEach } from 'vitest';
import {
  localStorageMiddleware,
  loadMapsFromStorage,
  loadCurrentMapId,
  loadExplorationState,
  loadUIPreferences,
  clearAllStoredData,
  exportAllData,
  importAllData,
} from './localStorage';
import type { MapData } from '../../types';

// Mock localStorage
const mockStorage: { [key: string]: string } = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  }),
};

// Mock global localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('localStorage middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockMapData: MapData = {
    id: 'test-map-1',
    name: 'Test Map',
    dimensions: { width: 10, height: 10 },
    cells: new Map([
      ['0,0', {
        coordinate: { q: 0, r: 0 },
        terrain: 'mountains',
        isExplored: false,
        isVisible: false,
      }],
    ]),
    playerPositions: [{ q: 1, r: 1 }],
    sightDistance: 3,
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
  };

  describe('loadMapsFromStorage', () => {
    it('should load maps from localStorage', () => {
      const serializedMaps = {
        'test-map-1': {
          ...mockMapData,
          cells: [['0,0', mockMapData.cells.get('0,0')]],
        },
      };
      mockStorage['hex-crawl-maker-maps'] = JSON.stringify(serializedMaps);

      const result = loadMapsFromStorage();

      expect(result['test-map-1']).toBeTruthy();
      expect(result['test-map-1'].name).toBe('Test Map');
      expect(result['test-map-1'].cells).toBeInstanceOf(Map);
      expect(result['test-map-1'].cells.get('0,0')).toBeTruthy();
    });

    it('should return empty object when no maps stored', () => {
      const result = loadMapsFromStorage();
      expect(result).toEqual({});
    });

    it('should handle corrupted data gracefully', () => {
      mockStorage['hex-crawl-maker-maps'] = 'invalid json';

      const result = loadMapsFromStorage();

      expect(result).toEqual({});
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hex-crawl-maker-maps');
    });

    it('should skip invalid map data', () => {
      const invalidMaps = {
        'valid-map': {
          ...mockMapData,
          cells: [['0,0', mockMapData.cells.get('0,0')]],
        },
        'invalid-map': {
          id: 'invalid',
          // Missing required fields
        },
      };
      mockStorage['hex-crawl-maker-maps'] = JSON.stringify(invalidMaps);

      const result = loadMapsFromStorage();

      expect(result['valid-map']).toBeTruthy();
      expect(result['invalid-map']).toBeUndefined();
    });
  });

  describe('loadCurrentMapId', () => {
    it('should load current map ID', () => {
      mockStorage['hex-crawl-maker-current-map-id'] = 'test-map-1';

      const result = loadCurrentMapId();

      expect(result).toBe('test-map-1');
    });

    it('should return null when no current map ID stored', () => {
      const result = loadCurrentMapId();
      expect(result).toBeNull();
    });
  });

  describe('loadExplorationState', () => {
    it('should load exploration state', () => {
      const explorationData = {
        exploredHexes: ['0,0', '1,1'],
        visibleHexes: ['0,0'],
        explorationHistory: [
          { timestamp: 123456, coordinate: { q: 0, r: 0 } },
        ],
      };
      mockStorage['hex-crawl-maker-exploration'] = JSON.stringify(explorationData);

      const result = loadExplorationState();

      expect(result.exploredHexes).toBeInstanceOf(Set);
      expect(result.exploredHexes.has('0,0')).toBe(true);
      expect(result.exploredHexes.has('1,1')).toBe(true);
      expect(result.visibleHexes.has('0,0')).toBe(true);
      expect(result.explorationHistory).toEqual(explorationData.explorationHistory);
    });

    it('should return default state when no exploration data stored', () => {
      const result = loadExplorationState();

      expect(result.exploredHexes).toBeInstanceOf(Set);
      expect(result.exploredHexes.size).toBe(0);
      expect(result.visibleHexes.size).toBe(0);
      expect(result.explorationHistory).toEqual([]);
    });

    it('should handle corrupted exploration data', () => {
      mockStorage['hex-crawl-maker-exploration'] = 'invalid json';

      const result = loadExplorationState();

      expect(result.exploredHexes.size).toBe(0);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hex-crawl-maker-exploration');
    });
  });

  describe('loadUIPreferences', () => {
    it('should load UI preferences', () => {
      const preferences = {
        showCoordinates: true,
        zoom: 1.5,
        panOffset: { x: 10, y: 20 },
      };
      mockStorage['hex-crawl-maker-ui-preferences'] = JSON.stringify(preferences);

      const result = loadUIPreferences();

      expect(result).toEqual(preferences);
    });

    it('should return empty object when no preferences stored', () => {
      const result = loadUIPreferences();
      expect(result).toEqual({});
    });
  });

  describe('middleware functionality', () => {
    let store: any;
    let next: any;
    let middleware: any;

    beforeEach(() => {
      store = {
        getState: vi.fn(() => ({
          map: {
            currentMap: mockMapData,
            savedMaps: { 'test-map-1': mockMapData },
          },
          exploration: {
            exploredHexes: new Set(['0,0']),
            visibleHexes: new Set(['0,0']),
            explorationHistory: [],
          },
          ui: {
            showCoordinates: true,
            zoom: 1.2,
            panOffset: { x: 5, y: 10 },
          },
        })),
      };
      next = vi.fn((action) => action);
      middleware = localStorageMiddleware(store)(next);
    });

    it('should save maps immediately for critical operations', () => {
      const action = { type: 'map/createNewMap', payload: {} };

      middleware(action);

      expect(next).toHaveBeenCalledWith(action);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hex-crawl-maker-maps',
        expect.any(String)
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hex-crawl-maker-current-map-id',
        'test-map-1'
      );
    });

    it('should schedule auto-save for other map operations', () => {
      vi.useFakeTimers();
      const action = { type: 'map/placeIcon', payload: {} };

      middleware(action);

      expect(next).toHaveBeenCalledWith(action);
      
      // Auto-save should not happen immediately
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

      // Fast-forward time to trigger auto-save
      vi.advanceTimersByTime(2100);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should save UI preferences for coordinate/zoom actions', () => {
      const action = { type: 'ui/toggleCoordinates', payload: {} };

      middleware(action);

      expect(next).toHaveBeenCalledWith(action);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hex-crawl-maker-ui-preferences',
        expect.any(String)
      );
    });

    it('should pass through non-storage actions unchanged', () => {
      const action = { type: 'some/otherAction', payload: {} };

      const result = middleware(action);

      expect(next).toHaveBeenCalledWith(action);
      expect(result).toBe(action);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('utility functions', () => {
    beforeEach(() => {
      mockStorage['hex-crawl-maker-maps'] = '{"test": "data"}';
      mockStorage['hex-crawl-maker-current-map-id'] = 'test-id';
      mockStorage['hex-crawl-maker-exploration'] = '{"explored": []}';
      mockStorage['hex-crawl-maker-ui-preferences'] = '{"zoom": 1}';
    });

    it('should clear all stored data', () => {
      clearAllStoredData();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hex-crawl-maker-maps');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hex-crawl-maker-current-map-id');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hex-crawl-maker-exploration');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hex-crawl-maker-ui-preferences');
    });

    it('should export all data', () => {
      const result = exportAllData();

      expect(result).toBeTruthy();
      const parsed = JSON.parse(result!);
      expect(parsed.maps).toBe('{"test": "data"}');
      expect(parsed.currentMapId).toBe('test-id');
      expect(parsed.exploration).toBe('{"explored": []}');
      expect(parsed.uiPreferences).toBe('{"zoom": 1}');
      expect(parsed.exportDate).toBeTruthy();
    });

    it('should import all data', () => {
      const importData = {
        maps: '{"imported": "maps"}',
        currentMapId: 'imported-id',
        exploration: '{"imported": "exploration"}',
        uiPreferences: '{"imported": "ui"}',
        exportDate: '2023-01-01T00:00:00.000Z',
      };

      const result = importAllData(JSON.stringify(importData));

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hex-crawl-maker-maps', '{"imported": "maps"}');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hex-crawl-maker-current-map-id', 'imported-id');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hex-crawl-maker-exploration', '{"imported": "exploration"}');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hex-crawl-maker-ui-preferences', '{"imported": "ui"}');
    });

    it('should handle import errors gracefully', () => {
      const result = importAllData('invalid json');

      expect(result).toBe(false);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage unavailable', () => {
      // Mock localStorage as unavailable
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
      });

      const result = loadMapsFromStorage();
      expect(result).toEqual({});

      const explorationResult = loadExplorationState();
      expect(explorationResult.exploredHexes.size).toBe(0);

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
    });

    it('should handle localStorage quota exceeded', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw error
      expect(() => {
        const middleware = localStorageMiddleware(store)(next);
        middleware({ type: 'map/createNewMap', payload: {} });
      }).not.toThrow();
    });
  });
});