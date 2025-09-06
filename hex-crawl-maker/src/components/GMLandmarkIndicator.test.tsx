/**
 * Tests for GM Mode Landmark Indicators
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { HexGrid } from './HexGrid';
import { mapActions } from '../store/slices/mapSlice';
import { uiActions } from '../store/slices/uiSlice';

// Mock canvas context
const mockContext = {
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fillText: vi.fn(),
  drawImage: vi.fn(),
  set fillStyle(value: string) {},
  set strokeStyle(value: string) {},
  set lineWidth(value: number) {},
  set font(value: string) {},
  set textAlign(value: string) {},
  set textBaseline(value: string) {},
  set globalAlpha(value: number) {},
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => mockContext),
});

// Mock getBoundingClientRect
Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
  value: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600,
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('GM Landmark Indicators', () => {
  beforeEach(() => {
    // Reset store state
    store.dispatch(uiActions.setMode('gm'));
    
    // Create a test map
    store.dispatch(mapActions.createNewMap({
      name: 'Test Map',
      dimensions: { width: 10, height: 10 }
    }));
  });

  it('should render HexGrid component without errors in GM mode', () => {
    expect(() => {
      render(
        <Provider store={store}>
          <HexGrid />
        </Provider>
      );
    }).not.toThrow();
  });

  it('should render HexGrid component without errors in Player mode', () => {
    store.dispatch(uiActions.setMode('player'));
    
    expect(() => {
      render(
        <Provider store={store}>
          <HexGrid />
        </Provider>
      );
    }).not.toThrow();
  });

  it('should handle landmarks in GM mode', () => {
    // Add a test landmark
    store.dispatch(mapActions.placeIcon({
      coordinate: { q: 2, r: 3 },
      landmark: 'village',
      name: 'Test Village'
    }));

    expect(() => {
      render(
        <Provider store={store}>
          <HexGrid />
        </Provider>
      );
    }).not.toThrow();
  });

  it('should handle landmarks in Player mode', () => {
    store.dispatch(uiActions.setMode('player'));
    
    // Add a test landmark
    store.dispatch(mapActions.placeIcon({
      coordinate: { q: 2, r: 3 },
      landmark: 'village',
      name: 'Test Village'
    }));

    expect(() => {
      render(
        <Provider store={store}>
          <HexGrid />
        </Provider>
      );
    }).not.toThrow();
  });
});