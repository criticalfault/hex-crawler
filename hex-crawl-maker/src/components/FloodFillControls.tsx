/**
 * FloodFillControls component - provides flood fill tool controls for area filling
 */

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { uiActions, mapActions, historyActions } from '../store';
import { 
  selectFloodFillMode, 
  selectFloodFillPreviewHexes,
  selectFloodFillTargetTerrain,
  selectFloodFillTargetLandmark,
  selectIsGMMode,
  selectQuickTerrainMode,
  selectSelectedQuickTerrain,
  selectMapCells
} from '../store/selectors';
import { TERRAIN_ICONS, STRUCTURE_ICONS } from '../types/icons';
import './FloodFillControls.css';

interface ConfirmationDialogProps {
  isOpen: boolean;
  hexCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  hexCount,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="flood-fill-confirmation-overlay">
      <div className="flood-fill-confirmation-dialog">
        <h3>Confirm Flood Fill</h3>
        <p>
          This will fill <strong>{hexCount}</strong> connected hexes. 
          This is a large operation that cannot be easily undone.
        </p>
        <div className="confirmation-buttons">
          <button onClick={onConfirm} className="confirm-button">
            Fill {hexCount} Hexes
          </button>
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const FloodFillControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const floodFillMode = useAppSelector(selectFloodFillMode);
  const previewHexes = useAppSelector(selectFloodFillPreviewHexes);
  const targetTerrain = useAppSelector(selectFloodFillTargetTerrain);
  const targetLandmark = useAppSelector(selectFloodFillTargetLandmark);
  const isGMMode = useAppSelector(selectIsGMMode);
  const quickTerrainMode = useAppSelector(selectQuickTerrainMode);
  const selectedTerrain = useAppSelector(selectSelectedQuickTerrain);
  const mapCells = useAppSelector(selectMapCells);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFillData, setPendingFillData] = useState<{
    hexes: any[];
    terrain?: string;
    landmark?: string;
  } | null>(null);

  // Only show flood fill controls in GM mode
  if (!isGMMode) {
    return null;
  }

  const handleToggleFloodFillMode = () => {
    dispatch(uiActions.toggleFloodFillMode());
  };

  const handleConfirmFloodFill = () => {
    if (pendingFillData) {
      dispatch(mapActions.applyFloodFill(pendingFillData));
      dispatch(uiActions.clearFloodFillPreview());
      
      // Add to undo history
      dispatch(historyActions.saveToHistory(mapCells));
    }
    setShowConfirmation(false);
    setPendingFillData(null);
  };

  const handleCancelFloodFill = () => {
    setShowConfirmation(false);
    setPendingFillData(null);
    dispatch(uiActions.clearFloodFillPreview());
  };

  const executeFloodFill = (hexes: any[], terrain?: string, landmark?: string) => {
    const hexCount = hexes.length;
    
    if (hexCount > 20) {
      // Show confirmation for large operations
      setPendingFillData({ hexes, terrain, landmark });
      setShowConfirmation(true);
    } else {
      // Execute immediately for small operations
      dispatch(mapActions.applyFloodFill({ hexes, terrain, landmark }));
      dispatch(uiActions.clearFloodFillPreview());
      
      // Add to undo history
      dispatch(historyActions.saveToHistory(mapCells));
    }
  };

  const getTargetIcon = () => {
    if (targetTerrain) {
      return TERRAIN_ICONS.find(icon => icon.type === targetTerrain);
    }
    if (targetLandmark) {
      return STRUCTURE_ICONS.find(icon => icon.type === targetLandmark);
    }
    return null;
  };

  const targetIcon = getTargetIcon();

  return (
    <>
      <div className="flood-fill-controls">
        <div className="flood-fill-controls-header">
          <button 
            onClick={handleToggleFloodFillMode}
            className={`flood-fill-mode-toggle ${floodFillMode ? 'active' : ''}`}
            title="Toggle flood fill mode for connected area filling"
          >
            🪣 Flood Fill {floodFillMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {floodFillMode && (
          <div className="flood-fill-settings">
            <div className="flood-fill-instructions">
              <div className="flood-fill-info">
                <strong>Flood Fill Mode Active</strong>
                {previewHexes.length > 0 && (
                  <div className="preview-count">
                    {previewHexes.length} hexes selected
                  </div>
                )}
              </div>
              
              {targetIcon && (
                <div className="target-display">
                  <span>Filling with:</span>
                  <div className="target-icon-display">
                    <img 
                      src={targetIcon.svgPath} 
                      alt={targetIcon.name}
                      className="target-icon"
                    />
                    <span>{targetIcon.name}</span>
                  </div>
                </div>
              )}
              
              <div className="flood-fill-usage">
                {quickTerrainMode && selectedTerrain ? (
                  <span>Click on a hex to flood fill connected areas with {selectedTerrain}</span>
                ) : (
                  <span>Enable Quick Terrain mode and select a terrain type to use flood fill</span>
                )}
              </div>
            </div>

            {previewHexes.length > 0 && (
              <div className="flood-fill-actions">
                <button
                  onClick={() => executeFloodFill(previewHexes, selectedTerrain)}
                  className="execute-flood-fill-button"
                  title={`Fill ${previewHexes.length} connected hexes`}
                >
                  Fill {previewHexes.length} Hexes
                </button>
                <button
                  onClick={() => dispatch(uiActions.clearFloodFillPreview())}
                  className="cancel-flood-fill-button"
                  title="Cancel flood fill operation"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        hexCount={pendingFillData?.hexes.length || 0}
        onConfirm={handleConfirmFloodFill}
        onCancel={handleCancelFloodFill}
      />
    </>
  );
};