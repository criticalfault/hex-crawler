/**
 * Custom hook for handling keyboard shortcuts
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { uiActions } from '../store';
import { selectCurrentMode, selectIsGMMode } from '../store/selectors';

export const useKeyboardShortcuts = () => {
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector(selectCurrentMode);
  const isGMMode = useAppSelector(selectIsGMMode);

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

      switch (event.key.toLowerCase()) {
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

        case 'm':
          // Toggle GM/Player mode
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleMode());
          }
          break;

        case ' ':
          // Reset zoom and pan
          preventDefault();
          dispatch(uiActions.resetZoom());
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
          // Close dialogs and panels
          preventDefault();
          dispatch(uiActions.closePropertyDialog());
          dispatch(uiActions.closeSettingsPanel());
          dispatch(uiActions.closeMapManager());
          dispatch(uiActions.clearSelection());
          break;

        case 's':
          // Open settings (GM mode only)
          if (isGMMode && !event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleSettingsPanel());
          }
          break;

        case 'h':
          // Toggle help
          if (!event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleHelp());
          }
          break;

        case 'c':
          // Toggle coordinates display (GM mode only)
          if (isGMMode && !event.ctrlKey && !event.metaKey) {
            preventDefault();
            dispatch(uiActions.toggleCoordinates());
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
  }, [dispatch, currentMode, isGMMode]);
};

// Export shortcut definitions for documentation
export const KEYBOARD_SHORTCUTS = {
  'F11': 'Toggle Fullscreen',
  'P': 'Toggle Projection Mode',
  'M': 'Switch GM/Player Mode',
  'Space': 'Reset Zoom & Pan',
  '+/-': 'Zoom In/Out',
  'Escape': 'Close Dialogs',
  'S': 'Settings (GM Mode)',
  'H': 'Toggle Help',
  'C': 'Toggle Coordinates (GM Mode)',
  'WASD/Arrows': 'Pan Map',
  'Ctrl+Z': 'Undo',
  'Ctrl+Y': 'Redo',
} as const;