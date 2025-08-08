/**
 * Integration tests for ModeToggle component with HexGrid
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { ModeToggle } from './ModeToggle';
import { HexGrid } from './HexGrid';
import { uiSlice } from '../store/slices/uiSlice';
import { mapSlice } from '../store/slices/mapSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import { localStorageMiddleware } from '../store/middleware/localStorage';

// Enable Immer MapSet plugin
enableMapSet();

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: uiSlice.reducer,
      map: mapSlice.reducer,
      exploration: explorationSlice.reducer,
    },
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
      }).concat(localStorageMiddleware),
    preloadedState: initialState,
  });
};

const TestApp: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '600px' }}>
      <div style={{ width: '250px', padding: '1rem' }}>
        <ModeToggle />
      </div>
      <div style={{ flex: 1 }}>
        <HexGrid />
      </div>
    </div>
  );
};

const renderWithStore = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

describe('ModeToggle Integration', () => {
  beforeEach(() => {
    // Mock canvas context
    const mockCanvas = {
      getContext: vi.fn(() => ({
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
        drawImage: vi.fn(),
        fillText: vi.fn(),
        set fillStyle(value) {},
        set strokeStyle(value) {},
        set lineWidth(value) {},
        set font(value) {},
        set textAlign(value) {},
        set textBaseline(value) {},
        set globalAlpha(value) {},
      })),
      width: 800,
      height: 600,
    };

    // Mock HTMLCanvasElement
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: mockCanvas.getContext,
      writable: true,
    });

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));
  });

  it('renders both ModeToggle and HexGrid components', () => {
    renderWithStore(<TestApp />);
    
    expect(screen.getByText('View Mode')).toBeInTheDocument();
    expect(screen.getByText('GM Mode')).toBeInTheDocument();
    expect(screen.getByText('Player Mode')).toBeInTheDocument();
    
    // HexGrid should be rendered (canvas element)
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('switches between GM and Player modes correctly', () => {
    const { store } = renderWithStore(<TestApp />);
    
    // Should start in GM mode
    expect(store.getState().ui.currentMode).toBe('gm');
    expect(screen.getByText(/GM Mode:/)).toBeInTheDocument();
    
    // Switch to player mode
    const playerButton = screen.getByRole('button', { name: /Player Mode/ });
    fireEvent.click(playerButton);
    
    expect(store.getState().ui.currentMode).toBe('player');
    expect(screen.getByText(/Player Mode:/)).toBeInTheDocument();
    
    // Switch back to GM mode
    const gmButton = screen.getByRole('button', { name: /GM Mode/ });
    fireEvent.click(gmButton);
    
    expect(store.getState().ui.currentMode).toBe('gm');
    expect(screen.getByText(/GM Mode:/)).toBeInTheDocument();
  });

  it('updates mode indicator correctly', () => {
    const { store } = renderWithStore(<TestApp />);
    
    // Check initial GM mode button state
    const gmButton = screen.getByRole('button', { name: /GM Mode/ });
    const playerButton = screen.getByRole('button', { name: /Player Mode/ });
    
    expect(gmButton).toHaveAttribute('aria-pressed', 'true');
    expect(playerButton).toHaveAttribute('aria-pressed', 'false');
    
    // Switch to player mode
    fireEvent.click(playerButton);
    
    expect(gmButton).toHaveAttribute('aria-pressed', 'false');
    expect(playerButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('quick switch button works correctly', () => {
    const { store } = renderWithStore(<TestApp />);
    
    const quickSwitchButton = screen.getByRole('button', { name: /Quick Switch/ });
    
    // Should start in GM mode
    expect(store.getState().ui.currentMode).toBe('gm');
    expect(quickSwitchButton).toHaveAttribute('title', 'Switch to Player Mode');
    
    // Click quick switch
    fireEvent.click(quickSwitchButton);
    
    expect(store.getState().ui.currentMode).toBe('player');
    expect(quickSwitchButton).toHaveAttribute('title', 'Switch to GM Mode');
    
    // Click again
    fireEvent.click(quickSwitchButton);
    
    expect(store.getState().ui.currentMode).toBe('gm');
    expect(quickSwitchButton).toHaveAttribute('title', 'Switch to Player Mode');
  });

  it('maintains state consistency between components', () => {
    const { store } = renderWithStore(<TestApp />);
    
    // Both components should reflect the same mode state
    expect(store.getState().ui.currentMode).toBe('gm');
    
    // Switch mode via ModeToggle
    const playerButton = screen.getByRole('button', { name: /Player Mode/ });
    fireEvent.click(playerButton);
    
    // State should be updated
    expect(store.getState().ui.currentMode).toBe('player');
    
    // UI should reflect the change
    expect(screen.getByText(/Player Mode:/)).toBeInTheDocument();
    expect(playerButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('clears selection when switching modes', () => {
    const initialState = {
      ui: {
        currentMode: 'gm' as const,
        selectedHex: { q: 1, r: 1 },
        isPropertyDialogOpen: true,
        isDragging: false,
        draggedIcon: null,
        showCoordinates: false,
        isFullscreen: false,
        showHelp: false,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
      },
    };

    const { store } = renderWithStore(<TestApp />, initialState);
    
    // Should have selection initially
    expect(store.getState().ui.selectedHex).toEqual({ q: 1, r: 1 });
    expect(store.getState().ui.isPropertyDialogOpen).toBe(true);
    
    // Switch to player mode
    const playerButton = screen.getByRole('button', { name: /Player Mode/ });
    fireEvent.click(playerButton);
    
    // Selection should be cleared
    expect(store.getState().ui.selectedHex).toBeNull();
    expect(store.getState().ui.isPropertyDialogOpen).toBe(false);
  });
});