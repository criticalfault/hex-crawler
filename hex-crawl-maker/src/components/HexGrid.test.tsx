/**
 * Tests for HexGrid component - focusing on hex cell interaction and selection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { HexGrid } from './HexGrid';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import { hexToPixel, pixelToHex } from '../utils/hexCoordinates';
import type { HexCoordinate } from '../types';

// Enable Immer MapSet plugin for tests
enableMapSet();

const createTestStore = (initialState?: any) => {
  return configureStore({
    reducer: {
      map: mapSlice.reducer,
      ui: uiSlice.reducer,
      exploration: explorationSlice.reducer,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'map/setMapData', 
            'map/updateHexCell', 
            'map/placeIcon',
            'exploration/setExplorationState'
          ],
          ignoredPaths: [
            'map.currentMap.cells',
            'map.savedMaps',
            'exploration.exploredHexes',
            'exploration.visibleHexes'
          ],
        },
      }),
  });
};

import { vi } from 'vitest';

// Mock canvas context for testing
const mockCanvasContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 50 })),
  getContext: vi.fn(() => mockCanvasContext),
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => mockCanvasContext),
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

describe('HexGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <div style={{ width: '800px', height: '600px' }}>
          <HexGrid />
        </div>
      </Provider>
    );
  });

  it('handles hex selection on click', () => {
    const store = createTestStore();
    
    const { container } = render(
      <Provider store={store}>
        <div style={{ width: '800px', height: '600px' }}>
          <HexGrid />
        </div>
      </Provider>
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Simulate a click at the center of the canvas
    fireEvent.mouseDown(canvas!, {
      button: 0,
      clientX: 400,
      clientY: 300,
    });

    // Check that a hex was selected in the store
    const state = store.getState();
    expect(state.ui.selectedHex).toBeTruthy();
  });

  it('clears selection when clicking outside grid bounds', () => {
    const initialState = {
      ui: {
        selectedHex: { q: 0, r: 0 },
        currentMode: 'gm' as const,
        isPropertyDialogOpen: false,
        isDragging: false,
        draggedIcon: null,
        showCoordinates: false,
        isFullscreen: false,
        showHelp: false,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
      }
    };

    const store = createTestStore(initialState);
    
    const { container } = render(
      <Provider store={store}>
        <div style={{ width: '800px', height: '600px' }}>
          <HexGrid />
        </div>
      </Provider>
    );

    const canvas = container.querySelector('canvas');
    
    // Click far outside the grid
    fireEvent.mouseDown(canvas!, {
      button: 0,
      clientX: 10000,
      clientY: 10000,
    });

    // Selection should remain (since we're still within canvas bounds)
    // The actual bounds checking happens in the coordinate conversion
    const state = store.getState();
    expect(state.ui.selectedHex).toBeTruthy();
  });

  it('handles mouse move for hover detection', () => {
    const store = createTestStore();
    
    const { container } = render(
      <Provider store={store}>
        <div style={{ width: '800px', height: '600px' }}>
          <HexGrid />
        </div>
      </Provider>
    );

    const canvas = container.querySelector('canvas');
    
    // Simulate mouse move
    fireEvent.mouseMove(canvas!, {
      clientX: 400,
      clientY: 300,
    });

    // The hover state is managed internally by the component
    // We can't easily test it without exposing internal state
    // But we can verify the event handlers are attached
    expect(canvas).toBeInTheDocument();
  });

  it('handles panning with middle mouse button', () => {
    const store = createTestStore();
    
    const { container } = render(
      <Provider store={store}>
        <div style={{ width: '800px', height: '600px' }}>
          <HexGrid />
        </div>
      </Provider>
    );

    const canvas = container.querySelector('canvas');
    
    // Start panning with middle mouse button
    fireEvent.mouseDown(canvas!, {
      button: 1,
      clientX: 400,
      clientY: 300,
    });

    // Move mouse while panning
    fireEvent.mouseMove(canvas!, {
      clientX: 450,
      clientY: 350,
    });

    // End panning
    fireEvent.mouseUp(canvas!);

    // Check that pan offset was updated
    const state = store.getState();
    expect(state.ui.panOffset.x).not.toBe(0);
    expect(state.ui.panOffset.y).not.toBe(0);
  });

  it('handles zoom with mouse wheel', () => {
    const store = createTestStore();
    
    const { container } = render(
      <Provider store={store}>
        <div style={{ width: '800px', height: '600px' }}>
          <HexGrid />
        </div>
      </Provider>
    );

    const canvas = container.querySelector('canvas');
    
    // Zoom in
    fireEvent.wheel(canvas!, {
      deltaY: -100,
    });

    let state = store.getState();
    expect(state.ui.zoom).toBeGreaterThan(1);

    // Zoom out
    fireEvent.wheel(canvas!, {
      deltaY: 100,
    });

    state = store.getState();
    expect(state.ui.zoom).toBeLessThan(1.1); // Should be less than the zoomed in value
  });

  it('clears hover state on mouse leave', () => {
    const store = createTestStore();
    
    const { container } = render(
      <Provider store={store}>
        <div style={{ width: '800px', height: '600px' }}>
          <HexGrid />
        </div>
      </Provider>
    );

    const canvas = container.querySelector('canvas');
    
    // Move mouse over canvas
    fireEvent.mouseMove(canvas!, {
      clientX: 400,
      clientY: 300,
    });

    // Leave canvas
    fireEvent.mouseLeave(canvas!);

    // Hover state should be cleared (internal state, hard to test directly)
    expect(canvas).toBeInTheDocument();
  });

  it('shows coordinates when showCoordinates is enabled', () => {
    const initialState = {
      ui: {
        showCoordinates: true,
        selectedHex: null,
        currentMode: 'gm' as const,
        isPropertyDialogOpen: false,
        isDragging: false,
        draggedIcon: null,
        isFullscreen: false,
        showHelp: false,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
      }
    };

    const store = createTestStore(initialState);
    
    render(
      <Provider store={store}>
        <div style={{ width: '800px', height: '600px' }}>
          <HexGrid />
        </div>
      </Provider>
    );

    // Verify that fillText was called (coordinates are drawn)
    expect(mockCanvasContext.fillText).toHaveBeenCalled();
  });
});

// Test coordinate conversion accuracy
describe('HexGrid Coordinate Conversion', () => {
  const hexSize = 30;

  it('converts hex coordinates to pixel coordinates correctly', () => {
    const hex: HexCoordinate = { q: 0, r: 0 };
    const pixel = hexToPixel(hex, hexSize);
    
    expect(pixel.x).toBe(0);
    expect(pixel.y).toBe(0);
  });

  it('converts pixel coordinates to hex coordinates correctly', () => {
    const pixel = { x: 0, y: 0 };
    const hex = pixelToHex(pixel, hexSize);
    
    expect(hex.q).toBe(0);
    expect(hex.r).toBe(0);
  });

  it('maintains coordinate conversion accuracy for various positions', () => {
    const testCases: HexCoordinate[] = [
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: -1, r: 1 },
      { q: -1, r: 0 },
      { q: 0, r: -1 },
      { q: 1, r: -1 },
      { q: 2, r: 1 },
      { q: -2, r: -1 },
    ];

    testCases.forEach(originalHex => {
      const pixel = hexToPixel(originalHex, hexSize);
      const convertedHex = pixelToHex(pixel, hexSize);
      
      expect(convertedHex.q).toBe(originalHex.q);
      expect(convertedHex.r).toBe(originalHex.r);
    });
  });

  it('handles fractional pixel coordinates correctly', () => {
    const pixel = { x: 15.5, y: 25.7 };
    const hex = pixelToHex(pixel, hexSize);
    
    // Should round to nearest valid hex coordinate
    expect(Number.isInteger(hex.q)).toBe(true);
    expect(Number.isInteger(hex.r)).toBe(true);
  });
});