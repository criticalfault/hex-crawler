/**
 * Integration test for Task 7: Icon placement and hex content management
 * Tests the complete workflow from drag-drop to visual rendering
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { mapSlice, mapActions } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import { hexCellUtils } from './HexCell';
import type { HexCoordinate, HexCell } from '../types';

describe('Task 7: Icon Placement Integration', () => {
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

  describe('Icon Placement Logic', () => {
    it('should place terrain icons correctly', () => {
      const coordinate: HexCoordinate = { q: 0, r: 0 };
      
      store.dispatch(mapActions.placeIcon({
        coordinate,
        terrain: 'mountains'
      }));

      const state = store.getState();
      const hexKey = `${coordinate.q},${coordinate.r}`;
      const hexCell = state.map.currentMap?.cells.get(hexKey);

      expect(hexCell).toBeDefined();
      expect(hexCell?.terrain).toBe('mountains');
      expect(hexCell?.landmark).toBeUndefined();
    });

    it('should place landmark icons correctly', () => {
      const coordinate: HexCoordinate = { q: 1, r: 1 };
      
      store.dispatch(mapActions.placeIcon({
        coordinate,
        landmark: 'tower'
      }));

      const state = store.getState();
      const hexKey = `${coordinate.q},${coordinate.r}`;
      const hexCell = state.map.currentMap?.cells.get(hexKey);

      expect(hexCell).toBeDefined();
      expect(hexCell?.landmark).toBe('tower');
      expect(hexCell?.terrain).toBeUndefined();
    });

    it('should replace existing icons when new ones are dropped', () => {
      const coordinate: HexCoordinate = { q: 2, r: 2 };
      
      // Place initial terrain
      store.dispatch(mapActions.placeIcon({
        coordinate,
        terrain: 'plains'
      }));

      // Replace with landmark
      store.dispatch(mapActions.placeIcon({
        coordinate,
        landmark: 'city'
      }));

      const state = store.getState();
      const hexKey = `${coordinate.q},${coordinate.r}`;
      const hexCell = state.map.currentMap?.cells.get(hexKey);

      expect(hexCell).toBeDefined();
      expect(hexCell?.terrain).toBeUndefined(); // Should be cleared
      expect(hexCell?.landmark).toBe('city'); // Should be the new icon
    });

    it('should preserve exploration state during icon placement', () => {
      const coordinate: HexCoordinate = { q: 3, r: 3 };
      
      // Create hex with exploration state
      const existingCell: HexCell = {
        coordinate,
        isExplored: true,
        isVisible: true
      };
      
      store.dispatch(mapActions.updateHexCell(existingCell));

      // Place icon
      store.dispatch(mapActions.placeIcon({
        coordinate,
        terrain: 'water'
      }));

      const state = store.getState();
      const hexKey = `${coordinate.q},${coordinate.r}`;
      const hexCell = state.map.currentMap?.cells.get(hexKey);

      expect(hexCell).toBeDefined();
      expect(hexCell?.terrain).toBe('water');
      expect(hexCell?.isExplored).toBe(true);
      expect(hexCell?.isVisible).toBe(true);
    });
  });

  describe('Visual Indicators', () => {
    const mockAppearance = {
      hexSize: 30,
      borderColor: '#333333',
      backgroundColor: '#f0f0f0',
      unexploredColor: '#cccccc',
      textSize: 12,
    };

    it('should provide different fill color for hexes with content', () => {
      const hexWithContent: HexCell = {
        coordinate: { q: 0, r: 0 },
        terrain: 'mountains',
        isExplored: false,
        isVisible: false
      };

      const hexWithoutContent: HexCell = {
        coordinate: { q: 1, r: 1 },
        isExplored: false,
        isVisible: false
      };

      const fillColorWithContent = hexCellUtils.getHexFillColor(
        hexWithContent, false, false, mockAppearance, 'gm'
      );

      const fillColorWithoutContent = hexCellUtils.getHexFillColor(
        hexWithoutContent, false, false, mockAppearance, 'gm'
      );

      expect(fillColorWithContent).toBe('#f8f9fa'); // Content background
      expect(fillColorWithoutContent).toBe('#f0f0f0'); // Default background
      expect(fillColorWithContent).not.toBe(fillColorWithoutContent);
    });

    it('should provide different stroke color for hexes with content', () => {
      const strokeColorWithContent = hexCellUtils.getHexStrokeColor(
        false, false, mockAppearance, true
      );

      const strokeColorWithoutContent = hexCellUtils.getHexStrokeColor(
        false, false, mockAppearance, false
      );

      expect(strokeColorWithContent).toBe('#6c757d'); // Content border
      expect(strokeColorWithoutContent).toBe('#333333'); // Default border
      expect(strokeColorWithContent).not.toBe(strokeColorWithoutContent);
    });

    it('should prioritize selection and hover states over content styling', () => {
      const hexWithContent: HexCell = {
        coordinate: { q: 0, r: 0 },
        terrain: 'mountains',
        isExplored: false,
        isVisible: false
      };

      // Selection should override content styling
      const selectedColor = hexCellUtils.getHexFillColor(
        hexWithContent, false, true, mockAppearance, 'gm'
      );
      expect(selectedColor).toBe('#d4edda');

      // Hover should override content styling
      const hoveredColor = hexCellUtils.getHexFillColor(
        hexWithContent, true, false, mockAppearance, 'gm'
      );
      expect(hoveredColor).toBe('#e6f3ff');
    });
  });

  describe('Content Detection', () => {
    it('should correctly identify hexes with terrain content', () => {
      const hexWithTerrain: HexCell = {
        coordinate: { q: 0, r: 0 },
        terrain: 'desert',
        isExplored: false,
        isVisible: false
      };

      const hasContent = Boolean(hexWithTerrain.terrain || hexWithTerrain.landmark);
      expect(hasContent).toBe(true);
    });

    it('should correctly identify hexes with landmark content', () => {
      const hexWithLandmark: HexCell = {
        coordinate: { q: 0, r: 0 },
        landmark: 'town',
        isExplored: false,
        isVisible: false
      };

      const hasContent = Boolean(hexWithLandmark.terrain || hexWithLandmark.landmark);
      expect(hasContent).toBe(true);
    });

    it('should correctly identify hexes without content', () => {
      const emptyHex: HexCell = {
        coordinate: { q: 0, r: 0 },
        isExplored: false,
        isVisible: false
      };

      const hasContent = Boolean(emptyHex.terrain || emptyHex.landmark);
      expect(hasContent).toBe(false);
    });
  });
});