/**
 * Custom hook for handling keyboard shortcuts
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { uiActions } from '../store';
import { selectCurrentMode, selectIsGMMode, selectQuickTerrainMode, selectSelectedQuickTerrain, selectBrushMode, selectBrushSize } from '../store/selectors';
import { BRUSH_SIZES } from '../utils/brushUtils';
import type { BrushSize } from '../store/slices/uiSlice';
import { TERRAIN_ICONS, STRUCTURE_ICONS } from '../types/icons';

export const useKeyboardShortcuts = () => {
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector(selectCurrentMode);
  const isGMMode = useAppSelector(selectIsGMMode);
  const quickTerrainMode = useAppSelector(selectQuickTerrainMode);
  const selectedQuickTerrain = useAppSelector(selectSelectedQuickTerrain);
  const brushMode = useAppSelector(selectBrushMode);
  const brushSize = useAppSelector(selectBrushSize);
  const floodFillMode = useAppSelector((state) => state.ui.floodFillMode);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Prevent default for handled shortcuts
      const preventDefault = () => {
        event.preventDefault();
        event.stopPropagation();
      };

      // Handle B + number keys for brush size selection
      if (isGMMode && event.key >= '1' && event.key <= '4' && event.code.startsWith('Digit') && 
          (event.ctrlKey || event.metaKey || event.shiftKey)) {
        const keyIndex = parseInt(event.key) - 1;
        if (keyIndex < BRUSH_SIZES.length) {
          preventDefault();
          const brushSize = BRUSH_SIZES[keyIndex] as BrushSize;
          dispatch(uiActions.setBrushSize(brushSize));
          if (!brushMode) {
            dispatch(uiActions.setBrushMode(true));
          }
        }
        return;
      }

      // Handle number keys for terrain and structure selection (1-9)
      if (isGMMode && event.key >= '1' && event.key <= '9' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        const keyIndex = parseInt(event.key) - 1;
        
        // First 5 keys (1-5) for terrain icons
        if (keyIndex < TERRAIN_ICONS.length) {
          preventDefault();
          const terrain = TERRAIN_ICONS[keyIndex];
          dispatch(uiActions.setSelectedQuickTerrain(terrain.type));
          if (!quickTerrainMode) {
            dispatch(uiActions.setQuickTerrainMode(true));
          }
        }
        // Keys 6-8 for structure icons
        else if (keyIndex >= 5 && keyIndex < 5 + STRUCTURE_ICONS.length) {
          preventDefault();
          const structureIndex = keyIndex - 5;
          const structure = STRUCTURE_ICONS[structureIndex];
          dispatch(uiActions.setSelectedQuickTerrain(structure.type));
          if (!quickTerrainMode) {
            dispatch(uiActions.setQuickTerrainMode(true));
          }
        }
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'f1':
        case '?':
          // Toggle shortcuts overlay (quick reference)
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleShortcutsOverlay());
          }
          break;

        case 'f11':
          // Fullscreen toggle (handled by browser, but we track state)
          preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.error);
            dispatch(uiActions.setFullscreen(true));
          } else {
            document.exitFullscreen().catch(console.error);
            dispatch(uiActions.setFullscreen(false));
          }
          break;

        case 'p':
          // Toggle projection mode
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleProjectionMode());
          }
          break;

        case ' ':
          // Spacebar: Toggle GM/Player mode
          preventDefault();
          dispatch(uiActions.toggleMode());
          break;

        case '+':
        case '=':
          // Zoom in
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.zoomIn());
          }
          break;

        case '-':
        case '_':
          // Zoom out
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.zoomOut());
          }
          break;

        case 'escape':
          // Cancel operations and close dialogs
          preventDefault();
          dispatch(uiActions.closePropertyDialog());
          dispatch(uiActions.closeSettingsPanel());
          dispatch(uiActions.closeMapManager());
          dispatch(uiActions.setShowShortcutsOverlay(false));
          dispatch(uiActions.clearHexSelection());
          if (brushMode) {
            dispatch(uiActions.setBrushMode(false));
          }
          if (floodFillMode) {
            dispatch(uiActions.setFloodFillMode(false));
          }
          if (quickTerrainMode) {
            dispatch(uiActions.setQuickTerrainMode(false));
          }
          break;

        case 'tab':
          // Cycle through terrain and structure types in quick mode
          if (isGMMode && !event.ctrlKey && !event.metaKey) {
            preventDefault();
            const allIcons = [...TERRAIN_ICONS, ...STRUCTURE_ICONS];
            const currentIndex = allIcons.findIndex(icon => icon.type === selectedQuickTerrain);
            const nextIndex = (currentIndex + 1) % allIcons.length;
            const nextIcon = allIcons[nextIndex];
            dispatch(uiActions.setSelectedQuickTerrain(nextIcon.type));
            if (!quickTerrainMode) {
              dispatch(uiActions.setQuickTerrainMode(true));
            }
          }
          break;

        case 'b':
          // Toggle brush mode (GM mode only)
          if (isGMMode && !event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleBrushMode());
          }
          break;

        case 'f':
          // Toggle flood fill mode (GM mode only)
          if (isGMMode && !event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleFloodFillMode());
          }
          break;



        case 'h':
          // Toggle help
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleHelp());
          }
          break;



        case 'm':
          // Toggle GM/Player mode (alternative to spacebar)
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleMode());
          }
          break;

        case 'arrowup':
        case 'w':
          // Pan up
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.updatePanOffset({ deltaX: 0, deltaY: 20 }));
          }
          break;

        case 'arrowdown':
          // Pan down
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.updatePanOffset({ deltaX: 0, deltaY: -20 }));
          }
          break;

        case 's':
          // Open settings (GM mode only) or pan down (Player mode)
          if (!event.ctrlKey && !event.metaKey) {
            if (isGMMode) {
              preventDefault();
              dispatch(uiActions.toggleSettingsPanel());
            } else {
              preventDefault();
              dispatch(uiActions.updatePanOffset({ deltaX: 0, deltaY: -20 }));
            }
          }
          break;

        case 'arrowleft':
        case 'a':
          // Pan left
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.updatePanOffset({ deltaX: 20, deltaY: 0 }));
          }
          break;

        case 'arrowright':
        case 'd':
          // Pan right
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.updatePanOffset({ deltaX: -20, deltaY: 0 }));
          }
          break;

        case 'z':
          // Undo (Ctrl+Z)
          if (event.ctrlKey || event.metaKey) {
            preventDefault();
            // Import historyActions dynamically to avoid circular dependency
            import('../store').then(({ historyActions }) => {
              dispatch(historyActions.undo());
            });
          }
          break;

        case 'y':
          // Redo (Ctrl+Y)
          if (event.ctrlKey || event.metaKey) {
            preventDefault();
            // Import historyActions dynamically to avoid circular dependency
            import('../store').then(({ historyActions }) => {
              dispatch(historyActions.redo());
            });
          }
          break;

        case 'c':
          // Copy (Ctrl+C) or toggle coordinates (C alone)
          if (event.ctrlKey || event.metaKey) {
            if (isGMMode) {
              preventDefault();
              // Import copy/paste actions dynamically
              import('../utils/copyPasteActions').then(({ handleCopy }) => {
                handleCopy(dispatch);
              });
            }
          } else if (isGMMode) {
            preventDefault();
            dispatch(uiActions.toggleCoordinates());
          }
          break;

        case 'v':
          // Paste (Ctrl+V)
          if ((event.ctrlKey || event.metaKey) && isGMMode) {
            preventDefault();
            // Import copy/paste actions dynamically
            import('../utils/copyPasteActions').then(({ handlePaste }) => {
              handlePaste(dispatch);
            });
          }
          break;

        case 'r':
          // Toggle selection mode (GM mode only)
          if (isGMMode && !event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleSelectionMode());
          }
          break;

        default:
          // No action for other keys
          break;
      }
    };

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      dispatch(uiActions.setFullscreen(isFullscreen));
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [dispatch, currentMode, isGMMode, quickTerrainMode, selectedQuickTerrain, brushMode, brushSize, floodFillMode]);
};

// Export shortcut definitions for documentation
export const KEYBOARD_SHORTCUTS = {
  // Number keys for terrain and structure selection
  '1-9': 'Quick Icon Selection (GM Mode)',
  
  // Mode and view controls
  'Space/M': 'Toggle GM/Player Mode',
  'F1/?': 'Toggle Shortcuts Overlay',
  'F11': 'Toggle Fullscreen',
  'P': 'Toggle Projection Mode',
  
  // Map navigation
  'WASD/Arrows': 'Pan Map',
  '+/-': 'Zoom In/Out',
  
  // Editing controls
  'Ctrl+Z': 'Undo',
  'Ctrl+Y': 'Redo',
  'Tab': 'Cycle Icon Types (GM Mode)',
  'Escape': 'Cancel Operations & Close Dialogs',
  
  // Brush controls
  'B': 'Toggle Brush Mode (GM Mode)',
  'F': 'Toggle Flood Fill Mode (GM Mode)',
  'Shift+1-4': 'Brush Size Selection (1×1, 3×3, 5×5, 7×7)',
  
  // Copy/paste controls
  'Ctrl+C': 'Copy Selected Region (GM Mode)',
  'Ctrl+V': 'Paste Pattern (GM Mode)',
  'R': 'Toggle Selection Mode (GM Mode)',
  
  // GM Mode specific
  'S': 'Settings Panel (GM Mode)',
  'C': 'Toggle Coordinates (GM Mode)',
  'H': 'Toggle Help',
} as const;

// Icon shortcuts mapping for quick reference
export const ICON_SHORTCUTS = {
  // Terrain icons (1-5)
  '1': 'Mountains',
  '2': 'Plains', 
  '3': 'Swamps',
  '4': 'Water',
  '5': 'Desert',
  // Structure icons (6-8)
  '6': 'Tower',
  '7': 'Town',
  '8': 'City',
} as const;

// Legacy export for backward compatibility
export const TERRAIN_SHORTCUTS = {
  '1': 'Mountains',
  '2': 'Plains', 
  '3': 'Swamps',
  '4': 'Water',
  '5': 'Desert',
} as const;