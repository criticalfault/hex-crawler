/**
 * Redux slice for map data management
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { MapData, HexCell, HexCoordinate, GridAppearance, RevealMode, TerrainType, LandmarkType, RoadType } from '../../types';

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
    sightColor: '#e6e6fa',
    textSize: 12,
    terrainColors: {
      mountains: '#8B4513',
      plains: '#90EE90',
      swamps: '#556B2F',
      water: '#4169E1',
      desert: '#F4A460',
      hills: '#65A330',
      shallowWater: '#87CEEB',
      deepWater: '#2563EB',
      oceanWater: '#1E3A8A',
    },
    roadColors: {
      path: '#8B4513',
      road: '#696969',
      highway: '#333333',
    },
    borderWidth: 1,
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
      road?: string;
      roadConnections?: ('north' | 'northeast' | 'southeast' | 'south' | 'southwest' | 'northwest')[];
      name?: string;
      description?: string;
      gmNotes?: string;
    }>) => {
      if (state.currentMap) {
        const { coordinate, terrain, landmark, road, roadConnections, name, description, gmNotes } = action.payload;
        const key = coordToKey(coordinate);
        
        const existingCell = state.currentMap.cells.get(key);
        const updatedCell: HexCell = {
          coordinate,
          terrain: terrain as TerrainType ?? existingCell?.terrain,
          landmark: landmark as LandmarkType ?? existingCell?.landmark,
          road: road as RoadType ?? existingCell?.road,
          roadConnections: roadConnections ?? existingCell?.roadConnections,
          name: name ?? existingCell?.name,
          description: description ?? existingCell?.description,
          gmNotes: gmNotes ?? existingCell?.gmNotes,
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

    // Road-specific actions
    placeRoad: (state, action: PayloadAction<{
      coordinate: HexCoordinate;
      roadType: RoadType;
      connections?: ('north' | 'northeast' | 'southeast' | 'south' | 'southwest' | 'northwest')[];
    }>) => {
      if (state.currentMap) {
        const { coordinate, roadType, connections = [] } = action.payload;
        const key = coordToKey(coordinate);
        
        const existingCell = state.currentMap.cells.get(key);
        const updatedCell: HexCell = {
          coordinate,
          terrain: existingCell?.terrain,
          landmark: existingCell?.landmark,
          road: roadType,
          roadConnections: connections,
          name: existingCell?.name,
          description: existingCell?.description,
          gmNotes: existingCell?.gmNotes,
          isExplored: existingCell?.isExplored || false,
          isVisible: existingCell?.isVisible || false,
        };

        state.currentMap.cells.set(key, updatedCell);
        state.savedMaps[state.currentMap.id].cells.set(key, updatedCell);
      }
    },

    removeRoad: (state, action: PayloadAction<HexCoordinate>) => {
      if (state.currentMap) {
        const key = coordToKey(action.payload);
        const existingCell = state.currentMap.cells.get(key);
        
        if (existingCell) {
          const updatedCell: HexCell = {
            ...existingCell,
            road: undefined,
            roadConnections: undefined,
          };
          
          state.currentMap.cells.set(key, updatedCell);
          state.savedMaps[state.currentMap.id].cells.set(key, updatedCell);
        }
      }
    },

    updateRoadConnections: (state, action: PayloadAction<{
      coordinate: HexCoordinate;
      connections: ('north' | 'northeast' | 'southeast' | 'south' | 'southwest' | 'northwest')[];
    }>) => {
      if (state.currentMap) {
        const { coordinate, connections } = action.payload;
        const key = coordToKey(coordinate);
        const existingCell = state.currentMap.cells.get(key);
        
        if (existingCell && existingCell.road) {
          const updatedCell: HexCell = {
            ...existingCell,
            roadConnections: connections,
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

    // Flood fill operations
    applyFloodFill: (state, action: PayloadAction<{
      hexes: HexCoordinate[];
      terrain?: string;
      landmark?: string;
      road?: string;
      clearExisting?: boolean;
    }>) => {
      if (state.currentMap) {
        const { hexes, terrain, landmark, road, clearExisting = false } = action.payload;
        
        for (const hex of hexes) {
          const key = coordToKey(hex);
          const existingCell = state.currentMap.cells.get(key);
          
          const updatedCell: HexCell = {
            coordinate: hex,
            terrain: clearExisting ? undefined : (terrain as TerrainType ?? existingCell?.terrain),
            landmark: clearExisting ? undefined : (landmark as LandmarkType ?? existingCell?.landmark),
            road: clearExisting ? undefined : (road as RoadType ?? existingCell?.road),
            roadConnections: clearExisting ? undefined : existingCell?.roadConnections,
            name: clearExisting ? undefined : existingCell?.name,
            description: clearExisting ? undefined : existingCell?.description,
            gmNotes: clearExisting ? undefined : existingCell?.gmNotes,
            isExplored: existingCell?.isExplored || false,
            isVisible: existingCell?.isVisible || false,
          };
          
          state.currentMap.cells.set(key, updatedCell);
          state.savedMaps[state.currentMap.id].cells.set(key, updatedCell);
        }
      }
    },

    // Copy/paste operations
    pastePattern: (state, action: PayloadAction<{
      targetPosition: HexCoordinate;
      pattern: Map<string, { terrain?: string; landmark?: string; road?: string; roadConnections?: ('north' | 'northeast' | 'southeast' | 'south' | 'southwest' | 'northwest')[]; name?: string; description?: string; gmNotes?: string }>;
      patternDimensions: { width: number; height: number };
      rotation?: number;
      mirror?: 'horizontal' | 'vertical' | 'both';
    }>) => {
      if (state.currentMap) {
        const { targetPosition, pattern, rotation = 0, mirror } = action.payload;
        
        for (const [relativeKey, cellData] of pattern.entries()) {
          const [relQ, relR] = relativeKey.split(',').map(Number);
          let finalQ = relQ;
          let finalR = relR;
          
          // Apply mirroring
          if (mirror === 'horizontal' || mirror === 'both') {
            finalQ = -finalQ;
          }
          if (mirror === 'vertical' || mirror === 'both') {
            finalR = -finalR;
          }
          
          // Apply rotation (60-degree increments for hex grid)
          const rotations = Math.floor(rotation / 60) % 6;
          for (let i = 0; i < rotations; i++) {
            const newQ = -finalR;
            const newR = finalQ + finalR;
            finalQ = newQ;
            finalR = newR;
          }
          
          const absoluteCoord: HexCoordinate = {
            q: targetPosition.q + finalQ,
            r: targetPosition.r + finalR,
          };
          
          // Check if the coordinate is within map bounds
          if (absoluteCoord.q >= 0 && absoluteCoord.q < state.currentMap.dimensions.width &&
              absoluteCoord.r >= 0 && absoluteCoord.r < state.currentMap.dimensions.height) {
            
            const key = coordToKey(absoluteCoord);
            const existingCell = state.currentMap.cells.get(key);
            
            const updatedCell: HexCell = {
              coordinate: absoluteCoord,
              terrain: cellData.terrain as TerrainType ?? existingCell?.terrain,
              landmark: cellData.landmark as LandmarkType ?? existingCell?.landmark,
              road: cellData.road as RoadType ?? existingCell?.road,
              roadConnections: cellData.roadConnections ?? existingCell?.roadConnections,
              name: cellData.name ?? existingCell?.name,
              description: cellData.description ?? existingCell?.description,
              gmNotes: cellData.gmNotes ?? existingCell?.gmNotes,
              isExplored: existingCell?.isExplored || false,
              isVisible: existingCell?.isVisible || false,
            };
            
            state.currentMap.cells.set(key, updatedCell);
            state.savedMaps[state.currentMap.id].cells.set(key, updatedCell);
          }
        }
      }
    },
  },
});

export const mapActions = mapSlice.actions;