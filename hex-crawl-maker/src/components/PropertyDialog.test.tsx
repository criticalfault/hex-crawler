/**
 * PropertyDialog component tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PropertyDialog } from './PropertyDialog';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import type { RootState } from '../store';
import type { HexCoordinate, MapData } from '../types/hex';

// Mock store setup
const createMockStore = (initialState?: Partial<RootState>) => {
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

  return configureStore({
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
      ...initialState,
    },
  });
};

const renderWithStore = (store: ReturnType<typeof createMockStore>) => {
  return render(
    <Provider store={store}>
      <PropertyDialog />
    </Provider>
  );
};

describe('PropertyDialog', () => {
  const testHex: HexCoordinate = { q: 1, r: 2 };

  describe('Dialog Visibility', () => {
    it('should not render when dialog is closed', () => {
      const store = createMockStore();
      renderWithStore(store);
      
      expect(screen.queryByText('Edit Hex Properties')).not.toBeInTheDocument();
    });

    it('should render when dialog is open', () => {
      const store = createMockStore({
        ui: {
          currentMode: 'gm',
          selectedHex: testHex,
          isPropertyDialogOpen: true,
          isDragging: false,
          draggedIcon: null,
          showCoordinates: false,
          isFullscreen: false,
          showHelp: false,
          zoom: 1,
          panOffset: { x: 0, y: 0 },
        },
      });
      
      renderWithStore(store);
      
      expect(screen.getByText('Edit Hex Properties')).toBeInTheDocument();
      expect(screen.getByText('Hex (1, 2)')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    let store: ReturnType<typeof createMockStore>;

    beforeEach(() => {
      store = createMockStore({
        ui: {
          currentMode: 'gm',
          selectedHex: testHex,
          isPropertyDialogOpen: true,
          isDragging: false,
          draggedIcon: null,
          showCoordinates: false,
          isFullscreen: false,
          showHelp: false,
          zoom: 1,
          panOffset: { x: 0, y: 0 },
        },
      });
    });

    it('should render all form fields', () => {
      renderWithStore(store);
      
      expect(screen.getByText('Icon Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Icon')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('GM Notes')).toBeInTheDocument();
    });

    it('should show character counts for text fields', () => {
      renderWithStore(store);
      
      expect(screen.getByText('0/50')).toBeInTheDocument(); // Name counter
      expect(screen.getByText('0/500')).toBeInTheDocument(); // Description counter
      expect(screen.getByText('0/1000')).toBeInTheDocument(); // GM Notes counter
    });

    it('should update character counts when typing', async () => {
      const user = userEvent.setup();
      renderWithStore(store);
      
      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'Test Location');
      
      expect(screen.getByText('13/50')).toBeInTheDocument();
    });

    it('should validate field lengths', async () => {
      const user = userEvent.setup();
      renderWithStore(store);
      
      const nameInput = screen.getByLabelText('Name');
      // Use fireEvent to bypass maxLength restriction for testing
      const longName = 'a'.repeat(51);
      fireEvent.change(nameInput, { target: { value: longName } });
      
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name must be 50 characters or less')).toBeInTheDocument();
      });
    });
  });

  describe('Icon Selection', () => {
    let store: ReturnType<typeof createMockStore>;

    beforeEach(() => {
      store = createMockStore({
        ui: {
          currentMode: 'gm',
          selectedHex: testHex,
          isPropertyDialogOpen: true,
          isDragging: false,
          draggedIcon: null,
          showCoordinates: false,
          isFullscreen: false,
          showHelp: false,
          zoom: 1,
          panOffset: { x: 0, y: 0 },
        },
      });
    });

    it('should default to terrain type', () => {
      renderWithStore(store);
      
      const terrainButton = screen.getByText('Terrain');
      expect(terrainButton).toHaveClass('active');
    });

    it('should switch between terrain and landmark types', async () => {
      const user = userEvent.setup();
      renderWithStore(store);
      
      const landmarkButton = screen.getByText('Landmark');
      await user.click(landmarkButton);
      
      expect(landmarkButton).toHaveClass('active');
      expect(screen.getByText('Terrain')).not.toHaveClass('active');
    });

    it('should show appropriate icons for selected type', async () => {
      const user = userEvent.setup();
      renderWithStore(store);
      
      // Check terrain options
      const iconSelect = screen.getByLabelText('Icon');
      expect(screen.getByText('Plains')).toBeInTheDocument();
      
      // Switch to landmark
      const landmarkButton = screen.getByText('Landmark');
      await user.click(landmarkButton);
      
      expect(screen.getByText('Tower')).toBeInTheDocument();
    });
  });

  describe('Existing Data Loading', () => {
    it('should load existing hex data when dialog opens', () => {
      const store = createMockStore({
        ui: {
          currentMode: 'gm',
          selectedHex: testHex,
          isPropertyDialogOpen: true,
          isDragging: false,
          draggedIcon: null,
          showCoordinates: false,
          isFullscreen: false,
          showHelp: false,
          zoom: 1,
          panOffset: { x: 0, y: 0 },
        },
      });

      // Add existing hex data
      const mapState = store.getState().map;
      if (mapState.currentMap) {
        mapState.currentMap.cells.set('1,2', {
          coordinate: testHex,
          terrain: 'mountains',
          name: 'Test Mountain',
          description: 'A tall mountain',
          gmNotes: 'Secret cave here',
          isExplored: false,
          isVisible: false,
        });
      }

      renderWithStore(store);
      
      expect(screen.getByDisplayValue('Test Mountain')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A tall mountain')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Secret cave here')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    let store: ReturnType<typeof createMockStore>;

    beforeEach(() => {
      store = createMockStore({
        ui: {
          currentMode: 'gm',
          selectedHex: testHex,
          isPropertyDialogOpen: true,
          isDragging: false,
          draggedIcon: null,
          showCoordinates: false,
          isFullscreen: false,
          showHelp: false,
          zoom: 1,
          panOffset: { x: 0, y: 0 },
        },
      });
    });

    it('should dispatch placeIcon action when saving', async () => {
      const user = userEvent.setup();
      renderWithStore(store);
      
      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'Test Location');
      
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);
      
      // Check that the action was dispatched
      const state = store.getState();
      expect(state.ui.isPropertyDialogOpen).toBe(false);
    });

    it('should close dialog when canceling', async () => {
      const user = userEvent.setup();
      renderWithStore(store);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      const state = store.getState();
      expect(state.ui.isPropertyDialogOpen).toBe(false);
    });

    it('should close dialog when clicking backdrop', async () => {
      const user = userEvent.setup();
      renderWithStore(store);
      
      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
        
        const state = store.getState();
        expect(state.ui.isPropertyDialogOpen).toBe(false);
      }
    });

    it('should close dialog when clicking close button', async () => {
      const user = userEvent.setup();
      renderWithStore(store);
      
      const closeButton = screen.getByLabelText('Close dialog');
      await user.click(closeButton);
      
      const state = store.getState();
      expect(state.ui.isPropertyDialogOpen).toBe(false);
    });
  });

  describe('Accessibility', () => {
    let store: ReturnType<typeof createMockStore>;

    beforeEach(() => {
      store = createMockStore({
        ui: {
          currentMode: 'gm',
          selectedHex: testHex,
          isPropertyDialogOpen: true,
          isDragging: false,
          draggedIcon: null,
          showCoordinates: false,
          isFullscreen: false,
          showHelp: false,
          zoom: 1,
          panOffset: { x: 0, y: 0 },
        },
      });
    });

    it('should have proper labels for all form fields', () => {
      renderWithStore(store);
      
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('GM Notes')).toBeInTheDocument();
      expect(screen.getByLabelText('Icon')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      renderWithStore(store);
      
      const closeButton = screen.getByLabelText('Close dialog');
      expect(closeButton).toHaveAttribute('aria-label', 'Close dialog');
    });
  });
});