/**
 * Copy/paste utilities tests
 */

import {
  getHexesInRectangularSelection,
  createPattern,
  calculatePastePreviewHexes,
  savePatternToStorage,
  loadPatternFromStorage,
  getSavedPatternNames,
  deletePatternFromStorage,
} from './copyPasteUtils';
import type { HexCoordinate, HexCell } from '../types';

describe('copyPasteUtils', () => {
  describe('getHexesInRectangularSelection', () => {
    it('returns hexes in rectangular selection', () => {
      const start: HexCoordinate = { q: 0, r: 0 };
      const end: HexCoordinate = { q: 2, r: 1 };
      
      const result = getHexesInRectangularSelection(start, end);
      
      expect(result).toHaveLength(6); // 3x2 rectangle
      expect(result).toContainEqual({ q: 0, r: 0 });
      expect(result).toContainEqual({ q: 1, r: 0 });
      expect(result).toContainEqual({ q: 2, r: 0 });
      expect(result).toContainEqual({ q: 0, r: 1 });
      expect(result).toContainEqual({ q: 1, r: 1 });
      expect(result).toContainEqual({ q: 2, r: 1 });
    });

    it('handles reversed selection coordinates', () => {
      const start: HexCoordinate = { q: 2, r: 1 };
      const end: HexCoordinate = { q: 0, r: 0 };
      
      const result = getHexesInRectangularSelection(start, end);
      
      expect(result).toHaveLength(6); // Same 3x2 rectangle
      expect(result).toContainEqual({ q: 0, r: 0 });
      expect(result).toContainEqual({ q: 2, r: 1 });
    });
  });

  describe('createPattern', () => {
    it('creates pattern from selected hexes', () => {
      const hexes: HexCoordinate[] = [
        { q: 1, r: 1 },
        { q: 2, r: 1 },
        { q: 1, r: 2 },
      ];
      
      const cells = new Map<string, HexCell>([
        ['1,1', {
          coordinate: { q: 1, r: 1 },
          terrain: 'plains',
          isExplored: false,
          isVisible: false,
        }],
        ['2,1', {
          coordinate: { q: 2, r: 1 },
          terrain: 'mountains',
          name: 'Test Mountain',
          isExplored: false,
          isVisible: false,
        }],
        ['1,2', {
          coordinate: { q: 1, r: 2 },
          landmark: 'tower',
          description: 'Ancient tower',
          isExplored: false,
          isVisible: false,
        }],
      ]);
      
      const origin: HexCoordinate = { q: 1, r: 1 };
      
      const result = createPattern(hexes, cells, origin);
      
      expect(result.pattern.size).toBe(3);
      expect(result.dimensions).toEqual({ width: 2, height: 2 });
      
      // Check relative coordinates
      expect(result.pattern.get('0,0')).toEqual({ terrain: 'plains' });
      expect(result.pattern.get('1,0')).toEqual({ terrain: 'mountains', name: 'Test Mountain' });
      expect(result.pattern.get('0,1')).toEqual({ landmark: 'tower', description: 'Ancient tower' });
    });

    it('filters out empty hexes', () => {
      const hexes: HexCoordinate[] = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
      ];
      
      const cells = new Map<string, HexCell>([
        ['0,0', {
          coordinate: { q: 0, r: 0 },
          terrain: 'plains',
          isExplored: false,
          isVisible: false,
        }],
        // 1,0 has no content
      ]);
      
      const origin: HexCoordinate = { q: 0, r: 0 };
      
      const result = createPattern(hexes, cells, origin);
      
      expect(result.pattern.size).toBe(1);
      expect(result.pattern.get('0,0')).toEqual({ terrain: 'plains' });
    });
  });

  describe('calculatePastePreviewHexes', () => {
    it('calculates preview hexes for paste operation', () => {
      const targetPosition: HexCoordinate = { q: 5, r: 5 };
      const pattern = new Map([
        ['0,0', { terrain: 'plains' }],
        ['1,0', { terrain: 'mountains' }],
        ['0,1', { landmark: 'tower' }],
      ]);
      const mapDimensions = { width: 10, height: 10 };
      
      const result = calculatePastePreviewHexes(targetPosition, pattern, mapDimensions);
      
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ q: 5, r: 5 });
      expect(result).toContainEqual({ q: 6, r: 5 });
      expect(result).toContainEqual({ q: 5, r: 6 });
    });

    it('filters out hexes outside map bounds', () => {
      // Test with coordinates that should be within bounds
      const targetPosition: HexCoordinate = { q: 2, r: 2 };
      const pattern = new Map([
        ['0,0', { terrain: 'plains' }],
        ['1,0', { terrain: 'mountains' }],
        ['0,1', { landmark: 'tower' }],
      ]);
      const mapDimensions = { width: 10, height: 10 };
      
      const result = calculatePastePreviewHexes(targetPosition, pattern, mapDimensions);
      
      // All should be within bounds for this test
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ q: 2, r: 2 });
      expect(result).toContainEqual({ q: 3, r: 2 });
      expect(result).toContainEqual({ q: 2, r: 3 });
    });

    it('properly filters out hexes outside map bounds', () => {
      // Test with coordinates that will go out of bounds
      // Using coordinates where some will be out of bounds
      const targetPosition: HexCoordinate = { q: 0, r: 4 };
      const pattern = new Map([
        ['0,0', { terrain: 'plains' }], // This should be within bounds
        ['5,0', { terrain: 'mountains' }], // This should be out of bounds
        ['0,2', { landmark: 'tower' }], // This should be out of bounds (r=6)
      ]);
      const mapDimensions = { width: 10, height: 5 };
      
      const result = calculatePastePreviewHexes(targetPosition, pattern, mapDimensions);
      
      // Two hexes should be within bounds, one should be filtered out
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ q: 0, r: 4 });
      expect(result).toContainEqual({ q: 5, r: 4 });
      // The hex at (0, 6) should be filtered out because r=6 >= height=5
    });
  });

  describe('localStorage operations', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    it('saves and loads patterns from storage', () => {
      const pattern = new Map([
        ['0,0', { terrain: 'plains' }],
        ['1,0', { terrain: 'mountains' }],
      ]);
      const dimensions = { width: 2, height: 1 };
      const name = 'test-pattern';
      
      savePatternToStorage(name, pattern, dimensions);
      const loaded = loadPatternFromStorage(name);
      
      expect(loaded).not.toBeNull();
      expect(loaded!.pattern.size).toBe(2);
      expect(loaded!.dimensions).toEqual(dimensions);
      expect(loaded!.pattern.get('0,0')).toEqual({ terrain: 'plains' });
      expect(loaded!.pattern.get('1,0')).toEqual({ terrain: 'mountains' });
    });

    it('returns null for non-existent patterns', () => {
      const result = loadPatternFromStorage('non-existent');
      expect(result).toBeNull();
    });

    it('gets saved pattern names', () => {
      savePatternToStorage('pattern1', new Map([['0,0', { terrain: 'plains' }]]), { width: 1, height: 1 });
      savePatternToStorage('pattern2', new Map([['0,0', { terrain: 'mountains' }]]), { width: 1, height: 1 });
      
      const names = getSavedPatternNames();
      
      expect(names).toHaveLength(2);
      expect(names).toContain('pattern1');
      expect(names).toContain('pattern2');
    });

    it('deletes patterns from storage', () => {
      const name = 'pattern-to-delete';
      savePatternToStorage(name, new Map([['0,0', { terrain: 'plains' }]]), { width: 1, height: 1 });
      
      expect(getSavedPatternNames()).toContain(name);
      
      deletePatternFromStorage(name);
      
      expect(getSavedPatternNames()).not.toContain(name);
      expect(loadPatternFromStorage(name)).toBeNull();
    });
  });
});