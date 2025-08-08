import { uiSlice, uiActions } from './uiSlice';
import type { HexCoordinate } from '../../types';

describe('uiSlice', () => {
  const initialState = {
    currentMode: 'gm' as const,
    selectedHex: null,
    isPropertyDialogOpen: false,
    isSettingsPanelOpen: false,
    isMapManagerOpen: false,
    isDragging: false,
    draggedIcon: null,
    showCoordinates: false,
    isFullscreen: false,
    showHelp: false,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    isProjectionMode: false,
    projectionSettings: {
      highContrast: true,
      largeText: true,
      simplifiedUI: true,
    },
  };

  describe('mode switching', () => {
    it('should set mode to player', () => {
      const action = uiActions.setMode('player');
      const state = uiSlice.reducer(initialState, action);

      expect(state.currentMode).toBe('player');
      expect(state.selectedHex).toBeNull();
      expect(state.isPropertyDialogOpen).toBe(false);
    });

    it('should toggle mode from GM to player', () => {
      const action = uiActions.toggleMode();
      const state = uiSlice.reducer(initialState, action);

      expect(state.currentMode).toBe('player');
    });

    it('should toggle mode from player to GM', () => {
      const playerState = { ...initialState, currentMode: 'player' as const };
      const action = uiActions.toggleMode();
      const state = uiSlice.reducer(playerState, action);

      expect(state.currentMode).toBe('gm');
    });

    it('should clear selection when switching modes', () => {
      const stateWithSelection = {
        ...initialState,
        selectedHex: { q: 1, r: 1 },
        isPropertyDialogOpen: true,
      };

      const action = uiActions.setMode('player');
      const state = uiSlice.reducer(stateWithSelection, action);

      expect(state.selectedHex).toBeNull();
      expect(state.isPropertyDialogOpen).toBe(false);
    });
  });

  describe('hex selection', () => {
    it('should select a hex', () => {
      const coordinate: HexCoordinate = { q: 2, r: 3 };
      const action = uiActions.selectHex(coordinate);
      const state = uiSlice.reducer(initialState, action);

      expect(state.selectedHex).toEqual(coordinate);
    });

    it('should clear selection', () => {
      const stateWithSelection = {
        ...initialState,
        selectedHex: { q: 1, r: 1 },
        isPropertyDialogOpen: true,
      };

      const action = uiActions.clearSelection();
      const state = uiSlice.reducer(stateWithSelection, action);

      expect(state.selectedHex).toBeNull();
      expect(state.isPropertyDialogOpen).toBe(false);
    });
  });

  describe('property dialog', () => {
    it('should open property dialog with hex selection', () => {
      const coordinate: HexCoordinate = { q: 1, r: 1 };
      const action = uiActions.openPropertyDialog(coordinate);
      const state = uiSlice.reducer(initialState, action);

      expect(state.selectedHex).toEqual(coordinate);
      expect(state.isPropertyDialogOpen).toBe(true);
    });

    it('should close property dialog', () => {
      const stateWithDialog = {
        ...initialState,
        isPropertyDialogOpen: true,
      };

      const action = uiActions.closePropertyDialog();
      const state = uiSlice.reducer(stateWithDialog, action);

      expect(state.isPropertyDialogOpen).toBe(false);
    });
  });

  describe('settings panel', () => {
    it('should open settings panel', () => {
      const action = uiActions.openSettingsPanel();
      const state = uiSlice.reducer(initialState, action);

      expect(state.isSettingsPanelOpen).toBe(true);
    });

    it('should close settings panel', () => {
      const stateWithPanel = {
        ...initialState,
        isSettingsPanelOpen: true,
      };

      const action = uiActions.closeSettingsPanel();
      const state = uiSlice.reducer(stateWithPanel, action);

      expect(state.isSettingsPanelOpen).toBe(false);
    });

    it('should toggle settings panel', () => {
      const action = uiActions.toggleSettingsPanel();
      const state = uiSlice.reducer(initialState, action);

      expect(state.isSettingsPanelOpen).toBe(true);

      const secondState = uiSlice.reducer(state, action);
      expect(secondState.isSettingsPanelOpen).toBe(false);
    });
  });

  describe('drag and drop', () => {
    it('should start drag operation', () => {
      const dragData = { type: 'terrain' as const, value: 'mountains' };
      const action = uiActions.startDrag(dragData);
      const state = uiSlice.reducer(initialState, action);

      expect(state.isDragging).toBe(true);
      expect(state.draggedIcon).toEqual(dragData);
    });

    it('should end drag operation', () => {
      const stateWithDrag = {
        ...initialState,
        isDragging: true,
        draggedIcon: { type: 'terrain' as const, value: 'mountains' },
      };

      const action = uiActions.endDrag();
      const state = uiSlice.reducer(stateWithDrag, action);

      expect(state.isDragging).toBe(false);
      expect(state.draggedIcon).toBeNull();
    });
  });

  describe('zoom and pan', () => {
    it('should set zoom level', () => {
      const action = uiActions.setZoom(2.5);
      const state = uiSlice.reducer(initialState, action);

      expect(state.zoom).toBe(2.5);
    });

    it('should clamp zoom to minimum value', () => {
      const action = uiActions.setZoom(0.05);
      const state = uiSlice.reducer(initialState, action);

      expect(state.zoom).toBe(0.1);
    });

    it('should clamp zoom to maximum value', () => {
      const action = uiActions.setZoom(10);
      const state = uiSlice.reducer(initialState, action);

      expect(state.zoom).toBe(5);
    });

    it('should zoom in', () => {
      const action = uiActions.zoomIn();
      const state = uiSlice.reducer(initialState, action);

      expect(state.zoom).toBeCloseTo(1.2);
    });

    it('should zoom out', () => {
      const action = uiActions.zoomOut();
      const state = uiSlice.reducer(initialState, action);

      expect(state.zoom).toBeCloseTo(0.833, 2);
    });

    it('should reset zoom and pan', () => {
      const stateWithZoomPan = {
        ...initialState,
        zoom: 2,
        panOffset: { x: 100, y: 50 },
      };

      const action = uiActions.resetZoom();
      const state = uiSlice.reducer(stateWithZoomPan, action);

      expect(state.zoom).toBe(1);
      expect(state.panOffset).toEqual({ x: 0, y: 0 });
    });

    it('should update pan offset', () => {
      const action = uiActions.updatePanOffset({ deltaX: 10, deltaY: -5 });
      const state = uiSlice.reducer(initialState, action);

      expect(state.panOffset).toEqual({ x: 10, y: -5 });
    });
  });

  describe('view options', () => {
    it('should toggle coordinates display', () => {
      const action = uiActions.toggleCoordinates();
      const state = uiSlice.reducer(initialState, action);

      expect(state.showCoordinates).toBe(true);

      const secondState = uiSlice.reducer(state, action);
      expect(secondState.showCoordinates).toBe(false);
    });

    it('should set coordinates display', () => {
      const action = uiActions.setShowCoordinates(true);
      const state = uiSlice.reducer(initialState, action);

      expect(state.showCoordinates).toBe(true);
    });

    it('should toggle fullscreen', () => {
      const action = uiActions.toggleFullscreen();
      const state = uiSlice.reducer(initialState, action);

      expect(state.isFullscreen).toBe(true);
    });

    it('should toggle help', () => {
      const action = uiActions.toggleHelp();
      const state = uiSlice.reducer(initialState, action);

      expect(state.showHelp).toBe(true);
    });
  });

  describe('projection mode', () => {
    it('should toggle projection mode', () => {
      const action = uiActions.toggleProjectionMode();
      const state = uiSlice.reducer(initialState, action);

      expect(state.isProjectionMode).toBe(true);
    });

    it('should set projection mode', () => {
      const action = uiActions.setProjectionMode(true);
      const state = uiSlice.reducer(initialState, action);

      expect(state.isProjectionMode).toBe(true);
    });

    it('should update projection settings', () => {
      const newSettings = { highContrast: false, largeText: false };
      const action = uiActions.updateProjectionSettings(newSettings);
      const state = uiSlice.reducer(initialState, action);

      expect(state.projectionSettings.highContrast).toBe(false);
      expect(state.projectionSettings.largeText).toBe(false);
      expect(state.projectionSettings.simplifiedUI).toBe(true); // Should preserve existing
    });
  });
});