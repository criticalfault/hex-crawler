import { explorationSlice, explorationActions } from './explorationSlice';
import type { HexCoordinate } from '../../types';

describe('explorationSlice', () => {
  const initialState = {
    exploredHexes: new Set<string>(),
    visibleHexes: new Set<string>(),
    explorationHistory: [],
  };

  describe('exploration management', () => {
    it('should explore a single hex', () => {
      const coordinate: HexCoordinate = { q: 1, r: 2 };
      const action = explorationActions.exploreHex(coordinate);
      const state = explorationSlice.reducer(initialState, action);

      expect(state.exploredHexes.has('1,2')).toBe(true);
      expect(state.explorationHistory).toHaveLength(1);
      expect(state.explorationHistory[0].coordinate).toEqual(coordinate);
    });

    it('should explore multiple hexes', () => {
      const coordinates: HexCoordinate[] = [
        { q: 0, r: 0 },
        { q: 1, r: 1 },
        { q: 2, r: 2 },
      ];

      const action = explorationActions.exploreHexes(coordinates);
      const state = explorationSlice.reducer(initialState, action);

      expect(state.exploredHexes.has('0,0')).toBe(true);
      expect(state.exploredHexes.has('1,1')).toBe(true);
      expect(state.exploredHexes.has('2,2')).toBe(true);
      expect(state.explorationHistory).toHaveLength(3);
    });

    it('should not duplicate hexes when exploring multiple times', () => {
      const coordinate: HexCoordinate = { q: 1, r: 1 };
      
      // First exploration
      const firstAction = explorationActions.exploreHex(coordinate);
      const firstState = explorationSlice.reducer(initialState, firstAction);

      // Second exploration of same hex
      const secondAction = explorationActions.exploreHexes([coordinate]);
      const secondState = explorationSlice.reducer(firstState, secondAction);

      expect(secondState.exploredHexes.size).toBe(1);
      expect(secondState.explorationHistory).toHaveLength(1); // Should not add duplicate
    });

    it('should unexplore a hex', () => {
      const coordinate: HexCoordinate = { q: 1, r: 1 };
      
      // First explore the hex
      const exploreAction = explorationActions.exploreHex(coordinate);
      const exploredState = explorationSlice.reducer(initialState, exploreAction);

      // Then unexplore it
      const unexploreAction = explorationActions.unexploreHex(coordinate);
      const state = explorationSlice.reducer(exploredState, unexploreAction);

      expect(state.exploredHexes.has('1,1')).toBe(false);
      expect(state.explorationHistory).toHaveLength(0);
    });

    it('should reset all exploration', () => {
      const stateWithExploration = {
        exploredHexes: new Set(['0,0', '1,1']),
        visibleHexes: new Set(['0,0', '1,1', '2,2']),
        explorationHistory: [
          { timestamp: Date.now(), coordinate: { q: 0, r: 0 } },
          { timestamp: Date.now(), coordinate: { q: 1, r: 1 } },
        ],
      };

      const action = explorationActions.resetExploration();
      const state = explorationSlice.reducer(stateWithExploration, action);

      expect(state.exploredHexes.size).toBe(0);
      expect(state.visibleHexes.size).toBe(0);
      expect(state.explorationHistory).toHaveLength(0);
    });
  });

  describe('visibility management', () => {
    it('should set visible hexes', () => {
      const coordinates: HexCoordinate[] = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
      ];

      const action = explorationActions.setVisibleHexes(coordinates);
      const state = explorationSlice.reducer(initialState, action);

      expect(state.visibleHexes.has('0,0')).toBe(true);
      expect(state.visibleHexes.has('1,0')).toBe(true);
      expect(state.visibleHexes.has('0,1')).toBe(true);
      expect(state.visibleHexes.size).toBe(3);
    });

    it('should replace existing visible hexes when setting new ones', () => {
      const initialVisible = {
        ...initialState,
        visibleHexes: new Set(['5,5', '6,6']),
      };

      const newCoordinates: HexCoordinate[] = [
        { q: 0, r: 0 },
        { q: 1, r: 1 },
      ];

      const action = explorationActions.setVisibleHexes(newCoordinates);
      const state = explorationSlice.reducer(initialVisible, action);

      expect(state.visibleHexes.has('5,5')).toBe(false);
      expect(state.visibleHexes.has('6,6')).toBe(false);
      expect(state.visibleHexes.has('0,0')).toBe(true);
      expect(state.visibleHexes.has('1,1')).toBe(true);
      expect(state.visibleHexes.size).toBe(2);
    });

    it('should add visible hex', () => {
      const coordinate: HexCoordinate = { q: 3, r: 4 };
      const action = explorationActions.addVisibleHex(coordinate);
      const state = explorationSlice.reducer(initialState, action);

      expect(state.visibleHexes.has('3,4')).toBe(true);
    });

    it('should remove visible hex', () => {
      const stateWithVisible = {
        ...initialState,
        visibleHexes: new Set(['1,1', '2,2']),
      };

      const coordinate: HexCoordinate = { q: 1, r: 1 };
      const action = explorationActions.removeVisibleHex(coordinate);
      const state = explorationSlice.reducer(stateWithVisible, action);

      expect(state.visibleHexes.has('1,1')).toBe(false);
      expect(state.visibleHexes.has('2,2')).toBe(true);
    });

    it('should clear all visible hexes', () => {
      const stateWithVisible = {
        ...initialState,
        visibleHexes: new Set(['1,1', '2,2', '3,3']),
      };

      const action = explorationActions.clearVisibleHexes();
      const state = explorationSlice.reducer(stateWithVisible, action);

      expect(state.visibleHexes.size).toBe(0);
    });
  });

  describe('bulk operations', () => {
    it('should set complete exploration state', () => {
      const explorationData = {
        exploredHexes: ['0,0', '1,1', '2,2'],
        visibleHexes: ['0,0', '1,1'],
        explorationHistory: [
          { timestamp: 1234567890, coordinate: { q: 0, r: 0 } },
          { timestamp: 1234567891, coordinate: { q: 1, r: 1 } },
        ],
      };

      const action = explorationActions.setExplorationState(explorationData);
      const state = explorationSlice.reducer(initialState, action);

      expect(state.exploredHexes.has('0,0')).toBe(true);
      expect(state.exploredHexes.has('1,1')).toBe(true);
      expect(state.exploredHexes.has('2,2')).toBe(true);
      expect(state.visibleHexes.has('0,0')).toBe(true);
      expect(state.visibleHexes.has('1,1')).toBe(true);
      expect(state.visibleHexes.has('2,2')).toBe(false);
      expect(state.explorationHistory).toEqual(explorationData.explorationHistory);
    });
  });

  describe('player-specific exploration', () => {
    it('should explore hex as specific player', () => {
      const coordinate: HexCoordinate = { q: 2, r: 3 };
      const playerId = 'player-1';

      const action = explorationActions.exploreHexAsPlayer({ coordinate, playerId });
      const state = explorationSlice.reducer(initialState, action);

      expect(state.exploredHexes.has('2,3')).toBe(true);
      expect(state.explorationHistory).toHaveLength(1);
      expect(state.explorationHistory[0].playerId).toBe(playerId);
      expect(state.explorationHistory[0].coordinate).toEqual(coordinate);
    });
  });
});