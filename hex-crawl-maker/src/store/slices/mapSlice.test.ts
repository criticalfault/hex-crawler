import { mapSlice, mapActions } from './mapSlice';
import type { MapData, HexCoordinate } from '../../types';

describe('mapSlice', () => {
  const initialState = {
    currentMap: null,
    savedMaps: {},
  };

  const mockMapData: MapData = {
    id: 'test-map-1',
    name: 'Test Map',
    dimensions: { width: 10, height: 10 },
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
    },
  };

  describe('createNewMap', () => {
    it('should create a new map with default settings', () => {
      const action = mapActions.createNewMap({
        name: 'New Map',
        dimensions: { width: 15, height: 15 },
      });

      const state = mapSlice.reducer(initialState, action);

      expect(state.currentMap).toBeTruthy();
      expect(state.currentMap?.name).toBe('New Map');
      expect(state.currentMap?.dimensions).toEqual({ width: 15, height: 15 });
      expect(state.currentMap?.sightDistance).toBe(2);
      expect(state.currentMap?.revealMode).toBe('permanent');
      expect(state.savedMaps[state.currentMap!.id]).toBeTruthy();
    });
  });

  describe('loadMap', () => {
    it('should load an existing map', () => {
      const stateWithMap = {
        currentMap: null,
        savedMaps: { 'test-map-1': mockMapData },
      };

      const action = mapActions.loadMap('test-map-1');
      const state = mapSlice.reducer(stateWithMap, action);

      expect(state.currentMap).toEqual(mockMapData);
    });

    it('should not change state when loading non-existent map', () => {
      const action = mapActions.loadMap('non-existent');
      const state = mapSlice.reducer(initialState, action);

      expect(state.currentMap).toBeNull();
    });
  });

  describe('placeIcon', () => {
    it('should place terrain icon on hex', () => {
      const stateWithMap = {
        currentMap: mockMapData,
        savedMaps: { 'test-map-1': mockMapData },
      };

      const coordinate: HexCoordinate = { q: 0, r: 0 };
      const action = mapActions.placeIcon({
        coordinate,
        terrain: 'mountains',
        name: 'Test Mountain',
      });

      const state = mapSlice.reducer(stateWithMap, action);
      const placedCell = state.currentMap?.cells.get('0,0');

      expect(placedCell).toBeTruthy();
      expect(placedCell?.terrain).toBe('mountains');
      expect(placedCell?.name).toBe('Test Mountain');
      expect(placedCell?.coordinate).toEqual(coordinate);
    });

    it('should preserve exploration state when placing icons', () => {
      const stateWithMap = {
        currentMap: {
          ...mockMapData,
          cells: new Map([
            ['1,1', {
              coordinate: { q: 1, r: 1 },
              isExplored: true,
              isVisible: true,
            }],
          ]),
        },
        savedMaps: { 'test-map-1': mockMapData },
      };

      const action = mapActions.placeIcon({
        coordinate: { q: 1, r: 1 },
        terrain: 'plains',
      });

      const state = mapSlice.reducer(stateWithMap, action);
      const updatedCell = state.currentMap?.cells.get('1,1');

      expect(updatedCell?.isExplored).toBe(true);
      expect(updatedCell?.isVisible).toBe(true);
      expect(updatedCell?.terrain).toBe('plains');
    });
  });

  describe('updateSightDistance', () => {
    it('should update sight distance within valid range', () => {
      const stateWithMap = {
        currentMap: mockMapData,
        savedMaps: { 'test-map-1': mockMapData },
      };

      const action = mapActions.updateSightDistance(5);
      const state = mapSlice.reducer(stateWithMap, action);

      expect(state.currentMap?.sightDistance).toBe(5);
    });

    it('should clamp sight distance to minimum value', () => {
      const stateWithMap = {
        currentMap: mockMapData,
        savedMaps: { 'test-map-1': mockMapData },
      };

      const action = mapActions.updateSightDistance(-1);
      const state = mapSlice.reducer(stateWithMap, action);

      expect(state.currentMap?.sightDistance).toBe(1);
    });

    it('should clamp sight distance to maximum value', () => {
      const stateWithMap = {
        currentMap: mockMapData,
        savedMaps: { 'test-map-1': mockMapData },
      };

      const action = mapActions.updateSightDistance(15);
      const state = mapSlice.reducer(stateWithMap, action);

      expect(state.currentMap?.sightDistance).toBe(10);
    });
  });

  describe('updatePlayerPositions', () => {
    it('should update player positions', () => {
      const stateWithMap = {
        currentMap: mockMapData,
        savedMaps: { 'test-map-1': mockMapData },
      };

      const positions: HexCoordinate[] = [
        { q: 0, r: 0 },
        { q: 1, r: 1 },
      ];

      const action = mapActions.updatePlayerPositions(positions);
      const state = mapSlice.reducer(stateWithMap, action);

      expect(state.currentMap?.playerPositions).toEqual(positions);
    });
  });

  describe('updateAppearance', () => {
    it('should update appearance settings', () => {
      const stateWithMap = {
        currentMap: mockMapData,
        savedMaps: { 'test-map-1': mockMapData },
      };

      const newAppearance = {
        hexSize: 40,
        borderColor: '#ff0000',
      };

      const action = mapActions.updateAppearance(newAppearance);
      const state = mapSlice.reducer(stateWithMap, action);

      expect(state.currentMap?.appearance.hexSize).toBe(40);
      expect(state.currentMap?.appearance.borderColor).toBe('#ff0000');
      // Should preserve other appearance settings
      expect(state.currentMap?.appearance.backgroundColor).toBe('#f0f0f0');
    });
  });

  describe('deleteMap', () => {
    it('should delete map from saved maps', () => {
      const stateWithMap = {
        currentMap: mockMapData,
        savedMaps: { 'test-map-1': mockMapData },
      };

      const action = mapActions.deleteMap('test-map-1');
      const state = mapSlice.reducer(stateWithMap, action);

      expect(state.savedMaps['test-map-1']).toBeUndefined();
      expect(state.currentMap).toBeNull();
    });

    it('should not affect current map if deleting different map', () => {
      const otherMap = { ...mockMapData, id: 'other-map' };
      const stateWithMaps = {
        currentMap: mockMapData,
        savedMaps: { 
          'test-map-1': mockMapData,
          'other-map': otherMap,
        },
      };

      const action = mapActions.deleteMap('other-map');
      const state = mapSlice.reducer(stateWithMaps, action);

      expect(state.savedMaps['other-map']).toBeUndefined();
      expect(state.currentMap).toEqual(mockMapData);
    });
  });
});