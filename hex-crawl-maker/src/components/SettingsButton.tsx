/**
 * Settings button component for opening the settings panel
 */

import React from 'react';
import { useAppDispatch } from '../store/hooks';
import { uiActions } from '../store';
import './SettingsButton.css';

export const SettingsButton: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(uiActions.openSettingsPanel());
  };

  return (
    <button 
      className="settings-button-trigger" 
      onClick={handleClick}
      title="Map Settings"
      aria-label="Open map settings"
    >
      ⚙️
    </button>
  );
};