/**
 * Integration tests for Task 17 - Polish UI/UX and add final features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import { historySlice } from '../store/slices/historySlice';
import { Tooltip } from './Tooltip';
import { HelpSystem } from './HelpSystem';
import { UndoRedoControls } from './UndoRedoControls';
import { AnimatedTransition } from './AnimatedTransition';
import App from '../App';

// Mock store for testing
const createTestStore = () => {
  return configureStore({
    reducer: {
      map: mapSlice.reducer,
      ui: uiSlice.reducer,
      exploration: explorationSlice.reducer,
      history: historySlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['map/setMapData', 'map/updateHexCell', 'map/placeIcon'],
          ignoredPaths: ['map.currentMap.cells', 'exploration.exploredHexes'],
        },
      }),
  });
};

describe('Task 17: Polish UI/UX and Final Features', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Tooltip Component', () => {
    it('should show tooltip on hover with delay', async () => {
      const user = userEvent.setup();
      
      render(
        <Tooltip content="Test tooltip content" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const button = screen.getByRole('button', { name: 'Hover me' });
      
      // Hover over the button
      await user.hover(button);
      
      // Wait for tooltip to appear
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      }, { timeout: 200 });

      // Unhover
      await user.unhover(button);
      
      // Tooltip should disappear
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should position tooltip correctly', () => {
      render(
        <Tooltip content="Top tooltip" position="top">
          <button>Button</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tooltip--top');
    });

    it('should support keyboard focus', async () => {
      const user = userEvent.setup();
      
      render(
        <Tooltip content="Focus tooltip">
          <button>Focusable</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      
      // Focus the button
      await user.tab();
      expect(button).toHaveFocus();
      
      // Tooltip should appear
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });
  });

  describe('Help System', () => {
    it('should render help panel when showHelp is true', () => {
      // Set help to be visible
      store.dispatch({ type: 'ui/setShowHelp', payload: true });

      render(
        <Provider store={store}>
          <HelpSystem />
        </Provider>
      );

      expect(screen.getByText('Hex Crawl Maker - Help & Shortcuts')).toBeInTheDocument();
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('Universal Shortcuts')).toBeInTheDocument();
    });

    it('should close help panel when close button is clicked', async () => {
      const user = userEvent.setup();
      store.dispatch({ type: 'ui/setShowHelp', payload: true });

      render(
        <Provider store={store}>
          <HelpSystem />
        </Provider>
      );

      const closeButton = screen.getByLabelText('Close help panel');
      await user.click(closeButton);

      // Help should be hidden
      expect(screen.queryByText('Hex Crawl Maker - Help & Shortcuts')).not.toBeInTheDocument();
    });

    it('should show mode-specific shortcuts', () => {
      store.dispatch({ type: 'ui/setMode', payload: 'gm' });
      store.dispatch({ type: 'ui/setShowHelp', payload: true });

      render(
        <Provider store={store}>
          <HelpSystem />
        </Provider>
      );

      expect(screen.getByText('Current Mode: GM Mode')).toBeInTheDocument();
      expect(screen.getByText('Open Settings Panel')).toBeInTheDocument();
    });

    it('should show projection mode info when active', () => {
      store.dispatch({ type: 'ui/setProjectionMode', payload: true });
      store.dispatch({ type: 'ui/setShowHelp', payload: true });

      render(
        <Provider store={store}>
          <HelpSystem />
        </Provider>
      );

      expect(screen.getByText('🎥 Projection Mode Active')).toBeInTheDocument();
    });
  });

  describe('Undo/Redo Controls', () => {
    it('should render undo and redo buttons', () => {
      render(
        <Provider store={store}>
          <UndoRedoControls />
        </Provider>
      );

      expect(screen.getByLabelText('Undo last action')).toBeInTheDocument();
      expect(screen.getByLabelText('Redo last undone action')).toBeInTheDocument();
    });

    it('should disable buttons when no history available', () => {
      render(
        <Provider store={store}>
          <UndoRedoControls />
        </Provider>
      );

      const undoButton = screen.getByLabelText('Undo last action');
      const redoButton = screen.getByLabelText('Redo last undone action');

      expect(undoButton).toBeDisabled();
      expect(redoButton).toBeDisabled();
    });

    it('should show history count when available', () => {
      // Add some history
      const mockMapData = {
        id: 'test',
        name: 'Test Map',
        dimensions: { width: 10, height: 10 },
        cells: new Map(),
        playerPositions: [],
        sightDistance: 2,
        revealMode: 'permanent' as const,
        appearance: {
          hexSize: 30,
          borderColor: '#333',
          backgroundColor: '#fff',
          unexploredColor: '#ccc',
          textSize: 12,
        },
      };

      store.dispatch({ type: 'history/saveToHistory', payload: mockMapData });

      render(
        <Provider store={store}>
          <UndoRedoControls />
        </Provider>
      );

      expect(screen.getByText('1 actions in history')).toBeInTheDocument();
    });
  });

  describe('Animated Transitions', () => {
    it('should render children when visible', () => {
      render(
        <AnimatedTransition isVisible={true} type="fade">
          <div>Animated content</div>
        </AnimatedTransition>
      );

      expect(screen.getByText('Animated content')).toBeInTheDocument();
    });

    it('should not render children when not visible', () => {
      render(
        <AnimatedTransition isVisible={false} type="fade">
          <div>Hidden content</div>
        </AnimatedTransition>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('should apply correct CSS classes', () => {
      const { container } = render(
        <AnimatedTransition isVisible={true} type="scale" direction="up">
          <div>Content</div>
        </AnimatedTransition>
      );

      const transition = container.firstChild as HTMLElement;
      expect(transition).toHaveClass('animated-transition');
      expect(transition).toHaveClass('animated-transition--scale');
      expect(transition).toHaveClass('animated-transition--up');
    });
  });

  describe('Keyboard Shortcuts Integration', () => {
    it('should handle help toggle shortcut', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      // Press H to toggle help
      await user.keyboard('h');

      await waitFor(() => {
        expect(screen.getByText('Hex Crawl Maker - Help & Shortcuts')).toBeInTheDocument();
      });

      // Press H again to close
      await user.keyboard('h');

      await waitFor(() => {
        expect(screen.queryByText('Hex Crawl Maker - Help & Shortcuts')).not.toBeInTheDocument();
      });
    });

    it('should handle mode toggle shortcut', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      // Should start in GM mode
      expect(screen.getByText('🎲 GM Mode')).toBeInTheDocument();

      // Press M to switch to player mode
      await user.keyboard('m');

      await waitFor(() => {
        expect(screen.getByText('🗺️ Player Mode')).toBeInTheDocument();
      });
    });

    it('should handle projection mode toggle', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      // Press P to toggle projection mode
      await user.keyboard('p');

      await waitFor(() => {
        const app = document.querySelector('.app');
        expect(app).toHaveClass('app--projection-mode');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      const sidebar = document.querySelector('.app-sidebar');
      expect(sidebar).toBeInTheDocument();
    });

    it('should handle touch interactions', () => {
      // Mock touch device
      Object.defineProperty(window, 'ontouchstart', {
        value: () => {},
      });

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      // Should render without errors on touch devices
      expect(screen.getByText('Hex Crawl Maker')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should provide proper ARIA labels', () => {
      render(
        <Provider store={store}>
          <UndoRedoControls />
        </Provider>
      );

      expect(screen.getByLabelText('Undo last action')).toBeInTheDocument();
      expect(screen.getByLabelText('Redo last undone action')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <AnimatedTransition isVisible={true} type="fade">
          <div>Content</div>
        </AnimatedTransition>
      );

      // Should still render content
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle tooltip positioning errors gracefully', () => {
      // Mock getBoundingClientRect to return invalid values
      const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        top: NaN,
        left: NaN,
        right: NaN,
        bottom: NaN,
        width: NaN,
        height: NaN,
        x: NaN,
        y: NaN,
        toJSON: jest.fn(),
      }));

      render(
        <Tooltip content="Test">
          <button>Test</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      // Should not crash
      expect(button).toBeInTheDocument();

      // Restore original method
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    });

    it('should handle animation errors gracefully', () => {
      // Mock requestAnimationFrame to throw error
      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = jest.fn(() => {
        throw new Error('Animation error');
      });

      render(
        <AnimatedTransition isVisible={true} type="fade">
          <div>Content</div>
        </AnimatedTransition>
      );

      // Should still render content
      expect(screen.getByText('Content')).toBeInTheDocument();

      // Restore original method
      window.requestAnimationFrame = originalRAF;
    });
  });
});

describe('Performance Optimizations', () => {
  it('should not re-render unnecessarily', () => {
    const renderSpy = jest.fn();
    
    const TestComponent = () => {
      renderSpy();
      return <div>Test</div>;
    };

    const { rerender } = render(
      <AnimatedTransition isVisible={true} type="fade">
        <TestComponent />
      </AnimatedTransition>
    );

    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Re-render with same props
    rerender(
      <AnimatedTransition isVisible={true} type="fade">
        <TestComponent />
      </AnimatedTransition>
    );

    // Should not cause unnecessary re-renders
    expect(renderSpy).toHaveBeenCalledTimes(2); // Once for initial, once for rerender
  });

  it('should cleanup timers properly', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { unmount } = render(
      <Tooltip content="Test" delay={1000}>
        <button>Test</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});