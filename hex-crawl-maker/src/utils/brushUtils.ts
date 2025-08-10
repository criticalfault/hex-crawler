/**
 * Utility functions for brush calculations and patterns
 */

import type { HexCoordinate } from '../types/hex';
import type { BrushSize, BrushShape } from '../store/slices/uiSlice';
import { hexDistance } from './hexCoordinates';

/**
 * Get all hexes within a brush pattern centered on the given coordinate
 */
export function getBrushHexes(
  center: HexCoordinate,
  size: BrushSize,
  shape: BrushShape
): HexCoordinate[] {
  const hexes: HexCoordinate[] = [];
  const radius = Math.floor(size / 2);

  // For size 1, just return the center hex
  if (size === 1) {
    return [center];
  }

  // Generate all hexes in a square area around the center
  for (let dq = -radius; dq <= radius; dq++) {
    for (let dr = -radius; dr <= radius; dr++) {
      const hex: HexCoordinate = {
        q: center.q + dq,
        r: center.r + dr
      };

      // Apply shape filtering
      if (isHexInBrushShape(hex, center, radius, shape)) {
        hexes.push(hex);
      }
    }
  }

  return hexes;
}

/**
 * Check if a hex coordinate is within the specified brush shape
 */
function isHexInBrushShape(
  hex: HexCoordinate,
  center: HexCoordinate,
  radius: number,
  shape: BrushShape
): boolean {
  const distance = hexDistance(hex, center);

  switch (shape) {
    case 'circle':
      return distance <= radius;
    
    case 'square':
      // Square pattern - include all hexes within a square bounding box
      const dq = Math.abs(hex.q - center.q);
      const dr = Math.abs(hex.r - center.r);
      return dq <= radius && dr <= radius;
    
    case 'diamond':
      // Diamond pattern - use Manhattan distance in axial coordinates
      const manhattanDistance = Math.abs(hex.q - center.q) + Math.abs(hex.r - center.r);
      return manhattanDistance <= radius;
    
    default:
      return distance <= radius;
  }
}

/**
 * Get the visual representation of brush sizes for UI display
 */
export function getBrushSizeLabel(size: BrushSize): string {
  switch (size) {
    case 1:
      return '1×1';
    case 3:
      return '3×3';
    case 5:
      return '5×5';
    case 7:
      return '7×7';
    default:
      return `${size}×${size}`;
  }
}

/**
 * Get the visual representation of brush shapes for UI display
 */
export function getBrushShapeLabel(shape: BrushShape): string {
  switch (shape) {
    case 'circle':
      return '●';
    case 'square':
      return '■';
    case 'diamond':
      return '◆';
    default:
      return '●';
  }
}

/**
 * Get all available brush sizes
 */
export const BRUSH_SIZES: BrushSize[] = [1, 3, 5, 7];

/**
 * Get all available brush shapes
 */
export const BRUSH_SHAPES: BrushShape[] = ['circle', 'square', 'diamond'];