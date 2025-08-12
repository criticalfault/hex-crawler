/**
 * PatternLibrary component - manages saved terrain patterns
 */

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { uiActions } from '../store';
import { selectClipboard } from '../store/selectors';
import {
  getSavedPatternNames,
  loadPatternFromStorage,
  savePatternToStorage,
  deletePatternFromStorage,
} from '../utils/copyPasteUtils';
import './PatternLibrary.css';

export const PatternLibrary: React.FC = () => {
  const dispatch = useAppDispatch();
  const clipboard = useAppSelector(selectClipboard);
  const [savedPatterns, setSavedPatterns] = useState<string[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [patternName, setPatternName] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  // Load saved patterns on mount
  useEffect(() => {
    refreshPatternList();
  }, []);

  const refreshPatternList = () => {
    setSavedPatterns(getSavedPatternNames());
  };

  const handleSavePattern = () => {
    if (!clipboard || !patternName.trim()) return;

    savePatternToStorage(patternName.trim(), clipboard.pattern, clipboard.dimensions);
    setPatternName('');
    setShowSaveDialog(false);
    refreshPatternList();
  };

  const handleLoadPattern = (name: string) => {
    const pattern = loadPatternFromStorage(name);
    if (pattern) {
      dispatch(uiActions.setClipboard(pattern));
      setSelectedPattern(name);
    }
  };

  const handleDeletePattern = (name: string) => {
    if (confirm(`Delete pattern "${name}"?`)) {
      deletePatternFromStorage(name);
      if (selectedPattern === name) {
        setSelectedPattern(null);
      }
      refreshPatternList();
    }
  };

  const handleCancelSave = () => {
    setShowSaveDialog(false);
    setPatternName('');
  };

  return (
    <div className="pattern-library">
      <div className="pattern-library__header">
        <h3>Pattern Library</h3>
        {clipboard && (
          <button
            className="pattern-library__save-button"
            onClick={() => setShowSaveDialog(true)}
            title="Save current clipboard pattern"
          >
            💾 Save Pattern
          </button>
        )}
      </div>

      {showSaveDialog && (
        <div className="pattern-library__save-dialog">
          <div className="pattern-library__save-content">
            <h4>Save Pattern</h4>
            <input
              type="text"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              placeholder="Enter pattern name..."
              className="pattern-library__name-input"
              autoFocus
            />
            <div className="pattern-library__save-actions">
              <button
                className="pattern-library__button pattern-library__button--save"
                onClick={handleSavePattern}
                disabled={!patternName.trim()}
              >
                Save
              </button>
              <button
                className="pattern-library__button pattern-library__button--cancel"
                onClick={handleCancelSave}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pattern-library__list">
        {savedPatterns.length === 0 ? (
          <div className="pattern-library__empty">
            <p>No saved patterns</p>
            <small>Copy a region and save it to create reusable patterns</small>
          </div>
        ) : (
          savedPatterns.map((name) => (
            <div
              key={name}
              className={`pattern-library__item ${
                selectedPattern === name ? 'pattern-library__item--selected' : ''
              }`}
            >
              <div className="pattern-library__item-info">
                <span className="pattern-library__item-name">{name}</span>
                {(() => {
                  const pattern = loadPatternFromStorage(name);
                  return pattern ? (
                    <small className="pattern-library__item-details">
                      {pattern.pattern.size} hexes ({pattern.dimensions.width}×{pattern.dimensions.height})
                    </small>
                  ) : null;
                })()}
              </div>
              <div className="pattern-library__item-actions">
                <button
                  className="pattern-library__button pattern-library__button--load"
                  onClick={() => handleLoadPattern(name)}
                  title="Load pattern to clipboard"
                >
                  📋 Load
                </button>
                <button
                  className="pattern-library__button pattern-library__button--delete"
                  onClick={() => handleDeletePattern(name)}
                  title="Delete pattern"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {clipboard && (
        <div className="pattern-library__current">
          <h4>Current Clipboard</h4>
          <div className="pattern-library__current-info">
            <span>
              {clipboard.pattern.size} hexes ({clipboard.dimensions.width}×{clipboard.dimensions.height})
            </span>
            <button
              className="pattern-library__button pattern-library__button--clear"
              onClick={() => dispatch(uiActions.clearClipboard())}
              title="Clear clipboard"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};