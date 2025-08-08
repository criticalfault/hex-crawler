/**
 * Integration tests for player positioning and movement system
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store, initializeStore, mapActions, uiActions } from '../store';
import { HexGrid } from './HexGrid';
import { PlayerControls } from './PlayerControls';
import { ModeToggle } from './ModeToggle';

// Test wrapper component
const TestApp = () => (
  <Provider store={store}>
    <div>
      <ModeToggle />
      <PlayerControls />
      <div style={{ width: '800px', height: '600px' }}>
        <HexGrid />
      </div>
    </div>
  </Provider>
);

describe('Player Positioning Integration', () => {
  beforeEach(() => {
    // Initialize store with a test map
    initializeStore();
    store.dispatch(mapActions.createNewMap({
      name: 'Test Map',
      dimensions: { width: 10, height: 10 }
    }));
  });

  it('allows switching to player mode and shows player controls', async () => {
    render(<TestApp />);
    
    // Initially should be in GM mode
    expect(screen.getByText('🎲 GM Mode')).toBeInTheDocument();
    
    // Switch to player mode
    const playerModeButton = screen.getByText('Player Mode');
    fireEvent.click(playerModeButton);
    
    // Should now show player mode and controls
    expect(screen.getByText('🗺️ Player Mode')).toBeInTheDocument();
    expect(screen.getByText('Player Controls')).toBeInTheDocument();
    expect(screen.getByText(/Sight Distance:/)).toBeInTheDocument();
  });

  it('shows default sight distance and reveal mode', () => {
    render(<TestApp />);
    
    // Switch to player mode
    const playerModeButton = screen.getByText('Player Mode');
    fireEvent.click(playerModeButton);
    
    // Check default values
    expect(screen.getByText('Sight Distance: 2 hexes')).toBeInTheDocument();
    expect(screen.getByText('Permanent')).toHaveClass('active');
    expect(screen.getByText('Player Positions (0):')).toBeInTheDocument();
    expect(screen.getByText('Click on the map to place players')).toBeInTheDocument();
  });

  it('allows changing sight distance', () => {
    render(<TestApp />);
    
    // Switch to player mode
    const playerModeButton = screen.getByText('Player Mode');
    fireEvent.click(playerModeButton);
    
    // Change sight distance
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '4' } });
    
    // Should update the display
    expect(screen.getByText('Sight Distance: 4 hexes')).toBeInTheDocument();
  });

  it('allows switching reveal modes', () => {
    render(<TestApp />);
    
    // Switch to player mode
    const playerModeButton = screen.getByText('Player Mode');
    fireEvent.click(playerModeButton);
    
    // Initially permanent should be active
    expect(screen.getByText('Permanent')).toHaveClass('active');
    expect(screen.getByText('Line of Sight')).not.toHaveClass('active');
    
    // Switch to line of sight
    const lineOfSightButton = screen.getByText('Line of Sight');
    fireEvent.click(lineOfSightButton);
    
    // Should update active state
    expect(screen.getByText('Line of Sight')).toHaveClass('active');
    expect(screen.getByText('Permanent')).not.toHaveClass('active');
  });

  it('displays instructions for player interaction', () => {
    render(<TestApp />);
    
    // Switch to player mode
    const playerModeButton = screen.getByText('Player Mode');
    fireEvent.click(playerModeButton);
    
    // Check instructions are present
    expect(screen.getByText('Instructions:')).toBeInTheDocument();
    expect(screen.getByText('Click on hexes to move players')).toBeInTheDocument();
    expect(screen.getByText('Adjust sight distance to control exploration range')).toBeInTheDocument();
    expect(screen.getByText('Toggle reveal mode to change visibility behavior')).toBeInTheDocument();
  });

  it('shows player mode info in sidebar', () => {
    render(<TestApp />);
    
    // Switch to player mode
    const playerModeButton = screen.getByText('Player Mode');
    fireEvent.click(playerModeButton);
    
    // Check player mode info
    expect(screen.getByText('Player View')).toBeInTheDocument();
    expect(screen.getByText('Only explored areas are visible. Move players to reveal new hexes.')).toBeInTheDocument();
  });

  it('integrates with hex grid for player positioning', () => {
    render(<TestApp />);
    
    // Switch to player mode
    const playerModeButton = screen.getByText('Player Mode');
    fireEvent.click(playerModeButton);
    
    // The hex grid should be rendered and ready for interaction
    const hexGrid = screen.getByRole('img', { hidden: true }); // Canvas element
    expect(hexGrid).toBeInTheDocument();
    
    // Player controls should be visible
    expect(screen.getByText('Player Controls')).toBeInTheDocument();
  });

  it('maintains state when switching between modes', () => {
    render(<TestApp />);
    
    // Switch to player mode and change sight distance
    const playerModeButton = screen.getByText('Player Mode');
    fireEvent.click(playerModeButton);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '3' } });
    expect(screen.getByText('Sight Distance: 3 hexes')).toBeInTheDocument();
    
    // Switch back to GM mode
    const gmModeButton = screen.getByText('GM Mode');
    fireEvent.click(gmModeButton);
    
    // Switch back to player mode
    fireEvent.click(playerModeButton);
    
    // Sight distance should be preserved
    expect(screen.getByText('Sight Distance: 3 hexes')).toBeInTheDocument();
  });
});