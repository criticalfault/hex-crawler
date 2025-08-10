/**
 * Tests for brush utility functions
 */

import { describe, it, expect } from 'vitest';
import { getBrushHexes, getBrushSizeLabel, getBrushShapeLabel } from './brushUtils';
import type { HexCoordinate } from '../types/hex';

describe('brushUtils', () => {
  describe('getBrushHexes', () => {
    const center: HexCoordinate = { q: 0, r: 0 };

    it('should return only center hex for size 1', () => {
      const result = getBrushHexes(center, 1, 'circle');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(center);
    });

    it('should return correct number of hexes for size 3 circle', () => {
      const result = getBrushHexes(center, 3, 'circle');
      expect(result.length).toBeGreaterThan(1);
      expect(result.length).toBeLessThanOrEqual(7); // Maximum for radius 1 circle
    });

    it('should return different patterns for different shapes', () => {
      const circleResult = getBrushHexes(center, 3, 'circle');
      const squareResult = getBrushHexes(center, 3, 'square');
      const diamondResult = getBrushHexes(center, 3, 'diamond');

      // All should include the center
      expect(circleResult).toContainEqual(center);
      expect(squareResult).toContainEqual(center);
      expect(diamondResult).toContainEqual(center);

      // Different shapes should produce different results
      expect(circleResult.length).not.toBe(squareResult.length);
    });

    it('should handle larger brush sizes', () => {
      const size5Result = getBrushHexes(center, 5, 'circle');
      const size7Result = getBrushHexes(center, 7, 'circle');

      expect(size7Result.length).toBeGreaterThan(size5Result.length);
    });
  });

  describe('getBrushSizeLabel', () => {
    it('should return correct labels for brush sizes', () => {
      expect(getBrushSizeLabel(1)).toBe('1×1');
      expect(getBrushSizeLabel(3)).toBe('3×3');
      expect(getBrushSizeLabel(5)).toBe('5×5');
      expect(getBrushSizeLabel(7)).toBe('7×7');
    });
  });

  describe('getBrushShapeLabel', () => {
    it('should return correct symbols for brush shapes', () => {
      expect(getBrushShapeLabel('circle')).toBe('●');
      expect(getBrushShapeLabel('square')).toBe('■');
      expect(getBrushShapeLabel('diamond')).toBe('◆');
    });
  });
});