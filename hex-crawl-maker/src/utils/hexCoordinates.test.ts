/**
 * Unit tests for hexagonal coordinate system utilities
 */

import { describe, it, expect } from 'vitest';
import {
  hexToPixel,
  pixelToHex,
  hexRound,
  hexDistance,
  hexNeighbors,
  hexNeighbor,
  hexesInRange,
  hexToKey,
  keyToHex,
  hexEquals
} from './hexCoordinates';
import type { HexCoordinate } from '../types/hex';

describe('hexCoordinates', () => {
  describe('hexToPixel', () => {
    it('should convert origin hex to pixel coordinates', () => {
      const hex: HexCoordinate = { q: 0, r: 0 };
      const pixel = hexToPixel(hex);
      
      expect(pixel.x).toBeCloseTo(0, 5);
      expect(pixel.y).toBeCloseTo(0, 5);
    });

    it('should convert hex coordinates to correct pixel positions', () => {
      const hex: HexCoordinate = { q: 1, r: 0 };
      const pixel = hexToPixel(hex, 30);
      
      // For flat-top hexagons, moving right (q+1) should move by sqrt(3) * hexSize
      expect(pixel.x).toBeCloseTo(30 * Math.sqrt(3), 5);
      expect(pixel.y).toBeCloseTo(0, 5);
    });

    it('should handle custom hex size', () => {
      const hex: HexCoordinate = { q: 1, r: 1 };
      const pixel = hexToPixel(hex, 20);
      
      const expectedX = 20 * (Math.sqrt(3) * 1 + Math.sqrt(3) / 2 * 1);
      const expectedY = 20 * (3 / 2 * 1);
      
      expect(pixel.x).toBeCloseTo(expectedX, 5);
      expect(pixel.y).toBeCloseTo(expectedY, 5);
    });
  });

  describe('pixelToHex', () => {
    it('should convert pixel coordinates back to hex coordinates', () => {
      const originalHex: HexCoordinate = { q: 2, r: -1 };
      const pixel = hexToPixel(originalHex);
      const convertedHex = pixelToHex(pixel);
      
      expect(convertedHex.q).toBe(originalHex.q);
      expect(convertedHex.r).toBe(originalHex.r);
    });

    it('should handle origin pixel coordinates', () => {
      const pixel = { x: 0, y: 0 };
      const hex = pixelToHex(pixel);
      
      expect(hex.q).toBe(0);
      expect(hex.r).toBe(0);
    });
  });

  describe('hexRound', () => {
    it('should round fractional coordinates to nearest hex', () => {
      const fractionalHex: HexCoordinate = { q: 1.2, r: -0.8 };
      const rounded = hexRound(fractionalHex);
      
      expect(rounded.q).toBe(1);
      expect(rounded.r).toBe(-1);
    });

    it('should not change integer coordinates', () => {
      const integerHex: HexCoordinate = { q: 3, r: -2 };
      const rounded = hexRound(integerHex);
      
      expect(rounded.q).toBe(3);
      expect(rounded.r).toBe(-2);
    });
  });

  describe('hexDistance', () => {
    it('should calculate distance between adjacent hexes', () => {
      const hex1: HexCoordinate = { q: 0, r: 0 };
      const hex2: HexCoordinate = { q: 1, r: 0 };
      
      expect(hexDistance(hex1, hex2)).toBe(1);
    });

    it('should calculate distance between same hex', () => {
      const hex: HexCoordinate = { q: 2, r: -1 };
      
      expect(hexDistance(hex, hex)).toBe(0);
    });

    it('should calculate distance between distant hexes', () => {
      const hex1: HexCoordinate = { q: 0, r: 0 };
      const hex2: HexCoordinate = { q: 3, r: -2 };
      
      expect(hexDistance(hex1, hex2)).toBe(3);
    });

    it('should be symmetric', () => {
      const hex1: HexCoordinate = { q: 1, r: 2 };
      const hex2: HexCoordinate = { q: -2, r: 1 };
      
      expect(hexDistance(hex1, hex2)).toBe(hexDistance(hex2, hex1));
    });
  });

  describe('hexNeighbors', () => {
    it('should return 6 neighbors for any hex', () => {
      const hex: HexCoordinate = { q: 0, r: 0 };
      const neighbors = hexNeighbors(hex);
      
      expect(neighbors).toHaveLength(6);
    });

    it('should return correct neighbors for origin', () => {
      const hex: HexCoordinate = { q: 0, r: 0 };
      const neighbors = hexNeighbors(hex);
      
      const expected = [
        { q: 1, r: 0 },   // right
        { q: 1, r: -1 },  // top-right
        { q: 0, r: -1 },  // top-left
        { q: -1, r: 0 },  // left
        { q: -1, r: 1 },  // bottom-left
        { q: 0, r: 1 }    // bottom-right
      ];
      
      expect(neighbors).toEqual(expected);
    });

    it('should have all neighbors at distance 1', () => {
      const hex: HexCoordinate = { q: 2, r: -1 };
      const neighbors = hexNeighbors(hex);
      
      neighbors.forEach(neighbor => {
        expect(hexDistance(hex, neighbor)).toBe(1);
      });
    });
  });

  describe('hexNeighbor', () => {
    it('should return correct neighbor by direction', () => {
      const hex: HexCoordinate = { q: 0, r: 0 };
      
      expect(hexNeighbor(hex, 0)).toEqual({ q: 1, r: 0 });   // right
      expect(hexNeighbor(hex, 1)).toEqual({ q: 1, r: -1 });  // top-right
      expect(hexNeighbor(hex, 2)).toEqual({ q: 0, r: -1 });  // top-left
      expect(hexNeighbor(hex, 3)).toEqual({ q: -1, r: 0 });  // left
      expect(hexNeighbor(hex, 4)).toEqual({ q: -1, r: 1 });  // bottom-left
      expect(hexNeighbor(hex, 5)).toEqual({ q: 0, r: 1 });   // bottom-right
    });

    it('should wrap direction indices', () => {
      const hex: HexCoordinate = { q: 0, r: 0 };
      
      expect(hexNeighbor(hex, 6)).toEqual(hexNeighbor(hex, 0));
      expect(hexNeighbor(hex, 7)).toEqual(hexNeighbor(hex, 1));
    });
  });

  describe('hexesInRange', () => {
    it('should return only center hex for range 0', () => {
      const center: HexCoordinate = { q: 1, r: 1 };
      const hexes = hexesInRange(center, 0);
      
      expect(hexes).toHaveLength(1);
      expect(hexes[0]).toEqual(center);
    });

    it('should return 7 hexes for range 1 (center + 6 neighbors)', () => {
      const center: HexCoordinate = { q: 0, r: 0 };
      const hexes = hexesInRange(center, 1);
      
      expect(hexes).toHaveLength(7);
      expect(hexes).toContainEqual(center);
    });

    it('should return 19 hexes for range 2', () => {
      const center: HexCoordinate = { q: 0, r: 0 };
      const hexes = hexesInRange(center, 2);
      
      expect(hexes).toHaveLength(19);
    });

    it('should include all hexes within specified distance', () => {
      const center: HexCoordinate = { q: 0, r: 0 };
      const range = 2;
      const hexes = hexesInRange(center, range);
      
      hexes.forEach(hex => {
        expect(hexDistance(center, hex)).toBeLessThanOrEqual(range);
      });
    });
  });

  describe('hexToKey and keyToHex', () => {
    it('should convert hex to string key and back', () => {
      const hex: HexCoordinate = { q: 3, r: -2 };
      const key = hexToKey(hex);
      const convertedHex = keyToHex(key);
      
      expect(key).toBe('3,-2');
      expect(convertedHex).toEqual(hex);
    });

    it('should handle negative coordinates', () => {
      const hex: HexCoordinate = { q: -1, r: -3 };
      const key = hexToKey(hex);
      const convertedHex = keyToHex(key);
      
      expect(key).toBe('-1,-3');
      expect(convertedHex).toEqual(hex);
    });
  });

  describe('hexEquals', () => {
    it('should return true for identical coordinates', () => {
      const hex1: HexCoordinate = { q: 2, r: -1 };
      const hex2: HexCoordinate = { q: 2, r: -1 };
      
      expect(hexEquals(hex1, hex2)).toBe(true);
    });

    it('should return false for different coordinates', () => {
      const hex1: HexCoordinate = { q: 2, r: -1 };
      const hex2: HexCoordinate = { q: 2, r: 0 };
      
      expect(hexEquals(hex1, hex2)).toBe(false);
    });

    it('should return true for same object reference', () => {
      const hex: HexCoordinate = { q: 1, r: 1 };
      
      expect(hexEquals(hex, hex)).toBe(true);
    });
  });
});