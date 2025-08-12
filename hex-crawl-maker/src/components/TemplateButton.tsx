/**
 * Template button component for GM controls
 */

import React from 'react';
import { useAppDispatch } from '../store/hooks';
import { templateActions } from '../store';
import './TemplateButton.css';

export const TemplateButton: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleOpenTemplateDialog = () => {
    dispatch(templateActions.openTemplateDialog());
  };

  const handleOpenBiomeGenerator = () => {
    dispatch(templateActions.openBiomeGenerator());
  };

  return (
    <div className="template-button-group">
      <button
        className="template-button primary"
        onClick={handleOpenTemplateDialog}
        title="Browse and apply terrain templates"
      >
        📋 Templates
      </button>
      
      <button
        className="template-button secondary"
        onClick={handleOpenBiomeGenerator}
        title="Generate procedural biomes"
      >
        🌍 Generate Biome
      </button>
    </div>
  );
};