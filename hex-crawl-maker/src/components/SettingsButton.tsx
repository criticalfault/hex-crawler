/**
 * Settings button component for opening the settings panel
 */

import React from 'react';
import { useAppDispatch } from '../store/hooks';
import { uiActions } from '../store';
import { Tooltip } from './Tooltip';
import './SettingsButton.css';

export const SettingsButton: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(uiActions.openSettingsPanel());
  };

  return (
    <Tooltip content="Open map settings - Configure grid appearance, projection mode, and display options (Press S)" position="bottom">
      <button 
        className="settings-button-trigger" 
        onClick={handleClick}
        aria-label="Open map settings"
      >
        ⚙️
      </button>
    </Tooltip>
  );
};