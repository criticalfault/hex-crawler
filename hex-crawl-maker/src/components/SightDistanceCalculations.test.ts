/**
 * Tests for sight distance calculations and hex visibility logic
 * Task 11: Implement sight distance and exploration mechanics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import { selectHexVisibility } from '../store/selectors';
import { hexesInRange, hexDistance } from '../utils/hexCoordinates';
import type { HexCoordinate } from '../types/hex';

// Mock store setup
const createMockStore = (initialState = {}) => {
  const defaultMap = {
    id: 'test-map',
    name: 'Test Map',
    dimensions: { width: 10, height: 10 },
    cells: new Map(),
    playerPositions: [] as HexCoordinate[],
    sightDistance: 2,
    revealMode: 'permanent' as const,
    appearance: {
      hexSize: 30,
      borderColor: '#333333',
      backgroundColor: '#f0f0f0',
      unexploredColor: '#cccccc',
      textSize: 12,
    },
  };

  const defaultState = {
    map: {
      currentMap: defaultMap,
      savedMaps: {
        'test-map': defaultMap,
      },
    },
    ui: {
      currentMode: 'player' as const,
      selectedHex: null,
      isPropertyDialogOpen: false,
      isDragging: false,
      draggedIcon: null,
      showCoordinates: false,
      isFullscreen: false,
      showHelp: false,
      zoom: 1,
      panOffset: { x: 0, y: 0 },
    },
    exploration: {
      exploredHexes: new Set(),
      visibleHexes: new Set(),
      explorationHistory: [],
    },
  };

  // Deep merge the initial state
  const mergedState = {
    ...defaultState,
    ...initialState,
    map: {
      ...defaultState.map,
      ...initialState.map,
    },
    ui: {
      ...defaultState.ui,
      ...initialState.ui,
    },
    exploration: {
      ...defaultState.exploration,
      ...initialState.exploration,
    },
  };

  return configureStore({
    reducer: {
      map: mapSlice.reducer,
      ui: uiSlice.reducer,
      exploration: explorationSlice.reducer,
    },
    preloadedState: mergedState,
  });
};

describe('Sight Distance Calculations', () => {
  describe('hexesInRange function', () => {
    it('should calculate correct number of hexes for sight distance 1', () => {
      const center: HexCoordinate = { q: 0, r: 0 };
      const hexes = hexesInRange(center, 1);
      
      // Sight distance 1 should include center + 6 neighbors = 7 hexes
      expect(hexes).toHaveLength(7);
      
      // All hexes should be within distance 1
      hexes.forEach(hex => {
        expect(hexDistance(center, hex)).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate correct number of hexes for sight distance 2', () => {
      const center: HexCoordinate = { q: 0, r: 0 };
      const hexes = hexesInRange(center, 2);
      
      // Sight distance 2 should include 19 hexes (1 + 6 + 12)
      expect(hexes).toHaveLength(19);
      
      // All hexes should be within distance 2
      hexes.forEach(hex => {
        expect(hexDistance(center, hex)).toBeLessThanOrEqual(2);
      });
    });

    it('should calculate correct number of hexes for sight distance 3', () => {
      const center: HexCoordinate = { q: 0, r: 0 };
      const hexes = hexesInRange(center, 3);
      
      // Sight distance 3 should include 37 hexes (1 + 6 + 12 + 18)
      expect(hexes).toHaveLength(37);
      
      // All hexes should be within distance 3
      hexes.forEach(hex => {
        expect(hexDistance(center, hex)).toBeLessThanOrEqual(3);
      });
    });

    it('should calculate correct number of hexes for sight distance 4', () => {
      const center: HexCoordinate = { q: 0, r: 0 };
      const hexes = hexesInRange(center, 4);
      
      // Sight distance 4 should include 61 hexes (1 + 6 + 12 + 18 + 24)
      expect(hexes).toHaveLength(61);
      
      // All hexes should be within distance 4
      hexes.forEach(hex => {
        expect(hexDistance(center, hex)).toBeLessThanOrEqual(4);
      });
    });

    it('should calculate correct number of hexes for sight distance 5', () => {
      const center: HexCoordinate = { q: 0, r: 0 };
      const hexes = hexesInRange(center, 5);
      
      // Sight distance 5 should include 91 hexes (1 + 6 + 12 + 18 + 24 + 30)
      expect(hexes).toHaveLength(91);
      
      // All hexes should be within distance 5
      hexes.forEach(hex => {
        expect(hexDistance(center, hex)).toBeLessThanOrEqual(5);
      });
    });

    it('should include center hex in all sight distance calculations', () => {
      const center: HexCoordinate = { q: 2, r: -1 };
      
      for (let distance = 1; distance <= 5; distance++) {
        const hexes = hexesInRange(center, distance);
        expect(hexes).toContainEqual(center);
      }
    });

    it('should work with non-origin center coordinates', () => {
      const center: HexCoordinate = { q: 3, r: -2 };
      const hexes = hexesInRange(center, 2);
      
      expect(hexes).toHaveLength(19);
      expect(hexes).toContainEqual(center);
      
      // All hexes should be within distance 2 of the center
      hexes.forEach(hex => {
        expect(hexDistance(center, hex)).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('Multiple player positions', () => {
    it('should calculate combined sight range for multiple players', () => {
      const player1: HexCoordinate = { q: 0, r: 0 };
      const player2: HexCoordinate = { q: 3, r: 0 };
      const sightDistance = 2;
      
      const player1Hexes = hexesInRange(player1, sightDistance);
      const player2Hexes = hexesInRange(player2, sightDistance);
      
      // Combine the two sets
      const combinedHexes = new Set<string>();
      player1Hexes.forEach(hex => combinedHexes.add(`${hex.q},${hex.r}`));
      player2Hexes.forEach(hex => combinedHexes.add(`${hex.q},${hex.r}`));
      
      // Should have more hexes than either individual player
      expect(combinedHexes.size).toBeGreaterThan(player1Hexes.length);
      expect(combinedHexes.size).toBeGreaterThan(player2Hexes.length);
      
      // Should be less than or equal to the sum (due to potential overlap)
      expect(combinedHexes.size).toBeLessThanOrEqual(player1Hexes.length + player2Hexes.length);
    });

    it('should handle overlapping sight ranges correctly', () => {
      const player1: HexCoordinate = { q: 0, r: 0 };
      const player2: HexCoordinate = { q: 1, r: 0 }; // Adjacent to player1
      const sightDistance = 2;
      
      const player1Hexes = hexesInRange(player1, sightDistance);
      const player2Hexes = hexesInRange(player2, sightDistance);
      
      // Find overlapping hexes
      const player1Set = new Set(player1Hexes.map(hex => `${hex.q},${hex.r}`));
      const overlappingHexes = player2Hexes.filter(hex => 
        player1Set.has(`${hex.q},${hex.r}`)
      );
      
      // There should be significant overlap since players are adjacent
      expect(overlappingHexes.length).toBeGreaterThan(10);
    });
  });
});

describe('Hex Visibility Logic', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
  });

  describe('GM Mode Visibility', () => {
    it('should show all hexes in GM mode regardless of exploration state', () => {
      const testHex: HexCoordinate = { q: 1, r: 1 };
      
      // Set to GM mode
      store.dispatch({ type: 'ui/setMode', payload: 'gm' });
      
      const visibility = selectHexVisibility(testHex)(store.getState());
      
      expect(visibility.shouldShow).toBe(true);
      expect(visibility.isCurrentlyVisible).toBe(true);
    });

    it('should show unexplored hexes in GM mode', () => {
      const testHex: HexCoordinate = { q: 5, r: 5 };
      
      // Set to GM mode
      store.dispatch({ type: 'ui/setMode', payload: 'gm' });
      
      const visibility = selectHexVisibility(testHex)(store.getState());
      
      expect(visibility.shouldShow).toBe(true);
      expect(visibility.isExplored).toBe(false);
      expect(visibility.isCurrentlyVisible).toBe(true);
    });
  });

  describe('Player Mode Visibility - Permanent Reveal', () => {
    beforeEach(() => {
      // Set to player mode with permanent reveal
      store.dispatch({ type: 'ui/setMode', payload: 'player' });
      store.dispatch({ type: 'map/updateRevealMode', payload: 'permanent' });
    });

    it('should show explored hexes in permanent reveal mode', () => {
      const testHex: HexCoordinate = { q: 1, r: 1 };
      
      // Mark hex as explored
      store.dispatch({ type: 'exploration/exploreHex', payload: testHex });
      
      const visibility = selectHexVisibility(testHex)(store.getState());
      
      expect(visibility.shouldShow).toBe(true);
      expect(visibility.isExplored).toBe(true);
    });

    it('should hide unexplored hexes in permanent reveal mode', () => {
      const testHex: HexCoordinate = { q: 5, r: 5 };
      
      const visibility = selectHexVisibility(testHex)(store.getState());
      
      expect(visibility.shouldShow).toBe(false);
      expect(visibility.isExplored).toBe(false);
    });

    it('should show previously explored hexes even when not currently visible', () => {
      const testHex: HexCoordinate = { q: 1, r: 1 };
      
      // Mark hex as explored but not currently visible
      store.dispatch({ type: 'exploration/exploreHex', payload: testHex });
      
      const visibility = selectHexVisibility(testHex)(store.getState());
      
      expect(visibility.shouldShow).toBe(true);
      expect(visibility.isExplored).toBe(true);
      expect(visibility.isCurrentlyVisible).toBe(false);
    });
  });

  describe('Player Mode Visibility - Line of Sight', () => {
    beforeEach(() => {
      // Set to player mode with line of sight reveal
      store.dispatch({ type: 'ui/setMode', payload: 'player' });
      store.dispatch({ type: 'map/updateRevealMode', payload: 'lineOfSight' });
    });

    it('should show only currently visible hexes in line of sight mode', () => {
      const testHex: HexCoordinate = { q: 1, r: 1 };
      
      // Mark hex as currently visible
      store.dispatch({ type: 'exploration/setVisibleHexes', payload: [testHex] });
      
      const visibility = selectHexVisibility(testHex)(store.getState());
      
      expect(visibility.shouldShow).toBe(true);
      expect(visibility.isCurrentlyVisible).toBe(true);
    });

    it('should hide previously explored hexes that are not currently visible', () => {
      const testHex: HexCoordinate = { q: 1, r: 1 };
      
      // Mark hex as explored but not currently visible
      store.dispatch({ type: 'exploration/exploreHex', payload: testHex });
      
      const visibility = selectHexVisibility(testHex)(store.getState());
      
      expect(visibility.shouldShow).toBe(false);
      expect(visibility.isExplored).toBe(true);
      expect(visibility.isCurrentlyVisible).toBe(false);
    });

    it('should hide unexplored and non-visible hexes', () => {
      const testHex: HexCoordinate = { q: 5, r: 5 };
      
      const visibility = selectHexVisibility(testHex)(store.getState());
      
      expect(visibility.shouldShow).toBe(false);
      expect(visibility.isExplored).toBe(false);
      expect(visibility.isCurrentlyVisible).toBe(false);
    });
  });

  describe('Sight Distance Integration', () => {
    beforeEach(() => {
      store.dispatch({ type: 'ui/setMode', payload: 'player' });
    });

    it('should correctly calculate visibility for different sight distances', () => {
      const playerPosition: HexCoordinate = { q: 0, r: 0 };
      
      // Test different sight distances
      for (let sightDistance = 1; sightDistance <= 5; sightDistance++) {
        store.dispatch({ type: 'map/updateSightDistance', payload: sightDistance });
        
        const hexesInSight = hexesInRange(playerPosition, sightDistance);
        
        // Mark all hexes in sight as visible and explored
        store.dispatch({ type: 'exploration/setVisibleHexes', payload: hexesInSight });
        store.dispatch({ type: 'exploration/exploreHexes', payload: hexesInSight });
        
        // Test a hex that should be visible
        const visibleHex = hexesInSight[Math.floor(hexesInSight.length / 2)];
        const visibleVisibility = selectHexVisibility(visibleHex)(store.getState());
        expect(visibleVisibility.shouldShow).toBe(true);
        
        // Test a hex that should not be visible (outside sight range)
        const distantHex: HexCoordinate = { q: sightDistance + 2, r: 0 };
        const distantVisibility = selectHexVisibility(distantHex)(store.getState());
        expect(distantVisibility.shouldShow).toBe(false);
      }
    });

    it('should handle edge cases at exact sight distance boundaries', () => {
      const playerPosition: HexCoordinate = { q: 0, r: 0 };
      const sightDistance = 3;
      
      store.dispatch({ type: 'map/updateSightDistance', payload: sightDistance });
      
      // Find hexes at exactly the sight distance boundary
      const hexesInSight = hexesInRange(playerPosition, sightDistance);
      const boundaryHexes = hexesInSight.filter(hex => 
        hexDistance(playerPosition, hex) === sightDistance
      );
      
      // Mark all hexes in sight as visible and explored
      store.dispatch({ type: 'exploration/setVisibleHexes', payload: hexesInSight });
      store.dispatch({ type: 'exploration/exploreHexes', payload: hexesInSight });
      
      // All boundary hexes should be visible
      boundaryHexes.forEach(hex => {
        const visibility = selectHexVisibility(hex)(store.getState());
        expect(visibility.shouldShow).toBe(true);
      });
      
      // Hexes just outside the boundary should not be visible
      const outsideHex: HexCoordinate = { q: sightDistance + 1, r: 0 };
      const outsideVisibility = selectHexVisibility(outsideHex)(store.getState());
      expect(outsideVisibility.shouldShow).toBe(false);
    });
  });

  describe('Visual Distinction Logic', () => {
    beforeEach(() => {
      store.dispatch({ type: 'ui/setMode', payload: 'player' });
    });

    it('should distinguish between explored, visible, and unexplored hexes', () => {
      const exploredHex: HexCoordinate = { q: 1, r: 0 };
      const visibleHex: HexCoordinate = { q: 0, r: 1 };
      const unexploredHex: HexCoordinate = { q: 5, r: 5 };
      
      // Set up different hex states
      store.dispatch({ type: 'exploration/exploreHex', payload: exploredHex });
      store.dispatch({ type: 'exploration/setVisibleHexes', payload: [visibleHex] });
      store.dispatch({ type: 'exploration/exploreHex', payload: visibleHex });
      
      // Test explored but not currently visible hex
      const exploredVisibility = selectHexVisibility(exploredHex)(store.getState());
      expect(exploredVisibility.isExplored).toBe(true);
      expect(exploredVisibility.isCurrentlyVisible).toBe(false);
      
      // Test currently visible hex
      const visibleVisibility = selectHexVisibility(visibleHex)(store.getState());
      expect(visibleVisibility.isExplored).toBe(true);
      expect(visibleVisibility.isCurrentlyVisible).toBe(true);
      
      // Test unexplored hex
      const unexploredVisibility = selectHexVisibility(unexploredHex)(store.getState());
      expect(unexploredVisibility.isExplored).toBe(false);
      expect(unexploredVisibility.isCurrentlyVisible).toBe(false);
    });

    it('should provide correct visibility states for rendering logic', () => {
      const testHex: HexCoordinate = { q: 2, r: 1 };
      
      // Test in permanent reveal mode
      store.dispatch({ type: 'map/updateRevealMode', payload: 'permanent' });
      store.dispatch({ type: 'exploration/exploreHex', payload: testHex });
      
      const permanentVisibility = selectHexVisibility(testHex)(store.getState());
      expect(permanentVisibility.shouldShow).toBe(true);
      expect(permanentVisibility.isExplored).toBe(true);
      
      // Test in line of sight mode (same hex, not currently visible)
      store.dispatch({ type: 'map/updateRevealMode', payload: 'lineOfSight' });
      
      const lineOfSightVisibility = selectHexVisibility(testHex)(store.getState());
      expect(lineOfSightVisibility.shouldShow).toBe(false);
      expect(lineOfSightVisibility.isExplored).toBe(true);
      expect(lineOfSightVisibility.isCurrentlyVisible).toBe(false);
    });
  });
});