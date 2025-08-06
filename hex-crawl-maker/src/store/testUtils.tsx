/**
 * Test utilities for Redux store testing
 */

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { mapSlice } from './slices/mapSlice';
import { uiSlice } from './slices/uiSlice';
import { explorationSlice } from './slices/explorationSlice';

// Enable Immer MapSet plugin for tests
enableMapSet();

/**
 * Create a test store with optional preloaded state
 */
export const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      map: mapSlice.reducer,
      ui: uiSlice.reducer,
      exploration: explorationSlice.reducer,
    },
    preloadedState,
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

/**
 * Test wrapper component that provides Redux store
 */
export const TestProvider: React.FC<{ 
  children: React.ReactNode; 
  store?: ReturnType<typeof createTestStore>;
}> = ({ children, store = createTestStore() }) => {
  return <Provider store={store}>{children}</Provider>;
};