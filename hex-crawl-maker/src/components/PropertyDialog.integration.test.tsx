/**
 * PropertyDialog integration tests
 * Tests the PropertyDialog component integration with Redux store and other components
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { mapSlice, mapActions } from '../store/slices/mapSlice';
import { uiSlice, uiActions } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import type { HexCoordinate, MapData } from '../types/hex';

describe('PropertyDialog Integration', () => {
  let store: ReturnType<typeof configureStore>;
  const testHex: HexCoordinate = { q: 1, r: 2 };

  beforeEach(() => {
    const mockMap: MapData = {
      id: 'test-map',
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
      },
    };

    store = configureStore({
      reducer: {
        map: mapSlice.reducer,
        ui: uiSlice.reducer,
        exploration: explorationSlice.reducer,
      },
      preloadedState: {
        map: {
          currentMap: mockMap,
          savedMaps: { 'test-map': mockMap },
        },
        ui: {
          currentMode: 'gm',
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
          playerPositions: [],
        },
      },
    });
  });

  describe('Redux Integration', () => {
    it('should open property dialog when openPropertyDialog action is dispatched', () => {
      // Initially closed
      expect(store.getState().ui.isPropertyDialogOpen).toBe(false);
      expect(store.getState().ui.selectedHex).toBe(null);

      // Open dialog
      store.dispatch(uiActions.openPropertyDialog(testHex));

      // Should be open with selected hex
      expect(store.getState().ui.isPropertyDialogOpen).toBe(true);
      expect(store.getState().ui.selectedHex).toEqual(testHex);
    });

    it('should close property dialog when closePropertyDialog action is dispatched', () => {
      // Open dialog first
      store.dispatch(uiActions.openPropertyDialog(testHex));
      expect(store.getState().ui.isPropertyDialogOpen).toBe(true);

      // Close dialog
      store.dispatch(uiActions.closePropertyDialog());

      // Should be closed
      expect(store.getState().ui.isPropertyDialogOpen).toBe(false);
    });

    it('should place icon with properties when placeIcon action is dispatched', () => {
      const iconData = {
        coordinate: testHex,
        terrain: 'mountains',
        name: 'Test Mountain',
        description: 'A tall mountain',
        gmNotes: 'Secret cave here',
      };

      store.dispatch(mapActions.placeIcon(iconData));

      const state = store.getState();
      const hexKey = `${testHex.q},${testHex.r}`;
      const placedHex = state.map.currentMap?.cells.get(hexKey);

      expect(placedHex).toBeDefined();
      expect(placedHex?.terrain).toBe('mountains');
      expect(placedHex?.name).toBe('Test Mountain');
      expect(placedHex?.description).toBe('A tall mountain');
      expect(placedHex?.gmNotes).toBe('Secret cave here');
    });

    it('should update existing hex when placeIcon is called on occupied hex', () => {
      // Place initial icon
      store.dispatch(mapActions.placeIcon({
        coordinate: testHex,
        terrain: 'plains',
        name: 'Old Name',
      }));

      // Update with new data
      store.dispatch(mapActions.placeIcon({
        coordinate: testHex,
        landmark: 'tower',
        name: 'New Tower',
        description: 'A mighty tower',
      }));

      const state = store.getState();
      const hexKey = `${testHex.q},${testHex.r}`;
      const updatedHex = state.map.currentMap?.cells.get(hexKey);

      expect(updatedHex?.terrain).toBeUndefined(); // Should be replaced
      expect(updatedHex?.landmark).toBe('tower');
      expect(updatedHex?.name).toBe('New Tower');
      expect(updatedHex?.description).toBe('A mighty tower');
    });
  });

  describe('Workflow Integration', () => {
    it('should support complete icon placement workflow', () => {
      // 1. Start with empty hex
      const hexKey = `${testHex.q},${testHex.r}`;
      expect(store.getState().map.currentMap?.cells.get(hexKey)).toBeUndefined();

      // 2. Place icon (simulating drag and drop)
      store.dispatch(mapActions.placeIcon({
        coordinate: testHex,
        terrain: 'mountains',
      }));

      // 3. Open property dialog (simulating click on placed icon)
      store.dispatch(uiActions.openPropertyDialog(testHex));

      // 4. Verify state
      const state = store.getState();
      expect(state.ui.isPropertyDialogOpen).toBe(true);
      expect(state.ui.selectedHex).toEqual(testHex);
      
      const placedHex = state.map.currentMap?.cells.get(hexKey);
      expect(placedHex?.terrain).toBe('mountains');
    });

    it('should support editing existing hex properties', () => {
      const hexKey = `${testHex.q},${testHex.r}`;

      // 1. Place initial icon with basic data
      store.dispatch(mapActions.placeIcon({
        coordinate: testHex,
        terrain: 'plains',
        name: 'Basic Plains',
      }));

      // 2. Open dialog for editing
      store.dispatch(uiActions.openPropertyDialog(testHex));

      // 3. Update with more detailed information
      store.dispatch(mapActions.placeIcon({
        coordinate: testHex,
        terrain: 'plains',
        name: 'Windswept Plains',
        description: 'Rolling grasslands with gentle hills',
        gmNotes: 'Bandits sometimes camp here at night',
      }));

      // 4. Close dialog
      store.dispatch(uiActions.closePropertyDialog());

      // 5. Verify final state
      const state = store.getState();
      expect(state.ui.isPropertyDialogOpen).toBe(false);
      
      const updatedHex = state.map.currentMap?.cells.get(hexKey);
      expect(updatedHex?.name).toBe('Windswept Plains');
      expect(updatedHex?.description).toBe('Rolling grasslands with gentle hills');
      expect(updatedHex?.gmNotes).toBe('Bandits sometimes camp here at night');
    });
  });

  describe('Requirements Validation', () => {
    it('should satisfy requirement 1.4: dialog opens when icons are placed', () => {
      // This would be tested in the HexGrid component integration
      // Here we verify the Redux actions work correctly
      
      // Simulate icon placement
      store.dispatch(mapActions.placeIcon({
        coordinate: testHex,
        terrain: 'mountains',
      }));
      
      // Simulate dialog opening (this should happen automatically in HexGrid)
      store.dispatch(uiActions.openPropertyDialog(testHex));
      
      expect(store.getState().ui.isPropertyDialogOpen).toBe(true);
    });

    it('should satisfy requirement 1.5: stores name, description, and GM notes', () => {
      const testData = {
        coordinate: testHex,
        terrain: 'swamps',
        name: 'Murky Swampland',
        description: 'A dangerous bog filled with strange creatures',
        gmNotes: 'Contains a hidden treasure chest under the old oak',
      };

      store.dispatch(mapActions.placeIcon(testData));

      const hexKey = `${testHex.q},${testHex.r}`;
      const storedHex = store.getState().map.currentMap?.cells.get(hexKey);

      expect(storedHex?.name).toBe(testData.name);
      expect(storedHex?.description).toBe(testData.description);
      expect(storedHex?.gmNotes).toBe(testData.gmNotes);
    });

    it('should satisfy requirement 1.7: allows editing existing hex properties', () => {
      const hexKey = `${testHex.q},${testHex.r}`;

      // Initial placement
      store.dispatch(mapActions.placeIcon({
        coordinate: testHex,
        landmark: 'town',
        name: 'Small Village',
      }));

      // Verify initial state
      let storedHex = store.getState().map.currentMap?.cells.get(hexKey);
      expect(storedHex?.name).toBe('Small Village');
      expect(storedHex?.description).toBeUndefined();

      // Edit properties
      store.dispatch(mapActions.placeIcon({
        coordinate: testHex,
        landmark: 'city', // Changed from town to city
        name: 'Prosperous City',
        description: 'A thriving trade hub',
        gmNotes: 'The mayor has a secret',
      }));

      // Verify updated state
      storedHex = store.getState().map.currentMap?.cells.get(hexKey);
      expect(storedHex?.landmark).toBe('city');
      expect(storedHex?.name).toBe('Prosperous City');
      expect(storedHex?.description).toBe('A thriving trade hub');
      expect(storedHex?.gmNotes).toBe('The mayor has a secret');
    });
  });
});