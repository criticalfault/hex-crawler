/**
 * ModeToggle component for switching between GM and Player modes
 */

import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCurrentMode, selectIsGMMode, selectIsPlayerMode } from '../store/selectors';
import { uiActions } from '../store/slices/uiSlice';
import { Tooltip } from './Tooltip';
import './ModeToggle.css';

export const ModeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector(selectCurrentMode);
  const isGMMode = useAppSelector(selectIsGMMode);
  const isPlayerMode = useAppSelector(selectIsPlayerMode);

  const handleModeToggle = () => {
    dispatch(uiActions.toggleMode());
  };

  const handleSetGMMode = () => {
    dispatch(uiActions.setMode('gm'));
  };

  const handleSetPlayerMode = () => {
    dispatch(uiActions.setMode('player'));
  };

  return (
    <div className="mode-toggle">
      <div className="mode-toggle__header">
        <h3>View Mode</h3>
      </div>
      
      <div className="mode-toggle__buttons">
        <Tooltip content="GM Creation Mode - Full map visibility and editing controls. Use this mode to create and modify your hex crawl." position="top">
          <button
            className={`mode-toggle__button ${isGMMode ? 'mode-toggle__button--active' : ''}`}
            onClick={handleSetGMMode}
            aria-pressed={isGMMode}
          >
            <span className="mode-toggle__icon">🎲</span>
            <span className="mode-toggle__label">GM Mode</span>
          </button>
        </Tooltip>
        
        <Tooltip content="Player Exploration Mode - Progressive map revelation. Only explored areas are visible to simulate player discovery." position="top">
          <button
            className={`mode-toggle__button ${isPlayerMode ? 'mode-toggle__button--active' : ''}`}
            onClick={handleSetPlayerMode}
            aria-pressed={isPlayerMode}
          >
            <span className="mode-toggle__icon">🗺️</span>
            <span className="mode-toggle__label">Player Mode</span>
          </button>
        </Tooltip>
      </div>

      <div className="mode-toggle__quick-switch">
        <Tooltip content={`Quickly switch to ${currentMode === 'gm' ? 'Player' : 'GM'} Mode (Press M)`} position="top">
          <button
            className="mode-toggle__quick-button"
            onClick={handleModeToggle}
          >
            ⇄ Quick Switch
          </button>
        </Tooltip>
      </div>

      <div className="mode-toggle__description">
        {isGMMode ? (
          <p className="mode-toggle__description-text">
            <strong>GM Mode:</strong> Full map visibility with editing controls. 
            Use this mode to create and modify your hex crawl.
          </p>
        ) : (
          <p className="mode-toggle__description-text">
            <strong>Player Mode:</strong> Progressive exploration view. 
            Only revealed areas are visible to simulate player discovery.
          </p>
        )}
      </div>
    </div>
  );
};