/**
 * PlayerControls component tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PlayerControls } from './PlayerControls';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import type { HexCoordinate } from '../types';

// Mock store setup
const createMockStore = (initialState = {}) => {
  const defaultMap = {
    id: 'test-map',
    name: 'Test Map',
    dimensions: { width: 10, height: 10 },
    cells: new Map(),
    playerPositions: [] as HexCoordinate[],
    sightDistance: 2,
    revealMode: 'permanent' as const,
    appearance: {
      hexSize: 30,
      borderColor: '#333333',
      backgroundColor: '#f0f0f0',
      unexploredColor: '#cccccc',
      textSize: 12,
    },
  };

  const defaultState = {
    map: {
      currentMap: defaultMap,
      savedMaps: {
        'test-map': defaultMap,
      },
    },
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
    exploration: {
      exploredHexes: new Set(),
      visibleHexes: new Set(),
      explorationHistory: [],
    },
  };

  // Deep merge the initial state
  const mergedState = {
    ...defaultState,
    ...initialState,
    map: {
      ...defaultState.map,
      ...initialState.map,
    },
    ui: {
      ...defaultState.ui,
      ...initialState.ui,
    },
    exploration: {
      ...defaultState.exploration,
      ...initialState.exploration,
    },
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

const renderWithStore = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('PlayerControls', () => {
  it('renders player controls in player mode', () => {
    renderWithStore(<PlayerControls />);
    
    expect(screen.getByText('Player Controls')).toBeInTheDocument();
    expect(screen.getByText(/Sight Distance:/)).toBeInTheDocument();
    expect(screen.getByText('Reveal Mode:')).toBeInTheDocument();
    expect(screen.getByText(/Player Positions/)).toBeInTheDocument();
  });

  it('does not render in GM mode', () => {
    const store = createMockStore({
      ui: {
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
      },
    });

    const { container } = renderWithStore(<PlayerControls />, store);
    expect(container.firstChild).toBeNull();
  });

  it('displays current sight distance', () => {
    const testMap = {
      id: 'test-map',
      name: 'Test Map',
      dimensions: { width: 10, height: 10 },
      cells: new Map(),
      playerPositions: [],
      sightDistance: 3,
      revealMode: 'permanent' as const,
      appearance: {
        hexSize: 30,
        borderColor: '#333333',
        backgroundColor: '#f0f0f0',
        unexploredColor: '#cccccc',
        textSize: 12,
      },
    };

    const store = createMockStore({
      map: {
        currentMap: testMap,
        savedMaps: {
          'test-map': testMap,
        },
      },
    });

    renderWithStore(<PlayerControls />, store);
    expect(screen.getByText('Sight Distance: 3 hexes')).toBeInTheDocument();
  });

  it('updates sight distance when slider changes', () => {
    const testMap = {
      id: 'test-map',
      name: 'Test Map',
      dimensions: { width: 10, height: 10 },
      cells: new Map(),
      playerPositions: [] as HexCoordinate[],
      sightDistance: 2,
      revealMode: 'permanent' as const,
      appearance: {
        hexSize: 30,
        borderColor: '#333333',
        backgroundColor: '#f0f0f0',
        unexploredColor: '#cccccc',
        textSize: 12,
      },
    };

    const store = createMockStore({
      map: {
        currentMap: testMap,
        savedMaps: {
          'test-map': testMap,
        },
      },
    });

    renderWithStore(<PlayerControls />, store);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '4' } });
    
    // Check that the slider value changed (the component should update)
    expect(slider).toHaveValue('4');
  });

  it('displays reveal mode buttons', () => {
    renderWithStore(<PlayerControls />);
    
    expect(screen.getByText('Permanent')).toBeInTheDocument();
    expect(screen.getByText('Line of Sight')).toBeInTheDocument();
  });

  it('shows active reveal mode', () => {
    const testMap = {
      id: 'test-map',
      name: 'Test Map',
      dimensions: { width: 10, height: 10 },
      cells: new Map(),
      playerPositions: [],
      sightDistance: 2,
      revealMode: 'lineOfSight' as const,
      appearance: {
        hexSize: 30,
        borderColor: '#333333',
        backgroundColor: '#f0f0f0',
        unexploredColor: '#cccccc',
        textSize: 12,
      },
    };

    const store = createMockStore({
      map: {
        currentMap: testMap,
        savedMaps: {
          'test-map': testMap,
        },
      },
    });

    renderWithStore(<PlayerControls />, store);
    
    const lineOfSightButton = screen.getByText('Line of Sight');
    expect(lineOfSightButton).toHaveClass('active');
  });

  it('displays player positions when present', () => {
    const testMap = {
      id: 'test-map',
      name: 'Test Map',
      dimensions: { width: 10, height: 10 },
      cells: new Map(),
      playerPositions: [
        { q: 1, r: 2 },
        { q: 3, r: 4 },
      ],
      sightDistance: 2,
      revealMode: 'permanent' as const,
      appearance: {
        hexSize: 30,
        borderColor: '#333333',
        backgroundColor: '#f0f0f0',
        unexploredColor: '#cccccc',
        textSize: 12,
      },
    };

    const store = createMockStore({
      map: {
        currentMap: testMap,
        savedMaps: {
          'test-map': testMap,
        },
      },
    });

    renderWithStore(<PlayerControls />, store);
    
    expect(screen.getByText('Player Positions (2):')).toBeInTheDocument();
    expect(screen.getByText('Player 1: (1, 2)')).toBeInTheDocument();
    expect(screen.getByText('Player 2: (3, 4)')).toBeInTheDocument();
  });

  it('shows no players message when no players are present', () => {
    renderWithStore(<PlayerControls />);
    
    expect(screen.getByText('Player Positions (0):')).toBeInTheDocument();
    expect(screen.getByText('Click on the map to place players')).toBeInTheDocument();
  });

  it('displays instructions', () => {
    renderWithStore(<PlayerControls />);
    
    expect(screen.getByText('Instructions:')).toBeInTheDocument();
    expect(screen.getByText('Click on hexes to move players')).toBeInTheDocument();
    expect(screen.getByText('Adjust sight distance to control exploration range')).toBeInTheDocument();
    expect(screen.getByText('Toggle reveal mode to change visibility behavior')).toBeInTheDocument();
  });

  it('shows clear all button when players are present', () => {
    const testMap = {
      id: 'test-map',
      name: 'Test Map',
      dimensions: { width: 10, height: 10 },
      cells: new Map(),
      playerPositions: [{ q: 1, r: 2 }],
      sightDistance: 2,
      revealMode: 'permanent' as const,
      appearance: {
        hexSize: 30,
        borderColor: '#333333',
        backgroundColor: '#f0f0f0',
        unexploredColor: '#cccccc',
        textSize: 12,
      },
    };

    const store = createMockStore({
      map: {
        currentMap: testMap,
        savedMaps: {
          'test-map': testMap,
        },
      },
    });

    renderWithStore(<PlayerControls />, store);
    
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });
});