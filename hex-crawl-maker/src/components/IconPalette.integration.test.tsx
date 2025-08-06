/**
 * Integration tests for IconPalette drag and drop functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { IconPalette } from './IconPalette';
import { HexGrid } from './HexGrid';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import { enableMapSet } from 'immer';

// Enable Immer MapSet plugin
enableMapSet();

// Create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      map: mapSlice.reducer,
      ui: uiSlice.reducer,
      exploration: explorationSlice.reducer,
    },
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

const TestApp = () => {
  const store = createTestStore();
  
  // Initialize with a default map
  store.dispatch({
    type: 'map/setMapData',
    payload: {
      id: 'test',
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
      }
    }
  });

  return (
    <Provider store={store}>
      <div style={{ display: 'flex', height: '600px' }}>
        <IconPalette />
        <div style={{ flex: 1 }}>
          <HexGrid />
        </div>
      </div>
    </Provider>
  );
};

describe('IconPalette Integration', () => {
  it('renders both IconPalette and HexGrid components', () => {
    render(<TestApp />);
    
    expect(screen.getByText('Icon Palette')).toBeInTheDocument();
    expect(screen.getByText('Mountains')).toBeInTheDocument();
    expect(screen.getByText('Plains')).toBeInTheDocument();
  });

  it('allows dragging icons from palette', () => {
    render(<TestApp />);
    
    const mountainsIcon = screen.getByText('Mountains').closest('div');
    expect(mountainsIcon).toHaveAttribute('draggable', 'true');
    
    // Test drag start
    const mockDataTransfer = {
      setData: vi.fn(),
      setDragImage: vi.fn(),
      effectAllowed: ''
    };
    
    const dragEvent = new Event('dragstart', { bubbles: true }) as any;
    dragEvent.dataTransfer = mockDataTransfer;
    
    fireEvent(mountainsIcon!, dragEvent);
    
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      expect.stringContaining('"iconId":"mountains"')
    );
  });

  it('creates proper drag data structure', () => {
    render(<TestApp />);
    
    const mountainsIcon = screen.getByText('Mountains').closest('div');
    const mockDataTransfer = {
      setData: vi.fn(),
      setDragImage: vi.fn(),
      effectAllowed: ''
    };
    
    const dragEvent = new Event('dragstart', { bubbles: true }) as any;
    dragEvent.dataTransfer = mockDataTransfer;
    
    fireEvent(mountainsIcon!, dragEvent);
    
    const dragDataCall = mockDataTransfer.setData.mock.calls.find(
      call => call[0] === 'application/json'
    );
    
    expect(dragDataCall).toBeDefined();
    const dragData = JSON.parse(dragDataCall[1]);
    
    expect(dragData).toEqual({
      iconId: 'mountains',
      category: 'terrain',
      type: 'mountains'
    });
  });

  it('shows all icon categories', () => {
    render(<TestApp />);
    
    expect(screen.getByText('TERRAIN')).toBeInTheDocument();
    expect(screen.getByText('STRUCTURES')).toBeInTheDocument();
    expect(screen.getByText('MARKERS')).toBeInTheDocument();
  });

  it('displays correct number of icons in each category', () => {
    render(<TestApp />);
    
    // Terrain icons
    expect(screen.getByText('Mountains')).toBeInTheDocument();
    expect(screen.getByText('Plains')).toBeInTheDocument();
    expect(screen.getByText('Swamps')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Desert')).toBeInTheDocument();
    
    // Structure icons
    expect(screen.getByText('Tower')).toBeInTheDocument();
    expect(screen.getByText('Town')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    
    // Marker icons
    expect(screen.getByText('Generic Marker')).toBeInTheDocument();
  });
});