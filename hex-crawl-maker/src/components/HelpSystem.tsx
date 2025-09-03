/**
 * Help system component with keyboard shortcuts and user guidance
 */

import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectShowHelp, selectCurrentMode, selectIsProjectionMode } from '../store/selectors';
import { uiActions } from '../store';
import { KEYBOARD_SHORTCUTS, TERRAIN_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import './HelpSystem.css';

export const HelpSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const showHelp = useAppSelector(selectShowHelp);
  const currentMode = useAppSelector(selectCurrentMode);
  const isProjectionMode = useAppSelector(selectIsProjectionMode);

  const handleClose = () => {
    dispatch(uiActions.setShowHelp(false));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!showHelp) return null;

  const terrainShortcuts = [
    { key: '1', description: 'Mountains' },
    { key: '2', description: 'Plains' },
    { key: '3', description: 'Swamps' },
    { key: '4', description: 'Water' },
    { key: '5', description: 'Desert' },
    { key: 'Tab', description: 'Cycle through terrain types' },
  ];

  const gmModeShortcuts = [
    { key: 'Space', description: 'Switch to Player Mode' },
    { key: 'S', description: 'Open Settings Panel' },
    { key: 'C', description: 'Toggle Coordinate Display' },
    { key: 'Ctrl+Z', description: 'Undo last action' },
    { key: 'Ctrl+Y', description: 'Redo last action' },
    { key: 'Drag & Drop', description: 'Place icons from palette onto hexes' },
    { key: 'Click Hex', description: 'Edit hex properties' },
  ];

  const playerModeShortcuts = [
    { key: 'Space', description: 'Switch to GM Mode' },
    { key: 'Click Hex', description: 'Move player to hex (reveals surrounding area)' },
  ];

  const universalShortcuts = [
    { key: 'F1 / ?', description: 'Toggle this help panel' },
    { key: 'H', description: 'Toggle help panel' },
    { key: 'P', description: 'Toggle Projection Mode' },
    { key: 'F11', description: 'Toggle Fullscreen' },
    { key: '+/-', description: 'Zoom In/Out' },
    { key: 'WASD/Arrows', description: 'Pan Map' },
    { key: 'Escape', description: 'Cancel operations & close dialogs' },
  ];

  return (
    <div className="help-overlay" onClick={handleOverlayClick}>
      <div className="help-panel">
        <div className="help-panel__header">
          <h2>Hex Crawl Maker - Help & Shortcuts</h2>
          <button
            className="help-panel__close"
            onClick={handleClose}
            aria-label="Close help panel"
          >
            ×
          </button>
        </div>

        <div className="help-panel__content">
          <div className="help-section">
            <h3>Getting Started</h3>
            <div className="help-content">
              <p><strong>New to Hex Crawl Maker?</strong> Press <kbd>Ctrl+Shift+H</kbd> to restart the interactive tutorial!</p>
              <p><strong>GM Mode:</strong> Create your hex crawl by dragging icons from the palette onto the grid. Click on hexes to add names, descriptions, and GM notes.</p>
              <p><strong>Player Mode:</strong> Switch to this mode during gameplay. Only explored areas are visible. Click to move players and reveal new hexes based on sight distance.</p>
              <p><strong>Projection Mode:</strong> Optimized for streaming or projecting to players with high contrast colors and larger text.</p>
              
              <div style={{ marginTop: '16px', padding: '12px', background: '#e3f2fd', borderRadius: '6px', borderLeft: '4px solid #2196f3' }}>
                <p style={{ margin: 0, fontSize: '14px' }}><strong>💡 Quick Start:</strong></p>
                <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '14px' }}>
                  <li>Try the Template button to generate a starting landscape</li>
                  <li>Drag terrain icons from the palette onto hexes</li>
                  <li>Click hexes to add names and descriptions</li>
                  <li>Switch to Player Mode to test exploration</li>
                  <li>Use the ? button (bottom right) for quick reference</li>
                </ol>
              </div>
            </div>
          </div>

          {currentMode === 'gm' && (
            <div className="help-section">
              <h3>🎯 Quick Terrain Selection (GM Mode)</h3>
              <div className="shortcuts-grid">
                {terrainShortcuts.map((shortcut, index) => (
                  <div key={index} className="shortcut-item">
                    <kbd className="shortcut-key">{shortcut.key}</kbd>
                    <span className="shortcut-description">{shortcut.description}</span>
                  </div>
                ))}
              </div>
              <p className="help-note">
                <strong>Tip:</strong> Press number keys to quickly select terrain types for painting. 
                Use Tab to cycle through all terrain types.
              </p>
            </div>
          )}

          <div className="help-section">
            <h3>Current Mode: {currentMode === 'gm' ? '🎲 GM Mode' : '🗺️ Player Mode'}</h3>
            <div className="shortcuts-grid">
              {(currentMode === 'gm' ? gmModeShortcuts : playerModeShortcuts).map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <kbd className="shortcut-key">{shortcut.key}</kbd>
                  <span className="shortcut-description">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="help-section">
            <h3>Universal Shortcuts</h3>
            <div className="shortcuts-grid">
              {universalShortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <kbd className="shortcut-key">{shortcut.key}</kbd>
                  <span className="shortcut-description">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="help-section">
            <h3>Tips & Tricks</h3>
            <div className="help-content">
              <ul>
                <li><strong>Sight Distance:</strong> In Player Mode, adjust the sight distance slider to control how far players can see (1-5 hexes).</li>
                <li><strong>Reveal Modes:</strong> Choose between "Permanent" (keeps revealed areas visible) or "Line of Sight" (only shows currently visible areas).</li>
                <li><strong>Quick Terrain:</strong> Enable Quick Terrain mode, then click any hex with terrain to select that type for fast painting.</li>
                <li><strong>Brush Tools:</strong> Use brush mode (B key) to paint multiple hexes at once. Adjust brush size with Shift+1-4.</li>
                <li><strong>Templates:</strong> Use the Template button to generate procedural biomes or apply pre-made terrain patterns.</li>
                <li><strong>Map Management:</strong> Save multiple maps and switch between them using the Map Manager.</li>
                <li><strong>Export Options:</strong> Export your maps as high-resolution PNG for digital use or PDF for printing.</li>
                <li><strong>Projection Setup:</strong> Use Projection Mode + Fullscreen for optimal display during live sessions.</li>
                <li><strong>Mobile Support:</strong> The interface adapts to touch devices with gesture controls and mobile-optimized layouts.</li>
                <li><strong>Accessibility:</strong> All features support keyboard navigation and screen readers.</li>
              </ul>
            </div>
          </div>

          {isProjectionMode && (
            <div className="help-section help-section--projection">
              <h3>🎥 Projection Mode Active</h3>
              <div className="help-content">
                <p>You're currently in Projection Mode, optimized for streaming and projectors:</p>
                <ul>
                  <li>High contrast colors for better visibility</li>
                  <li>Larger text and UI elements</li>
                  <li>Simplified interface to reduce distractions</li>
                  <li>Press <kbd>P</kbd> to toggle projection mode</li>
                </ul>
              </div>
            </div>
          )}

          <div className="help-section">
            <h3>Accessibility</h3>
            <div className="help-content">
              <ul>
                <li>All interactive elements support keyboard navigation</li>
                <li>Screen reader compatible with proper ARIA labels</li>
                <li>High contrast mode support for better visibility</li>
                <li>Reduced motion support for users with vestibular disorders</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="help-panel__footer">
          <p>Press <kbd>F1</kbd>, <kbd>?</kbd>, or <kbd>H</kbd> anytime to toggle this help panel</p>
          <p><strong>Pro Tip:</strong> Use <kbd>Escape</kbd> to quickly cancel any operation or close dialogs</p>
        </div>
      </div>
    </div>
  );
};