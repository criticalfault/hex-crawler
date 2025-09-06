# Biome Generation Complete Fix

## Problem
The biome generator was missing hexes when filling maps, particularly coordinates like (-1,2) and (-7,14) to (-1,14). This happened because:

1. **Density-based gaps**: The original algorithm only placed terrain on a percentage of hexes based on density, leaving gaps
2. **Fixed coordinate range**: Generation was limited to (0,0) to (width-1, height-1), but maps can have cells at any coordinates including negative ones
3. **Mismatch between map reality and generation**: Maps store cells in a flexible coordinate system, but generation assumed a fixed rectangular grid

## Solution: Coordinate-Based Generation
Redesigned the biome generator to fill ALL existing hexes on the current map, regardless of their coordinates.

## Key Changes

### 1. Eliminated Density-Based Gaps
**File**: `hex-crawl-maker/src/services/templateService.ts`
- Removed the `if (seededRandom() < config.density)` check that was causing gaps
- Every hex now gets terrain - no more missing hexes
- Repurposed "density" as "terrain consistency" - controls variation vs. primary terrain type

### 2. Added Coordinate-Based Generation
**File**: `hex-crawl-maker/src/services/templateService.ts`
- New `generateBiomeForCoordinates()` method that takes specific coordinates
- Generates terrain for exactly the coordinates provided
- Works with any coordinate range, including negative coordinates

### 3. Grid-Synchronized Generation
**File**: `hex-crawl-maker/src/components/BiomeGenerator.tsx`
- Uses the EXACT same coordinate generation logic as HexGrid component
- Generates coordinates for every visible grid position: `q = col - Math.floor(row / 2), r = row`
- Ensures perfect alignment between what's visible and what gets filled

### 4. Updated UI Labels
**File**: `hex-crawl-maker/src/components/BiomeGenerator.tsx`
- Changed "Terrain Density" to "Terrain Consistency" 
- Added help text explaining the new behavior
- Clarified that higher values = more consistent terrain

### 5. Enhanced Terrain Selection
**File**: `hex-crawl-maker/src/services/templateService.ts`
- Updated `selectWeightedTerrain()` to use consistency parameter
- Lower consistency = more terrain variation
- Higher consistency = more of the primary biome terrain type

## How It Works Now

1. **Grid Coordinate Generation**: Uses the same logic as HexGrid to generate ALL visible coordinates
2. **Perfect Synchronization**: `q = col - Math.floor(row / 2), r = row` for every grid position
3. **Complete Coverage**: Generates terrain for every single visible hex, including white/empty ones
4. **No Gaps**: Every hex that should be visible on the grid gets filled with terrain

## Result

✅ **No more missing hexes** - Every existing coordinate gets terrain  
✅ **Works with negative coordinates** - Handles (-7,14), (-1,2), etc.  
✅ **Works with any map shape** - Not limited to rectangular grids  
✅ **100% coverage** - Fills every hex that exists on your map  
✅ **Maintains biome characteristics** - Still respects forest/desert/mountain themes  

## Usage
1. Open the Biome Generator
2. Select biome type (Forest, Desert, Mountain, etc.)
3. Adjust terrain consistency (higher = more uniform, lower = more varied)
4. Adjust landmark chance and other settings
5. Click "Generate Full Map Biome" - fills ALL existing hexes
6. Click "Apply to Map" to apply the generated biome

## Technical Details
- Maps use `Map<string, HexCell>` keyed by "q,r" strings (e.g., "-7,14")
- Coordinates can be anywhere in 2D space, not just positive ranges
- The generator now respects this flexible coordinate system
- Empty maps still use dimension-based generation as fallback