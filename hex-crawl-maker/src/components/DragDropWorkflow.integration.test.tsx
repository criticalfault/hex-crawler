import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { vi } from 'vitest';
import { IconPalette } from './IconPalette';
import { HexGrid } from './HexGrid';
import { PropertyDialog } from './PropertyDialog';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';

// Enable Immer MapSet plugin
enableMapSet();

// Mock canvas context
const mockCanvasContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 50 })),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext);
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
  left: 0,
  top: 0,
  width: 800,
  height: 600,
  right: 800,
  bottom: 600,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
}));

const createTestStore = () => {
  const store = configureStore({
    reducer: {
      map: mapSlice.reducer,
      ui: uiSlice.reducer,
      exploration: explorationSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['map/setMapData', 'map/updateHexCell', 'map/placeIcon'],
          ignoredPaths: ['map.currentMap.cells', 'map.savedMaps'],
        },
      }),
  });

  // Create a default map
  store.dispatch({
    type: 'map/createNewMap',
    payload: { name: 'Test Map', dimensions: { width: 10, height: 10 } },
  });

  return store;
};

const TestApp = () => {
  const store = createTestStore();
  
  return (
    <Provider store={store}>
      <div style={{ display: 'flex' }}>
        <IconPalette />
        <div style={{ width: '800px', height: '600px' }}>
          <HexGrid />
        </div>
      </div>
      <PropertyDialog />
    </Provider>
  );
};

