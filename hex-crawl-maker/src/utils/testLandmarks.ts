/**
 * Utility functions for testing landmark tooltips
 */

import { store } from '../store';
import { mapActions } from '../store/slices/mapSlice';
import { explorationActions } from '../store/slices/explorationSlice';
import type { HexCoordinate } from '../types';

/**
 * Add test landmarks with names and descriptions for tooltip testing
 */
export function addTestLandmarks() {
  const testLandmarks = [
    {
      coordinate: { q: 2, r: 3 },
      landmark: 'village',
      name: 'Riverside Village',
      description: 'A small farming community nestled by the winding river. The villagers are known for their hospitality and fresh produce.',
    },
    {
      coordinate: { q: 5, r: 2 },
      landmark: 'castle',
      name: 'Ironhold Keep',
      description: 'An ancient fortress built on a rocky outcrop. Its walls have withstood countless sieges.',
    },
    {
      coordinate: { q: 8, r: 5 },
      landmark: 'temple',
      name: 'Temple of the Dawn',
      description: 'A sacred shrine where pilgrims come to witness the first light of day.',
    },
    {
      coordinate: { q: 1, r: 7 },
      landmark: 'ruinsAncient',
      name: 'The Forgotten Ruins',
      description: 'Crumbling stone structures from a lost civilization. Strange symbols cover the weathered walls.',
    },
    {
      coordinate: { q: 6, r: 8 },
      landmark: 'tradingPost',
      name: 'Crossroads Market',
      description: 'A bustling trading post where merchants from distant lands gather to exchange goods.',
    },
    {
      coordinate: { q: 10, r: 4 },
      landmark: 'tower',
      name: 'The Watchtower',
      // No description - test tooltip with name only
    },
    {
      coordinate: { q: 3, r: 9 },
      landmark: 'shrine',
      // No name - test tooltip with description only
      description: 'A small roadside shrine dedicated to travelers seeking safe passage.',
    },
    {
      coordinate: { q: 12, r: 6 },
      landmark: 'hamlet',
      // No name or description - should not show tooltip
    },
  ];

  // Add each test landmark
  testLandmarks.forEach(landmark => {
    store.dispatch(mapActions.placeIcon(landmark));
  });

  // Mark all test landmark hexes as explored so they're visible in player mode
  const landmarkCoordinates = testLandmarks.map(l => l.coordinate);
  store.dispatch(explorationActions.exploreHexes(landmarkCoordinates));
  store.dispatch(explorationActions.setVisibleHexes(landmarkCoordinates));

  console.log('Test landmarks added! Switch to Player Mode and hover over the landmarks to see tooltips.');
  console.log('Landmarks added at coordinates:', landmarkCoordinates.map(c => `(${c.q},${c.r})`).join(', '));
}

/**
 * Remove all test landmarks
 */
export function removeTestLandmarks() {
  const testCoordinates: HexCoordinate[] = [
    { q: 2, r: 3 },
    { q: 5, r: 2 },
    { q: 8, r: 5 },
    { q: 1, r: 7 },
    { q: 6, r: 8 },
    { q: 10, r: 4 },
    { q: 3, r: 9 },
    { q: 12, r: 6 },
  ];

  testCoordinates.forEach(coordinate => {
    store.dispatch(mapActions.removeIcon(coordinate));
  });

  console.log('Test landmarks removed.');
}

// Make functions available globally for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).addTestLandmarks = addTestLandmarks;
  (window as any).removeTestLandmarks = removeTestLandmarks;
}