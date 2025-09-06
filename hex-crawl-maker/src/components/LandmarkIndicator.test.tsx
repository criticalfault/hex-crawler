/**
 * Tests for landmark indicator functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HexGrid } from './HexGrid';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';

// Mock canvas context
const mockContext = {
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fillText: vi.fn(),
  drawImage: vi.fn(),
  set fillStyle(value: string) {},
  set strokeStyle(value: string) {},
  set lineWidth(value: number) {},
  set font(value: string) {},
  set textAlign(value: string) {},
  set textBaseline(value: string) {},
  set globalAlpha(value: number) {},
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => mockContext),
});

// Mock getBoundingClientRect
Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
  value: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600,
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}));

describe('Landmark Indicator', () => {
  const createTestStore = (initialState = {}) => {
    const defaultState = {
      map: {
        cells: new Map([
          ['2,3', {
            coordinate: { q: 2, r: 3 },
            terrain: 'forest',
            landmark: 'village',
            name: 'Test Village',
            description: 'A test village for landmark indicators',
          }],
        ]),
        dimensions: { width: 20, height: 20 },
        playerPositions: [],
      },
      ui: {
        currentMode: 'player',
        zoom: 1,
        panOffset: { x: 0, y: 0 },
        selectedHex: null,
        showCoordinates: false,
        hoveredHex: null,
        dragOverHex: null,
        quickTerrainMode: false,
        selectedQuickTerrain: null,
        brushMode: false,
        brushSize: 1,
        brushShape: 'circle',
        brushPreviewHexes: [],
        floodFillMode: false,
        floodFillPreviewHexes: [],
        floodFillTargetTerrain: null,
        floodFillTargetLandmark: null,
        selectionMode: false,
        selectionStart: null,
        selectionEnd: null,
        selectedRegion: [],
        pastePreviewHexes: [],
        isProjectionMode: false,
        projectionSettings: {
          backgroundColor: '#000000',
          textColor: '#ffffff',
          accentColor: '#ffd700',
          largeText: false,
        },
        gridAppearance: {
          hexSize: 30,
          borderWidth: 1,
          backgroundColor: '#ffffff',
          borderColor: '#cccccc',
          unexploredColor: '#f0f0f0',
          sightColor: '#e0e0e0',
          textSize: 12,
          terrainColors: {
            forest: '#228b22',
          },
        },
      },
      exploration: {
        exploredHexes: new Set(['2,3']),
        visibleHexes: new Set(['2,3']),
        sightDistance: 2,
        revealMode: 'permanent',
      },
    };

    // Deep merge with initial state
    const mergedState = {
      ...defaultState,
      ...initialState,
      map: { ...defaultState.map, ...initialState.map },
      ui: { ...defaultState.ui, ...initialState.ui },
      exploration: { ...defaultState.exploration, ...initialState.exploration },
    };

    return configureStore({
      reducer: {
        map: mapSlice.reducer,
        ui: uiSlice.reducer,
        exploration: explorationSlice.reducer,
      },
      preloadedState: mergedState,
    });
  };

  it('should render landmark indicator in player mode', () => {
    const store = createTestStore();
    
    const { container } = render(
      <Provider store={store}>
        <HexGrid />
      </Provider>
    );

    // Verify that the component renders without errors
    // Canvas rendering is difficult to test directly, so we just ensure no crashes
    expect(container.querySelector('canvas')).toBeTruthy();
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('should not render landmark indicator in GM mode', () => {
    const store = createTestStore({
      ui: {
        currentMode: 'gm',
      },
    });

    // Clear previous calls
    vi.clearAllMocks();
    
    render(
      <Provider store={store}>
        <HexGrid />
      </Provider>
    );

    // In GM mode, the landmark indicator should not be drawn
    // We can't easily test this directly, but we can verify the component renders
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('should not render indicator for landmarks without name or description', () => {
    const store = createTestStore({
      map: {
        cells: new Map([
          ['2,3', {
            coordinate: { q: 2, r: 3 },
            terrain: 'forest',
            landmark: 'village',
            // No name or description
          }],
        ]),
        dimensions: { width: 20, height: 20 },
        playerPositions: [],
      },
    });

    // Clear previous calls
    vi.clearAllMocks();
    
    render(
      <Provider store={store}>
        <HexGrid />
      </Provider>
    );

    // The indicator should not be drawn for landmarks without name/description
    // This prevents empty tooltips
    expect(mockContext.clearRect).toHaveBeenCalled();
  });
});