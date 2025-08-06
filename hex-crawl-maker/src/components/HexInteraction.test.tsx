/**
 * Integration test for hex cell interaction functionality
 */

import { describe, it, expect } from 'vitest';
import { hexCellUtils } from './HexCell';
import type { HexCell, GridAppearance } from '../types';

const mockAppearance: GridAppearance = {
  hexSize: 30,
  borderColor: '#333333',
  backgroundColor: '#f0f0f0',
  unexploredColor: '#cccccc',
  textSize: 12,
};

describe('Hex Cell Interaction', () => {
  describe('Visual State Management', () => {
    it('should provide correct fill color for different states', () => {
      const hexCell: HexCell = {
        coordinate: { q: 0, r: 0 },
        terrain: 'mountains',
        isExplored: true,
        isVisible: true,
      };

      // Normal state
      const normalColor = hexCellUtils.getHexFillColor(
        hexCell, false, false, mockAppearance, 'gm'
      );
      expect(normalColor).toBe(mockAppearance.backgroundColor);

      // Hovered state
      const hoveredColor = hexCellUtils.getHexFillColor(
        hexCell, true, false, mockAppearance, 'gm'
      );
      expect(hoveredColor).toBe('#e6f3ff');

      // Selected state (takes priority over hover)
      const selectedColor = hexCellUtils.getHexFillColor(
        hexCell, true, true, mockAppearance, 'gm'
      );
      expect(selectedColor).toBe('#d4edda');
    });

    it('should provide correct stroke properties for interaction states', () => {
      // Normal state
      expect(hexCellUtils.getHexStrokeColor(false, false, mockAppearance))
        .toBe(mockAppearance.borderColor);
      expect(hexCellUtils.getHexStrokeWidth(false, false)).toBe(1);

      // Hovered state
      expect(hexCellUtils.getHexStrokeColor(true, false, mockAppearance))
        .toBe('#4a90e2');
      expect(hexCellUtils.getHexStrokeWidth(true, false)).toBe(2);

      // Selected state
      expect(hexCellUtils.getHexStrokeColor(false, true, mockAppearance))
        .toBe('#28a745');
      expect(hexCellUtils.getHexStrokeWidth(false, true)).toBe(3);
    });
  });

  describe('Visibility Logic', () => {
    it('should handle GM mode visibility correctly', () => {
      const hexCell: HexCell = {
        coordinate: { q: 0, r: 0 },
        isExplored: false,
        isVisible: false,
      };

      // GM should see everything
      expect(hexCellUtils.shouldShowHex(hexCell, 'gm', 'permanent')).toBe(true);
      expect(hexCellUtils.shouldShowHex(hexCell, 'gm', 'lineOfSight')).toBe(true);
      expect(hexCellUtils.shouldShowHex(null, 'gm', 'permanent')).toBe(true);
    });

    it('should handle player mode visibility with different reveal modes', () => {
      const exploredHex: HexCell = {
        coordinate: { q: 0, r: 0 },
        isExplored: true,
        isVisible: false,
      };

      const visibleHex: HexCell = {
        coordinate: { q: 1, r: 0 },
        isExplored: false,
        isVisible: true,
      };

      // Permanent reveal mode
      expect(hexCellUtils.shouldShowHex(exploredHex, 'player', 'permanent')).toBe(true);
      expect(hexCellUtils.shouldShowHex(visibleHex, 'player', 'permanent')).toBe(false);

      // Line of sight mode
      expect(hexCellUtils.shouldShowHex(exploredHex, 'player', 'lineOfSight')).toBe(false);
      expect(hexCellUtils.shouldShowHex(visibleHex, 'player', 'lineOfSight')).toBe(true);
    });
  });

  describe('Content-based Styling', () => {
    it('should handle hexes with different content types', () => {
      const terrainHex: HexCell = {
        coordinate: { q: 0, r: 0 },
        terrain: 'mountains',
        isExplored: true,
        isVisible: true,
      };

      const landmarkHex: HexCell = {
        coordinate: { q: 1, r: 0 },
        landmark: 'tower',
        isExplored: true,
        isVisible: true,
      };

      const emptyHex: HexCell = {
        coordinate: { q: 2, r: 0 },
        isExplored: true,
        isVisible: true,
      };

      // All content hexes should use background color in normal state
      expect(hexCellUtils.getHexFillColor(terrainHex, false, false, mockAppearance, 'gm'))
        .toBe(mockAppearance.backgroundColor);
      
      expect(hexCellUtils.getHexFillColor(landmarkHex, false, false, mockAppearance, 'gm'))
        .toBe(mockAppearance.backgroundColor);
      
      expect(hexCellUtils.getHexFillColor(emptyHex, false, false, mockAppearance, 'gm'))
        .toBe(mockAppearance.backgroundColor);
    });

    it('should handle unexplored hexes in player mode', () => {
      const unexploredHex: HexCell = {
        coordinate: { q: 0, r: 0 },
        terrain: 'mountains',
        isExplored: false,
        isVisible: false,
      };

      const color = hexCellUtils.getHexFillColor(
        unexploredHex, false, false, mockAppearance, 'player'
      );
      expect(color).toBe(mockAppearance.unexploredColor);
    });
  });
});