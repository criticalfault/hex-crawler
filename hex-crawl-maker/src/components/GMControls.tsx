/**
 * GMControls component - provides GM-specific controls and utilities
 */

import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { explorationActions, uiActions } from '../store';
import { selectQuickTerrainMode, selectSelectedQuickTerrain } from '../store/selectors';
import { TERRAIN_ICONS } from '../types/icons';
import { BrushControls } from './BrushControls';
import { FloodFillControls } from './FloodFillControls';
import './GMControls.css';

export const GMControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const quickTerrainMode = useAppSelector(selectQuickTerrainMode);
  const selectedTerrain = useAppSelector(selectSelectedQuickTerrain);

  const handleResetExploration = () => {
    if (window.confirm('Are you sure you want to reset all explored hexes? This will clear the player exploration history and cannot be undone.')) {
      dispatch(explorationActions.resetExploration());
    }
  };

  const toggleQuickTerrainMode = () => {
    dispatch(uiActions.toggleQuickTerrainMode());
  };

  return (
    <div className="gm-controls">
      <div className="gm-controls-header">
        <h3>GM Controls</h3>
      </div>

      <div className="control-section">
        <button 
          onClick={handleResetExploration}
          className="reset-exploration-button"
          title="Clear all explored hexes and reset player sight lines"
        >
          🔄 Reset Exploration
        </button>
        <div className="control-description">
          Clears all explored hexes and resets player sight lines for testing
        </div>
      </div>

      <BrushControls />

      <FloodFillControls />

      <div className="control-section">
        <div className="quick-terrain-header">
          <button 
            onClick={toggleQuickTerrainMode}
            className={`quick-terrain-toggle ${quickTerrainMode ? 'active' : ''}`}
            title="Toggle quick terrain placement mode"
          >
            🎨 Quick Terrain {quickTerrainMode ? 'ON' : 'OFF'}
          </button>
        </div>
        
        {quickTerrainMode && (
          <div className="quick-terrain-selector">
            {selectedTerrain ? (
              <div className="selected-terrain-display">
                <div className="terrain-info">
                  <div className="terrain-icon-display">
                    <img 
                      src={TERRAIN_ICONS.find(t => t.type === selectedTerrain)?.svgPath} 
                      alt={TERRAIN_ICONS.find(t => t.type === selectedTerrain)?.name}
                      className="terrain-icon"
                    />
                    <span><strong>{TERRAIN_ICONS.find(t => t.type === selectedTerrain)?.name || 'Unknown'}</strong></span>
                  </div>
                </div>
                <div className="quick-terrain-instructions">
                  Click on hexes to paint with this terrain
                </div>
                <button 
                  onClick={() => dispatch(uiActions.setSelectedQuickTerrain(''))}
                  className="clear-terrain-button"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="no-terrain-selected">
                <div className="quick-terrain-instructions">
                  <strong>How to use Quick Terrain:</strong>
                  <ol>
                    <li>Click on any hex with terrain to select that terrain type</li>
                    <li>Then click on other hexes to paint them with the same terrain</li>
                    <li>Or drag terrain from the palette to start painting</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};