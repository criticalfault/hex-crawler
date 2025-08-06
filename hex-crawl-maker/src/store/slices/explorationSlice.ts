/**
 * Redux slice for exploration state management
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { HexCoordinate } from '../../types';

interface ExplorationState {
  exploredHexes: Set<string>; // coordinate keys "q,r"
  visibleHexes: Set<string>; // currently visible hexes in player mode
  explorationHistory: {
    timestamp: number;
    coordinate: HexCoordinate;
    playerId?: string;
  }[];
}

const initialState: ExplorationState = {
  exploredHexes: new Set(),
  visibleHexes: new Set(),
  explorationHistory: [],
};

// Helper function to create coordinate key
const coordToKey = (coord: HexCoordinate): string => `${coord.q},${coord.r}`;

export const explorationSlice = createSlice({
  name: 'exploration',
  initialState,
  reducers: {
    // Exploration management
    exploreHex: (state, action: PayloadAction<HexCoordinate>) => {
      const key = coordToKey(action.payload);
      state.exploredHexes.add(key);
      state.explorationHistory.push({
        timestamp: Date.now(),
        coordinate: action.payload,
      });
    },

    exploreHexes: (state, action: PayloadAction<HexCoordinate[]>) => {
      const timestamp = Date.now();
      action.payload.forEach(coord => {
        const key = coordToKey(coord);
        if (!state.exploredHexes.has(key)) {
          state.exploredHexes.add(key);
          state.explorationHistory.push({
            timestamp,
            coordinate: coord,
          });
        }
      });
    },

    unexploreHex: (state, action: PayloadAction<HexCoordinate>) => {
      const key = coordToKey(action.payload);
      state.exploredHexes.delete(key);
      // Remove from history
      state.explorationHistory = state.explorationHistory.filter(
        entry => coordToKey(entry.coordinate) !== key
      );
    },

    resetExploration: (state) => {
      state.exploredHexes.clear();
      state.visibleHexes.clear();
      state.explorationHistory = [];
    },

    // Visibility management (for line-of-sight mode)
    setVisibleHexes: (state, action: PayloadAction<HexCoordinate[]>) => {
      state.visibleHexes.clear();
      action.payload.forEach(coord => {
        state.visibleHexes.add(coordToKey(coord));
      });
    },

    addVisibleHex: (state, action: PayloadAction<HexCoordinate>) => {
      state.visibleHexes.add(coordToKey(action.payload));
    },

    removeVisibleHex: (state, action: PayloadAction<HexCoordinate>) => {
      state.visibleHexes.delete(coordToKey(action.payload));
    },

    clearVisibleHexes: (state) => {
      state.visibleHexes.clear();
    },

    // Bulk operations
    setExplorationState: (state, action: PayloadAction<{
      exploredHexes: string[];
      visibleHexes: string[];
      explorationHistory: ExplorationState['explorationHistory'];
    }>) => {
      state.exploredHexes = new Set(action.payload.exploredHexes);
      state.visibleHexes = new Set(action.payload.visibleHexes);
      state.explorationHistory = action.payload.explorationHistory;
    },

    // Player-specific exploration (for future multi-player support)
    exploreHexAsPlayer: (state, action: PayloadAction<{
      coordinate: HexCoordinate;
      playerId: string;
    }>) => {
      const key = coordToKey(action.payload.coordinate);
      state.exploredHexes.add(key);
      state.explorationHistory.push({
        timestamp: Date.now(),
        coordinate: action.payload.coordinate,
        playerId: action.payload.playerId,
      });
    },

    // Utility actions
    isHexExplored: (_state, _action: PayloadAction<HexCoordinate>) => {
      // This is a query action - the result would be used in selectors
      // We don't modify state here, just provide the action for consistency
    },

    isHexVisible: (_state, _action: PayloadAction<HexCoordinate>) => {
      // This is a query action - the result would be used in selectors
      // We don't modify state here, just provide the action for consistency
    },
  },
});

export const explorationActions = explorationSlice.actions;