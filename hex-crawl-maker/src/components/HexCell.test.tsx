/**
 * Tests for HexCell component and utility functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { HexCell, hexCellUtils } from './HexCell';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import type { HexCoordinate, HexCell as HexCellData, GridAppearance } from '../types';

// Enable Immer MapSet plugin for tests
enableMapSet();

const createTestStore = (initialState?: any) => {
  return configureStore({
    reducer: {
      map: mapSlice.reducer,
      ui: uiSlice.reducer,
      exploration: explorationSlice.reducer,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'map/setMapData', 
            'map/updateHexCell', 
            'map/placeIcon',
            'exploration/setExplorationState'
          ],
          ignoredPaths: [
            'map.currentMap.cells',
            'map.savedMaps',
            'exploration.exploredHexes',
            'exploration.visibleHexes'
          ],
        },
      }),
  });
};

const mockAppearance: GridAppearance = {
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
  },
  borderWidth: 1,
};

describe('HexCell Component', () => {
  const mockCoordinate: HexCoordinate = { q: 0, r: 0 };
  const mockOnHover = vi.fn();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <HexCell
          coordinate={mockCoordinate}
          isHovered={false}
          isSelected={false}
          onHover={mockOnHover}
          onClick={mockOnClick}
        />
      </Provider>
    );
  });

  it('returns null as it is a logic-only component', () => {
    const store = createTestStore();
    
    const { container } = render(
      <Provider store={store}>
        <HexCell
          coordinate={mockCoordinate}
          isHovered={false}
          isSelected={false}
          onHover={mockOnHover}
          onClick={mockOnClick}
        />
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });
});

describe('hexCellUtils', () => {
  describe('shouldShowHex', () => {
    const mockHexCell: HexCellData = {
      coordinate: { q: 0, r: 0 },
      isExplored: true,
      isVisible: true,
    };

    it('shows all hexes in GM mode', () => {
      expect(hexCellUtils.shouldShowHex(mockHexCell, 'gm', 'permanent')).toBe(true);
      expect(hexCellUtils.shouldShowHex(mockHexCell, 'gm', 'lineOfSight')).toBe(true);
      expect(hexCellUtils.shouldShowHex(null, 'gm', 'permanent')).toBe(true);
    });

    it('shows explored hexes in player mode with permanent reveals', () => {
      const exploredHex = { ...mockHexCell, isExplored: true };
      const unexploredHex = { ...mockHexCell, isExplored: false };

      expect(hexCellUtils.shouldShowHex(exploredHex, 'player', 'permanent')).toBe(true);
      expect(hexCellUtils.shouldShowHex(unexploredHex, 'player', 'permanent')).toBe(false);
    });

    it('shows only visible hexes in player mode with line of sight', () => {
      const visibleHex = { ...mockHexCell, isVisible: true };
      const invisibleHex = { ...mockHexCell, isVisible: false };

      expect(hexCellUtils.shouldShowHex(visibleHex, 'player', 'lineOfSight')).toBe(true);
      expect(hexCellUtils.shouldShowHex(invisibleHex, 'player', 'lineOfSight')).toBe(false);
    });

    it('returns false for null hex cells in player mode', () => {
      expect(hexCellUtils.shouldShowHex(null, 'player', 'permanent')).toBe(false);
      expect(hexCellUtils.shouldShowHex(null, 'player', 'lineOfSight')).toBe(false);
    });
  });

  describe('getHexFillColor', () => {
    const mockHexCell: HexCellData = {
      coordinate: { q: 0, r: 0 },
      terrain: 'mountains',
      isExplored: true,
      isVisible: true,
    };

    it('returns selection color when hex is selected', () => {
      const color = hexCellUtils.getHexFillColor(
        mockHexCell,
        false,
        true,
        mockAppearance,
        'gm'
      );
      expect(color).toBe('#d4edda');
    });

    it('returns hover color when hex is hovered (and not selected)', () => {
      const color = hexCellUtils.getHexFillColor(
        mockHexCell,
        true,
        false,
        mockAppearance,
        'gm'
      );
      expect(color).toBe('#e6f3ff');
    });

    it('returns background color for hexes with content', () => {
      const color = hexCellUtils.getHexFillColor(
        mockHexCell,
        false,
        false,
        mockAppearance,
        'gm'
      );
      expect(color).toBe(mockAppearance.backgroundColor);
    });

    it('returns unexplored color for unexplored hexes in player mode', () => {
      const unexploredHex = { ...mockHexCell, isExplored: false };
      const color = hexCellUtils.getHexFillColor(
        unexploredHex,
        false,
        false,
        mockAppearance,
        'player'
      );
      expect(color).toBe(mockAppearance.unexploredColor);
    });

    it('returns background color for empty hexes in GM mode', () => {
      const color = hexCellUtils.getHexFillColor(
        null,
        false,
        false,
        mockAppearance,
        'gm'
      );
      expect(color).toBe(mockAppearance.backgroundColor);
    });
  });

  describe('getHexStrokeColor', () => {
    it('returns selection stroke color when hex is selected', () => {
      const color = hexCellUtils.getHexStrokeColor(false, true, mockAppearance);
      expect(color).toBe('#28a745');
    });

    it('returns hover stroke color when hex is hovered (and not selected)', () => {
      const color = hexCellUtils.getHexStrokeColor(true, false, mockAppearance);
      expect(color).toBe('#4a90e2');
    });

    it('returns default border color for normal state', () => {
      const color = hexCellUtils.getHexStrokeColor(false, false, mockAppearance);
      expect(color).toBe(mockAppearance.borderColor);
    });
  });

  describe('getHexStrokeWidth', () => {
    it('returns thick stroke for selected hex', () => {
      const width = hexCellUtils.getHexStrokeWidth(false, true);
      expect(width).toBe(3);
    });

    it('returns medium stroke for hovered hex', () => {
      const width = hexCellUtils.getHexStrokeWidth(true, false);
      expect(width).toBe(2);
    });

    it('returns thin stroke for normal hex', () => {
      const width = hexCellUtils.getHexStrokeWidth(false, false);
      expect(width).toBe(1);
    });

    it('prioritizes selection over hover', () => {
      const width = hexCellUtils.getHexStrokeWidth(true, true);
      expect(width).toBe(3); // Selection takes priority
    });
  });
});

describe('HexCell Integration', () => {
  it('handles hex cells with different content types', () => {
    const terrainHex: HexCellData = {
      coordinate: { q: 0, r: 0 },
      terrain: 'mountains',
      isExplored: true,
      isVisible: true,
    };

    const landmarkHex: HexCellData = {
      coordinate: { q: 1, r: 0 },
      landmark: 'tower',
      isExplored: true,
      isVisible: true,
    };

    const emptyHex: HexCellData = {
      coordinate: { q: 2, r: 0 },
      isExplored: true,
      isVisible: true,
    };

    // All should return background color when not hovered/selected
    expect(hexCellUtils.getHexFillColor(terrainHex, false, false, mockAppearance, 'gm'))
      .toBe(mockAppearance.backgroundColor);
    
    expect(hexCellUtils.getHexFillColor(landmarkHex, false, false, mockAppearance, 'gm'))
      .toBe(mockAppearance.backgroundColor);
    
    expect(hexCellUtils.getHexFillColor(emptyHex, false, false, mockAppearance, 'gm'))
      .toBe(mockAppearance.backgroundColor);
  });

  it('handles visibility states correctly', () => {
    const visibleHex: HexCellData = {
      coordinate: { q: 0, r: 0 },
      isExplored: true,
      isVisible: true,
    };

    const exploredButNotVisible: HexCellData = {
      coordinate: { q: 1, r: 0 },
      isExplored: true,
      isVisible: false,
    };

    const notExploredNotVisible: HexCellData = {
      coordinate: { q: 2, r: 0 },
      isExplored: false,
      isVisible: false,
    };

    // GM mode - all should be visible
    expect(hexCellUtils.shouldShowHex(visibleHex, 'gm', 'permanent')).toBe(true);
    expect(hexCellUtils.shouldShowHex(exploredButNotVisible, 'gm', 'permanent')).toBe(true);
    expect(hexCellUtils.shouldShowHex(notExploredNotVisible, 'gm', 'permanent')).toBe(true);

    // Player mode with permanent reveals
    expect(hexCellUtils.shouldShowHex(visibleHex, 'player', 'permanent')).toBe(true);
    expect(hexCellUtils.shouldShowHex(exploredButNotVisible, 'player', 'permanent')).toBe(true);
    expect(hexCellUtils.shouldShowHex(notExploredNotVisible, 'player', 'permanent')).toBe(false);

    // Player mode with line of sight
    expect(hexCellUtils.shouldShowHex(visibleHex, 'player', 'lineOfSight')).toBe(true);
    expect(hexCellUtils.shouldShowHex(exploredButNotVisible, 'player', 'lineOfSight')).toBe(false);
    expect(hexCellUtils.shouldShowHex(notExploredNotVisible, 'player', 'lineOfSight')).toBe(false);
  });
});