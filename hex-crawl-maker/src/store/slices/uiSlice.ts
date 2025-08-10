/**
 * Redux slice for UI state management
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { HexCoordinate } from '../../types';

export type AppMode = 'gm' | 'player';

export type BrushSize = 1 | 3 | 5 | 7;
export type BrushShape = 'circle' | 'square' | 'diamond';

interface UIState {
  currentMode: AppMode;
  selectedHex: HexCoordinate | null;
  isPropertyDialogOpen: boolean;
  isSettingsPanelOpen: boolean;
  isMapManagerOpen: boolean;
  isDragging: boolean;
  draggedIcon: {
    type: 'terrain' | 'landmark';
    value: string;
  } | null;
  showCoordinates: boolean;
  isFullscreen: boolean;
  showHelp: boolean;
  showShortcutsOverlay: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
  isProjectionMode: boolean;
  projectionSettings: {
    highContrast: boolean;
    largeText: boolean;
    simplifiedUI: boolean;
  };
  quickTerrainMode: boolean;
  selectedQuickTerrain: string;
  brushMode: boolean;
  brushSize: BrushSize;
  brushShape: BrushShape;
  brushPreviewHexes: HexCoordinate[];
  floodFillMode: boolean;
  floodFillPreviewHexes: HexCoordinate[];
  floodFillTargetTerrain?: string;
  floodFillTargetLandmark?: string;
}

const initialState: UIState = {
  currentMode: 'gm',
  selectedHex: null,
  isPropertyDialogOpen: false,
  isSettingsPanelOpen: false,
  isMapManagerOpen: false,
  isDragging: false,
  draggedIcon: null,
  showCoordinates: false,
  isFullscreen: false,
  showHelp: false,
  showShortcutsOverlay: false,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  isProjectionMode: false,
  projectionSettings: {
    highContrast: true,
    largeText: true,
    simplifiedUI: true,
  },
  quickTerrainMode: false,
  selectedQuickTerrain: 'plains',
  brushMode: false,
  brushSize: 1,
  brushShape: 'circle',
  brushPreviewHexes: [],
  floodFillMode: false,
  floodFillPreviewHexes: [],
  floodFillTargetTerrain: undefined,
  floodFillTargetLandmark: undefined,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Mode switching
    setMode: (state, action: PayloadAction<AppMode>) => {
      state.currentMode = action.payload;
      // Clear selection when switching modes
      state.selectedHex = null;
      state.isPropertyDialogOpen = false;
    },

    toggleMode: (state) => {
      state.currentMode = state.currentMode === 'gm' ? 'player' : 'gm';
      state.selectedHex = null;
      state.isPropertyDialogOpen = false;
    },

    // Hex selection
    selectHex: (state, action: PayloadAction<HexCoordinate | null>) => {
      state.selectedHex = action.payload;
    },

    clearSelection: (state) => {
      state.selectedHex = null;
      state.isPropertyDialogOpen = false;
    },

    // Property dialog
    openPropertyDialog: (state, action: PayloadAction<HexCoordinate>) => {
      state.selectedHex = action.payload;
      state.isPropertyDialogOpen = true;
    },

    closePropertyDialog: (state) => {
      state.isPropertyDialogOpen = false;
    },

    // Settings panel
    openSettingsPanel: (state) => {
      state.isSettingsPanelOpen = true;
    },

    closeSettingsPanel: (state) => {
      state.isSettingsPanelOpen = false;
    },

    toggleSettingsPanel: (state) => {
      state.isSettingsPanelOpen = !state.isSettingsPanelOpen;
    },

    // Map manager
    openMapManager: (state) => {
      state.isMapManagerOpen = true;
    },

    closeMapManager: (state) => {
      state.isMapManagerOpen = false;
    },

    toggleMapManager: (state) => {
      state.isMapManagerOpen = !state.isMapManagerOpen;
    },

    // Drag and drop
    startDrag: (state, action: PayloadAction<{ type: 'terrain' | 'landmark'; value: string }>) => {
      state.isDragging = true;
      state.draggedIcon = action.payload;
    },

    endDrag: (state) => {
      state.isDragging = false;
      state.draggedIcon = null;
    },

    // View options
    toggleCoordinates: (state) => {
      state.showCoordinates = !state.showCoordinates;
    },

    setShowCoordinates: (state, action: PayloadAction<boolean>) => {
      state.showCoordinates = action.payload;
    },

    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },

    setFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },

    toggleHelp: (state) => {
      state.showHelp = !state.showHelp;
    },

    setShowHelp: (state, action: PayloadAction<boolean>) => {
      state.showHelp = action.payload;
    },

    toggleShortcutsOverlay: (state) => {
      state.showShortcutsOverlay = !state.showShortcutsOverlay;
    },

    setShowShortcutsOverlay: (state, action: PayloadAction<boolean>) => {
      state.showShortcutsOverlay = action.payload;
    },

    // Zoom and pan
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(0.1, Math.min(5, action.payload));
    },

    zoomIn: (state) => {
      state.zoom = Math.min(5, state.zoom * 1.2);
    },

    zoomOut: (state) => {
      state.zoom = Math.max(0.1, state.zoom / 1.2);
    },

    resetZoom: (state) => {
      state.zoom = 1;
      state.panOffset = { x: 0, y: 0 };
    },

    setPanOffset: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.panOffset = action.payload;
    },

    updatePanOffset: (state, action: PayloadAction<{ deltaX: number; deltaY: number }>) => {
      state.panOffset.x += action.payload.deltaX;
      state.panOffset.y += action.payload.deltaY;
    },

    // Projection mode
    toggleProjectionMode: (state) => {
      state.isProjectionMode = !state.isProjectionMode;
    },

    setProjectionMode: (state, action: PayloadAction<boolean>) => {
      state.isProjectionMode = action.payload;
    },

    updateProjectionSettings: (state, action: PayloadAction<Partial<UIState['projectionSettings']>>) => {
      state.projectionSettings = { ...state.projectionSettings, ...action.payload };
    },

    // Quick terrain mode
    toggleQuickTerrainMode: (state) => {
      state.quickTerrainMode = !state.quickTerrainMode;
      if (state.quickTerrainMode) {
        // Clear selection when entering quick terrain mode
        state.selectedHex = null;
        state.isPropertyDialogOpen = false;
      }
    },

    setQuickTerrainMode: (state, action: PayloadAction<boolean>) => {
      state.quickTerrainMode = action.payload;
      if (action.payload) {
        state.selectedHex = null;
        state.isPropertyDialogOpen = false;
      }
    },

    setSelectedQuickTerrain: (state, action: PayloadAction<string>) => {
      state.selectedQuickTerrain = action.payload;
    },

    // Brush mode
    toggleBrushMode: (state) => {
      state.brushMode = !state.brushMode;
      if (state.brushMode) {
        // Clear selection when entering brush mode
        state.selectedHex = null;
        state.isPropertyDialogOpen = false;
        // Enable quick terrain mode if not already enabled
        if (!state.quickTerrainMode) {
          state.quickTerrainMode = true;
        }
      } else {
        // Clear brush preview when exiting brush mode
        state.brushPreviewHexes = [];
      }
    },

    setBrushMode: (state, action: PayloadAction<boolean>) => {
      state.brushMode = action.payload;
      if (action.payload) {
        state.selectedHex = null;
        state.isPropertyDialogOpen = false;
        if (!state.quickTerrainMode) {
          state.quickTerrainMode = true;
        }
      } else {
        state.brushPreviewHexes = [];
      }
    },

    setBrushSize: (state, action: PayloadAction<BrushSize>) => {
      state.brushSize = action.payload;
    },

    setBrushShape: (state, action: PayloadAction<BrushShape>) => {
      state.brushShape = action.payload;
    },

    setBrushPreviewHexes: (state, action: PayloadAction<HexCoordinate[]>) => {
      state.brushPreviewHexes = action.payload;
    },

    clearBrushPreview: (state) => {
      state.brushPreviewHexes = [];
    },

    // Flood fill mode
    toggleFloodFillMode: (state) => {
      state.floodFillMode = !state.floodFillMode;
      if (state.floodFillMode) {
        // Clear selection when entering flood fill mode
        state.selectedHex = null;
        state.isPropertyDialogOpen = false;
        // Enable quick terrain mode if not already enabled
        if (!state.quickTerrainMode) {
          state.quickTerrainMode = true;
        }
        // Disable brush mode when enabling flood fill
        if (state.brushMode) {
          state.brushMode = false;
          state.brushPreviewHexes = [];
        }
      } else {
        // Clear flood fill preview when exiting flood fill mode
        state.floodFillPreviewHexes = [];
        state.floodFillTargetTerrain = undefined;
        state.floodFillTargetLandmark = undefined;
      }
    },

    setFloodFillMode: (state, action: PayloadAction<boolean>) => {
      state.floodFillMode = action.payload;
      if (action.payload) {
        state.selectedHex = null;
        state.isPropertyDialogOpen = false;
        if (!state.quickTerrainMode) {
          state.quickTerrainMode = true;
        }
        if (state.brushMode) {
          state.brushMode = false;
          state.brushPreviewHexes = [];
        }
      } else {
        state.floodFillPreviewHexes = [];
        state.floodFillTargetTerrain = undefined;
        state.floodFillTargetLandmark = undefined;
      }
    },

    setFloodFillPreviewHexes: (state, action: PayloadAction<HexCoordinate[]>) => {
      state.floodFillPreviewHexes = action.payload;
    },

    setFloodFillTarget: (state, action: PayloadAction<{ terrain?: string; landmark?: string }>) => {
      state.floodFillTargetTerrain = action.payload.terrain;
      state.floodFillTargetLandmark = action.payload.landmark;
    },

    clearFloodFillPreview: (state) => {
      state.floodFillPreviewHexes = [];
      state.floodFillTargetTerrain = undefined;
      state.floodFillTargetLandmark = undefined;
    },
  },
});

export const uiActions = uiSlice.actions;