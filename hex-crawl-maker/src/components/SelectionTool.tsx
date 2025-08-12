/**
 * SelectionTool component - handles rectangular selection for copy/paste
 */

import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { uiActions } from '../store';
import {
  selectSelectionMode,
  selectSelectedRegion,
  selectClipboard,
  selectPastePreviewHexes,
} from '../store/selectors';
import './SelectionTool.css';

export const SelectionTool: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectionMode = useAppSelector(selectSelectionMode);
  const selectedRegion = useAppSelector(selectSelectedRegion);
  const clipboard = useAppSelector(selectClipboard);
  const pastePreviewHexes = useAppSelector(selectPastePreviewHexes);

  const handleToggleSelection = () => {
    dispatch(uiActions.toggleSelectionMode());
  };

  const handleClearSelection = () => {
    dispatch(uiActions.clearSelection());
  };

  const handleCopy = () => {
    if (selectedRegion.length === 0) return;

    // Import copy action dynamically
    import('../utils/copyPasteActions').then(({ handleCopy }) => {
      handleCopy(dispatch);
    });
  };

  const handlePaste = () => {
    if (!clipboard) return;

    // Import paste action dynamically
    import('../utils/copyPasteActions').then(({ handlePaste }) => {
      handlePaste(dispatch);
    });
  };

  const handleClearClipboard = () => {
    dispatch(uiActions.clearClipboard());
  };

  return (
    <div className="selection-tool">
      <div className="selection-tool__header">
        <h3>Copy/Paste</h3>
      </div>

      <div className="selection-tool__controls">
        <button
          className={`selection-tool__button ${selectionMode ? 'selection-tool__button--active' : ''}`}
          onClick={handleToggleSelection}
          title="Toggle selection mode (R)"
        >
          {selectionMode ? '🔲 Exit Selection' : '⬚ Select Region'}
        </button>

        {selectedRegion.length > 0 && (
          <div className="selection-tool__selection-info">
            <span className="selection-tool__count">
              {selectedRegion.length} hexes selected
            </span>
            <div className="selection-tool__selection-actions">
              <button
                className="selection-tool__button selection-tool__button--copy"
                onClick={handleCopy}
                title="Copy selected region (Ctrl+C)"
              >
                📋 Copy
              </button>
              <button
                className="selection-tool__button selection-tool__button--clear"
                onClick={handleClearSelection}
                title="Clear selection"
              >
                ✕ Clear
              </button>
            </div>
          </div>
        )}

        {clipboard && (
          <div className="selection-tool__clipboard-info">
            <span className="selection-tool__clipboard-count">
              📋 {clipboard.pattern.size} hexes in clipboard
              <br />
              <small>({clipboard.dimensions.width}×{clipboard.dimensions.height})</small>
            </span>
            <div className="selection-tool__clipboard-actions">
              <button
                className="selection-tool__button selection-tool__button--paste"
                onClick={handlePaste}
                title="Paste pattern at selected hex (Ctrl+V)"
              >
                📄 Paste
              </button>
              <button
                className="selection-tool__button selection-tool__button--clear"
                onClick={handleClearClipboard}
                title="Clear clipboard"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        )}

        {pastePreviewHexes.length > 0 && (
          <div className="selection-tool__preview-info">
            <span className="selection-tool__preview-text">
              👁️ Paste preview active
            </span>
          </div>
        )}
      </div>

      {selectionMode && (
        <div className="selection-tool__instructions">
          <p>
            <strong>Selection Mode Active</strong>
          </p>
          <ul>
            <li>Click and drag to select a rectangular region</li>
            <li>Press <kbd>Ctrl+C</kbd> to copy selected hexes</li>
            <li>Press <kbd>R</kbd> or click "Exit Selection" to exit</li>
          </ul>
        </div>
      )}

      {clipboard && !selectionMode && (
        <div className="selection-tool__instructions">
          <p>
            <strong>Paste Instructions</strong>
          </p>
          <ul>
            <li>Click on a hex to select paste target</li>
            <li>Press <kbd>Ctrl+V</kbd> to paste pattern</li>
            <li>Pattern will be placed relative to target hex</li>
          </ul>
        </div>
      )}
    </div>
  );
};