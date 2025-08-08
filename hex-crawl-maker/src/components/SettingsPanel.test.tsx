/**
 * Tests for SettingsPanel component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SettingsPanel } from './SettingsPanel';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import type { MapData } from '../types';

// Create a test store with initial data
const createTestStore = (initialMap?: Partial<MapData>) => {
  const defaultMap: MapData = {
    id: 'test-map',
    name: 'Test Map',
    dimensions: { width: 10, height: 8 },
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
    ...initialMap,
  };

  return configureStore({
    reducer: {
      map: mapSlice.reducer,
      ui: uiSlice.reducer,
      exploration: explorationSlice.reducer,
    },
    preloadedState: {
      map: {
        currentMap: defaultMap,
        savedMaps: { [defaultMap.id]: defaultMap },
      },
      ui: {
        currentMode: 'gm',
        selectedHex: null,
        isPropertyDialogOpen: false,
        isSettingsPanelOpen: true,
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
    },
  });
};

const renderWithStore = (store: ReturnType<typeof createTestStore>) => {
  const mockOnClose = vi.fn();
  
  return {
    ...render(
      <Provider store={store}>
        <SettingsPanel isOpen={true} onClose={mockOnClose} />
      </Provider>
    ),
    mockOnClose,
    store,
  };
};

describe('SettingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    const store = createTestStore();
    renderWithStore(store);
    
    expect(screen.getByText('Map Settings')).toBeInTheDocument();
    expect(screen.getByText('Grid')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Terrain')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const store = createTestStore();
    const mockOnClose = vi.fn();
    
    render(
      <Provider store={store}>
        <SettingsPanel isOpen={false} onClose={mockOnClose} />
      </Provider>
    );
    
    expect(screen.queryByText('Map Settings')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const store = createTestStore();
    const { mockOnClose } = renderWithStore(store);
    
    const closeButton = screen.getByLabelText('Close settings');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    const store = createTestStore();
    const { mockOnClose } = renderWithStore(store);
    
    const overlay = screen.getByText('Map Settings').closest('.settings-panel-overlay');
    fireEvent.click(overlay!);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when panel content is clicked', () => {
    const store = createTestStore();
    const { mockOnClose } = renderWithStore(store);
    
    const panel = screen.getByText('Map Settings').closest('.settings-panel');
    fireEvent.click(panel!);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  describe('Grid tab', () => {
    it('displays current grid dimensions', () => {
      const store = createTestStore();
      renderWithStore(store);
      
      expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // width
      expect(screen.getByDisplayValue('8')).toBeInTheDocument(); // height
    });

    it('updates grid width when input changes', async () => {
      const store = createTestStore();
      renderWithStore(store);
      
      const widthInput = screen.getByLabelText('Width (hexes):');
      fireEvent.change(widthInput, { target: { value: '15' } });
      
      await waitFor(() => {
        const state = store.getState();
        expect(state.map.currentMap?.dimensions.width).toBe(15);
      });
    });

    it('updates grid height when input changes', async () => {
      const store = createTestStore();
      renderWithStore(store);
      
      const heightInput = screen.getByLabelText('Height (hexes):');
      fireEvent.change(heightInput, { target: { value: '12' } });
      
      await waitFor(() => {
        const state = store.getState();
        expect(state.map.currentMap?.dimensions.height).toBe(12);
      });
    });

    it('updates hex size when slider changes', async () => {
      const store = createTestStore();
      renderWithStore(store);
      
      const hexSizeSlider = screen.getByLabelText('Size (pixels):');
      fireEvent.change(hexSizeSlider, { target: { value: '45' } });
      
      await waitFor(() => {
        const state = store.getState();
        expect(state.map.currentMap?.appearance.hexSize).toBe(45);
      });
    });
  });

  describe('Appearance tab', () => {
    it('switches to appearance tab when clicked', () => {
      const store = createTestStore();
      renderWithStore(store);
      
      const appearanceTab = screen.getByText('Appearance');
      fireEvent.click(appearanceTab);
      
      expect(screen.getByText('Colors')).toBeInTheDocument();
      expect(screen.getByText('Border Style')).toBeInTheDocument();
      expect(screen.getByText('Text Display')).toBeInTheDocument();
    });

    it('updates background color when color input changes', async () => {
      const store = createTestStore();
      renderWithStore(store);
      
      const appearanceTab = screen.getByText('Appearance');
      fireEvent.click(appearanceTab);
      
      const bgColorInput = screen.getByLabelText('Background:');
      fireEvent.change(bgColorInput, { target: { value: '#ff0000' } });
      
      await waitFor(() => {
        const state = store.getState();
        expect(state.map.currentMap?.appearance.backgroundColor).toBe('#ff0000');
      });
    });

    it('updates text size when slider changes', async () => {
      const store = createTestStore();
      renderWithStore(store);
      
      const appearanceTab = screen.getByText('Appearance');
      fireEvent.click(appearanceTab);
      
      const textSizeSlider = screen.getByLabelText('Font Size:');
      fireEvent.change(textSizeSlider, { target: { value: '16' } });
      
      await waitFor(() => {
        const state = store.getState();
        expect(state.map.currentMap?.appearance.textSize).toBe(16);
      });
    });
  });

  describe('Terrain tab', () => {
    it('switches to terrain tab when clicked', () => {
      const store = createTestStore();
      renderWithStore(store);
      
      const terrainTab = screen.getByText('Terrain');
      fireEvent.click(terrainTab);
      
      expect(screen.getByText('Terrain Colors')).toBeInTheDocument();
      expect(screen.getByText('🏔️ Mountains:')).toBeInTheDocument();
      expect(screen.getByText('🌾 Plains:')).toBeInTheDocument();
      expect(screen.getByText('🌿 Swamps:')).toBeInTheDocument();
      expect(screen.getByText('🌊 Water:')).toBeInTheDocument();
      expect(screen.getByText('🏜️ Desert:')).toBeInTheDocument();
    });

    it('updates terrain color when color input changes', async () => {
      const store = createTestStore();
      renderWithStore(store);
      
      const terrainTab = screen.getByText('Terrain');
      fireEvent.click(terrainTab);
      
      const mountainsColorInput = screen.getByLabelText('🏔️ Mountains:');
      fireEvent.change(mountainsColorInput, { target: { value: '#ff0000' } });
      
      await waitFor(() => {
        const state = store.getState();
        expect(state.map.currentMap?.appearance.terrainColors.mountains).toBe('#ff0000');
      });
    });
  });

  describe('Reset functionality', () => {
    it('resets all settings to defaults when reset button is clicked', async () => {
      const store = createTestStore({
        appearance: {
          hexSize: 50,
          borderColor: '#ff0000',
          backgroundColor: '#00ff00',
          unexploredColor: '#0000ff',
          textSize: 20,
          terrainColors: {
            mountains: '#ff0000',
            plains: '#00ff00',
            swamps: '#0000ff',
            water: '#ffff00',
            desert: '#ff00ff',
          },
          borderWidth: 3,
        },
      });
      renderWithStore(store);
      
      const resetButton = screen.getByText('Reset to Defaults');
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        const state = store.getState();
        const appearance = state.map.currentMap?.appearance;
        expect(appearance?.hexSize).toBe(30);
        expect(appearance?.borderColor).toBe('#333333');
        expect(appearance?.backgroundColor).toBe('#f0f0f0');
        expect(appearance?.terrainColors.mountains).toBe('#8B4513');
      });
    });
  });
});