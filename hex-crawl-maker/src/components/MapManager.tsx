/**
 * Map Manager Component - Handles map creation, loading, saving, and management
 */

import React, { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { mapActions } from '../store';
import { exportAllData, importAllData, clearAllStoredData } from '../store/middleware/localStorage';
// MapData type is imported but not used directly in JSX, keeping import for type checking
import './MapManager.css';

interface MapManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MapManager: React.FC<MapManagerProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { currentMap, savedMaps } = useAppSelector(state => state.map);
  
  const [newMapName, setNewMapName] = useState('');
  const [newMapWidth, setNewMapWidth] = useState(20);
  const [newMapHeight, setNewMapHeight] = useState(15);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateMap = () => {
    if (newMapName.trim()) {
      dispatch(mapActions.createNewMap({
        name: newMapName.trim(),
        dimensions: { width: newMapWidth, height: newMapHeight }
      }));
      setNewMapName('');
      setNewMapWidth(20);
      setNewMapHeight(15);
      setShowCreateForm(false);
    }
  };

  const handleLoadMap = (mapId: string) => {
    dispatch(mapActions.loadMap(mapId));
    onClose();
  };

  const handleDeleteMap = (mapId: string) => {
    dispatch(mapActions.deleteMap(mapId));
    setShowDeleteConfirm(null);
  };

  const handleSaveCurrentMap = () => {
    if (currentMap) {
      dispatch(mapActions.saveCurrentMap());
    }
  };

  const handleExportData = () => {
    const data = exportAllData();
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hex-crawl-maps-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const success = importAllData(content);
          if (success) {
            // Reload the page to refresh the store with imported data
            window.location.reload();
          } else {
            alert('Failed to import data. Please check the file format.');
          }
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all saved maps and data? This cannot be undone.')) {
      clearAllStoredData();
      window.location.reload();
    }
  };

  const savedMapsList = Object.values(savedMaps);

  if (!isOpen) return null;

  return (
    <div className="map-manager-overlay">
      <div className="map-manager">
        <div className="map-manager__header">
          <h2>Map Manager</h2>
          <button 
            className="map-manager__close-btn"
            onClick={onClose}
            aria-label="Close map manager"
          >
            ×
          </button>
        </div>

        <div className="map-manager__content">
          {/* Current Map Section */}
          <section className="map-manager__section">
            <h3>Current Map</h3>
            {currentMap ? (
              <div className="current-map-info">
                <div className="current-map-details">
                  <strong>{currentMap.name}</strong>
                  <span className="map-dimensions">
                    {currentMap.dimensions.width} × {currentMap.dimensions.height} hexes
                  </span>
                </div>
                <button 
                  className="btn btn--primary"
                  onClick={handleSaveCurrentMap}
                >
                  Save Current Map
                </button>
              </div>
            ) : (
              <p className="no-current-map">No map currently loaded</p>
            )}
          </section>

          {/* Create New Map Section */}
          <section className="map-manager__section">
            <div className="section-header">
              <h3>Create New Map</h3>
              <button 
                className="btn btn--secondary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? 'Cancel' : 'New Map'}
              </button>
            </div>
            
            {showCreateForm && (
              <div className="create-map-form">
                <div className="form-group">
                  <label htmlFor="map-name">Map Name:</label>
                  <input
                    id="map-name"
                    type="text"
                    value={newMapName}
                    onChange={(e) => setNewMapName(e.target.value)}
                    placeholder="Enter map name"
                    maxLength={50}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="map-width">Width (hexes):</label>
                    <input
                      id="map-width"
                      type="number"
                      value={newMapWidth}
                      onChange={(e) => setNewMapWidth(Math.max(5, Math.min(100, parseInt(e.target.value) || 20)))}
                      min="5"
                      max="100"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="map-height">Height (hexes):</label>
                    <input
                      id="map-height"
                      type="number"
                      value={newMapHeight}
                      onChange={(e) => setNewMapHeight(Math.max(5, Math.min(100, parseInt(e.target.value) || 15)))}
                      min="5"
                      max="100"
                    />
                  </div>
                </div>
                <button 
                  className="btn btn--primary"
                  onClick={handleCreateMap}
                  disabled={!newMapName.trim()}
                >
                  Create Map
                </button>
              </div>
            )}
          </section>

          {/* Saved Maps Section */}
          <section className="map-manager__section">
            <h3>Saved Maps ({savedMapsList.length})</h3>
            {savedMapsList.length > 0 ? (
              <div className="saved-maps-list">
                {savedMapsList.map((map) => (
                  <div key={map.id} className="saved-map-item">
                    <div className="saved-map-info">
                      <div className="saved-map-name">{map.name}</div>
                      <div className="saved-map-details">
                        {map.dimensions.width} × {map.dimensions.height} hexes
                        {currentMap?.id === map.id && (
                          <span className="current-indicator">(Current)</span>
                        )}
                      </div>
                    </div>
                    <div className="saved-map-actions">
                      <button 
                        className="btn btn--small btn--primary"
                        onClick={() => handleLoadMap(map.id)}
                        disabled={currentMap?.id === map.id}
                      >
                        Load
                      </button>
                      <button 
                        className="btn btn--small btn--danger"
                        onClick={() => setShowDeleteConfirm(map.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-saved-maps">No saved maps found</p>
            )}
          </section>

          {/* Import/Export Section */}
          <section className="map-manager__section">
            <h3>Import/Export</h3>
            <div className="import-export-actions">
              <button 
                className="btn btn--secondary"
                onClick={handleExportData}
                disabled={savedMapsList.length === 0}
              >
                Export All Data
              </button>
              <button 
                className="btn btn--secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Import Data
              </button>
              <button 
                className="btn btn--danger"
                onClick={handleClearAllData}
              >
                Clear All Data
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              style={{ display: 'none' }}
            />
            <p className="import-export-note">
              Export creates a JSON file with all your maps and settings. 
              Import will replace all current data.
            </p>
          </section>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h4>Delete Map</h4>
              <p>
                Are you sure you want to delete "{savedMaps[showDeleteConfirm]?.name}"? 
                This action cannot be undone.
              </p>
              <div className="delete-confirm-actions">
                <button 
                  className="btn btn--secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn--danger"
                  onClick={() => handleDeleteMap(showDeleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};