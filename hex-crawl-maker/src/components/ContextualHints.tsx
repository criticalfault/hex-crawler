/**
 * Contextual hints component - shows helpful tips based on user actions
 */

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { 
  selectCurrentMode, 
  selectQuickTerrainMode, 
  selectSelectedQuickTerrain,
  selectPlayerPositions,
  selectIsGMMode,
  selectIsPlayerMode
} from '../store/selectors';
import './ContextualHints.css';

interface Hint {
  id: string;
  content: React.ReactNode;
  condition: () => boolean;
  priority: number;
  dismissible?: boolean;
  autoHide?: number; // Auto-hide after X milliseconds
}

export const ContextualHints: React.FC = () => {
  const currentMode = useAppSelector(selectCurrentMode);
  const quickTerrainMode = useAppSelector(selectQuickTerrainMode);
  const selectedTerrain = useAppSelector(selectSelectedQuickTerrain);
  const playerPositions = useAppSelector(selectPlayerPositions);
  const isGMMode = useAppSelector(selectIsGMMode);
  const isPlayerMode = useAppSelector(selectIsPlayerMode);

  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);

  // Load dismissed hints from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('hex-crawl-dismissed-hints');
    if (dismissed) {
      setDismissedHints(new Set(JSON.parse(dismissed)));
    }
  }, []);

  // Save dismissed hints to localStorage
  const dismissHint = (hintId: string) => {
    const newDismissed = new Set([...dismissedHints, hintId]);
    setDismissedHints(newDismissed);
    localStorage.setItem('hex-crawl-dismissed-hints', JSON.stringify([...newDismissed]));
    setCurrentHint(null);
  };

  const hints: Hint[] = [
    {
      id: 'first-gm-mode',
      content: (
        <div>
          <strong>🎲 Welcome to GM Mode!</strong>
          <p>Start by dragging terrain icons from the palette onto hexes, or press number keys (1-8) for quick selection.</p>
        </div>
      ),
      condition: () => isGMMode && !localStorage.getItem('hex-crawl-used-gm-mode'),
      priority: 10,
      dismissible: true
    },
    {
      id: 'quick-terrain-active',
      content: (
        <div>
          <strong>🎨 Quick Terrain Mode Active</strong>
          <p>Click on hexes to paint them with <strong>{selectedTerrain}</strong>. Press number keys to switch terrain types quickly!</p>
        </div>
      ),
      condition: () => quickTerrainMode && selectedTerrain !== '',
      priority: 8,
      autoHide: 5000
    },
    {
      id: 'quick-terrain-no-selection',
      content: (
        <div>
          <strong>🎨 Quick Terrain Mode</strong>
          <p>Click on any hex with terrain to select that terrain type, then paint other hexes by clicking them.</p>
        </div>
      ),
      condition: () => quickTerrainMode && selectedTerrain === '',
      priority: 7,
      dismissible: true
    },
    {
      id: 'first-player-mode',
      content: (
        <div>
          <strong>🗺️ Player Mode Active</strong>
          <p>Click on hexes to move players there. Only explored areas are visible. Adjust sight distance to control exploration range.</p>
        </div>
      ),
      condition: () => isPlayerMode && playerPositions.length === 0 && !localStorage.getItem('hex-crawl-used-player-mode'),
      priority: 9,
      dismissible: true
    },
    {
      id: 'players-placed',
      content: (
        <div>
          <strong>👥 Players Positioned</strong>
          <p>Great! You have {playerPositions.length} player{playerPositions.length !== 1 ? 's' : ''} on the map. Click new hexes to move them and reveal more areas.</p>
        </div>
      ),
      condition: () => isPlayerMode && playerPositions.length > 0 && playerPositions.length <= 2,
      priority: 6,
      autoHide: 4000
    },
    {
      id: 'keyboard-shortcuts-reminder',
      content: (
        <div>
          <strong>⌨️ Pro Tip</strong>
          <p>Press <kbd>?</kbd> or <kbd>F1</kbd> for keyboard shortcuts, <kbd>Space</kbd> to switch modes quickly!</p>
        </div>
      ),
      condition: () => !localStorage.getItem('hex-crawl-shortcuts-shown') && Math.random() < 0.3,
      priority: 3,
      dismissible: true
    },
    {
      id: 'empty-map-suggestion',
      content: (
        <div>
          <strong>🗺️ Empty Map Detected</strong>
          <p>Try using the Template button to generate a starting landscape, or drag terrain icons to begin creating your hex crawl!</p>
        </div>
      ),
      condition: () => {
        // This would need to check if the map is mostly empty
        // For now, we'll show it in GM mode if no recent activity
        return isGMMode && !localStorage.getItem('hex-crawl-has-content');
      },
      priority: 5,
      dismissible: true
    }
  ];

  // Find the highest priority hint that should be shown
  useEffect(() => {
    const activeHints = hints
      .filter(hint => !dismissedHints.has(hint.id) && hint.condition())
      .sort((a, b) => b.priority - a.priority);

    if (activeHints.length > 0) {
      setCurrentHint(activeHints[0]);
    } else {
      setCurrentHint(null);
    }
  }, [currentMode, quickTerrainMode, selectedTerrain, playerPositions, dismissedHints]);

  // Auto-hide hints
  useEffect(() => {
    if (currentHint?.autoHide) {
      const timer = setTimeout(() => {
        setCurrentHint(null);
      }, currentHint.autoHide);

      return () => clearTimeout(timer);
    }
  }, [currentHint]);

  // Mark usage for certain modes
  useEffect(() => {
    if (isGMMode) {
      localStorage.setItem('hex-crawl-used-gm-mode', 'true');
    }
    if (isPlayerMode) {
      localStorage.setItem('hex-crawl-used-player-mode', 'true');
    }
  }, [isGMMode, isPlayerMode]);

  if (!currentHint) return null;

  return (
    <div className="contextual-hints">
      <div className="contextual-hint">
        <div className="contextual-hint__content">
          {currentHint.content}
        </div>
        
        {currentHint.dismissible && (
          <button
            className="contextual-hint__dismiss"
            onClick={() => dismissHint(currentHint.id)}
            aria-label="Dismiss hint"
            title="Dismiss this hint"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};