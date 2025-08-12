/**
 * Copy/paste action handlers for keyboard shortcuts
 */

import type { AppDispatch } from '../store';
import { uiActions } from '../store';
import { store } from '../store';
import { selectMapCells, selectSelectedRegion, selectClipboard, selectMapDimensions } from '../store/selectors';
import { createPattern, calculatePastePreviewHexes } from './copyPasteUtils';
import type { HexCoordinate } from '../types/hex';

/**
 * Handle copy operation (Ctrl+C)
 */
export const handleCopy = (dispatch: AppDispatch) => {
  const state = store.getState();
  const selectedRegion = state.ui.selectedRegion;
  const mapCells = selectMapCells(state);

  if (selectedRegion.length === 0) {
    console.log('No region selected for copying');
    return;
  }

  // Use the first hex as the origin for relative coordinates
  const origin = selectedRegion[0];
  const { pattern, dimensions } = createPattern(selectedRegion, mapCells, origin);

  if (pattern.size === 0) {
    console.log('No content found in selected region');
    return;
  }

  dispatch(uiActions.setClipboard({ pattern, dimensions }));
  console.log(`Copied ${pattern.size} hexes to clipboard (${dimensions.width}×${dimensions.height})`);
};

/**
 * Handle paste operation (Ctrl+V)
 */
export const handlePaste = (dispatch: AppDispatch) => {
  const state = store.getState();
  const clipboard = state.ui.clipboard;
  const selectedHex = state.ui.selectedHex;

  if (!clipboard) {
    console.log('No pattern in clipboard');
    return;
  }

  if (!selectedHex) {
    console.log('No hex selected for paste target');
    return;
  }

  // Import paste action dynamically to avoid circular dependency
  import('../store').then(({ mapActions }) => {
    // Apply the pattern to the map starting at the selected hex
    for (const [relativeKey, cellData] of clipboard.pattern.entries()) {
      const [relQ, relR] = relativeKey.split(',').map(Number);
      const targetCoord = {
        q: selectedHex.q + relQ,
        r: selectedHex.r + relR,
      };

      // Only paste if the target is within bounds (this will be checked by the reducer)
      if (cellData.terrain || cellData.landmark) {
        dispatch(mapActions.placeIcon({
          coordinate: targetCoord,
          terrain: cellData.terrain,
          landmark: cellData.landmark,
          name: cellData.name,
          description: cellData.description,
          gmNotes: cellData.gmNotes,
        }));
      }
    }

    console.log(`Pasted pattern at (${selectedHex.q}, ${selectedHex.r})`);
  });
};

/**
 * Update paste preview when hovering over hexes
 */
export const updatePastePreview = (dispatch: AppDispatch, targetHex: HexCoordinate | null) => {
  const state = store.getState();
  const clipboard = state.ui.clipboard;
  const mapDimensions = selectMapDimensions(state);

  if (!clipboard || !targetHex) {
    dispatch(uiActions.clearPastePreview());
    return;
  }

  const previewHexes = calculatePastePreviewHexes(
    targetHex,
    clipboard.pattern,
    mapDimensions
  );

  dispatch(uiActions.setPastePreview({
    hexes: previewHexes,
    position: targetHex,
  }));
};