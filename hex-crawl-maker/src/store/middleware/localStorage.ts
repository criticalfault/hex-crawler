/**
 * Redux middleware for localStorage persistence
 */

import type { UnknownAction } from '@reduxjs/toolkit';
import type { MapData } from '../../types';

// Storage keys
const STORAGE_KEYS = {
  MAPS: 'hex-crawl-maker-maps',
  CURRENT_MAP_ID: 'hex-crawl-maker-current-map-id',
  EXPLORATION: 'hex-crawl-maker-exploration',
  UI_PREFERENCES: 'hex-crawl-maker-ui-preferences',
} as const;

// Helper functions for Map serialization
const serializeMapData = (mapData: MapData): any => {
  return {
    ...mapData,
    cells: Array.from(mapData.cells.entries()).map(([key, cell]) => [key, cell]),
  };
};

const deserializeMapData = (serializedData: any): MapData => {
  return {
    ...serializedData,
    cells: new Map(serializedData.cells || []),
  };
};

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null;
  } catch (error) {
    return false;
  }
};

// Save functions
const saveMapsToStorage = (maps: { [id: string]: MapData }) => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const serializedMaps: { [id: string]: any } = {};
    Object.entries(maps).forEach(([id, mapData]) => {
      serializedMaps[id] = serializeMapData(mapData);
    });
    localStorage.setItem(STORAGE_KEYS.MAPS, JSON.stringify(serializedMaps));
  } catch (error) {
    console.warn('Failed to save maps to localStorage:', error);
  }
};

const saveCurrentMapId = (mapId: string | null) => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    if (mapId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MAP_ID, mapId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_MAP_ID);
    }
  } catch (error) {
    console.warn('Failed to save current map ID to localStorage:', error);
  }
};

const saveExplorationState = (exploration: any) => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const serializedExploration = {
      exploredHexes: Array.from(exploration.exploredHexes),
      visibleHexes: Array.from(exploration.visibleHexes),
      explorationHistory: exploration.explorationHistory,
    };
    localStorage.setItem(STORAGE_KEYS.EXPLORATION, JSON.stringify(serializedExploration));
  } catch (error) {
    console.warn('Failed to save exploration state to localStorage:', error);
  }
};

const saveUIPreferences = (ui: any) => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const preferences = {
      showCoordinates: ui.showCoordinates,
      zoom: ui.zoom,
      panOffset: ui.panOffset,
    };
    localStorage.setItem(STORAGE_KEYS.UI_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save UI preferences to localStorage:', error);
  }
};

// Load functions
export const loadMapsFromStorage = (): { [id: string]: MapData } => {
  if (!isLocalStorageAvailable()) return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MAPS);
    if (stored) {
      const serializedMaps = JSON.parse(stored);
      const maps: { [id: string]: MapData } = {};
      Object.entries(serializedMaps).forEach(([id, serializedData]) => {
        maps[id] = deserializeMapData(serializedData);
      });
      return maps;
    }
  } catch (error) {
    console.warn('Failed to load maps from localStorage:', error);
  }
  return {};
};

export const loadCurrentMapId = (): string | null => {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_MAP_ID);
  } catch (error) {
    console.warn('Failed to load current map ID from localStorage:', error);
    return null;
  }
};

export const loadExplorationState = () => {
  if (!isLocalStorageAvailable()) {
    return {
      exploredHexes: new Set(),
      visibleHexes: new Set(),
      explorationHistory: [],
    };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPLORATION);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        exploredHexes: new Set(data.exploredHexes || []),
        visibleHexes: new Set(data.visibleHexes || []),
        explorationHistory: data.explorationHistory || [],
      };
    }
  } catch (error) {
    console.warn('Failed to load exploration state from localStorage:', error);
  }
  return {
    exploredHexes: new Set(),
    visibleHexes: new Set(),
    explorationHistory: [],
  };
};

export const loadUIPreferences = () => {
  if (!isLocalStorageAvailable()) return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.UI_PREFERENCES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load UI preferences from localStorage:', error);
  }
  return {};
};

// Middleware
export const localStorageMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  const state = store.getState();

  // Save state changes to localStorage based on action type
  if (action.type.startsWith('map/')) {
    // Save maps when map state changes
    saveMapsToStorage(state.map.savedMaps);
    saveCurrentMapId(state.map.currentMap?.id || null);
  }

  if (action.type.startsWith('exploration/')) {
    // Save exploration state when exploration changes
    saveExplorationState(state.exploration);
  }

  if (action.type.startsWith('ui/') && (
    action.type.includes('Coordinates') ||
    action.type.includes('Zoom') ||
    action.type.includes('Pan')
  )) {
    // Save UI preferences for persistent settings
    saveUIPreferences(state.ui);
  }

  return result;
};

// Utility function to clear all stored data
export const clearAllStoredData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear stored data:', error);
  }
};

// Utility function to export all data
export const exportAllData = () => {
  try {
    const data = {
      maps: localStorage.getItem(STORAGE_KEYS.MAPS),
      currentMapId: localStorage.getItem(STORAGE_KEYS.CURRENT_MAP_ID),
      exploration: localStorage.getItem(STORAGE_KEYS.EXPLORATION),
      uiPreferences: localStorage.getItem(STORAGE_KEYS.UI_PREFERENCES),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.warn('Failed to export data:', error);
    return null;
  }
};

// Utility function to import all data
export const importAllData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.maps) localStorage.setItem(STORAGE_KEYS.MAPS, data.maps);
    if (data.currentMapId) localStorage.setItem(STORAGE_KEYS.CURRENT_MAP_ID, data.currentMapId);
    if (data.exploration) localStorage.setItem(STORAGE_KEYS.EXPLORATION, data.exploration);
    if (data.uiPreferences) localStorage.setItem(STORAGE_KEYS.UI_PREFERENCES, data.uiPreferences);
    
    return true;
  } catch (error) {
    console.warn('Failed to import data:', error);
    return false;
  }
};