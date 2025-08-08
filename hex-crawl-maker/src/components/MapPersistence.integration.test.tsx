/**
 * Map Persistence Integration Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { vi } from 'vitest';
import { MapManager } from './MapManager';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import { localStorageMiddleware, loadMapsFromStorage, loadCurrentMapId, exportAllData, importAllData } from '../store/middleware/localStorage';
import { initializeStore } from '../store/initialization';
import type { MapData } from '../types';

// Enable Immer MapSet plugin
enableMapSet();

// Mock localStorage with actual implementation
const mockStorage: { [key: string]: string } = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const createTestStore = () => {
  return configureStore({
    reducer: {
      map: mapSlice.reducer,
      ui: uiSlice.reducer,
      exploration: explorationSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['map/setMapData', 'map/updateHexCell', 'map/placeIcon'],
          ignoredPaths: ['map.currentMap.cells', 'map.savedMaps'],
        },
      }).concat(localStorageMiddleware),
  });
};

describe('Map Persistence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear mock storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  it('saves and loads maps automatically', async () => {
    const store = createTestStore();

    // Create a new map
    store.dispatch({
      type: 'map/createNewMap',
      payload: { name: 'Test Map', dimensions: { width: 20, height: 15 } }
    });

    // Wait for auto-save
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hex-crawl-maker-maps',
        expect.any(String)
      );
    }, { timeout: 3000 });

    // Verify data was saved
    const savedMapsData = mockStorage['hex-crawl-maker-maps'];
    expect(savedMapsData).toBeTruthy();
    
    const parsedMaps = JSON.parse(savedMapsData);
    const mapIds = Object.keys(parsedMaps);
    expect(mapIds.length).toBe(1);
    expect(parsedMaps[mapIds[0]].name).toBe('Test Map');
  });

  it('loads saved maps on initialization', () => {
    // Pre-populate localStorage with map data
    const mockMapData = {
      'test-id': {
        id: 'test-id',
        name: 'Saved Map',
        dimensions: { width: 25, height: 20 },
        cells: [],
        playerPositions: [],
        sightDistance: 3,
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
    };

    mockStorage['hex-crawl-maker-maps'] = JSON.stringify(mockMapData);
    mockStorage['hex-crawl-maker-current-map-id'] = 'test-id';

    // Load maps from storage
    const loadedMaps = loadMapsFromStorage();
    const currentMapId = loadCurrentMapId();

    expect(Object.keys(loadedMaps)).toHaveLength(1);
    expect(loadedMaps['test-id'].name).toBe('Saved Map');
    expect(currentMapId).toBe('test-id');
  });

  it('handles corrupted map data gracefully', () => {
    // Set corrupted data in localStorage
    mockStorage['hex-crawl-maker-maps'] = 'invalid json';

    const loadedMaps = loadMapsFromStorage();
    expect(loadedMaps).toEqual({});
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hex-crawl-maker-maps');
  });

  it('exports and imports data correctly', () => {
    const store = createTestStore();

    // Create test data
    store.dispatch({
      type: 'map/createNewMap',
      payload: { name: 'Export Test Map', dimensions: { width: 15, height: 10 } }
    });

    // Export data
    const exportedData = exportAllData();
    expect(exportedData).toBeTruthy();

    // Clear storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

    // Import data
    const importSuccess = importAllData(exportedData!);
    expect(importSuccess).toBe(true);

    // Verify data was imported
    const importedMaps = loadMapsFromStorage();
    expect(Object.keys(importedMaps)).toHaveLength(1);
    expect(Object.values(importedMaps)[0].name).toBe('Export Test Map');
  });

  it('handles invalid import data', () => {
    const invalidData = 'not valid json';
    const importSuccess = importAllData(invalidData);
    expect(importSuccess).toBe(false);
  });

  it('persists exploration state', async () => {
    const store = createTestStore();

    // Add exploration data
    store.dispatch({
      type: 'exploration/exploreHex',
      payload: { q: 0, r: 0 }
    });

    // Wait for auto-save
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hex-crawl-maker-exploration',
        expect.any(String)
      );
    }, { timeout: 3000 });

    // Verify exploration data was saved
    const savedExplorationData = mockStorage['hex-crawl-maker-exploration'];
    expect(savedExplorationData).toBeTruthy();
    
    const parsedExploration = JSON.parse(savedExplorationData);
    expect(parsedExploration.exploredHexes).toContain('0,0');
  });

  it('auto-saves after map modifications', async () => {
    const store = createTestStore();

    // Create a map
    store.dispatch({
      type: 'map/createNewMap',
      payload: { name: 'Auto Save Test', dimensions: { width: 20, height: 15 } }
    });

    // Clear the mock to track new calls
    vi.clearAllMocks();

    // Modify the map
    store.dispatch({
      type: 'map/placeIcon',
      payload: {
        coordinate: { q: 0, r: 0 },
        terrain: 'mountains',
        name: 'Test Mountain',
      }
    });

    // Wait for auto-save (should happen after 2 seconds)
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hex-crawl-maker-maps',
        expect.any(String)
      );
    }, { timeout: 3000 });
  });

  it('immediately saves critical operations', () => {
    const store = createTestStore();

    // Create a map (should save immediately)
    store.dispatch({
      type: 'map/createNewMap',
      payload: { name: 'Immediate Save Test', dimensions: { width: 20, height: 15 } }
    });

    // Should have saved immediately, not after timeout
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'hex-crawl-maker-maps',
      expect.any(String)
    );
  });

  it('integrates with MapManager UI for full workflow', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <MapManager isOpen={true} onClose={vi.fn()} />
      </Provider>
    );

    // Create a new map through UI
    fireEvent.click(screen.getByText('New Map'));
    fireEvent.change(screen.getByLabelText('Map Name:'), {
      target: { value: 'UI Test Map' }
    });
    fireEvent.click(screen.getByText('Create Map'));

    // Wait for auto-save
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hex-crawl-maker-maps',
        expect.any(String)
      );
    }, { timeout: 3000 });

    // Verify the map appears in the saved maps list
    expect(screen.getByText('Saved Maps (1)')).toBeInTheDocument();
    expect(screen.getByText('UI Test Map')).toBeInTheDocument();

    // Save current map explicitly
    fireEvent.click(screen.getByText('Save Current Map'));

    // Should trigger another save
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
  });
});