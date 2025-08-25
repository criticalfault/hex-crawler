/**
 * PlayerControls component - manages player positioning and sight distance
 */

import React from 'react';
import { useAppSelector, useAppDispatch, mapActions, explorationActions } from '../store';
import { 
  selectPlayerPositions, 
  selectSightDistance, 
  selectRevealMode,
  selectCurrentMode 
} from '../store/selectors';
import { hexesInRange } from '../utils/hexCoordinates';
import { Tooltip } from './Tooltip';
import type { HexCoordinate } from '../types';
import './PlayerControls.css';

export const PlayerControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const playerPositions = useAppSelector(selectPlayerPositions);
  const sightDistance = useAppSelector(selectSightDistance);
  const revealMode = useAppSelector(selectRevealMode);
  const currentMode = useAppSelector(selectCurrentMode);

  // Update sight distance and recalculate visibility
  const handleSightDistanceChange = (newDistance: number) => {
    dispatch(mapActions.updateSightDistance(newDistance));
    updateVisibility(playerPositions, newDistance);
  };

  // Toggle reveal mode and update visibility accordingly
  const handleRevealModeChange = (mode: 'permanent' | 'lineOfSight') => {
    dispatch(mapActions.updateRevealMode(mode));
    updateVisibility(playerPositions, sightDistance);
  };

  // Calculate and update hex visibility based on player positions and sight distance
  const updateVisibility = (positions: HexCoordinate[], distance: number) => {
    if (positions.length === 0) {
      dispatch(explorationActions.clearVisibleHexes());
      return;
    }

    // Calculate all hexes within sight distance of any player
    const visibleHexes = new Set<string>();
    const exploredHexes = new Set<string>();

    positions.forEach(playerPos => {
      const hexesInSight = hexesInRange(playerPos, distance);
      hexesInSight.forEach(hex => {
        const key = `${hex.q},${hex.r}`;
        visibleHexes.add(key);
        exploredHexes.add(key);
      });
    });

    // Update visible hexes for current sight
    dispatch(explorationActions.setVisibleHexes(Array.from(visibleHexes).map(key => {
      const [q, r] = key.split(',').map(Number);
      return { q, r };
    })));

    // Mark hexes as explored
    dispatch(explorationActions.exploreHexes(Array.from(exploredHexes).map(key => {
      const [q, r] = key.split(',').map(Number);
      return { q, r };
    })));
  };

  // Remove a player position
  const handleRemovePlayer = (index: number) => {
    dispatch(mapActions.removePlayerPosition(index));
    // Update visibility with remaining players
    const remainingPositions = playerPositions.filter((_, i) => i !== index);
    updateVisibility(remainingPositions, sightDistance);
  };

  // Clear all player positions
  const handleClearAllPlayers = () => {
    dispatch(mapActions.updatePlayerPositions([]));
    dispatch(explorationActions.clearVisibleHexes());
  };

  // Only show controls in player mode
  if (currentMode !== 'player') {
    return null;
  }

  return (
    <div className="player-controls">
      <div className="player-controls-header">
        <h3>Player Controls</h3>
      </div>

      <div className="control-section">
        <Tooltip content="How far players can see from their position. Higher values reveal more hexes around each player." position="top">
          <label htmlFor="sight-distance">
            Sight Distance: {sightDistance} hex{sightDistance !== 1 ? 'es' : ''}
          </label>
        </Tooltip>
        <input
          id="sight-distance"
          type="range"
          min="1"
          max="5"
          value={sightDistance}
          onChange={(e) => handleSightDistanceChange(parseInt(e.target.value))}
          className="sight-distance-slider"
        />
        <div className="slider-labels">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      <div className="control-section">
        <label>Reveal Mode:</label>
        <div className="reveal-mode-toggle">
          <Tooltip content="Permanent: Once explored, hexes stay visible even when players move away. Good for traditional exploration." position="top">
            <button
              className={`toggle-button ${revealMode === 'permanent' ? 'active' : ''}`}
              onClick={() => handleRevealModeChange('permanent')}
            >
              Permanent
            </button>
          </Tooltip>
          <Tooltip content="Line of Sight: Only hexes currently within sight distance are visible. More realistic but can be confusing." position="top">
            <button
              className={`toggle-button ${revealMode === 'lineOfSight' ? 'active' : ''}`}
              onClick={() => handleRevealModeChange('lineOfSight')}
            >
              Line of Sight
            </button>
          </Tooltip>
        </div>
        <div className="reveal-mode-description">
          {revealMode === 'permanent' 
            ? 'Keep all explored areas visible'
            : 'Only show currently visible areas'
          }
        </div>
      </div>

      <div className="control-section">
        <div className="player-positions-header">
          <label>Player Positions ({playerPositions.length}):</label>
          {playerPositions.length > 0 && (
            <button 
              onClick={handleClearAllPlayers}
              className="clear-all-button"
              title="Remove all players"
            >
              Clear All
            </button>
          )}
        </div>
        
        {playerPositions.length === 0 ? (
          <div className="no-players">
            Click on the map to place players
          </div>
        ) : (
          <div className="player-list">
            {playerPositions.map((position, index) => (
              <div key={index} className="player-item">
                <span className="player-coordinate">
                  Player {index + 1}: ({position.q}, {position.r})
                </span>
                <button
                  onClick={() => handleRemovePlayer(index)}
                  className="remove-player-button"
                  title="Remove this player"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="control-section">
        <div className="instructions">
          <strong>Instructions:</strong>
          <ul>
            <li>Click on hexes to move players</li>
            <li>Adjust sight distance to control exploration range</li>
            <li>Toggle reveal mode to change visibility behavior</li>
          </ul>
        </div>
      </div>
    </div>
  );
};