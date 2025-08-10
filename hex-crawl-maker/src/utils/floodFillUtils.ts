/**
 * Utility functions for flood fill operations on hex grids
 */

import type { HexCoordinate, HexCell, TerrainType, LandmarkType } from '../types/hex';
import { hexNeighbors, hexToKey } from './hexCoordinates';

/**
 * Perform flood fill to find all connected hexes of the same terrain type
 */
export function floodFillHexes(
  startHex: HexCoordinate,
  cells: Map<string, HexCell>,
  targetTerrain?: TerrainType,
  targetLandmark?: LandmarkType,
  maxHexes: number = 1000
): HexCoordinate[] {
  const visited = new Set<string>();
  const result: HexCoordinate[] = [];
  const queue: HexCoordinate[] = [startHex];
  
  const startKey = hexToKey(startHex);
  const startCell = cells.get(startKey);
  
  // Determine what we're matching against
  const matchTerrain = targetTerrain ?? startCell?.terrain;
  const matchLandmark = targetLandmark ?? startCell?.landmark;
  
  // If we're looking for empty terrain/landmark, we need to be more restrictive
  // Only consider hexes that exist in the map or are direct neighbors of existing hexes
  const allExistingKeys = new Set(cells.keys());
  const isLookingForEmpty = !matchTerrain && !matchLandmark;
  
  while (queue.length > 0 && result.length < maxHexes) {
    const currentHex = queue.shift()!;
    const currentKey = hexToKey(currentHex);
    
    // Skip if already visited
    if (visited.has(currentKey)) {
      continue;
    }
    
    visited.add(currentKey);
    
    const currentCell = cells.get(currentKey);
    
    // For empty terrain searches, only consider hexes that exist in the map
    if (isLookingForEmpty && !allExistingKeys.has(currentKey)) {
      continue;
    }
    
    // Check if this hex matches our criteria
    const terrainMatches = matchTerrain 
      ? currentCell?.terrain === matchTerrain 
      : (!currentCell?.terrain);
    
    const landmarkMatches = matchLandmark 
      ? currentCell?.landmark === matchLandmark 
      : (!currentCell?.landmark);
    
    if (terrainMatches && landmarkMatches) {
      result.push(currentHex);
      
      // Add neighbors to queue
      const neighbors = hexNeighbors(currentHex);
      for (const neighbor of neighbors) {
        const neighborKey = hexToKey(neighbor);
        if (!visited.has(neighborKey)) {
          // For empty terrain searches, only add neighbors that exist in the map
          if (isLookingForEmpty) {
            if (allExistingKeys.has(neighborKey)) {
              queue.push(neighbor);
            }
          } else {
            queue.push(neighbor);
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * Get preview of hexes that would be affected by flood fill
 */
export function getFloodFillPreview(
  startHex: HexCoordinate,
  cells: Map<string, HexCell>,
  targetTerrain?: TerrainType,
  targetLandmark?: LandmarkType
): {
  hexes: HexCoordinate[];
  count: number;
  isLargeOperation: boolean;
} {
  const hexes = floodFillHexes(startHex, cells, targetTerrain, targetLandmark, 100);
  const count = hexes.length;
  const isLargeOperation = count > 20;
  
  return {
    hexes,
    count,
    isLargeOperation
  };
}

/**
 * Check if a hex coordinate is within map bounds
 */
export function isHexInBounds(
  hex: HexCoordinate,
  mapDimensions: { width: number; height: number }
): boolean {
  // Convert to offset coordinates for bounds checking
  const col = hex.q;
  const row = hex.r + Math.floor(hex.q / 2);
  
  return col >= 0 && col < mapDimensions.width && 
         row >= 0 && row < mapDimensions.height;
}

/**
 * Apply flood fill operation to update multiple hexes
 */
export function applyFloodFill(
  hexes: HexCoordinate[],
  cells: Map<string, HexCell>,
  newTerrain?: TerrainType,
  newLandmark?: LandmarkType,
  clearExisting: boolean = false
): Map<string, HexCell> {
  const updatedCells = new Map(cells);
  
  for (const hex of hexes) {
    const key = hexToKey(hex);
    const existingCell = updatedCells.get(key);
    
    const updatedCell: HexCell = {
      coordinate: hex,
      terrain: clearExisting ? undefined : (newTerrain ?? existingCell?.terrain),
      landmark: clearExisting ? undefined : (newLandmark ?? existingCell?.landmark),
      name: clearExisting ? undefined : existingCell?.name,
      description: clearExisting ? undefined : existingCell?.description,
      gmNotes: clearExisting ? undefined : existingCell?.gmNotes,
      isExplored: existingCell?.isExplored || false,
      isVisible: existingCell?.isVisible || false,
    };
    
    updatedCells.set(key, updatedCell);
  }
  
  return updatedCells;
}