/**
 * Simple test for coordinate display functionality
 */

import { describe, it, expect } from 'vitest';
import { hexToKey, keyToHex } from '../utils/hexCoordinates';
import type { HexCoordinate } from '../types';

describe('Coordinate Display', () => {
  it('should format hex coordinates correctly for display', () => {
    const testCases: HexCoordinate[] = [
      { q: 0, r: 0 },
      { q: 1, r: -1 },
      { q: -2, r: 3 },
      { q: 5, r: -2 }
    ];

    testCases.forEach(hex => {
      const key = hexToKey(hex);
      const expectedKey = `${hex.q},${hex.r}`;
      expect(key).toBe(expectedKey);
      
      // Test round-trip conversion
      const convertedHex = keyToHex(key);
      expect(convertedHex.q).toBe(hex.q);
      expect(convertedHex.r).toBe(hex.r);
    });
  });

  it('should handle coordinate display formatting', () => {
    const hex: HexCoordinate = { q: 3, r: -2 };
    const displayString = `${hex.q},${hex.r}`;
    expect(displayString).toBe('3,-2');
  });
});