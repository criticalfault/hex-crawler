/**
 * Integration tests for Redux store with selectors
 */

import { describe, it, expect } from 'vitest';
import { createTestStore } from './testUtils';
import { mapActions, uiActions, explorationActions } from './index';
import { 
  selectCurrentMap, 
  selectCurrentMode, 
  selectIsHexExplored,
  selectHexVisibility,
  selectMapStats
} from './selectors';
import type { HexCoordinate } from '../types';

describe('Redux Store Integration', () => {
  it('should work with selectors for map operations', () => {
    const store = createTestStore();
    
    // Create a map
    store.dispatch(mapActions.createNewMap({
      name: 'Integration Test Map',
      dimensions: { width: 5, height: 5 }
    }));
    
    // Test selectors
    const state = store.getState();
    const currentMap = selectCurrentMap(state);
    
    expect(currentMap).toBeTruthy();
    expect(currentMap?.name).toBe('Integration Test Map');
    expect(currentMap?.dimensions).toEqual({ width: 5, height: 5 });
  });

  it('should work with mode switching and selectors', () => {
    const store = createTestStore();
    
    // Test initial mode
    let state = store.getState();
    expect(selectCurrentMode(state)).toBe('gm');
    
    // Switch to player mode
    store.dispatch(uiActions.setMode('player'));
    state = store.getState();
    expect(selectCurrentMode(state)).toBe('player');
  });

  it('should work with exploration and visibility selectors', () => {
    const store = createTestStore();
    const coordinate: HexCoordinate = { q: 0, r: 0 };
    
    // Initially not explored
    let state = store.getState();
    expect(selectIsHexExplored(coordinate)(state)).toBe(false);
    
    // Explore the hex
    store.dispatch(explorationActions.exploreHex(coordinate));
    state = store.getState();
    expect(selectIsHexExplored(coordinate)(state)).toBe(true);
  });

  it('should work with hex visibility logic in different modes', () => {
    const store = createTestStore();
    const coordinate: HexCoordinate = { q: 0, r: 0 };
    
    // Create a map first
    store.dispatch(mapActions.createNewMap({
      name: 'Test Map',
      dimensions: { width: 5, height: 5 }
    }));
    
    // In GM mode, everything should be visible
    store.dispatch(uiActions.setMode('gm'));
    let state = store.getState();
    let visibility = selectHexVisibility(coordinate)(state);
    expect(visibility.shouldShow).toBe(true);
    
    // In player mode, unexplored hexes should not be visible
    store.dispatch(uiActions.setMode('player'));
    state = store.getState();
    visibility = selectHexVisibility(coordinate)(state);
    expect(visibility.shouldShow).toBe(false);
    
    // After exploring, it should be visible in permanent mode
    store.dispatch(explorationActions.exploreHex(coordinate));
    state = store.getState();
    visibility = selectHexVisibility(coordinate)(state);
    expect(visibility.shouldShow).toBe(true);
  });

  it('should work with map statistics', () => {
    const store = createTestStore();
    
    // Create a map
    store.dispatch(mapActions.createNewMap({
      name: 'Stats Test Map',
      dimensions: { width: 3, height: 3 }
    }));
    
    // Place some icons to create cells
    store.dispatch(mapActions.placeIcon({
      coordinate: { q: 0, r: 0 },
      terrain: 'mountains'
    }));
    store.dispatch(mapActions.placeIcon({
      coordinate: { q: 1, r: 0 },
      terrain: 'plains'
    }));
    
    // Explore one hex
    store.dispatch(explorationActions.exploreHex({ q: 0, r: 0 }));
    
    const state = store.getState();
    const stats = selectMapStats(state);
    
    expect(stats.totalCells).toBe(2); // Two cells with icons
    expect(stats.exploredCells).toBe(1); // One explored
    expect(stats.explorationPercentage).toBe(50); // 50% explored
  });

  it('should handle complex state updates correctly', () => {
    const store = createTestStore();
    
    // Create map
    store.dispatch(mapActions.createNewMap({
      name: 'Complex Test',
      dimensions: { width: 10, height: 10 }
    }));
    
    // Place multiple icons
    const coordinates = [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: -1, r: 1 }
    ];
    
    coordinates.forEach((coord, index) => {
      store.dispatch(mapActions.placeIcon({
        coordinate: coord,
        terrain: index % 2 === 0 ? 'mountains' : 'plains',
        name: `Location ${index + 1}`
      }));
    });
    
    // Explore some hexes
    store.dispatch(explorationActions.exploreHexes([
      coordinates[0],
      coordinates[1]
    ]));
    
    // Set some as visible
    store.dispatch(explorationActions.setVisibleHexes([
      coordinates[0],
      coordinates[2]
    ]));
    
    // Update sight distance
    store.dispatch(mapActions.updateSightDistance(3));
    
    // Switch to line-of-sight mode
    store.dispatch(mapActions.updateRevealMode('lineOfSight'));
    
    const state = store.getState();
    const currentMap = selectCurrentMap(state);
    
    expect(currentMap?.cells.size).toBe(4);
    expect(currentMap?.sightDistance).toBe(3);
    expect(currentMap?.revealMode).toBe('lineOfSight');
    expect(state.exploration.exploredHexes.size).toBe(2);
    expect(state.exploration.visibleHexes.size).toBe(2);
  });
});