/**
 * Biome generator component for procedural terrain generation
 */

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { templateActions, mapActions } from '../store';
import { TemplateService } from '../services/templateService';
import type { BiomeGeneratorConfig } from '../types/templates';
import type { HexCoordinate } from '../types/hex';
import './BiomeGenerator.css';

export const BiomeGenerator: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isBiomeGeneratorOpen,
    biomeGeneratorConfig,
    isGeneratingBiome,
    generatedBiomeCells
  } = useAppSelector(state => state.template);

  const { currentMap } = useAppSelector(state => state.map);

  // No need for preview dimensions or target coordinates - we'll fill the entire map

  const handleClose = () => {
    dispatch(templateActions.closeBiomeGenerator());
  };

  const handleConfigChange = (key: keyof BiomeGeneratorConfig, value: any) => {
    dispatch(templateActions.updateBiomeGeneratorConfig({ [key]: value }));
  };

  const handleGeneratePreview = () => {
    if (!currentMap) return;
    
    dispatch(templateActions.setIsGeneratingBiome(true));
    
    try {
      // Generate ALL hex coordinates that should exist on the grid
      // Use the same logic as HexGrid to ensure we fill every visible hex
      const allGridCoordinates: HexCoordinate[] = [];
      
      for (let row = 0; row < currentMap.dimensions.height; row++) {
        for (let col = 0; col < currentMap.dimensions.width; col++) {
          // Use the same coordinate generation as HexGrid
          const q = col - Math.floor(row / 2);
          const r = row;
          allGridCoordinates.push({ q, r });
        }
      }
      
      // Generate biome for ALL grid coordinates (including empty/white hexes)
      const cells = TemplateService.generateBiomeForCoordinates(allGridCoordinates, biomeGeneratorConfig);
      dispatch(templateActions.setGeneratedBiomeCells(cells));
    } catch (error) {
      console.error('Error generating biome:', error);
    } finally {
      dispatch(templateActions.setIsGeneratingBiome(false));
    }
  };

  const handleApplyBiome = () => {
    if (!currentMap || generatedBiomeCells.length === 0) return;

    // Apply generated cells directly to the map (they're already in the correct coordinates)
    generatedBiomeCells.forEach(cell => {
      // Check if coordinate is within map bounds using proper hex coordinate bounds checking
      const row = cell.coordinate.r;
      const col = cell.coordinate.q + Math.floor(row / 2);
      
      if (row >= 0 && row < currentMap.dimensions.height &&
          col >= 0 && col < currentMap.dimensions.width) {
        dispatch(mapActions.placeIcon({
          coordinate: cell.coordinate,
          terrain: cell.terrain,
          landmark: cell.landmark,
          name: cell.name,
          description: cell.description,
          gmNotes: cell.gmNotes
        }));
      }
    });

    handleClose();
  };

  const handleRandomizeSeed = () => {
    handleConfigChange('seed', Math.random());
  };

  if (!isBiomeGeneratorOpen) return null;

  return (
    <div className="biome-generator-overlay">
      <div className="biome-generator">
        <div className="biome-generator-header">
          <h2>Biome Generator</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="biome-generator-content">
          <div className="biome-controls">
            <h3>Generation Settings</h3>

            <div className="control-group">
              <label>
                Biome Type:
                <select
                  value={biomeGeneratorConfig.biomeType}
                  onChange={(e) => handleConfigChange('biomeType', e.target.value)}
                >
                  <option value="mixed">Mixed Terrain</option>
                  <option value="forest">Forest Region</option>
                  <option value="mountain">Mountain Range</option>
                  <option value="coastal">Coastal Area</option>
                  <option value="desert">Desert Wasteland</option>
                  <option value="swamp">Swampland</option>
                </select>
              </label>
            </div>

            <div className="control-group">
              <label>
                Terrain Consistency:
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={biomeGeneratorConfig.density}
                  onChange={(e) => handleConfigChange('density', parseFloat(e.target.value))}
                />
                <span>{Math.round(biomeGeneratorConfig.density * 100)}%</span>
              </label>
              <p className="help-text">Higher values = more consistent terrain, lower values = more variation</p>
            </div>

            <div className="control-group">
              <label>
                Terrain Variation:
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={biomeGeneratorConfig.variation}
                  onChange={(e) => handleConfigChange('variation', parseFloat(e.target.value))}
                />
                <span>{Math.round(biomeGeneratorConfig.variation * 100)}%</span>
              </label>
            </div>

            <div className="control-group">
              <label>
                Landmark Chance:
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={biomeGeneratorConfig.landmarkChance}
                  onChange={(e) => handleConfigChange('landmarkChance', parseFloat(e.target.value))}
                />
                <span>{Math.round(biomeGeneratorConfig.landmarkChance * 100)}%</span>
              </label>
            </div>

            <div className="control-group">
              <label>
                Generation Seed:
                <div className="seed-controls">
                  <input
                    type="number"
                    step="0.001"
                    value={biomeGeneratorConfig.seed || 0}
                    onChange={(e) => handleConfigChange('seed', parseFloat(e.target.value))}
                  />
                  <button onClick={handleRandomizeSeed} className="randomize-button">
                    🎲
                  </button>
                </div>
              </label>
            </div>

            {currentMap && (
              <div className="control-group">
                <label>
                  Map Size: {currentMap.dimensions.width} × {currentMap.dimensions.height}
                </label>
                <p className="help-text">The biome will fill your entire current map.</p>
              </div>
            )}

            <div className="generation-actions">
              <button
                onClick={handleGeneratePreview}
                disabled={isGeneratingBiome || !currentMap}
                className="generate-button"
              >
                {isGeneratingBiome ? 'Generating...' : 'Generate Full Map Biome'}
              </button>
            </div>
          </div>

          <div className="biome-preview">
            <h3>Preview</h3>
            
            {generatedBiomeCells.length > 0 && currentMap ? (
              <div className="preview-container">
                <div 
                  className="biome-preview-grid"
                  style={{
                    gridTemplateColumns: `repeat(${currentMap.dimensions.width}, 1fr)`,
                    aspectRatio: `${currentMap.dimensions.width} / ${currentMap.dimensions.height}`,
                    maxWidth: '400px',
                    maxHeight: '400px'
                  }}
                >
                  {Array.from({ length: currentMap.dimensions.width * currentMap.dimensions.height }).map((_, i) => {
                    const q = i % currentMap.dimensions.width;
                    const r = Math.floor(i / currentMap.dimensions.width);
                    const cell = generatedBiomeCells.find(c => c.coordinate.q === q && c.coordinate.r === r);
                    
                    return (
                      <div
                        key={i}
                        className={`preview-cell ${cell?.terrain || 'empty'} ${cell?.landmark ? 'has-landmark' : ''}`}
                        title={cell ? `${cell.terrain || 'Empty'}${cell.landmark ? ` (${cell.landmark})` : ''}` : 'Empty'}
                      />
                    );
                  })}
                </div>

                <div className="preview-stats">
                  <div className="stat">
                    <span className="stat-label">Total Cells:</span>
                    <span className="stat-value">{generatedBiomeCells.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">With Landmarks:</span>
                    <span className="stat-value">{generatedBiomeCells.filter(c => c.landmark).length}</span>
                  </div>
                </div>

                <div className="apply-actions">
                  <button
                    onClick={handleApplyBiome}
                    disabled={!currentMap}
                    className="apply-biome-button"
                  >
                    Apply to Map
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <p>Click "Generate Full Map Biome" to create a biome for your entire map</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};