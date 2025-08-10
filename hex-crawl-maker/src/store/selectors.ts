/**
 * Redux selectors for accessing state data
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { HexCoordinate, HexCell } from '../types';

// Helper function to create coordinate key
const coordToKey = (coord: HexCoordinate): string => `${coord.q},${coord.r}`;

// Map selectors
export const selectCurrentMap = (state: RootState) => state.map.currentMap;
export const selectSavedMaps = (state: RootState) => state.map.savedMaps;
export const selectMapExists = (state: RootState) => state.map.currentMap !== null;

export const selectMapDimensions = createSelector(
  [selectCurrentMap],
  (currentMap) => currentMap?.dimensions || { width: 0, height: 0 }
);

export const selectMapName = createSelector(
  [selectCurrentMap],
  (currentMap) => currentMap?.name || ''
);

export const selectMapId = createSelector(
  [selectCurrentMap],
  (currentMap) => currentMap?.id || ''
);

export const selectMapCells = createSelector(
  [selectCurrentMap],
  (currentMap) => currentMap?.cells || new Map()
);

export const selectHexCell = (coordinate: HexCoordinate) =>
  createSelector(
    [selectMapCells],
    (cells) => cells.get(coordToKey(coordinate)) || null
  );

export const selectPlayerPositions = createSelector(
  [selectCurrentMap],
  (currentMap) => currentMap?.playerPositions || []
);

export const selectSightDistance = createSelector(
  [selectCurrentMap],
  (currentMap) => currentMap?.sightDistance || 2
);

export const selectRevealMode = createSelector(
  [selectCurrentMap],
  (currentMap) => currentMap?.revealMode || 'permanent'
);

export const selectGridAppearance = createSelector(
  [selectCurrentMap],
  (currentMap) => currentMap?.appearance || {
    hexSize: 30,
    borderColor: '#333333',
    backgroundColor: '#f0f0f0',
    unexploredColor: '#cccccc',
    textSize: 12,
    terrainColors: {
      mountains: '#8B4513',
      plains: '#90EE90',
      swamps: '#556B2F',
      water: '#4169E1',
      desert: '#F4A460',
    },
    borderWidth: 1,
  }
);

// UI selectors
export const selectCurrentMode = (state: RootState) => state.ui.currentMode;
export const selectSelectedHex = (state: RootState) => state.ui.selectedHex;
export const selectIsPropertyDialogOpen = (state: RootState) => state.ui.isPropertyDialogOpen;
export const selectIsSettingsPanelOpen = (state: RootState) => state.ui.isSettingsPanelOpen;
export const selectIsMapManagerOpen = (state: RootState) => state.ui.isMapManagerOpen;
export const selectIsDragging = (state: RootState) => state.ui.isDragging;
export const selectDraggedIcon = (state: RootState) => state.ui.draggedIcon;
export const selectShowCoordinates = (state: RootState) => state.ui.showCoordinates;
export const selectIsFullscreen = (state: RootState) => state.ui.isFullscreen;
export const selectShowHelp = (state: RootState) => state.ui.showHelp;
export const selectShowShortcutsOverlay = (state: RootState) => state.ui.showShortcutsOverlay;
export const selectZoom = (state: RootState) => state.ui.zoom;
export const selectPanOffset = (state: RootState) => state.ui.panOffset;
export const selectIsProjectionMode = (state: RootState) => state.ui.isProjectionMode;
export const selectProjectionSettings = (state: RootState) => state.ui.projectionSettings;
export const selectQuickTerrainMode = (state: RootState) => state.ui.quickTerrainMode;
export const selectSelectedQuickTerrain = (state: RootState) => state.ui.selectedQuickTerrain;
export const selectBrushMode = (state: RootState) => state.ui.brushMode;
export const selectBrushSize = (state: RootState) => state.ui.brushSize;
export const selectBrushShape = (state: RootState) => state.ui.brushShape;
export const selectBrushPreviewHexes = (state: RootState) => state.ui.brushPreviewHexes;
export const selectFloodFillMode = (state: RootState) => state.ui.floodFillMode;
export const selectFloodFillPreviewHexes = (state: RootState) => state.ui.floodFillPreviewHexes;
export const selectFloodFillTargetTerrain = (state: RootState) => state.ui.floodFillTargetTerrain;
export const selectFloodFillTargetLandmark = (state: RootState) => state.ui.floodFillTargetLandmark;

export const selectIsGMMode = createSelector(
  [selectCurrentMode],
  (mode) => mode === 'gm'
);

export const selectIsPlayerMode = createSelector(
  [selectCurrentMode],
  (mode) => mode === 'player'
);

// Exploration selectors
export const selectExploredHexes = (state: RootState) => state.exploration.exploredHexes;
export const selectVisibleHexes = (state: RootState) => state.exploration.visibleHexes;
export const selectExplorationHistory = (state: RootState) => state.exploration.explorationHistory;

export const selectIsHexExplored = (coordinate: HexCoordinate) =>
  createSelector(
    [selectExploredHexes],
    (exploredHexes) => exploredHexes.has(coordToKey(coordinate))
  );

export const selectIsHexVisible = (coordinate: HexCoordinate) =>
  createSelector(
    [selectVisibleHexes],
    (visibleHexes) => visibleHexes.has(coordToKey(coordinate))
  );

// Combined selectors for hex visibility logic
export const selectHexVisibility = (coordinate: HexCoordinate) =>
  createSelector(
    [selectCurrentMode, selectRevealMode, selectIsHexExplored(coordinate), selectIsHexVisible(coordinate)],
    (mode, revealMode, isExplored, isVisible) => {
      // In GM mode, everything is visible
      if (mode === 'gm') {
        return { shouldShow: true, isExplored, isCurrentlyVisible: true };
      }

      // In player mode, visibility depends on exploration and reveal mode
      if (revealMode === 'permanent') {
        return { shouldShow: isExplored, isExplored, isCurrentlyVisible: isVisible };
      } else {
        // Line of sight mode - only show currently visible hexes
        return { shouldShow: isVisible, isExplored, isCurrentlyVisible: isVisible };
      }
    }
  );

// Utility selectors
export const selectAllExploredCells = createSelector(
  [selectMapCells, selectExploredHexes],
  (cells, exploredHexes) => {
    const exploredCells: HexCell[] = [];
    for (const [key, cell] of cells.entries()) {
      if (exploredHexes.has(key)) {
        exploredCells.push(cell);
      }
    }
    return exploredCells;
  }
);

export const selectAllVisibleCells = createSelector(
  [selectMapCells, selectVisibleHexes],
  (cells, visibleHexes) => {
    const visibleCells: HexCell[] = [];
    for (const [key, cell] of cells.entries()) {
      if (visibleHexes.has(key)) {
        visibleCells.push(cell);
      }
    }
    return visibleCells;
  }
);

export const selectMapStats = createSelector(
  [selectMapCells, selectExploredHexes],
  (cells, exploredHexes) => ({
    totalCells: cells.size,
    exploredCells: exploredHexes.size,
    explorationPercentage: cells.size > 0 ? (exploredHexes.size / cells.size) * 100 : 0,
  })
);