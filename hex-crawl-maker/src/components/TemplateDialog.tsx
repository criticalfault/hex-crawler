/**
 * Main template dialog component for browsing and applying templates
 */

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { templateActions, mapActions } from '../store';
import { TemplateService } from '../services/templateService';
import type { TerrainTemplate, TemplateSearchFilters, TemplateGenerationOptions } from '../types/templates';
import type { HexCoordinate } from '../types/hex';
import './TemplateDialog.css';

export const TemplateDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isTemplateDialogOpen,
    availableTemplates,
    filteredTemplates,
    searchFilters,
    selectedTemplate,
    templatePreview
  } = useAppSelector(state => state.template);

  const { currentMap } = useAppSelector(state => state.map);

  const [localFilters, setLocalFilters] = useState<TemplateSearchFilters>(searchFilters);
  const [generationOptions, setGenerationOptions] = useState<TemplateGenerationOptions>({
    dimensions: { width: 10, height: 10 },
    rotation: 0,
    scale: 1
  });

  // Load templates on mount
  useEffect(() => {
    const templates = TemplateService.getAllTemplates();
    dispatch(templateActions.setAvailableTemplates(templates));
  }, [dispatch]);

  // Apply filters when they change
  useEffect(() => {
    const filtered = TemplateService.searchTemplates(localFilters);
    dispatch(templateActions.setFilteredTemplates(filtered));
  }, [localFilters, availableTemplates, dispatch]);

  // Generate preview when template or options change
  useEffect(() => {
    if (selectedTemplate) {
      const preview = TemplateService.generateTemplatePreview(selectedTemplate, generationOptions);
      dispatch(templateActions.setTemplatePreview(preview));
    }
  }, [selectedTemplate, generationOptions, dispatch]);

  const handleClose = () => {
    dispatch(templateActions.closeTemplateDialog());
    dispatch(templateActions.selectTemplate(null));
  };

  const handleTemplateSelect = (template: TerrainTemplate) => {
    dispatch(templateActions.selectTemplate(template));
  };

  const handleFilterChange = (key: keyof TemplateSearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    dispatch(templateActions.updateSearchFilters(newFilters));
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate || !currentMap || !templatePreview) return;

    // Apply template at center of current map
    const centerCoord: HexCoordinate = {
      q: Math.floor(currentMap.dimensions.width / 2),
      r: Math.floor(currentMap.dimensions.height / 2)
    };

    const appliedCells = TemplateService.applyTemplate(selectedTemplate, centerCoord, generationOptions);

    // Apply each cell to the map
    appliedCells.forEach(cell => {
      if (cell.coordinate.q >= 0 && cell.coordinate.q < currentMap.dimensions.width &&
          cell.coordinate.r >= 0 && cell.coordinate.r < currentMap.dimensions.height) {
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

  const handleGenerationOptionChange = (key: keyof TemplateGenerationOptions, value: any) => {
    setGenerationOptions(prev => ({ ...prev, [key]: value }));
  };

  if (!isTemplateDialogOpen) return null;

  return (
    <div className="template-dialog-overlay">
      <div className="template-dialog">
        <div className="template-dialog-header">
          <h2>Template Library</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="template-dialog-content">
          {/* Search and Filter Panel */}
          <div className="template-filters">
            <div className="filter-row">
              <input
                type="text"
                placeholder="Search templates..."
                value={localFilters.searchTerm || ''}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="search-input"
              />
              
              <select
                value={localFilters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="category-select"
              >
                <option value="">All Categories</option>
                <option value="biome">Biomes</option>
                <option value="campaign">Campaign</option>
                <option value="structure">Structures</option>
                <option value="custom">Custom</option>
              </select>

              <select
                value={localFilters.sortBy || 'name'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="sort-select"
              >
                <option value="name">Name</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
              </select>

              <button
                className={`sort-order-button ${localFilters.sortOrder === 'desc' ? 'desc' : 'asc'}`}
                onClick={() => handleFilterChange('sortOrder', localFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {localFilters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          <div className="template-dialog-body">
            {/* Template List */}
            <div className="template-list">
              <h3>Templates ({filteredTemplates.length})</h3>
              <div className="template-grid">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="template-preview">
                      {/* Simple visual preview */}
                      <div className="template-preview-grid">
                        {Array.from({ length: Math.min(25, template.dimensions.width * template.dimensions.height) }).map((_, i) => {
                          const q = i % Math.min(5, template.dimensions.width);
                          const r = Math.floor(i / Math.min(5, template.dimensions.width));
                          const cell = template.cells.find(c => c.coordinate.q === q && c.coordinate.r === r);
                          return (
                            <div
                              key={i}
                              className={`preview-hex ${cell?.terrain || 'empty'} ${cell?.landmark ? 'has-landmark' : ''}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="template-info">
                      <h4>{template.name}</h4>
                      <p className="template-description">{template.description}</p>
                      <div className="template-meta">
                        <span className="template-category">{template.category}</span>
                        <span className="template-size">{template.dimensions.width}×{template.dimensions.height}</span>
                      </div>
                      <div className="template-tags">
                        {template.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="template-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Details and Options */}
            {selectedTemplate && (
              <div className="template-details">
                <h3>{selectedTemplate.name}</h3>
                <p>{selectedTemplate.description}</p>
                
                <div className="generation-options">
                  <h4>Application Options</h4>
                  
                  <div className="option-group">
                    <label>
                      Rotation:
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="60"
                        value={generationOptions.rotation || 0}
                        onChange={(e) => handleGenerationOptionChange('rotation', parseInt(e.target.value))}
                      />
                      <span>{generationOptions.rotation || 0}°</span>
                    </label>
                  </div>

                  <div className="option-group">
                    <label>
                      Scale:
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={generationOptions.scale || 1}
                        onChange={(e) => handleGenerationOptionChange('scale', parseFloat(e.target.value))}
                      />
                      <span>{generationOptions.scale || 1}x</span>
                    </label>
                  </div>

                  <div className="option-group">
                    <label>
                      Mirror:
                      <select
                        value={generationOptions.mirror || ''}
                        onChange={(e) => handleGenerationOptionChange('mirror', e.target.value || undefined)}
                      >
                        <option value="">None</option>
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                        <option value="both">Both</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="template-actions">
                  <button
                    className="apply-template-button"
                    onClick={handleApplyTemplate}
                    disabled={!currentMap}
                  >
                    Apply Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};