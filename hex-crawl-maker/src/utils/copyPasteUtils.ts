/**
 * Utility functions for copy/paste operations
 */

import type { HexCoordinate, HexCell } from '../types';

/**
 * Calculate hexes within a rectangular selection
 */
export function getHexesInRectangularSelection(
  start: HexCoordinate,
  end: HexCoordinate
): HexCoordinate[] {
  const minQ = Math.min(start.q, end.q);
  const maxQ = Math.max(start.q, end.q);
  const minR = Math.min(start.r, end.r);
  const maxR = Math.max(start.r, end.r);

  const hexes: HexCoordinate[] = [];
  
  for (let q = minQ; q <= maxQ; q++) {
    for (let r = minR; r <= maxR; r++) {
      hexes.push({ q, r });
    }
  }
  
  return hexes;
}

/**
 * Convert absolute coordinates to relative coordinates based on selection origin
 */
export function getRelativeCoordinates(
  hexes: HexCoordinate[],
  origin: HexCoordinate
): Map<string, HexCoordinate> {
  const relativeMap = new Map<string, HexCoordinate>();
  
  for (const hex of hexes) {
    const relative: HexCoordinate = {
      q: hex.q - origin.q,
      r: hex.r - origin.r,
    };
    relativeMap.set(`${relative.q},${relative.r}`, relative);
  }
  
  return relativeMap;
}

/**
 * Create a pattern from selected hexes and their cell data
 */
export function createPattern(
  hexes: HexCoordinate[],
  cells: Map<string, HexCell>,
  origin: HexCoordinate
): {
  pattern: Map<string, { terrain?: string; landmark?: string; name?: string; description?: string; gmNotes?: string }>;
  dimensions: { width: number; height: number };
} {
  const pattern = new Map<string, { terrain?: string; landmark?: string; name?: string; description?: string; gmNotes?: string }>();
  
  let minQ = Infinity, maxQ = -Infinity;
  let minR = Infinity, maxR = -Infinity;
  
  for (const hex of hexes) {
    const relative: HexCoordinate = {
      q: hex.q - origin.q,
      r: hex.r - origin.r,
    };
    
    minQ = Math.min(minQ, relative.q);
    maxQ = Math.max(maxQ, relative.q);
    minR = Math.min(minR, relative.r);
    maxR = Math.max(maxR, relative.r);
    
    const cellKey = `${hex.q},${hex.r}`;
    const cell = cells.get(cellKey);
    
    if (cell && (cell.terrain || cell.landmark || cell.name || cell.description || cell.gmNotes)) {
      pattern.set(`${relative.q},${relative.r}`, {
        terrain: cell.terrain,
        landmark: cell.landmark,
        name: cell.name,
        description: cell.description,
        gmNotes: cell.gmNotes,
      });
    }
  }
  
  const dimensions = {
    width: maxQ - minQ + 1,
    height: maxR - minR + 1,
  };
  
  return { pattern, dimensions };
}

/**
 * Calculate preview hexes for paste operation
 */
export function calculatePastePreviewHexes(
  targetPosition: HexCoordinate,
  pattern: Map<string, { terrain?: string; landmark?: string; name?: string; description?: string; gmNotes?: string }>,
  mapDimensions: { width: number; height: number },
  rotation: number = 0,
  mirror?: 'horizontal' | 'vertical' | 'both'
): HexCoordinate[] {
  const previewHexes: HexCoordinate[] = [];
  
  for (const relativeKey of pattern.keys()) {
    const [relQ, relR] = relativeKey.split(',').map(Number);
    let finalQ = relQ;
    let finalR = relR;
    
    // Apply mirroring
    if (mirror === 'horizontal' || mirror === 'both') {
      finalQ = -finalQ;
    }
    if (mirror === 'vertical' || mirror === 'both') {
      finalR = -finalR;
    }
    
    // Apply rotation (60-degree increments for hex grid)
    const rotations = Math.floor(rotation / 60) % 6;
    for (let i = 0; i < rotations; i++) {
      const newQ = -finalR;
      const newR = finalQ + finalR;
      finalQ = newQ;
      finalR = newR;
    }
    
    const absoluteCoord: HexCoordinate = {
      q: targetPosition.q + finalQ,
      r: targetPosition.r + finalR,
    };
    
    // Check bounds using the same logic as HexGrid
    // Convert back to row/col for bounds checking
    const row = absoluteCoord.r;
    const col = absoluteCoord.q + Math.floor(row / 2);
    
    if (row >= 0 && row < mapDimensions.height && col >= 0 && col < mapDimensions.width) {
      previewHexes.push(absoluteCoord);
    }
  }
  
  return previewHexes;
}

/**
 * Save pattern to localStorage for persistence between sessions
 */
export function savePatternToStorage(
  name: string,
  pattern: Map<string, { terrain?: string; landmark?: string; name?: string; description?: string; gmNotes?: string }>,
  dimensions: { width: number; height: number }
): void {
  try {
    const savedPatterns = JSON.parse(localStorage.getItem('hexCrawlPatterns') || '{}');
    
    // Convert Map to object for JSON serialization
    const patternObj: { [key: string]: any } = {};
    for (const [key, value] of pattern.entries()) {
      patternObj[key] = value;
    }
    
    savedPatterns[name] = {
      pattern: patternObj,
      dimensions,
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('hexCrawlPatterns', JSON.stringify(savedPatterns));
  } catch (error) {
    console.error('Failed to save pattern to storage:', error);
  }
}

/**
 * Load pattern from localStorage
 */
export function loadPatternFromStorage(name: string): {
  pattern: Map<string, { terrain?: string; landmark?: string; name?: string; description?: string; gmNotes?: string }>;
  dimensions: { width: number; height: number };
} | null {
  try {
    const savedPatterns = JSON.parse(localStorage.getItem('hexCrawlPatterns') || '{}');
    const savedPattern = savedPatterns[name];
    
    if (!savedPattern) {
      return null;
    }
    
    // Convert object back to Map
    const pattern = new Map<string, { terrain?: string; landmark?: string; name?: string; description?: string; gmNotes?: string }>();
    for (const [key, value] of Object.entries(savedPattern.pattern)) {
      pattern.set(key, value as any);
    }
    
    return {
      pattern,
      dimensions: savedPattern.dimensions,
    };
  } catch (error) {
    console.error('Failed to load pattern from storage:', error);
    return null;
  }
}

/**
 * Get all saved pattern names
 */
export function getSavedPatternNames(): string[] {
  try {
    const savedPatterns = JSON.parse(localStorage.getItem('hexCrawlPatterns') || '{}');
    return Object.keys(savedPatterns);
  } catch (error) {
    console.error('Failed to get saved pattern names:', error);
    return [];
  }
}

/**
 * Delete a saved pattern
 */
export function deletePatternFromStorage(name: string): void {
  try {
    const savedPatterns = JSON.parse(localStorage.getItem('hexCrawlPatterns') || '{}');
    delete savedPatterns[name];
    localStorage.setItem('hexCrawlPatterns', JSON.stringify(savedPatterns));
  } catch (error) {
    console.error('Failed to delete pattern from storage:', error);
  }
}