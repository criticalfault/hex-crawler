/**
 * Store initialization utilities
 */

import { store } from './index';
import { mapActions } from './slices/mapSlice';
import { loadMapsFromStorage, loadCurrentMapId, loadExplorationState, loadUIPreferences } from './middleware/localStorage';
import { explorationActions } from './slices/explorationSlice';
import { uiActions } from './slices/uiSlice';
import type { MapData } from '../types/hex';

/**
 * Initialize the store with data from localStorage or defaults
 */
export function initializeStore() {
  // Load saved maps from localStorage
  const savedMaps = loadMapsFromStorage();
  const currentMapId = loadCurrentMapId();
  const explorationState = loadExplorationState();
  const uiPreferences = loadUIPreferences();

  // Set saved maps in store
  if (Object.keys(savedMaps).length > 0) {
    Object.values(savedMaps).forEach(mapData => {
      store.dispatch(mapActions.setMapData(mapData));
    });

    // Load the current map if it exists
    if (currentMapId && savedMaps[currentMapId]) {
      store.dispatch(mapActions.loadMap(currentMapId));
    } else {
      // Load the first available map
      const firstMapId = Object.keys(savedMaps)[0];
      store.dispatch(mapActions.loadMap(firstMapId));
    }
  } else {
    // Create a default map if no saved maps exist
    const defaultMap: MapData = {
      id: crypto.randomUUID(),
      name: 'New Map',
      dimensions: { width: 20, height: 15 },
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
      }
    };
    
    store.dispatch(mapActions.setMapData(defaultMap));
  }

  // Load exploration state
  if (explorationState) {
    store.dispatch(explorationActions.setExplorationState(explorationState));
  }

  // Load UI preferences
  if (uiPreferences) {
    if (typeof uiPreferences.showCoordinates === 'boolean') {
      store.dispatch(uiActions.setShowCoordinates(uiPreferences.showCoordinates));
    }
    if (typeof uiPreferences.zoom === 'number') {
      store.dispatch(uiActions.setZoom(uiPreferences.zoom));
    }
    if (uiPreferences.panOffset) {
      store.dispatch(uiActions.setPanOffset(uiPreferences.panOffset));
    }
  }
}

/**
 * Reset store to initial state
 */
export function resetStore() {
  // This would reset all slices to their initial state
  // Implementation depends on specific requirements
}