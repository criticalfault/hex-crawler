/**
 * Redux slice for UI state management
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { HexCoordinate } from '../../types';

export type AppMode = 'gm' | 'player';

interface UIState {
  currentMode: AppMode;
  selectedHex: HexCoordinate | null;
  isPropertyDialogOpen: boolean;
  isDragging: boolean;
  draggedIcon: {
    type: 'terrain' | 'landmark';
    value: string;
  } | null;
  showCoordinates: boolean;
  isFullscreen: boolean;
  showHelp: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
}

const initialState: UIState = {
  currentMode: 'gm',
  selectedHex: null,
  isPropertyDialogOpen: false,
  isDragging: false,
  draggedIcon: null,
  showCoordinates: false,
  isFullscreen: false,
  showHelp: false,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
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
  },
});

export const uiActions = uiSlice.actions;