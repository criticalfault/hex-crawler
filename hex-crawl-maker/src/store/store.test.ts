/**
 * Tests for Redux store functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { store } from './index';
import { mapActions, uiActions, explorationActions } from './index';
import type { HexCoordinate } from '../types';

describe('Redux Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    // Note: In a real app, we'd want proper reset actions
  });

  describe('Map Slice', () => {
    it('should create a new map', () => {
      const mapData = {
        name: 'Test Map',
        dimensions: { width: 10, height: 10 }
      };

      store.dispatch(mapActions.createNewMap(mapData));
      
      const state = store.getState();
      expect(state.map.currentMap).toBeTruthy();
      expect(state.map.currentMap?.name).toBe('Test Map');
      expect(state.map.currentMap?.dimensions).toEqual({ width: 10, height: 10 });
    });

    it('should place an icon on a hex', () => {
      // First create a map
      store.dispatch(mapActions.createNewMap({
        name: 'Test Map',
        dimensions: { width: 10, height: 10 }
      }));

      const coordinate: HexCoordinate = { q: 0, r: 0 };
      store.dispatch(mapActions.placeIcon({
        coordinate,
        terrain: 'mountains',
        name: 'Test Mountain',
        description: 'A tall mountain'
      }));

      const state = store.getState();
      const cell = state.map.currentMap?.cells.get('0,0');
      expect(cell).toBeTruthy();
      expect(cell?.terrain).toBe('mountains');
      expect(cell?.name).toBe('Test Mountain');
    });

    it('should update sight distance', () => {
      store.dispatch(mapActions.createNewMap({
        name: 'Test Map',
        dimensions: { width: 10, height: 10 }
      }));

      store.dispatch(mapActions.updateSightDistance(5));
      
      const state = store.getState();
      expect(state.map.currentMap?.sightDistance).toBe(5);
    });

    it('should clamp sight distance to valid range', () => {
      store.dispatch(mapActions.createNewMap({
        name: 'Test Map',
        dimensions: { width: 10, height: 10 }
      }));

      store.dispatch(mapActions.updateSightDistance(15)); // Too high
      expect(store.getState().map.currentMap?.sightDistance).toBe(10);

      store.dispatch(mapActions.updateSightDistance(-1)); // Too low
      expect(store.getState().map.currentMap?.sightDistance).toBe(1);
    });
  });

  describe('UI Slice', () => {
    it('should switch modes', () => {
      expect(store.getState().ui.currentMode).toBe('gm');
      
      store.dispatch(uiActions.toggleMode());
      expect(store.getState().ui.currentMode).toBe('player');
      
      store.dispatch(uiActions.setMode('gm'));
      expect(store.getState().ui.currentMode).toBe('gm');
    });

    it('should handle hex selection', () => {
      const coordinate: HexCoordinate = { q: 1, r: 2 };
      
      store.dispatch(uiActions.selectHex(coordinate));
      expect(store.getState().ui.selectedHex).toEqual(coordinate);
      
      store.dispatch(uiActions.clearSelection());
      expect(store.getState().ui.selectedHex).toBeNull();
    });

    it('should handle drag and drop state', () => {
      const draggedIcon = { type: 'terrain' as const, value: 'mountains' };
      
      store.dispatch(uiActions.startDrag(draggedIcon));
      const state = store.getState();
      expect(state.ui.isDragging).toBe(true);
      expect(state.ui.draggedIcon).toEqual(draggedIcon);
      
      store.dispatch(uiActions.endDrag());
      const endState = store.getState();
      expect(endState.ui.isDragging).toBe(false);
      expect(endState.ui.draggedIcon).toBeNull();
    });

    it('should handle zoom controls', () => {
      store.dispatch(uiActions.setZoom(2));
      expect(store.getState().ui.zoom).toBe(2);
      
      store.dispatch(uiActions.zoomIn());
      expect(store.getState().ui.zoom).toBe(2.4);
      
      store.dispatch(uiActions.zoomOut());
      expect(store.getState().ui.zoom).toBe(2);
      
      store.dispatch(uiActions.resetZoom());
      const state = store.getState();
      expect(state.ui.zoom).toBe(1);
      expect(state.ui.panOffset).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Exploration Slice', () => {
    it('should explore hexes', () => {
      const coordinate: HexCoordinate = { q: 0, r: 0 };
      
      store.dispatch(explorationActions.exploreHex(coordinate));
      
      const state = store.getState();
      expect(state.exploration.exploredHexes.has('0,0')).toBe(true);
      expect(state.exploration.explorationHistory).toHaveLength(1);
    });

    it('should explore multiple hexes', () => {
      const coordinates: HexCoordinate[] = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 }
      ];
      
      store.dispatch(explorationActions.exploreHexes(coordinates));
      
      const state = store.getState();
      expect(state.exploration.exploredHexes.has('0,0')).toBe(true);
      expect(state.exploration.exploredHexes.has('1,0')).toBe(true);
      expect(state.exploration.exploredHexes.has('0,1')).toBe(true);
    });

    it('should manage visible hexes', () => {
      const coordinates: HexCoordinate[] = [
        { q: 0, r: 0 },
        { q: 1, r: 0 }
      ];
      
      store.dispatch(explorationActions.setVisibleHexes(coordinates));
      
      const state = store.getState();
      expect(state.exploration.visibleHexes.has('0,0')).toBe(true);
      expect(state.exploration.visibleHexes.has('1,0')).toBe(true);
      expect(state.exploration.visibleHexes.has('0,1')).toBe(false);
    });

    it('should reset exploration', () => {
      // First explore some hexes
      store.dispatch(explorationActions.exploreHex({ q: 0, r: 0 }));
      store.dispatch(explorationActions.setVisibleHexes([{ q: 1, r: 0 }]));
      
      // Then reset
      store.dispatch(explorationActions.resetExploration());
      
      const state = store.getState();
      expect(state.exploration.exploredHexes.size).toBe(0);
      expect(state.exploration.visibleHexes.size).toBe(0);
      expect(state.exploration.explorationHistory).toHaveLength(0);
    });
  });
});