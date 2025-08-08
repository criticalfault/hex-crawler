/**
 * ProjectionControls component for managing projection and streaming display settings
 */

import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  selectIsProjectionMode, 
  selectProjectionSettings, 
  selectIsFullscreen 
} from '../store/selectors';
import { uiActions } from '../store';
import './ProjectionControls.css';

export const ProjectionControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const isProjectionMode = useAppSelector(selectIsProjectionMode);
  const projectionSettings = useAppSelector(selectProjectionSettings);
  const isFullscreen = useAppSelector(selectIsFullscreen);

  const handleToggleProjectionMode = () => {
    dispatch(uiActions.toggleProjectionMode());
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
    dispatch(uiActions.toggleFullscreen());
  };

  const handleUpdateProjectionSetting = (setting: keyof typeof projectionSettings, value: boolean) => {
    dispatch(uiActions.updateProjectionSettings({ [setting]: value }));
  };

  return (
    <div className="projection-controls">
      <div className="projection-controls__header">
        <h3>🎥 Projection & Streaming</h3>
        <p>Optimize display for projection and streaming</p>
      </div>

      <div className="projection-controls__main-toggle">
        <label className="projection-toggle">
          <input
            type="checkbox"
            checked={isProjectionMode}
            onChange={handleToggleProjectionMode}
          />
          <span className="projection-toggle__slider"></span>
          <span className="projection-toggle__label">
            {isProjectionMode ? 'Projection Mode ON' : 'Projection Mode OFF'}
          </span>
        </label>
      </div>

      {isProjectionMode && (
        <div className="projection-controls__settings">
          <div className="projection-setting">
            <label>
              <input
                type="checkbox"
                checked={projectionSettings.highContrast}
                onChange={(e) => handleUpdateProjectionSetting('highContrast', e.target.checked)}
              />
              High Contrast Colors
            </label>
            <small>Enhanced visibility for projection</small>
          </div>

          <div className="projection-setting">
            <label>
              <input
                type="checkbox"
                checked={projectionSettings.largeText}
                onChange={(e) => handleUpdateProjectionSetting('largeText', e.target.checked)}
              />
              Large Text & Icons
            </label>
            <small>Bigger text for distant viewing</small>
          </div>

          <div className="projection-setting">
            <label>
              <input
                type="checkbox"
                checked={projectionSettings.simplifiedUI}
                onChange={(e) => handleUpdateProjectionSetting('simplifiedUI', e.target.checked)}
              />
              Simplified Interface
            </label>
            <small>Hide non-essential UI elements</small>
          </div>
        </div>
      )}

      <div className="projection-controls__actions">
        <button
          className="projection-button projection-button--fullscreen"
          onClick={handleToggleFullscreen}
          title="Toggle Fullscreen (F11)"
        >
          {isFullscreen ? '🗗 Exit Fullscreen' : '🗖 Enter Fullscreen'}
        </button>
      </div>

      <div className="projection-controls__shortcuts">
        <h4>Keyboard Shortcuts</h4>
        <div className="shortcut-list">
          <div className="shortcut-item">
            <kbd>F11</kbd>
            <span>Toggle Fullscreen</span>
          </div>
          <div className="shortcut-item">
            <kbd>P</kbd>
            <span>Toggle Projection Mode</span>
          </div>
          <div className="shortcut-item">
            <kbd>M</kbd>
            <span>Switch GM/Player Mode</span>
          </div>
          <div className="shortcut-item">
            <kbd>Space</kbd>
            <span>Reset Zoom & Pan</span>
          </div>
          <div className="shortcut-item">
            <kbd>+/-</kbd>
            <span>Zoom In/Out</span>
          </div>
        </div>
      </div>
    </div>
  );
};