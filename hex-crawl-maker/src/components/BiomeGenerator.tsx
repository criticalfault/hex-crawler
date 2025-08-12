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

  const [previewDimensions, setPreviewDimensions] = useState({ width: 10, height: 10 });
  const [targetCoordinate, setTargetCoordinate] = useState<HexCoordinate>({ q: 0, r: 0 });

  // Update target coordinate when map changes
  useEffect(() => {
    if (currentMap) {
      setTargetCoordinate({
        q: Math.floor(currentMap.dimensions.width / 2),
        r: Math.floor(currentMap.dimensions.height / 2)
      });
    }
  }, [currentMap]);

  const handleClose = () => {
    dispatch(templateActions.closeBiomeGenerator());
  };

  const handleConfigChange = (key: keyof BiomeGeneratorConfig, value: any) => {
    dispatch(templateActions.updateBiomeGeneratorConfig({ [key]: value }));
  };

  const handleGeneratePreview = () => {
    dispatch(templateActions.setIsGeneratingBiome(true));
    
    try {
      const cells = TemplateService.generateBiome(previewDimensions, biomeGeneratorConfig);
      dispatch(templateActions.setGeneratedBiomeCells(cells));
    } catch (error) {
      console.error('Error generating biome:', error);
    } finally {
      dispatch(templateActions.setIsGeneratingBiome(false));
    }
  };

  const handleApplyBiome = () => {
    if (!currentMap || generatedBiomeCells.length === 0) return;

    // Apply generated cells to the map at target coordinate
    generatedBiomeCells.forEach(cell => {
      const finalCoord = {
        q: cell.coordinate.q + targetCoordinate.q,
        r: cell.coordinate.r + targetCoordinate.r
      };

      // Check bounds
      if (finalCoord.q >= 0 && finalCoord.q < currentMap.dimensions.width &&
          finalCoord.r >= 0 && finalCoord.r < currentMap.dimensions.height) {
        dispatch(mapActions.placeIcon({
          coordinate: finalCoord,
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
                Terrain Density:
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

            <div className="control-group">
              <label>
                Preview Size:
                <div className="dimension-controls">
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={previewDimensions.width}
                    onChange={(e) => setPreviewDimensions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  />
                  ×
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={previewDimensions.height}
                    onChange={(e) => setPreviewDimensions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  />
                </div>
              </label>
            </div>

            {currentMap && (
              <div className="control-group">
                <label>
                  Target Position:
                  <div className="coordinate-controls">
                    <input
                      type="number"
                      min="0"
                      max={currentMap.dimensions.width - 1}
                      value={targetCoordinate.q}
                      onChange={(e) => setTargetCoordinate(prev => ({ ...prev, q: parseInt(e.target.value) }))}
                    />
                    ,
                    <input
                      type="number"
                      min="0"
                      max={currentMap.dimensions.height - 1}
                      value={targetCoordinate.r}
                      onChange={(e) => setTargetCoordinate(prev => ({ ...prev, r: parseInt(e.target.value) }))}
                    />
                  </div>
                </label>
              </div>
            )}

            <div className="generation-actions">
              <button
                onClick={handleGeneratePreview}
                disabled={isGeneratingBiome}
                className="generate-button"
              >
                {isGeneratingBiome ? 'Generating...' : 'Generate Preview'}
              </button>
            </div>
          </div>

          <div className="biome-preview">
            <h3>Preview</h3>
            
            {generatedBiomeCells.length > 0 ? (
              <div className="preview-container">
                <div 
                  className="biome-preview-grid"
                  style={{
                    gridTemplateColumns: `repeat(${previewDimensions.width}, 1fr)`,
                    aspectRatio: `${previewDimensions.width} / ${previewDimensions.height}`
                  }}
                >
                  {Array.from({ length: previewDimensions.width * previewDimensions.height }).map((_, i) => {
                    const q = i % previewDimensions.width;
                    const r = Math.floor(i / previewDimensions.width);
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
                <p>Click "Generate Preview" to see the biome</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};