/**
 * Redux slice for undo/redo functionality
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { MapData } from '../../types';

interface HistoryState {
  past: MapData[];
  present: MapData | null;
  future: MapData[];
  maxHistorySize: number;
}

const initialState: HistoryState = {
  past: [],
  present: null,
  future: [],
  maxHistorySize: 50, // Limit history to prevent memory issues
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    // Save current state to history before making changes
    saveToHistory: (state, action: PayloadAction<MapData>) => {
      if (state.present) {
        // Add current state to past
        state.past.push(state.present);
        
        // Limit history size
        if (state.past.length > state.maxHistorySize) {
          state.past.shift();
        }
      }
      
      // Set new present state
      state.present = action.payload;
      
      // Clear future (new action invalidates redo history)
      state.future = [];
    },

    // Undo last action
    undo: (state) => {
      if (state.past.length === 0) return;
      
      const previous = state.past.pop()!;
      
      if (state.present) {
        state.future.unshift(state.present);
        
        // Limit future size
        if (state.future.length > state.maxHistorySize) {
          state.future.pop();
        }
      }
      
      state.present = previous;
    },

    // Redo next action
    redo: (state) => {
      if (state.future.length === 0) return;
      
      const next = state.future.shift()!;
      
      if (state.present) {
        state.past.push(state.present);
        
        // Limit past size
        if (state.past.length > state.maxHistorySize) {
          state.past.shift();
        }
      }
      
      state.present = next;
    },

    // Clear all history
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
    },

    // Initialize history with current map
    initializeHistory: (state, action: PayloadAction<MapData | null>) => {
      state.present = action.payload;
      state.past = [];
      state.future = [];
    },

    // Set maximum history size
    setMaxHistorySize: (state, action: PayloadAction<number>) => {
      state.maxHistorySize = Math.max(1, Math.min(100, action.payload));
      
      // Trim existing history if needed
      while (state.past.length > state.maxHistorySize) {
        state.past.shift();
      }
      while (state.future.length > state.maxHistorySize) {
        state.future.pop();
      }
    },
  },
});

export const historyActions = historySlice.actions;