describe('Drag and Drop Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full drag and drop workflow from palette to hex', async () => {
    render(<TestApp />);

    // Find the mountains icon in the palette
    const mountainsIcon = screen.getByText('Mountains').closest('div');
    expect(mountainsIcon).toBeInTheDocument();

    // Start drag operation
    fireEvent.dragStart(mountainsIcon!, {
      dataTransfer: {
        setData: vi.fn(),
        getData: vi.fn(() => JSON.stringify({
          type: 'terrain',
          value: 'mountains',
        })),
      },
    });

    // Find the hex grid canvas
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();

    // Simulate drop on hex grid
    fireEvent.dragOver(canvas, {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn(() => JSON.stringify({
          type: 'terrain',
          value: 'mountains',
        })),
      },
    });

    fireEvent.drop(canvas, {
      preventDefault: vi.fn(),
      clientX: 400, // Center of canvas
      clientY: 300,
      dataTransfer: {
        getData: vi.fn(() => JSON.stringify({
          type: 'terrain',
          value: 'mountains',
        })),
      },
    });

    // Property dialog should open
    await waitFor(() => {
      expect(screen.getByText('Hex Properties')).toBeInTheDocument();
    });

    // Fill in property dialog
    const nameInput = screen.getByLabelText('Name:');
    fireEvent.change(nameInput, { target: { value: 'Test Mountain' } });

    const descriptionInput = screen.getByLabelText('Description:');
    fireEvent.change(descriptionInput, { target: { value: 'A tall mountain peak' } });

    // Save the properties
    fireEvent.click(screen.getByText('Save'));

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Hex Properties')).not.toBeInTheDocument();
    });
  });

  it('should handle drag and drop with different icon types', async () => {
    render(<TestApp />);

    // Test with landmark icon (tower)
    const towerIcon = screen.getByText('Tower').closest('div');
    expect(towerIcon).toBeInTheDocument();

    fireEvent.dragStart(towerIcon!, {
      dataTransfer: {
        setData: vi.fn(),
        getData: vi.fn(() => JSON.stringify({
          type: 'landmark',
          value: 'tower',
        })),
      },
    });

    const canvas = screen.getByRole('img', { hidden: true });
    
    fireEvent.drop(canvas, {
      preventDefault: vi.fn(),
      clientX: 200,
      clientY: 200,
      dataTransfer: {
        getData: vi.fn(() => JSON.stringify({
          type: 'landmark',
          value: 'tower',
        })),
      },
    });

    // Property dialog should open for landmark
    await waitFor(() => {
      expect(screen.getByText('Hex Properties')).toBeInTheDocument();
    });

    // Icon type should be set to tower
    const iconSelect = screen.getByDisplayValue('tower');
    expect(iconSelect).toBeInTheDocument();
  });

  it('should provide visual feedback during drag operation', () => {
    render(<TestApp />);

    const mountainsIcon = screen.getByText('Mountains').closest('div');
    
    // Start drag - should add dragging class
    fireEvent.dragStart(mountainsIcon!, {
      dataTransfer: {
        setData: vi.fn(),
      },
    });

    // Check for visual feedback (this would depend on CSS classes)
    expect(mountainsIcon).toHaveClass('dragging');
  });

  it('should handle invalid drop targets gracefully', () => {
    render(<TestApp />);

    const mountainsIcon = screen.getByText('Mountains').closest('div');
    
    fireEvent.dragStart(mountainsIcon!, {
      dataTransfer: {
        setData: vi.fn(),
      },
    });

    // Try to drop on an invalid target (the palette itself)
    const palette = screen.getByText('Icon Palette').closest('div');
    
    fireEvent.drop(palette!, {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn(() => JSON.stringify({
          type: 'terrain',
          value: 'mountains',
        })),
      },
    });

    // Property dialog should not open
    expect(screen.queryByText('Hex Properties')).not.toBeInTheDocument();
  });

  it('should handle drag cancellation', () => {
    render(<TestApp />);

    const mountainsIcon = screen.getByText('Mountains').closest('div');
    
    fireEvent.dragStart(mountainsIcon!, {
      dataTransfer: {
        setData: vi.fn(),
      },
    });

    // Cancel the drag
    fireEvent.dragEnd(mountainsIcon!);

    // Should remove dragging state
    expect(mountainsIcon).not.toHaveClass('dragging');
  });

  it('should support replacing existing icons', async () => {
    const store = createTestStore();
    
    // First, place a mountain icon
    store.dispatch({
      type: 'map/placeIcon',
      payload: {
        coordinate: { q: 0, r: 0 },
        terrain: 'mountains',
        name: 'Old Mountain',
      },
    });

    render(
      <Provider store={store}>
        <div style={{ display: 'flex' }}>
          <IconPalette />
          <div style={{ width: '800px', height: '600px' }}>
            <HexGrid />
          </div>
        </div>
        <PropertyDialog />
      </Provider>
    );

    // Now drag a plains icon to the same location
    const plainsIcon = screen.getByText('Plains').closest('div');
    
    fireEvent.dragStart(plainsIcon!, {
      dataTransfer: {
        setData: vi.fn(),
      },
    });

    const canvas = screen.getByRole('img', { hidden: true });
    
    fireEvent.drop(canvas, {
      preventDefault: vi.fn(),
      clientX: 400, // Same location as before
      clientY: 300,
      dataTransfer: {
        getData: vi.fn(() => JSON.stringify({
          type: 'terrain',
          value: 'plains',
        })),
      },
    });

    // Property dialog should open with existing data
    await waitFor(() => {
      expect(screen.getByText('Hex Properties')).toBeInTheDocument();
    });

    // Name field should have the old name
    const nameInput = screen.getByDisplayValue('Old Mountain');
    expect(nameInput).toBeInTheDocument();

    // But icon type should be updated to plains
    const iconSelect = screen.getByDisplayValue('plains');
    expect(iconSelect).toBeInTheDocument();
  });

  it('should maintain state consistency during drag operations', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <div style={{ display: 'flex' }}>
          <IconPalette />
          <div style={{ width: '800px', height: '600px' }}>
            <HexGrid />
          </div>
        </div>
        <PropertyDialog />
      </Provider>
    );

    // Start drag
    const mountainsIcon = screen.getByText('Mountains').closest('div');
    fireEvent.dragStart(mountainsIcon!);

    // Check that UI state reflects dragging
    let state = store.getState();
    expect(state.ui.isDragging).toBe(true);
    expect(state.ui.draggedIcon).toEqual({
      type: 'terrain',
      value: 'mountains',
    });

    // End drag
    fireEvent.dragEnd(mountainsIcon!);

    // Check that dragging state is cleared
    state = store.getState();
    expect(state.ui.isDragging).toBe(false);
    expect(state.ui.draggedIcon).toBeNull();
  });
});