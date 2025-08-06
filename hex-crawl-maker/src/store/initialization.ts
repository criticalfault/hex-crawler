/**
 * Store initialization utilities
 */

import { store } from './index';
import { mapActions } from './slices/mapSlice';
import type { MapData } from '../types/hex';

/**
 * Initialize the store with default data if needed
 */
export function initializeStore() {
  const state = store.getState();
  
  // If no current map exists, create a default one
  if (!state.map.currentMap) {
    const defaultMap: MapData = {
      id: 'default',
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
      }
    };
    
    store.dispatch(mapActions.setMapData(defaultMap));
  }
}

/**
 * Reset store to initial state
 */
export function resetStore() {
  // This would reset all slices to their initial state
  // Implementation depends on specific requirements
}