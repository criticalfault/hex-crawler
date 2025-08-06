/**
 * Hexagonal coordinate system utilities using axial coordinates
 * Based on the comprehensive guide at: https://www.redblobgames.com/grids/hexagons/
 */

import type { HexCoordinate, PixelCoordinate } from '../types/hex';

// Constants for hexagon geometry
export const HEX_SIZE_DEFAULT = 30;
export const HEX_WIDTH_RATIO = Math.sqrt(3);
export const HEX_HEIGHT_RATIO = 2;

/**
 * Convert axial hex coordinates to pixel coordinates
 * Uses flat-top hexagon orientation
 */
export function hexToPixel(hex: HexCoordinate, hexSize: number = HEX_SIZE_DEFAULT): PixelCoordinate {
  const x = hexSize * (HEX_WIDTH_RATIO * hex.q + HEX_WIDTH_RATIO / 2 * hex.r);
  const y = hexSize * (3 / 2 * hex.r);
  
  return { x, y };
}

/**
 * Convert pixel coordinates to axial hex coordinates
 * Uses flat-top hexagon orientation
 */
export function pixelToHex(pixel: PixelCoordinate, hexSize: number = HEX_SIZE_DEFAULT): HexCoordinate {
  const q = (HEX_WIDTH_RATIO / 3 * pixel.x - 1 / 3 * pixel.y) / hexSize;
  const r = (2 / 3 * pixel.y) / hexSize;
  
  return hexRound({ q, r });
}

/**
 * Round fractional hex coordinates to the nearest hex
 */
export function hexRound(hex: HexCoordinate): HexCoordinate {
  const s = -hex.q - hex.r; // third coordinate for cube coordinates
  
  let rq = Math.round(hex.q);
  let rr = Math.round(hex.r);
  let rs = Math.round(s);
  
  const qDiff = Math.abs(rq - hex.q);
  const rDiff = Math.abs(rr - hex.r);
  const sDiff = Math.abs(rs - s);
  
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  
  return { q: rq, r: rr };
}

/**
 * Calculate the distance between two hex coordinates
 */
export function hexDistance(a: HexCoordinate, b: HexCoordinate): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

/**
 * Get all neighboring hex coordinates
 */
export function hexNeighbors(hex: HexCoordinate): HexCoordinate[] {
  const directions: HexCoordinate[] = [
    { q: 1, r: 0 },   // right
    { q: 1, r: -1 },  // top-right
    { q: 0, r: -1 },  // top-left
    { q: -1, r: 0 },  // left
    { q: -1, r: 1 },  // bottom-left
    { q: 0, r: 1 }    // bottom-right
  ];
  
  return directions.map(dir => ({
    q: hex.q + dir.q,
    r: hex.r + dir.r
  }));
}

/**
 * Get a specific neighbor by direction index (0-5)
 */
export function hexNeighbor(hex: HexCoordinate, direction: number): HexCoordinate {
  const directions: HexCoordinate[] = [
    { q: 1, r: 0 },   // right
    { q: 1, r: -1 },  // top-right
    { q: 0, r: -1 },  // top-left
    { q: -1, r: 0 },  // left
    { q: -1, r: 1 },  // bottom-left
    { q: 0, r: 1 }    // bottom-right
  ];
  
  const dir = directions[direction % 6];
  return {
    q: hex.q + dir.q,
    r: hex.r + dir.r
  };
}

/**
 * Get all hexes within a certain distance (sight range)
 */
export function hexesInRange(center: HexCoordinate, range: number): HexCoordinate[] {
  const results: HexCoordinate[] = [];
  
  for (let q = -range; q <= range; q++) {
    const r1 = Math.max(-range, -q - range);
    const r2 = Math.min(range, -q + range);
    
    for (let r = r1; r <= r2; r++) {
      results.push({
        q: center.q + q,
        r: center.r + r
      });
    }
  }
  
  return results;
}

/**
 * Convert hex coordinate to string key for Map storage
 */
export function hexToKey(hex: HexCoordinate): string {
  return `${hex.q},${hex.r}`;
}

/**
 * Convert string key back to hex coordinate
 */
export function keyToHex(key: string): HexCoordinate {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

/**
 * Check if two hex coordinates are equal
 */
export function hexEquals(a: HexCoordinate, b: HexCoordinate): boolean {
  return a.q === b.q && a.r === b.r;
}