/**
 * BrushControls component - provides brush size and shape controls for area painting
 */

import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { uiActions } from '../store';
import { 
  selectBrushMode, 
  selectBrushSize, 
  selectBrushShape, 
  selectIsGMMode,
  selectQuickTerrainMode 
} from '../store/selectors';
import { 
  BRUSH_SIZES, 
  BRUSH_SHAPES, 
  getBrushSizeLabel, 
  getBrushShapeLabel 
} from '../utils/brushUtils';
import type { BrushSize, BrushShape } from '../store/slices/uiSlice';
import './BrushControls.css';

export const BrushControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const brushMode = useAppSelector(selectBrushMode);
  const brushSize = useAppSelector(selectBrushSize);
  const brushShape = useAppSelector(selectBrushShape);
  const isGMMode = useAppSelector(selectIsGMMode);
  const quickTerrainMode = useAppSelector(selectQuickTerrainMode);

  // Only show brush controls in GM mode
  if (!isGMMode) {
    return null;
  }

  const handleToggleBrushMode = () => {
    dispatch(uiActions.toggleBrushMode());
  };

  const handleBrushSizeChange = (size: BrushSize) => {
    dispatch(uiActions.setBrushSize(size));
    // Enable brush mode if not already enabled
    if (!brushMode) {
      dispatch(uiActions.setBrushMode(true));
    }
  };

  const handleBrushShapeChange = (shape: BrushShape) => {
    dispatch(uiActions.setBrushShape(shape));
    // Enable brush mode if not already enabled
    if (!brushMode) {
      dispatch(uiActions.setBrushMode(true));
    }
  };

  return (
    <div className="brush-controls">
      <div className="brush-controls-header">
        <button 
          onClick={handleToggleBrushMode}
          className={`brush-mode-toggle ${brushMode ? 'active' : ''}`}
          title="Toggle brush mode for area painting"
        >
          🖌️ Brush {brushMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {brushMode && (
        <div className="brush-settings">
          <div className="brush-size-section">
            <label className="brush-label">Size:</label>
            <div className="brush-size-buttons">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => handleBrushSizeChange(size)}
                  className={`brush-size-button ${brushSize === size ? 'active' : ''}`}
                  title={`Brush size ${getBrushSizeLabel(size)}`}
                >
                  {getBrushSizeLabel(size)}
                </button>
              ))}
            </div>
          </div>

          <div className="brush-shape-section">
            <label className="brush-label">Shape:</label>
            <div className="brush-shape-buttons">
              {BRUSH_SHAPES.map((shape) => (
                <button
                  key={shape}
                  onClick={() => handleBrushShapeChange(shape)}
                  className={`brush-shape-button ${brushShape === shape ? 'active' : ''}`}
                  title={`${shape} brush shape`}
                >
                  {getBrushShapeLabel(shape)}
                </button>
              ))}
            </div>
          </div>

          <div className="brush-instructions">
            <div className="brush-info">
              <strong>Brush Mode Active</strong>
              <div className="current-brush-display">
                {getBrushSizeLabel(brushSize)} {getBrushShapeLabel(brushShape)}
              </div>
            </div>
            <div className="brush-usage">
              {quickTerrainMode ? (
                <span>Click and drag to paint terrain in large areas</span>
              ) : (
                <span>Enable Quick Terrain mode to use brush painting</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};