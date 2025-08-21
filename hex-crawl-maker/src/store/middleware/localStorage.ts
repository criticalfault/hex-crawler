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

// Data validation functions
const isValidMapData = (data: any): boolean => {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    data.dimensions &&
    typeof data.dimensions.width === 'number' &&
    typeof data.dimensions.height === 'number' &&
    Array.isArray(data.cells) &&
    Array.isArray(data.playerPositions) &&
    typeof data.sightDistance === 'number' &&
    typeof data.revealMode === 'string' &&
    data.appearance &&
    typeof data.appearance === 'object'
  );
};

const isValidExplorationData = (data: any): boolean => {
  return (
    data &&
    Array.isArray(data.exploredHexes) &&
    Array.isArray(data.visibleHexes) &&
    Array.isArray(data.explorationHistory)
  );
};

// Helper functions for Map serialization
const serializeMapData = (mapData: MapData): any => {
  try {
    return {
      ...mapData,
      cells: Array.from(mapData.cells.entries()).map(([key, cell]) => [key, cell]),
    };
  } catch (error) {
    console.warn('Failed to serialize map data:', error);
    return null;
  }
};

const deserializeMapData = (serializedData: any): MapData | null => {
  try {
    if (!isValidMapData(serializedData)) {
      console.warn('Invalid map data structure, skipping:', serializedData);
      return null;
    }

    return {
      ...serializedData,
      cells: new Map(serializedData.cells || []),
    };
  } catch (error) {
    console.warn('Failed to deserialize map data:', error);
    return null;
  }
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
      const serialized = serializeMapData(mapData);
      if (serialized) {
        serializedMaps[id] = serialized;
      }
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
      explorationHistory: exploration.explorationHistory || [],
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
        const deserializedMap = deserializeMapData(serializedData);
        if (deserializedMap) {
          maps[id] = deserializedMap;
        }
      });
      return maps;
    }
  } catch (error) {
    console.warn('Failed to load maps from localStorage, clearing corrupted data:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEYS.MAPS);
    } catch (clearError) {
      console.warn('Failed to clear corrupted map data:', clearError);
    }
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
      if (isValidExplorationData(data)) {
        return {
          exploredHexes: new Set(data.exploredHexes || []),
          visibleHexes: new Set(data.visibleHexes || []),
          explorationHistory: data.explorationHistory || [],
        };
      } else {
        console.warn('Invalid exploration data structure, using defaults');
      }
    }
  } catch (error) {
    console.warn('Failed to load exploration state from localStorage, clearing corrupted data:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEYS.EXPLORATION);
    } catch (clearError) {
      console.warn('Failed to clear corrupted exploration data:', clearError);
    }
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

// Auto-save functionality
let autoSaveTimeout: number | null = null;

const scheduleAutoSave = (state: any) => {
  // Clear existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  // Schedule auto-save after 2 seconds of inactivity
  autoSaveTimeout = setTimeout(() => {
    saveMapsToStorage(state.map.savedMaps);
    saveCurrentMapId(state.map.currentMap?.id || null);
    saveExplorationState(state.exploration);
  }, 2000);
};

// Middleware
export const localStorageMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  const state = store.getState();

  // Save state changes to localStorage based on action type
  if (action.type.startsWith('map/')) {
    // Immediate save for critical map operations
    if (action.type === 'map/createNewMap' || 
        action.type === 'map/deleteMap' || 
        action.type === 'map/loadMap') {
      saveMapsToStorage(state.map.savedMaps);
      saveCurrentMapId(state.map.currentMap?.id || null);
    } else {
      // Auto-save for other map changes
      scheduleAutoSave(state);
    }
  }

  if (action.type.startsWith('exploration/')) {
    // Auto-save exploration state changes
    scheduleAutoSave(state);
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