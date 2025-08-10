/**
 * Tests for FloodFillControls component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { FloodFillControls } from './FloodFillControls';
import { uiSlice } from '../store/slices/uiSlice';
import { mapSlice } from '../store/slices/mapSlice';
import { explorationSlice } from '../store/slices/explorationSlice';

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: uiSlice.reducer,
      map: mapSlice.reducer,
      exploration: explorationSlice.reducer,
    },
    preloadedState: {
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
        quickTerrainMode: true,
        selectedQuickTerrain: 'plains',
        brushMode: false,
        brushSize: 1,
        brushShape: 'circle',
        brushPreviewHexes: [],
        floodFillMode: false,
        floodFillPreviewHexes: [],
        floodFillTargetTerrain: undefined,
        floodFillTargetLandmark: undefined,
        ...initialState.ui,
      },
      map: {
        currentMap: {
          id: 'test-map',
          name: 'Test Map',
          dimensions: { width: 10, height: 10 },
          cells: new Map(),
          playerPositions: [],
          sightDistance: 2,
          revealMode: 'permanent',
          appearance: {
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
          },
        },
        savedMaps: {
          'test-map': {
            id: 'test-map',
            name: 'Test Map',
            dimensions: { width: 10, height: 10 },
            cells: new Map(),
            playerPositions: [],
            sightDistance: 2,
            revealMode: 'permanent',
            appearance: {
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
            },
          }
        },
        ...initialState.map,
      },
      exploration: {
        exploredHexes: new Set(),
        visibleHexes: new Set(),
        explorationHistory: [],
        ...initialState.exploration,
      },
    },
  });
};

describe('FloodFillControls', () => {
  it('renders flood fill toggle button in GM mode', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <FloodFillControls />
      </Provider>
    );
    
    expect(screen.getByText(/Flood Fill OFF/)).toBeInTheDocument();
  });

  it('does not render in player mode', () => {
    const store = createMockStore({
      ui: { currentMode: 'player' }
    });
    
    const { container } = render(
      <Provider store={store}>
        <FloodFillControls />
      </Provider>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('toggles flood fill mode when button is clicked', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <FloodFillControls />
      </Provider>
    );
    
    const toggleButton = screen.getByText(/Flood Fill OFF/);
    fireEvent.click(toggleButton);
    
    // Check that the state was updated
    const state = store.getState();
    expect(state.ui.floodFillMode).toBe(true);
  });

  it('shows flood fill settings when mode is active', () => {
    const store = createMockStore({
      ui: { floodFillMode: true }
    });
    
    render(
      <Provider store={store}>
        <FloodFillControls />
      </Provider>
    );
    
    expect(screen.getByText(/Flood Fill Mode Active/)).toBeInTheDocument();
    expect(screen.getByText(/Click on a hex to flood fill/)).toBeInTheDocument();
  });

  it('shows preview count when hexes are selected', () => {
    const store = createMockStore({
      ui: { 
        floodFillMode: true,
        floodFillPreviewHexes: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 }
        ]
      }
    });
    
    render(
      <Provider store={store}>
        <FloodFillControls />
      </Provider>
    );
    
    expect(screen.getByText(/3 hexes selected/)).toBeInTheDocument();
    expect(screen.getByText(/Fill 3 Hexes/)).toBeInTheDocument();
  });

  it('shows target terrain when set', () => {
    const store = createMockStore({
      ui: { 
        floodFillMode: true,
        floodFillTargetTerrain: 'plains',
        selectedQuickTerrain: 'plains'
      }
    });
    
    render(
      <Provider store={store}>
        <FloodFillControls />
      </Provider>
    );
    
    expect(screen.getByText(/Filling with:/)).toBeInTheDocument();
  });

  it('shows confirmation dialog for large operations', () => {
    const store = createMockStore({
      ui: { 
        floodFillMode: true,
        floodFillPreviewHexes: Array.from({ length: 25 }, (_, i) => ({ q: i, r: 0 }))
      }
    });
    
    render(
      <Provider store={store}>
        <FloodFillControls />
      </Provider>
    );
    
    const fillButton = screen.getByText(/Fill 25 Hexes/);
    fireEvent.click(fillButton);
    
    expect(screen.getByText(/Confirm Flood Fill/)).toBeInTheDocument();
    expect(screen.getByText(/This will fill.*25.*connected hexes/)).toBeInTheDocument();
  });

  it('executes flood fill immediately for small operations', () => {
    const store = createMockStore({
      ui: { 
        floodFillMode: true,
        floodFillPreviewHexes: [
          { q: 0, r: 0 },
          { q: 1, r: 0 }
        ],
        selectedQuickTerrain: 'plains'
      }
    });
    
    render(
      <Provider store={store}>
        <FloodFillControls />
      </Provider>
    );
    
    const fillButton = screen.getByText(/Fill 2 Hexes/);
    fireEvent.click(fillButton);
    
    // Should not show confirmation dialog for small operations
    expect(screen.queryByText(/Confirm Flood Fill/)).not.toBeInTheDocument();
  });

  it('clears preview when cancel button is clicked', () => {
    const store = createMockStore({
      ui: { 
        floodFillMode: true,
        floodFillPreviewHexes: [{ q: 0, r: 0 }]
      }
    });
    
    render(
      <Provider store={store}>
        <FloodFillControls />
      </Provider>
    );
    
    const cancelButton = screen.getByText(/Cancel/);
    fireEvent.click(cancelButton);
    
    // Check that the preview was cleared
    const state = store.getState();
    expect(state.ui.floodFillPreviewHexes).toHaveLength(0);
  });
});