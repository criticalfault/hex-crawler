/**
 * ExportDialog component - provides UI for configuring and executing map exports
 */

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import { selectCurrentMap, selectVisibleHexes, selectExploredHexes } from '../store/selectors';
import { exportService } from '../services/exportService';
import type { ExportOptions, ExportDimensions } from '../utils/exportUtils';
import type { HexCoordinate } from '../types';
import './ExportDialog.css';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  const mapData = useAppSelector(selectCurrentMap);
  const visibleHexes = useAppSelector(selectVisibleHexes);
  const exploredHexes = useAppSelector(selectExploredHexes);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    dpi: 300,
    area: 'full',
    layers: {
      terrain: true,
      landmarks: true,
      labels: true,
      gmNotes: false,
      playerPositions: true,
      grid: true,
      coordinates: false,
    },
    margins: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    },
  });
  
  const [previewDimensions, setPreviewDimensions] = useState<ExportDimensions | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selection, setSelection] = useState<{ topLeft: HexCoordinate; bottomRight: HexCoordinate } | null>(null);

  // Update preview when options change
  useEffect(() => {
    if (mapData) {
      const hexesToUse = exportOptions.area === 'visible' ? visibleHexes : exploredHexes;
      const dimensions = exportService.getExportPreview(mapData, exportOptions, hexesToUse);
      setPreviewDimensions(dimensions);
    }
  }, [mapData, exportOptions, visibleHexes, exploredHexes]);

  const handleExport = async () => {
    if (!mapData) return;
    
    setIsExporting(true);
    try {
      const hexesToUse = exportOptions.area === 'visible' ? visibleHexes : exploredHexes;
      
      if (exportOptions.format === 'png') {
        await exportService.exportPNG(mapData, exportOptions, hexesToUse);
      } else {
        await exportService.exportPDF(mapData, exportOptions, hexesToUse);
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBatchExport = async () => {
    if (!mapData) return;
    
    setIsExporting(true);
    try {
      const hexesToUse = exportOptions.area === 'visible' ? visibleHexes : exploredHexes;
      
      // Create multiple export configurations
      const configs: ExportOptions[] = [
        { ...exportOptions, format: 'png', dpi: 150 },
        { ...exportOptions, format: 'png', dpi: 300 },
        { ...exportOptions, format: 'pdf', dpi: 300 },
      ];
      
      await exportService.batchExport(mapData, configs, hexesToUse);
      onClose();
    } catch (error) {
      console.error('Batch export failed:', error);
      alert('Batch export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const updateExportOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  };

  const updateLayers = (layer: keyof ExportOptions['layers'], value: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      layers: { ...prev.layers, [layer]: value }
    }));
  };

  const updateMargins = (margin: keyof NonNullable<ExportOptions['margins']>, value: number) => {
    setExportOptions(prev => ({
      ...prev,
      margins: { ...prev.margins!, [margin]: value }
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const estimateFileSize = (dimensions: ExportDimensions): number => {
    // Rough estimate: 4 bytes per pixel for RGBA
    return dimensions.width * dimensions.height * 4;
  };

  if (!isOpen || !mapData) return null;

  return (
    <div className="export-dialog-overlay">
      <div className="export-dialog">
        <div className="export-dialog-header">
          <h2>Export Map</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="export-dialog-content">
          <div className="export-options">
            {/* Format Selection */}
            <div className="option-group">
              <h3>Format</h3>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="png"
                    checked={exportOptions.format === 'png'}
                    onChange={(e) => updateExportOptions({ format: e.target.value as 'png' | 'pdf' })}
                  />
                  PNG (High Quality Image)
                </label>
                <label>
                  <input
                    type="radio"
                    value="pdf"
                    checked={exportOptions.format === 'pdf'}
                    onChange={(e) => updateExportOptions({ format: e.target.value as 'png' | 'pdf' })}
                  />
                  PDF (Print Ready)
                </label>
              </div>
            </div>

            {/* DPI Selection */}
            <div className="option-group">
              <h3>Resolution (DPI)</h3>
              <div className="dpi-options">
                <label>
                  <input
                    type="radio"
                    value="150"
                    checked={exportOptions.dpi === 150}
                    onChange={() => updateExportOptions({ dpi: 150 })}
                  />
                  150 DPI (Web/Screen)
                </label>
                <label>
                  <input
                    type="radio"
                    value="300"
                    checked={exportOptions.dpi === 300}
                    onChange={() => updateExportOptions({ dpi: 300 })}
                  />
                  300 DPI (Print Quality)
                </label>
                <label>
                  <input
                    type="radio"
                    value="600"
                    checked={exportOptions.dpi === 600}
                    onChange={() => updateExportOptions({ dpi: 600 })}
                  />
                  600 DPI (High Print Quality)
                </label>
                <div className="custom-dpi">
                  <label>
                    Custom:
                    <input
                      type="number"
                      min="72"
                      max="1200"
                      value={exportOptions.dpi}
                      onChange={(e) => updateExportOptions({ dpi: parseInt(e.target.value) || 300 })}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Area Selection */}
            <div className="option-group">
              <h3>Export Area</h3>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="full"
                    checked={exportOptions.area === 'full'}
                    onChange={() => updateExportOptions({ area: 'full' })}
                  />
                  Full Map
                </label>
                <label>
                  <input
                    type="radio"
                    value="visible"
                    checked={exportOptions.area === 'visible'}
                    onChange={() => updateExportOptions({ area: 'visible' })}
                  />
                  Visible Area Only
                </label>
                <label>
                  <input
                    type="radio"
                    value="selection"
                    checked={exportOptions.area === 'selection'}
                    onChange={() => updateExportOptions({ area: 'selection' })}
                    disabled={!selection}
                  />
                  Selected Region {!selection && '(Select region first)'}
                </label>
              </div>
              {exportOptions.area === 'selection' && (
                <button
                  className="selection-button"
                  onClick={() => setSelectionMode(!selectionMode)}
                >
                  {selectionMode ? 'Cancel Selection' : 'Select Region'}
                </button>
              )}
            </div>

            {/* Layer Options */}
            <div className="option-group">
              <h3>Layers to Include</h3>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={exportOptions.layers.terrain}
                    onChange={(e) => updateLayers('terrain', e.target.checked)}
                  />
                  Terrain
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={exportOptions.layers.landmarks}
                    onChange={(e) => updateLayers('landmarks', e.target.checked)}
                  />
                  Landmarks
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={exportOptions.layers.labels}
                    onChange={(e) => updateLayers('labels', e.target.checked)}
                  />
                  Labels
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={exportOptions.layers.gmNotes}
                    onChange={(e) => updateLayers('gmNotes', e.target.checked)}
                  />
                  GM Notes
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={exportOptions.layers.playerPositions}
                    onChange={(e) => updateLayers('playerPositions', e.target.checked)}
                  />
                  Player Positions
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={exportOptions.layers.grid}
                    onChange={(e) => updateLayers('grid', e.target.checked)}
                  />
                  Grid Lines
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={exportOptions.layers.coordinates}
                    onChange={(e) => updateLayers('coordinates', e.target.checked)}
                  />
                  Hex Coordinates
                </label>
              </div>
            </div>

            {/* Margins */}
            <div className="option-group">
              <h3>Margins (pixels)</h3>
              <div className="margins-grid">
                <div className="margin-input">
                  <label>Top:</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={exportOptions.margins?.top || 50}
                    onChange={(e) => updateMargins('top', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="margin-input">
                  <label>Right:</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={exportOptions.margins?.right || 50}
                    onChange={(e) => updateMargins('right', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="margin-input">
                  <label>Bottom:</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={exportOptions.margins?.bottom || 50}
                    onChange={(e) => updateMargins('bottom', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="margin-input">
                  <label>Left:</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={exportOptions.margins?.left || 50}
                    onChange={(e) => updateMargins('left', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Watermark */}
            <div className="option-group">
              <h3>Watermark (Optional)</h3>
              <div className="watermark-options">
                <label>
                  <input
                    type="checkbox"
                    checked={!!exportOptions.watermark}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateExportOptions({
                          watermark: {
                            text: 'Created with Hex Crawl Maker',
                            position: 'bottom-right',
                            opacity: 0.3,
                          }
                        });
                      } else {
                        updateExportOptions({ watermark: undefined });
                      }
                    }}
                  />
                  Add Watermark
                </label>
                {exportOptions.watermark && (
                  <div className="watermark-config">
                    <input
                      type="text"
                      placeholder="Watermark text"
                      value={exportOptions.watermark.text}
                      onChange={(e) => updateExportOptions({
                        watermark: { ...exportOptions.watermark!, text: e.target.value }
                      })}
                    />
                    <select
                      value={exportOptions.watermark.position}
                      onChange={(e) => updateExportOptions({
                        watermark: { ...exportOptions.watermark!, position: e.target.value as any }
                      })}
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="center">Center</option>
                    </select>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={exportOptions.watermark.opacity}
                      onChange={(e) => updateExportOptions({
                        watermark: { ...exportOptions.watermark!, opacity: parseFloat(e.target.value) }
                      })}
                    />
                    <span>{Math.round(exportOptions.watermark.opacity * 100)}% opacity</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="export-preview">
            <h3>Export Preview</h3>
            {previewDimensions && (
              <div className="preview-info">
                <div className="preview-stat">
                  <strong>Dimensions:</strong> {Math.round(previewDimensions.width)} × {Math.round(previewDimensions.height)} pixels
                </div>
                <div className="preview-stat">
                  <strong>Estimated Size:</strong> {formatFileSize(estimateFileSize(previewDimensions))}
                </div>
                <div className="preview-stat">
                  <strong>Print Size:</strong> {(previewDimensions.width / exportOptions.dpi).toFixed(1)}" × {(previewDimensions.height / exportOptions.dpi).toFixed(1)}"
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="export-dialog-footer">
          <div className="export-buttons">
            <button
              className="export-button primary"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : `Export ${exportOptions.format.toUpperCase()}`}
            </button>
            <button
              className="export-button secondary"
              onClick={handleBatchExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Batch Export (Multiple Formats)'}
            </button>
            <button className="export-button cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};