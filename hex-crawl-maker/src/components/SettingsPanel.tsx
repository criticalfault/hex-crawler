/**
 * Settings panel component for customizing map appearance and grid settings
 */

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCurrentMap } from '../store/selectors';
import { mapActions } from '../store';
import { ProjectionControls } from './ProjectionControls';
import type { GridAppearance } from '../types';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const currentMap = useAppSelector(selectCurrentMap);
  const [activeTab, setActiveTab] = useState<'grid' | 'appearance' | 'terrain' | 'projection'>('grid');

  if (!currentMap || !isOpen) {
    return null;
  }

  const { appearance, dimensions } = currentMap;

  const handleDimensionChange = (field: 'width' | 'height', value: number) => {
    const newDimensions = { ...dimensions, [field]: Math.max(1, Math.min(50, value)) };
    dispatch(mapActions.updateMapDimensions(newDimensions));
  };

  const handleAppearanceChange = (updates: Partial<GridAppearance>) => {
    dispatch(mapActions.updateAppearance(updates));
  };

  const handleTerrainColorChange = (terrain: keyof GridAppearance['terrainColors'], color: string) => {
    const newTerrainColors = { ...appearance.terrainColors, [terrain]: color };
    handleAppearanceChange({ terrainColors: newTerrainColors });
  };

  const resetToDefaults = () => {
    const defaultAppearance: GridAppearance = {
      hexSize: 30,
      borderColor: '#333333',
      backgroundColor: '#f0f0f0',
      unexploredColor: '#cccccc',
      textSize: 12,
      terrainColors: {
        mountains: '#8B4513',
        plains: '#90EE90',
        swamps: '#556B2F',
        water: '#4169E1',
        desert: '#F4A460',
      },
      borderWidth: 1,
    };
    handleAppearanceChange(defaultAppearance);
  };

  return (
    <div className="settings-panel-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-panel__header">
          <h2>Map Settings</h2>
          <button className="settings-panel__close" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>

        <div className="settings-panel__tabs">
          <button
            className={`settings-tab ${activeTab === 'grid' ? 'settings-tab--active' : ''}`}
            onClick={() => setActiveTab('grid')}
          >
            Grid
          </button>
          <button
            className={`settings-tab ${activeTab === 'appearance' ? 'settings-tab--active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button
            className={`settings-tab ${activeTab === 'terrain' ? 'settings-tab--active' : ''}`}
            onClick={() => setActiveTab('terrain')}
          >
            Terrain
          </button>
          <button
            className={`settings-tab ${activeTab === 'projection' ? 'settings-tab--active' : ''}`}
            onClick={() => setActiveTab('projection')}
          >
            Projection
          </button>
        </div>

        <div className="settings-panel__content">
          {activeTab === 'grid' && (
            <div className="settings-section">
              <h3>Grid Dimensions</h3>
              <div className="settings-row">
                <label htmlFor="grid-width">Width (hexes):</label>
                <input
                  id="grid-width"
                  type="number"
                  min="1"
                  max="50"
                  value={dimensions.width}
                  onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="settings-row">
                <label htmlFor="grid-height">Height (hexes):</label>
                <input
                  id="grid-height"
                  type="number"
                  min="1"
                  max="50"
                  value={dimensions.height}
                  onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 1)}
                />
              </div>
              
              <h3>Hex Size</h3>
              <div className="settings-row">
                <label htmlFor="hex-size">Size (pixels):</label>
                <input
                  id="hex-size"
                  type="range"
                  min="15"
                  max="80"
                  value={appearance.hexSize}
                  onChange={(e) => handleAppearanceChange({ hexSize: parseInt(e.target.value) })}
                />
                <span className="settings-value">{appearance.hexSize}px</span>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Colors</h3>
              <div className="settings-row">
                <label htmlFor="bg-color">Background:</label>
                <input
                  id="bg-color"
                  type="color"
                  value={appearance.backgroundColor}
                  onChange={(e) => handleAppearanceChange({ backgroundColor: e.target.value })}
                />
              </div>
              <div className="settings-row">
                <label htmlFor="border-color">Border:</label>
                <input
                  id="border-color"
                  type="color"
                  value={appearance.borderColor}
                  onChange={(e) => handleAppearanceChange({ borderColor: e.target.value })}
                />
              </div>
              <div className="settings-row">
                <label htmlFor="unexplored-color">Unexplored:</label>
                <input
                  id="unexplored-color"
                  type="color"
                  value={appearance.unexploredColor}
                  onChange={(e) => handleAppearanceChange({ unexploredColor: e.target.value })}
                />
              </div>

              <h3>Border Style</h3>
              <div className="settings-row">
                <label htmlFor="border-width">Width:</label>
                <input
                  id="border-width"
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={appearance.borderWidth}
                  onChange={(e) => handleAppearanceChange({ borderWidth: parseFloat(e.target.value) })}
                />
                <span className="settings-value">{appearance.borderWidth}px</span>
              </div>

              <h3>Text Display</h3>
              <div className="settings-row">
                <label htmlFor="text-size">Font Size:</label>
                <input
                  id="text-size"
                  type="range"
                  min="8"
                  max="24"
                  value={appearance.textSize}
                  onChange={(e) => handleAppearanceChange({ textSize: parseInt(e.target.value) })}
                />
                <span className="settings-value">{appearance.textSize}px</span>
              </div>
              <p className="settings-hint">Larger text is better for projection and streaming</p>
            </div>
          )}

          {activeTab === 'terrain' && (
            <div className="settings-section">
              <h3>Terrain Colors</h3>
              <div className="terrain-colors">
                <div className="settings-row">
                  <label htmlFor="mountains-color">🏔️ Mountains:</label>
                  <input
                    id="mountains-color"
                    type="color"
                    value={appearance.terrainColors.mountains}
                    onChange={(e) => handleTerrainColorChange('mountains', e.target.value)}
                  />
                </div>
                <div className="settings-row">
                  <label htmlFor="plains-color">🌾 Plains:</label>
                  <input
                    id="plains-color"
                    type="color"
                    value={appearance.terrainColors.plains}
                    onChange={(e) => handleTerrainColorChange('plains', e.target.value)}
                  />
                </div>
                <div className="settings-row">
                  <label htmlFor="swamps-color">🌿 Swamps:</label>
                  <input
                    id="swamps-color"
                    type="color"
                    value={appearance.terrainColors.swamps}
                    onChange={(e) => handleTerrainColorChange('swamps', e.target.value)}
                  />
                </div>
                <div className="settings-row">
                  <label htmlFor="water-color">🌊 Water:</label>
                  <input
                    id="water-color"
                    type="color"
                    value={appearance.terrainColors.water}
                    onChange={(e) => handleTerrainColorChange('water', e.target.value)}
                  />
                </div>
                <div className="settings-row">
                  <label htmlFor="desert-color">🏜️ Desert:</label>
                  <input
                    id="desert-color"
                    type="color"
                    value={appearance.terrainColors.desert}
                    onChange={(e) => handleTerrainColorChange('desert', e.target.value)}
                  />
                </div>
              </div>
              <p className="settings-hint">Colors help differentiate terrain types visually</p>
            </div>
          )}

          {activeTab === 'projection' && (
            <div className="settings-section">
              <ProjectionControls />
            </div>
          )}
        </div>

        <div className="settings-panel__footer">
          <button className="settings-button settings-button--secondary" onClick={resetToDefaults}>
            Reset to Defaults
          </button>
          <button className="settings-button settings-button--primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};