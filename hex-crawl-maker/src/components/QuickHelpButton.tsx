/**
 * Quick help button component - shows essential shortcuts and tips
 */

import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectCurrentMode, selectIsGMMode } from '../store/selectors';
import { Tooltip } from './Tooltip';
import './QuickHelpButton.css';

export const QuickHelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentMode = useAppSelector(selectCurrentMode);
  const isGMMode = useAppSelector(selectIsGMMode);

  const toggleHelp = () => {
    setIsOpen(!isOpen);
  };

  const closeHelp = () => {
    setIsOpen(false);
  };

  const essentialShortcuts = [
    { key: 'Space', desc: 'Switch GM/Player Mode' },
    { key: 'F1 / ?', desc: 'Full Help Panel' },
    { key: 'Esc', desc: 'Cancel/Close' },
    { key: '+/-', desc: 'Zoom In/Out' },
    { key: 'WASD', desc: 'Pan Map' },
  ];

  const gmShortcuts = [
    { key: '1-8', desc: 'Quick Terrain' },
    { key: 'Tab', desc: 'Cycle Terrain' },
    { key: 'Ctrl+Z', desc: 'Undo' },
    { key: 'S', desc: 'Settings' },
    { key: 'B', desc: 'Brush Mode' },
  ];

  return (
    <div className="quick-help">
      <Tooltip content="Quick reference for essential shortcuts and controls" position="left">
        <button 
          className={`quick-help-button ${isOpen ? 'quick-help-button--active' : ''}`}
          onClick={toggleHelp}
          aria-label="Quick help"
        >
          ?
        </button>
      </Tooltip>

      {isOpen && (
        <>
          <div className="quick-help-backdrop" onClick={closeHelp} />
          <div className="quick-help-panel">
            <div className="quick-help-header">
              <h4>Quick Reference</h4>
              <button 
                className="quick-help-close"
                onClick={closeHelp}
                aria-label="Close quick help"
              >
                ×
              </button>
            </div>

            <div className="quick-help-content">
              <div className="quick-help-section">
                <h5>Essential</h5>
                <div className="shortcut-list">
                  {essentialShortcuts.map((shortcut, index) => (
                    <div key={index} className="shortcut-item">
                      <kbd>{shortcut.key}</kbd>
                      <span>{shortcut.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {isGMMode && (
                <div className="quick-help-section">
                  <h5>GM Mode</h5>
                  <div className="shortcut-list">
                    {gmShortcuts.map((shortcut, index) => (
                      <div key={index} className="shortcut-item">
                        <kbd>{shortcut.key}</kbd>
                        <span>{shortcut.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="quick-help-section">
                <h5>Quick Tips</h5>
                <ul className="tip-list">
                  {isGMMode ? (
                    <>
                      <li>Drag icons from palette to hexes</li>
                      <li>Click hexes to edit properties</li>
                      <li>Use brush tools for faster terrain painting</li>
                      <li>Try templates for quick map generation</li>
                    </>
                  ) : (
                    <>
                      <li>Click hexes to move players</li>
                      <li>Adjust sight distance slider</li>
                      <li>Toggle reveal modes for different exploration styles</li>
                      <li>Switch to GM mode to edit the map</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="quick-help-footer">
              <p>Press <kbd>F1</kbd> for detailed help</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};