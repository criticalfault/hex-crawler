/**
 * Map Manager Button Component
 */

import React from 'react';
import './MapManagerButton.css';

interface MapManagerButtonProps {
  onClick: () => void;
}

export const MapManagerButton: React.FC<MapManagerButtonProps> = ({ onClick }) => {
  return (
    <button 
      className="map-manager-button"
      onClick={onClick}
      title="Manage Maps"
      aria-label="Open map manager"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="currentColor"
        className="map-manager-button__icon"
      >
        <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm1 0v10h10V3H3z"/>
        <path d="M4 5h8v1H4V5zm0 2h8v1H4V7zm0 2h5v1H4V9z"/>
      </svg>
      Maps
    </button>
  );
};