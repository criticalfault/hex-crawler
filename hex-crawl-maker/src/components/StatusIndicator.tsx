/**
 * Status indicator component - shows current mode and helpful status information
 */

import React from 'react';
import { useAppSelector } from '../store/hooks';
import { 
  selectCurrentMode, 
  selectPlayerPositions, 
  selectQuickTerrainMode,
  selectSelectedQuickTerrain,
  selectIsProjectionMode
} from '../store/selectors';
import { Tooltip } from './Tooltip';
import './StatusIndicator.css';

export const StatusIndicator: React.FC = () => {
  const currentMode = useAppSelector(selectCurrentMode);
  const playerPositions = useAppSelector(selectPlayerPositions);
  const quickTerrainMode = useAppSelector(selectQuickTerrainMode);
  const selectedTerrain = useAppSelector(selectSelectedQuickTerrain);
  const isProjectionMode = useAppSelector(selectIsProjectionMode);

  const getStatusMessage = () => {
    if (currentMode === 'gm') {
      if (quickTerrainMode && selectedTerrain) {
        return `Quick Terrain: ${selectedTerrain} selected`;
      }
      if (quickTerrainMode) {
        return 'Quick Terrain: Click hex to select terrain type';
      }
      return 'GM Mode: Creating and editing map';
    } else {
      if (playerPositions.length === 0) {
        return 'Player Mode: Click hexes to place players';
      }
      return `Player Mode: ${playerPositions.length} player${playerPositions.length !== 1 ? 's' : ''} positioned`;
    }
  };

  const getStatusIcon = () => {
    if (currentMode === 'gm') {
      if (quickTerrainMode) return '🎨';
      return '🎲';
    } else {
      if (playerPositions.length === 0) return '📍';
      return '🗺️';
    }
  };

  const getStatusColor = () => {
    if (currentMode === 'gm') {
      return quickTerrainMode ? '#f59e0b' : '#3b82f6';
    } else {
      return playerPositions.length === 0 ? '#ef4444' : '#10b981';
    }
  };

  return (
    <div className="status-indicator">
      <Tooltip 
        content={
          <div>
            <strong>Current Status:</strong> {getStatusMessage()}
            {isProjectionMode && <div><strong>Projection Mode:</strong> Active</div>}
            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              Press <kbd>Space</kbd> to switch modes
            </div>
          </div>
        } 
        position="top"
      >
        <div 
          className="status-indicator-badge"
          style={{ backgroundColor: getStatusColor() }}
        >
          <span className="status-indicator-icon">{getStatusIcon()}</span>
          <span className="status-indicator-text">{getStatusMessage()}</span>
          {isProjectionMode && (
            <span className="status-indicator-projection">📺</span>
          )}
        </div>
      </Tooltip>
    </div>
  );
};