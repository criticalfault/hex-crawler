/**
 * Tests for ProjectionControls component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import { ProjectionControls } from './ProjectionControls';
import { uiSlice } from '../store/slices/uiSlice';

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: uiSlice.reducer,
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
        ...initialState,
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

describe('ProjectionControls', () => {
  it('renders projection controls with default state', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <ProjectionControls />
      </Provider>
    );

    expect(screen.getByText('🎥 Projection & Streaming')).toBeInTheDocument();
    expect(screen.getByText('Projection Mode OFF')).toBeInTheDocument();
    expect(screen.getByText('🗖 Enter Fullscreen')).toBeInTheDocument();
  });

  it('shows projection settings when projection mode is enabled', () => {
    const store = createMockStore({ isProjectionMode: true });
    
    render(
      <Provider store={store}>
        <ProjectionControls />
      </Provider>
    );

    expect(screen.getByText('Projection Mode ON')).toBeInTheDocument();
    expect(screen.getByText('High Contrast Colors')).toBeInTheDocument();
    expect(screen.getByText('Large Text & Icons')).toBeInTheDocument();
    expect(screen.getByText('Simplified Interface')).toBeInTheDocument();
  });

  it('toggles projection mode when main toggle is clicked', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <ProjectionControls />
      </Provider>
    );

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    const state = store.getState();
    expect(state.ui.isProjectionMode).toBe(true);
  });

  it('updates projection settings when checkboxes are changed', () => {
    const store = createMockStore({ isProjectionMode: true });
    
    render(
      <Provider store={store}>
        <ProjectionControls />
      </Provider>
    );

    const highContrastCheckbox = screen.getByLabelText('High Contrast Colors');
    fireEvent.click(highContrastCheckbox);

    const state = store.getState();
    expect(state.ui.projectionSettings.highContrast).toBe(false);
  });

  it('displays keyboard shortcuts', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <ProjectionControls />
      </Provider>
    );

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('F11')).toBeInTheDocument();
    expect(screen.getByText('Toggle Fullscreen')).toBeInTheDocument();
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('Toggle Projection Mode')).toBeInTheDocument();
  });

  it('handles fullscreen toggle', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <ProjectionControls />
      </Provider>
    );

    const fullscreenButton = screen.getByText('🗖 Enter Fullscreen');
    fireEvent.click(fullscreenButton);

    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it('shows exit fullscreen when in fullscreen mode', () => {
    const store = createMockStore({ isFullscreen: true });
    
    render(
      <Provider store={store}>
        <ProjectionControls />
      </Provider>
    );

    expect(screen.getByText('🗗 Exit Fullscreen')).toBeInTheDocument();
  });
});