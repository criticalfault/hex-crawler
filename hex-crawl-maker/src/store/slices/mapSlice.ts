/**
 * Redux slice for map data management
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { MapData, HexCell, HexCoordinate, GridAppearance, RevealMode, TerrainType, LandmarkType } from '../../types';

interface MapState {
  currentMap: MapData | null;
  savedMaps: { [id: string]: MapData };
}

const initialState: MapState = {
  currentMap: null,
  savedMaps: {},
};

// Helper function to create coordinate key
const coordToKey = (coord: HexCoordinate): string => `${coord.q},${coord.r}`;

// Helper function to create default map
const createDefaultMap = (name: string, dimensions: { width: number; height: number }): MapData => ({
  id: crypto.randomUUID(),
  name,
  dimensions,
  cells: new Map(),
  playerPositions: [],
  sightDistance: 2,
  revealMode: 'permanent' as RevealMode,
  appearance: {
    hexSize: 30,
    borderColor: '#333333',
    backgroundColor: '#f0f0f0',
    unexploredColor: '#cccccc',
    textSize: 12,
  },
});

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    // Map creation and management
    createNewMap: (state, action: PayloadAction<{ name: string; dimensions: { width: number; height: number } }>) => {
      const newMap = createDefaultMap(action.payload.name, action.payload.dimensions);
      state.currentMap = newMap;
      state.savedMaps[newMap.id] = newMap;
    },

    loadMap: (state, action: PayloadAction<string>) => {
      const mapId = action.payload;
      if (state.savedMaps[mapId]) {
        state.currentMap = state.savedMaps[mapId];
      }
    },

    saveCurrentMap: (state) => {
      if (state.currentMap) {
        state.savedMaps[state.currentMap.id] = { ...state.currentMap };
      }
    },

    deleteMap: (state, action: PayloadAction<string>) => {
      const mapId = action.payload;
      delete state.savedMaps[mapId];
      if (state.currentMap?.id === mapId) {
        state.currentMap = null;
      }
    },

    // Map data updates
    setMapData: (state, action: PayloadAction<MapData>) => {
      state.currentMap = action.payload;
      state.savedMaps[action.payload.id] = action.payload;
    },

    updateMapName: (state, action: PayloadAction<string>) => {
      if (state.currentMap) {
        state.currentMap.name = action.payload;
        state.savedMaps[state.currentMap.id].name = action.payload;
      }
    },

    updateMapDimensions: (state, action: PayloadAction<{ width: number; height: number }>) => {
      if (state.currentMap) {
        state.currentMap.dimensions = action.payload;
        state.savedMaps[state.currentMap.id].dimensions = action.payload;
      }
    },

    // Hex cell management
    updateHexCell: (state, action: PayloadAction<HexCell>) => {
      if (state.currentMap) {
        const key = coordToKey(action.payload.coordinate);
        state.currentMap.cells.set(key, action.payload);
        state.savedMaps[state.currentMap.id].cells.set(key, action.payload);
      }
    },

    placeIcon: (state, action: PayloadAction<{
      coordinate: HexCoordinate;
      terrain?: string;
      landmark?: string;
      name?: string;
      description?: string;
      gmNotes?: string;
    }>) => {
      if (state.currentMap) {
        const { coordinate, terrain, landmark, name, description, gmNotes } = action.payload;
        const key = coordToKey(coordinate);
        
        const existingCell = state.currentMap.cells.get(key);
        const updatedCell: HexCell = {
          coordinate,
          terrain: terrain as TerrainType,
          landmark: landmark as LandmarkType,
          name,
          description,
          gmNotes,
          isExplored: existingCell?.isExplored || false,
          isVisible: existingCell?.isVisible || false,
        };

        state.currentMap.cells.set(key, updatedCell);
        state.savedMaps[state.currentMap.id].cells.set(key, updatedCell);
      }
    },

    removeIcon: (state, action: PayloadAction<HexCoordinate>) => {
      if (state.currentMap) {
        const key = coordToKey(action.payload);
        const existingCell = state.currentMap.cells.get(key);
        
        if (existingCell) {
          const updatedCell: HexCell = {
            ...existingCell,
            terrain: undefined,
            landmark: undefined,
            name: undefined,
            description: undefined,
            gmNotes: undefined,
          };
          
          state.currentMap.cells.set(key, updatedCell);
          state.savedMaps[state.currentMap.id].cells.set(key, updatedCell);
        }
      }
    },

    // Player positioning
    updatePlayerPositions: (state, action: PayloadAction<HexCoordinate[]>) => {
      if (state.currentMap) {
        state.currentMap.playerPositions = action.payload;
        state.savedMaps[state.currentMap.id].playerPositions = action.payload;
      }
    },

    addPlayerPosition: (state, action: PayloadAction<HexCoordinate>) => {
      if (state.currentMap) {
        state.currentMap.playerPositions.push(action.payload);
        state.savedMaps[state.currentMap.id].playerPositions.push(action.payload);
      }
    },

    removePlayerPosition: (state, action: PayloadAction<number>) => {
      if (state.currentMap) {
        state.currentMap.playerPositions.splice(action.payload, 1);
        state.savedMaps[state.currentMap.id].playerPositions.splice(action.payload, 1);
      }
    },

    // Sight and reveal settings
    updateSightDistance: (state, action: PayloadAction<number>) => {
      if (state.currentMap) {
        state.currentMap.sightDistance = Math.max(1, Math.min(10, action.payload));
        state.savedMaps[state.currentMap.id].sightDistance = state.currentMap.sightDistance;
      }
    },

    updateRevealMode: (state, action: PayloadAction<RevealMode>) => {
      if (state.currentMap) {
        state.currentMap.revealMode = action.payload;
        state.savedMaps[state.currentMap.id].revealMode = action.payload;
      }
    },

    // Appearance settings
    updateAppearance: (state, action: PayloadAction<Partial<GridAppearance>>) => {
      if (state.currentMap) {
        state.currentMap.appearance = { ...state.currentMap.appearance, ...action.payload };
        state.savedMaps[state.currentMap.id].appearance = state.currentMap.appearance;
      }
    },
  },
});

export const mapActions = mapSlice.actions;