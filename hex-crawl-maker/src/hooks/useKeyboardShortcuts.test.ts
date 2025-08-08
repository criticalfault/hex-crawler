/**
 * Tests for useKeyboardShortcuts hook
 */

import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
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
        zoom: 1,
        panOffset: { x: 0, y: 0 },
        isProjectionMode: false,
        projectionSettings: {
          highContrast: true,
          largeText: true,
          simplifiedUI: true,
        },
        ...initialState.ui,
      },
      map: {
        currentMap: null,
        savedMaps: new Map(),
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

// Mock fullscreen API
Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

Object.defineProperty(document.documentElement, 'requestFullscreen', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

describe('useKeyboardShortcuts', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  const renderHookWithProvider = () => {
    return renderHook(() => useKeyboardShortcuts(), {
      wrapper: ({ children }: { children: React.ReactNode }) => 
        React.createElement(Provider, { store }, children),
    });
  };

  const fireKeyboardEvent = (key: string, options: Partial<KeyboardEventInit> = {}) => {
    const event = new KeyboardEvent('keydown', { key, ...options });
    document.dispatchEvent(event);
    return event;
  };

  it('toggles projection mode on P key', () => {
    renderHookWithProvider();
    
    fireKeyboardEvent('p');
    
    const state = store.getState();
    expect(state.ui.isProjectionMode).toBe(true);
  });

  it('toggles mode on M key', () => {
    renderHookWithProvider();
    
    fireKeyboardEvent('m');
    
    const state = store.getState();
    expect(state.ui.currentMode).toBe('player');
  });

  it('resets zoom on Space key', () => {
    store = createMockStore({
      ui: { zoom: 2, panOffset: { x: 100, y: 100 } }
    });
    renderHookWithProvider();
    
    fireKeyboardEvent(' ');
    
    const state = store.getState();
    expect(state.ui.zoom).toBe(1);
    expect(state.ui.panOffset).toEqual({ x: 0, y: 0 });
  });

  it('zooms in on + key', () => {
    renderHookWithProvider();
    
    fireKeyboardEvent('+');
    
    const state = store.getState();
    expect(state.ui.zoom).toBeGreaterThan(1);
  });

  it('zooms out on - key', () => {
    store = createMockStore({
      ui: { zoom: 2 }
    });
    renderHookWithProvider();
    
    fireKeyboardEvent('-');
    
    const state = store.getState();
    expect(state.ui.zoom).toBeLessThan(2);
  });

  it('closes dialogs on Escape key', () => {
    store = createMockStore({
      ui: { 
        isPropertyDialogOpen: true,
        isSettingsPanelOpen: true,
        isMapManagerOpen: true,
        selectedHex: { q: 0, r: 0 }
      }
    });
    renderHookWithProvider();
    
    fireKeyboardEvent('Escape');
    
    const state = store.getState();
    expect(state.ui.isPropertyDialogOpen).toBe(false);
    expect(state.ui.isSettingsPanelOpen).toBe(false);
    expect(state.ui.isMapManagerOpen).toBe(false);
    expect(state.ui.selectedHex).toBe(null);
  });

  it('toggles settings on S key in GM mode', () => {
    renderHookWithProvider();
    
    fireKeyboardEvent('s');
    
    const state = store.getState();
    expect(state.ui.isSettingsPanelOpen).toBe(true);
  });

  it('does not toggle settings on S key in player mode', () => {
    store = createMockStore({
      ui: { currentMode: 'player' }
    });
    renderHookWithProvider();
    
    fireKeyboardEvent('s');
    
    const state = store.getState();
    expect(state.ui.isSettingsPanelOpen).toBe(false);
  });

  it('toggles help on H key', () => {
    renderHookWithProvider();
    
    fireKeyboardEvent('h');
    
    const state = store.getState();
    expect(state.ui.showHelp).toBe(true);
  });

  it('toggles coordinates on C key in GM mode', () => {
    renderHookWithProvider();
    
    fireKeyboardEvent('c');
    
    const state = store.getState();
    expect(state.ui.showCoordinates).toBe(true);
  });

  it('pans map with arrow keys', () => {
    renderHookWithProvider();
    
    fireKeyboardEvent('ArrowUp');
    
    const state = store.getState();
    expect(state.ui.panOffset.y).toBe(20);
  });

  it('pans map with WASD keys', () => {
    renderHookWithProvider();
    
    fireKeyboardEvent('w');
    
    const state = store.getState();
    expect(state.ui.panOffset.y).toBe(20);
  });

  it('ignores shortcuts when typing in inputs', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    renderHookWithProvider();
    
    const event = new KeyboardEvent('keydown', { key: 'p' });
    Object.defineProperty(event, 'target', { value: input });
    document.dispatchEvent(event);
    
    const state = store.getState();
    expect(state.ui.isProjectionMode).toBe(false);
    
    document.body.removeChild(input);
  });

  it('handles fullscreen change events', () => {
    renderHookWithProvider();
    
    // Simulate entering fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
    });
    
    const event = new Event('fullscreenchange');
    document.dispatchEvent(event);
    
    const state = store.getState();
    expect(state.ui.isFullscreen).toBe(true);
  });
});