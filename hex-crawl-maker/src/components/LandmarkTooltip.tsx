/**
 * LandmarkTooltip component - shows landmark information on hover in player mode
 */

import React from 'react';
import type { HexCell } from '../types';
import './LandmarkTooltip.css';

interface LandmarkTooltipProps {
  hexCell: HexCell | null;
  position: { x: number; y: number };
  isVisible: boolean;
}

export const LandmarkTooltip: React.FC<LandmarkTooltipProps> = ({
  hexCell,
  position,
  isVisible,
}) => {
  // Don't render if not visible or no landmark
  if (!isVisible || !hexCell?.landmark) {
    return null;
  }

  // Don't show if no name or description
  if (!hexCell.name && !hexCell.description) {
    return null;
  }

  return (
    <div
      className={`landmark-tooltip ${isVisible ? 'landmark-tooltip--visible' : ''}`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="landmark-tooltip__content">
        {hexCell.name && (
          <div className="landmark-tooltip__name">
            {hexCell.name}
          </div>
        )}
        {hexCell.description && (
          <div className="landmark-tooltip__description">
            {hexCell.description}
          </div>
        )}
      </div>
    </div>
  );
};