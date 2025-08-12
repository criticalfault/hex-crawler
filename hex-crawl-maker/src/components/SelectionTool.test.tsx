/**
 * SelectionTool component tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SelectionTool } from './SelectionTool';
import { uiSlice } from '../store/slices/uiSlice';
import { mapSlice } from '../store/slices/mapSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import { historySlice } from '../store/slices/historySlice';
import { templateSlice } from '../store/slices/templateSlice';

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: uiSlice.reducer,
      map: mapSlice.reducer,
      exploration: explorationSlice.reducer,
      history: historySlice.reducer,
      template: templateSlice.reducer,
    },
    preloadedState: initialState,
  });
};

describe('SelectionTool', () => {
  it('renders selection tool with toggle button', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <SelectionTool />
      </Provider>
    );

    expect(screen.getByText('Copy/Paste')).toBeInTheDocument();
    expect(screen.getByText('⬚ Select Region')).toBeInTheDocument();
  });

  it('toggles selection mode when button is clicked', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <SelectionTool />
      </Provider>
    );

    const toggleButton = screen.getByText('⬚ Select Region');
    fireEvent.click(toggleButton);

    expect(screen.getByText('🔲 Exit Selection')).toBeInTheDocument();
  });

  it('shows selection info when hexes are selected', () => {
    const store = createTestStore({
      ui: {
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
        selectionMode: false,
        selectionStart: null,
        selectionEnd: null,
        selectedRegion: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
        ],
        clipboard: null,
        pastePreviewHexes: [],
        pastePreviewPosition: null,
      },
    });
    
    render(
      <Provider store={store}>
        <SelectionTool />
      </Provider>
    );

    expect(screen.getByText('3 hexes selected')).toBeInTheDocument();
    expect(screen.getByText('📋 Copy')).toBeInTheDocument();
  });

  it('shows clipboard info when pattern is copied', () => {
    const mockPattern = new Map([
      ['0,0', { terrain: 'plains' }],
      ['1,0', { terrain: 'mountains' }],
    ]);

    const store = createTestStore({
      ui: {
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
        selectionMode: false,
        selectionStart: null,
        selectionEnd: null,
        selectedRegion: [],
        clipboard: {
          pattern: mockPattern,
          dimensions: { width: 2, height: 1 },
        },
        pastePreviewHexes: [],
        pastePreviewPosition: null,
      },
    });
    
    render(
      <Provider store={store}>
        <SelectionTool />
      </Provider>
    );

    expect(screen.getByText(/2 hexes in clipboard/)).toBeInTheDocument();
    expect(screen.getByText('📄 Paste')).toBeInTheDocument();
  });

  it('shows instructions when in selection mode', () => {
    const store = createTestStore({
      ui: {
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
        selectionMode: true,
        selectionStart: null,
        selectionEnd: null,
        selectedRegion: [],
        clipboard: null,
        pastePreviewHexes: [],
        pastePreviewPosition: null,
      },
    });
    
    render(
      <Provider store={store}>
        <SelectionTool />
      </Provider>
    );

    expect(screen.getByText('Selection Mode Active')).toBeInTheDocument();
    expect(screen.getByText('Click and drag to select a rectangular region')).toBeInTheDocument();
  });
});