/**
 * Redux store configuration and exports
 */

import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';

// Enable Immer MapSet plugin for Map and Set support
enableMapSet();
import { mapSlice } from './slices/mapSlice';
import { uiSlice } from './slices/uiSlice';
import { explorationSlice } from './slices/explorationSlice';
import { historySlice } from './slices/historySlice';
import { localStorageMiddleware } from './middleware/localStorage';

export const store = configureStore({
  reducer: {
    map: mapSlice.reducer,
    ui: uiSlice.reducer,
    exploration: explorationSlice.reducer,
    history: historySlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Map and Set objects in state - we handle serialization in middleware
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
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export action creators
export { mapActions } from './slices/mapSlice';
export { uiActions } from './slices/uiSlice';
export { explorationActions } from './slices/explorationSlice';
export { historyActions } from './slices/historySlice';

// Export selectors
export * from './selectors';

// Export hooks
export * from './hooks';

// Export initialization
export * from './initialization';