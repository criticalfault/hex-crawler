/**
 * Integration tests for SettingsPanel component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store, initializeStore } from '../store';
import { SettingsPanel } from './SettingsPanel';
import { SettingsButton } from './SettingsButton';

// Simple integration test to verify the settings panel opens and closes
describe('SettingsPanel Integration', () => {
  beforeEach(() => {
    initializeStore();
  });

  it('opens settings panel when settings button is clicked', () => {
    render(
      <Provider store={store}>
        <SettingsButton />
        <SettingsPanel isOpen={store.getState().ui.isSettingsPanelOpen} onClose={() => {}} />
      </Provider>
    );

    // Initially, settings panel should not be visible
    expect(screen.queryByText('Map Settings')).not.toBeInTheDocument();

    // Click the settings button
    const settingsButton = screen.getByLabelText('Open map settings');
    fireEvent.click(settingsButton);

    // Settings panel should now be visible
    expect(screen.getByText('Map Settings')).toBeInTheDocument();
    expect(screen.getByText('Grid')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Terrain')).toBeInTheDocument();
  });

  it('displays terrain color controls', () => {
    render(
      <Provider store={store}>
        <SettingsPanel isOpen={true} onClose={() => {}} />
      </Provider>
    );

    // Switch to terrain tab
    const terrainTab = screen.getByText('Terrain');
    fireEvent.click(terrainTab);

    // Check that terrain color controls are present
    expect(screen.getByText('🏔️ Mountains:')).toBeInTheDocument();
    expect(screen.getByText('🌾 Plains:')).toBeInTheDocument();
    expect(screen.getByText('🌿 Swamps:')).toBeInTheDocument();
    expect(screen.getByText('🌊 Water:')).toBeInTheDocument();
    expect(screen.getByText('🏜️ Desert:')).toBeInTheDocument();
  });
});