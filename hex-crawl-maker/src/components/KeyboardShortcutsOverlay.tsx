/**
 * Keyboard shortcuts overlay component - quick reference for shortcuts
 */

import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCurrentMode, selectIsGMMode } from '../store/selectors';
import { uiActions } from '../store';
import { ICON_SHORTCUTS, TERRAIN_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import './KeyboardShortcutsOverlay.css';

interface KeyboardShortcutsOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsOverlay: React.FC<KeyboardShortcutsOverlayProps> = ({
  isVisible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector(selectCurrentMode);
  const isGMMode = useAppSelector(selectIsGMMode);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const essentialShortcuts = [
    { key: 'Space', description: 'Toggle GM/Player Mode', category: 'mode' },
    { key: 'M', description: 'Toggle GM/Player Mode (Alt)', category: 'mode' },
    { key: 'Escape', description: 'Cancel & Close Dialogs', category: 'universal' },
    { key: '+/-', description: 'Zoom In/Out', category: 'navigation' },
    { key: 'WASD', description: 'Pan Map', category: 'navigation' },
    { key: '↑↓←→', description: 'Pan Map (Arrows)', category: 'navigation' },
  ];

  const gmShortcuts = [
    { key: '1-8', description: 'Quick Icon Selection', category: 'terrain' },
    { key: 'Tab', description: 'Cycle Icon Types', category: 'terrain' },
    { key: 'B', description: 'Toggle Brush Mode', category: 'brush' },
    { key: 'F', description: 'Toggle Flood Fill Mode', category: 'brush' },
    { key: 'Shift+1-4', description: 'Brush Size (1×1, 3×3, 5×5, 7×7)', category: 'brush' },
    { key: 'Ctrl+Z', description: 'Undo', category: 'editing' },
    { key: 'Ctrl+Y', description: 'Redo', category: 'editing' },
    { key: 'S', description: 'Settings', category: 'ui' },
    { key: 'C', description: 'Toggle Coordinates', category: 'ui' },
    { key: 'H', description: 'Toggle Help', category: 'ui' },
    { key: 'P', description: 'Toggle Projection Mode', category: 'ui' },
  ];

  const iconKeys = Object.entries(ICON_SHORTCUTS);

  return (
    <div className="shortcuts-overlay" onClick={handleOverlayClick}>
      <div className="shortcuts-panel">
        <div className="shortcuts-panel__header">
          <h3>⌨️ Keyboard Shortcuts</h3>
          <button
            className="shortcuts-panel__close"
            onClick={onClose}
            aria-label="Close shortcuts overlay"
          >
            ×
          </button>
        </div>

        <div className="shortcuts-panel__content">
          <div className="shortcuts-section">
            <h4>Essential</h4>
            <div className="shortcuts-list">
              {essentialShortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-row">
                  <kbd className="shortcut-key">{shortcut.key}</kbd>
                  <span className="shortcut-desc">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </div>

          {isGMMode && (
            <>
              <div className="shortcuts-section">
                <h4>GM Mode</h4>
                <div className="shortcuts-list">
                  {gmShortcuts.map((shortcut, index) => (
                    <div key={index} className="shortcut-row">
                      <kbd className="shortcut-key">{shortcut.key}</kbd>
                      <span className="shortcut-desc">{shortcut.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shortcuts-section">
                <h4>Quick Icons</h4>
                <div className="terrain-grid">
                  {iconKeys.map(([key, iconName]) => (
                    <div key={key} className="terrain-shortcut">
                      <kbd className="terrain-key">{key}</kbd>
                      <span className="terrain-name">{iconName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="shortcuts-panel__footer">
          <p>Press <kbd>F1</kbd> or <kbd>?</kbd> to toggle this overlay • <kbd>H</kbd> for detailed help</p>
        </div>
      </div>
    </div>
  );
};