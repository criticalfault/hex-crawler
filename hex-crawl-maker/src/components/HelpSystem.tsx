/**
 * Help system component with keyboard shortcuts and user guidance
 */

import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectShowHelp, selectCurrentMode, selectIsProjectionMode } from '../store/selectors';
import { uiActions } from '../store';
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
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

  const gmModeShortcuts = [
    { key: 'M', description: 'Switch to Player Mode' },
    { key: 'S', description: 'Open Settings Panel' },
    { key: 'C', description: 'Toggle Coordinate Display' },
    { key: 'Drag & Drop', description: 'Place icons from palette onto hexes' },
    { key: 'Click Hex', description: 'Edit hex properties' },
  ];

  const playerModeShortcuts = [
    { key: 'M', description: 'Switch to GM Mode' },
    { key: 'Click Hex', description: 'Move player to hex (reveals surrounding area)' },
  ];

  const universalShortcuts = [
    { key: 'H', description: 'Toggle this help panel' },
    { key: 'P', description: 'Toggle Projection Mode' },
    { key: 'F11', description: 'Toggle Fullscreen' },
    { key: 'Space', description: 'Reset Zoom & Pan' },
    { key: '+/-', description: 'Zoom In/Out' },
    { key: 'WASD/Arrows', description: 'Pan Map' },
    { key: 'Escape', description: 'Close Dialogs' },
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
              <p><strong>GM Mode:</strong> Create your hex crawl by dragging icons from the palette onto the grid. Click on hexes to add names, descriptions, and GM notes.</p>
              <p><strong>Player Mode:</strong> Switch to this mode during gameplay. Only explored areas are visible. Click to move players and reveal new hexes based on sight distance.</p>
              <p><strong>Projection Mode:</strong> Optimized for streaming or projecting to players with high contrast colors and larger text.</p>
            </div>
          </div>

          <div className="help-section">
            <h3>Current Mode: {currentMode === 'gm' ? 'GM Mode' : 'Player Mode'}</h3>
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
                <li><strong>Map Management:</strong> Save multiple maps and switch between them using the Map Manager.</li>
                <li><strong>Projection Setup:</strong> Use Projection Mode + Fullscreen for optimal display during live sessions.</li>
                <li><strong>Responsive Design:</strong> The interface adapts to different screen sizes and orientations.</li>
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
          <p>Press <kbd>H</kbd> anytime to toggle this help panel</p>
        </div>
      </div>
    </div>
  );
};