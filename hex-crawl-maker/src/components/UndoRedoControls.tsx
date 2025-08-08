/**
 * Undo/Redo controls component for map editing operations
 */

import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { historyActions } from '../store/slices/historySlice';
import { mapActions } from '../store';
import { Tooltip } from './Tooltip';
import './UndoRedoControls.css';

interface UndoRedoControlsProps {
  className?: string;
}

export const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  
  // We'll need to add these selectors to the history slice
  const canUndo = useAppSelector((state) => state.history?.past?.length > 0);
  const canRedo = useAppSelector((state) => state.history?.future?.length > 0);
  const historySize = useAppSelector((state) => state.history?.past?.length || 0);

  const handleUndo = () => {
    if (!canUndo) return;
    dispatch(historyActions.undo());
  };

  const handleRedo = () => {
    if (!canRedo) return;
    dispatch(historyActions.redo());
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all undo history? This cannot be undone.')) {
      dispatch(historyActions.clearHistory());
    }
  };

  return (
    <div className={`undo-redo-controls ${className}`}>
      <div className="undo-redo-controls__buttons">
        <Tooltip content="Undo last action (Ctrl+Z)" position="top">
          <button
            className={`undo-redo-button undo-button ${!canUndo ? 'undo-redo-button--disabled' : ''}`}
            onClick={handleUndo}
            disabled={!canUndo}
            aria-label="Undo last action"
          >
            <span className="undo-redo-icon">↶</span>
            <span className="undo-redo-label">Undo</span>
          </button>
        </Tooltip>

        <Tooltip content="Redo last undone action (Ctrl+Y)" position="top">
          <button
            className={`undo-redo-button redo-button ${!canRedo ? 'undo-redo-button--disabled' : ''}`}
            onClick={handleRedo}
            disabled={!canRedo}
            aria-label="Redo last undone action"
          >
            <span className="undo-redo-icon">↷</span>
            <span className="undo-redo-label">Redo</span>
          </button>
        </Tooltip>
      </div>

      {historySize > 0 && (
        <div className="undo-redo-controls__info">
          <span className="history-count">{historySize} actions in history</span>
          <Tooltip content="Clear all undo history" position="top">
            <button
              className="clear-history-button"
              onClick={handleClearHistory}
              aria-label="Clear undo history"
            >
              Clear
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

// Hook for automatically saving to history before map changes
export const useAutoSaveHistory = () => {
  const dispatch = useAppDispatch();
  const currentMap = useAppSelector((state) => state.map.currentMap);

  const saveToHistory = React.useCallback(() => {
    if (currentMap) {
      dispatch(historyActions.saveToHistory(currentMap));
    }
  }, [dispatch, currentMap]);

  return saveToHistory;
};