/**
 * Test for icon placement functionality - Task 7 verification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { mapSlice, mapActions } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import type { HexCoordinate } from '../types';

describe('Icon Placement - Task 7', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        map: mapSlice.reducer,
        ui: uiSlice.reducer,
        exploration: explorationSlice.reducer,
      },
    });

    // Create a test map
    store.dispatch(mapActions.createNewMap({
      name: 'Test Map',
      dimensions: { width: 10, height: 10 }
    }));
  });

  it('should place terrain icon on hex cell', () => {
    const coordinate: HexCoordinate = { q: 0, r: 0 };
    
    // Place a mountain terrain icon
    store.dispatch(mapActions.placeIcon({
      coordinate,
      terrain: 'mountains'
    }));

    const state = store.getState();
    const hexKey = `${coordinate.q},${coordinate.r}`;
    const hexCell = state.map.currentMap?.cells.get(hexKey);

    expect(hexCell).toBeDefined();
    expect(hexCell?.terrain).toBe('mountains');
    expect(hexCell?.coordinate).toEqual(coordinate);
  });

  it('should place landmark icon on hex cell', () => {
    const coordinate: HexCoordinate = { q: 1, r: 1 };
    
    // Place a tower landmark icon
    store.dispatch(mapActions.placeIcon({
      coordinate,
      landmark: 'tower'
    }));

    const state = store.getState();
    const hexKey = `${coordinate.q},${coordinate.r}`;
    const hexCell = state.map.currentMap?.cells.get(hexKey);

    expect(hexCell).toBeDefined();
    expect(hexCell?.landmark).toBe('tower');
    expect(hexCell?.coordinate).toEqual(coordinate);
  });

  it('should replace existing icon when dropping new one', () => {
    const coordinate: HexCoordinate = { q: 2, r: 2 };
    
    // First, place a mountain
    store.dispatch(mapActions.placeIcon({
      coordinate,
      terrain: 'mountains'
    }));

    // Then replace with a tower
    store.dispatch(mapActions.placeIcon({
      coordinate,
      landmark: 'tower'
    }));

    const state = store.getState();
    const hexKey = `${coordinate.q},${coordinate.r}`;
    const hexCell = state.map.currentMap?.cells.get(hexKey);

    expect(hexCell).toBeDefined();
    expect(hexCell?.terrain).toBeUndefined(); // Should be cleared
    expect(hexCell?.landmark).toBe('tower'); // Should be the new icon
  });

  it('should preserve exploration state when placing icons', () => {
    const coordinate: HexCoordinate = { q: 3, r: 3 };
    
    // First create a hex cell with exploration state
    const existingCell = {
      coordinate,
      isExplored: true,
      isVisible: true
    };
    
    store.dispatch(mapActions.updateHexCell(existingCell));

    // Then place an icon
    store.dispatch(mapActions.placeIcon({
      coordinate,
      terrain: 'plains'
    }));

    const state = store.getState();
    const hexKey = `${coordinate.q},${coordinate.r}`;
    const hexCell = state.map.currentMap?.cells.get(hexKey);

    expect(hexCell).toBeDefined();
    expect(hexCell?.terrain).toBe('plains');
    expect(hexCell?.isExplored).toBe(true); // Should preserve exploration state
    expect(hexCell?.isVisible).toBe(true); // Should preserve visibility state
  });

  it('should handle icon placement with additional properties', () => {
    const coordinate: HexCoordinate = { q: 4, r: 4 };
    
    store.dispatch(mapActions.placeIcon({
      coordinate,
      landmark: 'city',
      name: 'Test City',
      description: 'A bustling metropolis',
      gmNotes: 'Secret entrance in the sewers'
    }));

    const state = store.getState();
    const hexKey = `${coordinate.q},${coordinate.r}`;
    const hexCell = state.map.currentMap?.cells.get(hexKey);

    expect(hexCell).toBeDefined();
    expect(hexCell?.landmark).toBe('city');
    expect(hexCell?.name).toBe('Test City');
    expect(hexCell?.description).toBe('A bustling metropolis');
    expect(hexCell?.gmNotes).toBe('Secret entrance in the sewers');
  });
});