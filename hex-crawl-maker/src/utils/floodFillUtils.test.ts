/**
 * Tests for flood fill utility functions
 */

import { floodFillHexes, getFloodFillPreview, applyFloodFill } from './floodFillUtils';
import type { HexCoordinate, HexCell } from '../types/hex';

// Helper function to create a hex cell
const createHexCell = (
  coordinate: HexCoordinate,
  terrain?: string,
  landmark?: string
): HexCell => ({
  coordinate,
  terrain: terrain as any,
  landmark: landmark as any,
  isExplored: false,
  isVisible: false,
});

// Helper function to create a map of cells
const createCellMap = (cells: HexCell[]): Map<string, HexCell> => {
  const map = new Map<string, HexCell>();
  cells.forEach(cell => {
    const key = `${cell.coordinate.q},${cell.coordinate.r}`;
    map.set(key, cell);
  });
  return map;
};

describe('floodFillUtils', () => {
  describe('floodFillHexes', () => {
    it('finds connected hexes of the same terrain type', () => {
      const cells = createCellMap([
        createHexCell({ q: 0, r: 0 }, 'plains'),
        createHexCell({ q: 1, r: 0 }, 'plains'),
        createHexCell({ q: 0, r: 1 }, 'plains'),
        createHexCell({ q: 1, r: -1 }, 'mountains'),
        createHexCell({ q: -1, r: 1 }, 'water'),
      ]);

      const result = floodFillHexes({ q: 0, r: 0 }, cells, 'plains');
      
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ q: 0, r: 0 });
      expect(result).toContainEqual({ q: 1, r: 0 });
      expect(result).toContainEqual({ q: 0, r: 1 });
    });

    it('finds connected empty hexes when no terrain is specified', () => {
      const cells = createCellMap([
        createHexCell({ q: 0, r: 0 }), // empty
        createHexCell({ q: 1, r: 0 }), // empty
        createHexCell({ q: 0, r: 1 }, 'plains'),
        createHexCell({ q: 1, r: -1 }), // empty
      ]);

      const result = floodFillHexes({ q: 0, r: 0 }, cells);
      
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ q: 0, r: 0 });
      expect(result).toContainEqual({ q: 1, r: 0 });
      expect(result).toContainEqual({ q: 1, r: -1 });
    });

    it('stops at terrain boundaries', () => {
      const cells = createCellMap([
        createHexCell({ q: 0, r: 0 }, 'plains'),
        createHexCell({ q: 1, r: 0 }, 'plains'),
        createHexCell({ q: 2, r: 0 }, 'mountains'), // boundary
        createHexCell({ q: 3, r: 0 }, 'plains'), // isolated
      ]);

      const result = floodFillHexes({ q: 0, r: 0 }, cells, 'plains');
      
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ q: 0, r: 0 });
      expect(result).toContainEqual({ q: 1, r: 0 });
      expect(result).not.toContainEqual({ q: 3, r: 0 }); // isolated by mountains
    });

    it('respects max hexes limit', () => {
      const cells = createCellMap([
        createHexCell({ q: 0, r: 0 }, 'plains'),
        createHexCell({ q: 1, r: 0 }, 'plains'),
        createHexCell({ q: 0, r: 1 }, 'plains'),
        createHexCell({ q: -1, r: 0 }, 'plains'),
        createHexCell({ q: 0, r: -1 }, 'plains'),
      ]);

      const result = floodFillHexes({ q: 0, r: 0 }, cells, 'plains', undefined, 3);
      
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('returns empty array when starting hex has no matching terrain', () => {
      const cells = createCellMap([
        createHexCell({ q: 0, r: 0 }, 'mountains'),
        createHexCell({ q: 1, r: 0 }, 'plains'),
      ]);

      const result = floodFillHexes({ q: 0, r: 0 }, cells, 'plains');
      
      expect(result).toHaveLength(0);
    });

    it('handles hexes not in the map', () => {
      const cells = createCellMap([
        createHexCell({ q: 0, r: 0 }, 'plains'),
      ]);

      // Start from a hex that doesn't exist in the map
      const result = floodFillHexes({ q: 5, r: 5 }, cells, 'plains');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('getFloodFillPreview', () => {
    it('returns preview with correct count and large operation flag', () => {
      const cells = createCellMap([
        createHexCell({ q: 0, r: 0 }, 'plains'),
        createHexCell({ q: 1, r: 0 }, 'plains'),
        createHexCell({ q: 0, r: 1 }, 'plains'),
      ]);

      const result = getFloodFillPreview({ q: 0, r: 0 }, cells, 'plains');
      
      expect(result.count).toBe(3);
      expect(result.hexes).toHaveLength(3);
      expect(result.isLargeOperation).toBe(false);
    });

    it('identifies large operations correctly', () => {
      // Create a large connected area
      const cells = createCellMap(
        Array.from({ length: 25 }, (_, i) => 
          createHexCell({ q: i, r: 0 }, 'plains')
        )
      );

      const result = getFloodFillPreview({ q: 0, r: 0 }, cells, 'plains');
      
      expect(result.count).toBe(25);
      expect(result.isLargeOperation).toBe(true);
    });
  });

  describe('applyFloodFill', () => {
    it('updates hexes with new terrain', () => {
      const originalCells = createCellMap([
        createHexCell({ q: 0, r: 0 }, 'plains'),
        createHexCell({ q: 1, r: 0 }, 'plains'),
        createHexCell({ q: 0, r: 1 }, 'mountains'),
      ]);

      const hexesToUpdate = [{ q: 0, r: 0 }, { q: 1, r: 0 }];
      const result = applyFloodFill(hexesToUpdate, originalCells, 'water');
      
      const updatedHex1 = result.get('0,0');
      const updatedHex2 = result.get('1,0');
      const unchangedHex = result.get('0,1');
      
      expect(updatedHex1?.terrain).toBe('water');
      expect(updatedHex2?.terrain).toBe('water');
      expect(unchangedHex?.terrain).toBe('mountains'); // unchanged
    });

    it('clears existing content when clearExisting is true', () => {
      const originalCells = createCellMap([
        {
          ...createHexCell({ q: 0, r: 0 }, 'plains'),
          name: 'Test Hex',
          description: 'A test hex',
          gmNotes: 'Secret notes',
        },
      ]);

      const hexesToUpdate = [{ q: 0, r: 0 }];
      const result = applyFloodFill(hexesToUpdate, originalCells, undefined, undefined, true);
      
      const updatedHex = result.get('0,0');
      
      expect(updatedHex?.terrain).toBeUndefined();
      expect(updatedHex?.name).toBeUndefined();
      expect(updatedHex?.description).toBeUndefined();
      expect(updatedHex?.gmNotes).toBeUndefined();
    });

    it('preserves exploration state', () => {
      const originalCells = createCellMap([
        {
          ...createHexCell({ q: 0, r: 0 }, 'plains'),
          isExplored: true,
          isVisible: true,
        },
      ]);

      const hexesToUpdate = [{ q: 0, r: 0 }];
      const result = applyFloodFill(hexesToUpdate, originalCells, 'water');
      
      const updatedHex = result.get('0,0');
      
      expect(updatedHex?.isExplored).toBe(true);
      expect(updatedHex?.isVisible).toBe(true);
    });

    it('creates new hex cells for coordinates not in original map', () => {
      const originalCells = createCellMap([]);
      
      const hexesToUpdate = [{ q: 0, r: 0 }];
      const result = applyFloodFill(hexesToUpdate, originalCells, 'plains');
      
      const newHex = result.get('0,0');
      
      expect(newHex).toBeDefined();
      expect(newHex?.terrain).toBe('plains');
      expect(newHex?.coordinate).toEqual({ q: 0, r: 0 });
      expect(newHex?.isExplored).toBe(false);
      expect(newHex?.isVisible).toBe(false);
    });
  });
});