/**
 * Tests for ModeToggle component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ModeToggle } from './ModeToggle';
import { uiSlice } from '../store/slices/uiSlice';
import { mapSlice } from '../store/slices/mapSlice';
import { explorationSlice } from '../store/slices/explorationSlice';

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: uiSlice.reducer,
      map: mapSlice.reducer,
      exploration: explorationSlice.reducer,
    },
    preloadedState: initialState,
  });
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

describe('ModeToggle', () => {
  it('renders with GM mode active by default', () => {
    renderWithStore(<ModeToggle />);
    
    expect(screen.getByText('View Mode')).toBeInTheDocument();
    expect(screen.getByText('GM Mode')).toBeInTheDocument();
    expect(screen.getByText('Player Mode')).toBeInTheDocument();
    
    const gmButton = screen.getByRole('button', { name: /GM Mode/ });
    const playerButton = screen.getByRole('button', { name: /Player Mode/ });
    
    expect(gmButton).toHaveAttribute('aria-pressed', 'true');
    expect(playerButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders with player mode active when set in state', () => {
    const initialState = {
      ui: {
        currentMode: 'player' as const,
        selectedHex: null,
        isPropertyDialogOpen: false,
        isDragging: false,
        draggedIcon: null,
        showCoordinates: false,
        isFullscreen: false,
        showHelp: false,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
      },
    };

    renderWithStore(<ModeToggle />, initialState);
    
    const gmButton = screen.getByRole('button', { name: /GM Mode/ });
    const playerButton = screen.getByRole('button', { name: /Player Mode/ });
    
    expect(gmButton).toHaveAttribute('aria-pressed', 'false');
    expect(playerButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches to player mode when player button is clicked', () => {
    const { store } = renderWithStore(<ModeToggle />);
    
    const playerButton = screen.getByRole('button', { name: /Player Mode/ });
    fireEvent.click(playerButton);
    
    expect(store.getState().ui.currentMode).toBe('player');
  });

  it('switches to GM mode when GM button is clicked', () => {
    const initialState = {
      ui: {
        currentMode: 'player' as const,
        selectedHex: null,
        isPropertyDialogOpen: false,
        isDragging: false,
        draggedIcon: null,
        showCoordinates: false,
        isFullscreen: false,
        showHelp: false,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
      },
    };

    const { store } = renderWithStore(<ModeToggle />, initialState);
    
    const gmButton = screen.getByRole('button', { name: /GM Mode/ });
    fireEvent.click(gmButton);
    
    expect(store.getState().ui.currentMode).toBe('gm');
  });

  it('toggles mode when quick switch button is clicked', () => {
    const { store } = renderWithStore(<ModeToggle />);
    
    // Should start in GM mode
    expect(store.getState().ui.currentMode).toBe('gm');
    
    const quickSwitchButton = screen.getByRole('button', { name: /Quick Switch/ });
    fireEvent.click(quickSwitchButton);
    
    // Should switch to player mode
    expect(store.getState().ui.currentMode).toBe('player');
    
    fireEvent.click(quickSwitchButton);
    
    // Should switch back to GM mode
    expect(store.getState().ui.currentMode).toBe('gm');
  });

  it('displays correct description for GM mode', () => {
    renderWithStore(<ModeToggle />);
    
    expect(screen.getByText(/GM Mode:/)).toBeInTheDocument();
    expect(screen.getByText(/Full map visibility with editing controls/)).toBeInTheDocument();
  });

  it('displays correct description for player mode', () => {
    const initialState = {
      ui: {
        currentMode: 'player' as const,
        selectedHex: null,
        isPropertyDialogOpen: false,
        isDragging: false,
        draggedIcon: null,
        showCoordinates: false,
        isFullscreen: false,
        showHelp: false,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
      },
    };

    renderWithStore(<ModeToggle />, initialState);
    
    expect(screen.getByText(/Player Mode:/)).toBeInTheDocument();
    expect(screen.getByText(/Progressive exploration view/)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithStore(<ModeToggle />);
    
    const gmButton = screen.getByRole('button', { name: /GM Mode/ });
    const playerButton = screen.getByRole('button', { name: /Player Mode/ });
    const quickSwitchButton = screen.getByRole('button', { name: /Quick Switch/ });
    
    expect(gmButton).toHaveAttribute('title');
    expect(playerButton).toHaveAttribute('title');
    expect(quickSwitchButton).toHaveAttribute('title');
    
    expect(gmButton).toHaveAttribute('aria-pressed');
    expect(playerButton).toHaveAttribute('aria-pressed');
  });

  it('updates quick switch button title based on current mode', () => {
    const { store } = renderWithStore(<ModeToggle />);
    
    // In GM mode, should show "Switch to Player Mode"
    let quickSwitchButton = screen.getByRole('button', { name: /Quick Switch/ });
    expect(quickSwitchButton).toHaveAttribute('title', 'Switch to Player Mode');
    
    // Switch to player mode
    fireEvent.click(quickSwitchButton);
    
    // Should now show "Switch to GM Mode"
    quickSwitchButton = screen.getByRole('button', { name: /Quick Switch/ });
    expect(quickSwitchButton).toHaveAttribute('title', 'Switch to GM Mode');
  });
});