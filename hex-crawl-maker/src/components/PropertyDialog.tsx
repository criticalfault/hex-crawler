/**
 * PropertyDialog component for editing hex properties
 * Provides a modal interface for editing hex content including name, description, GM notes, and icon type
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { uiActions, mapActions } from '../store';
import { TERRAIN_ICONS, STRUCTURE_ICONS, MARKER_ICONS, type IconData } from '../types/icons';
import type { TerrainType, LandmarkType, HexCell } from '../types/hex';
import './PropertyDialog.css';

interface PropertyDialogProps {
  // No props needed - component gets state from Redux
}

export const PropertyDialog: React.FC<PropertyDialogProps> = () => {
  const dispatch = useDispatch();
  const { isPropertyDialogOpen, selectedHex } = useSelector((state: RootState) => state.ui);
  const currentMap = useSelector((state: RootState) => state.map.currentMap);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [gmNotes, setGmNotes] = useState('');
  const [selectedIconType, setSelectedIconType] = useState<'terrain' | 'landmark'>('terrain');
  const [selectedIconValue, setSelectedIconValue] = useState<string>('');
  
  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    gmNotes?: string;
  }>({});

  // Get current hex cell data
  const currentHexCell = React.useMemo(() => {
    if (!currentMap || !selectedHex) return null;
    const key = `${selectedHex.q},${selectedHex.r}`;
    return currentMap.cells.get(key) || null;
  }, [currentMap, selectedHex]);

  // Load existing data when dialog opens
  useEffect(() => {
    if (isPropertyDialogOpen && currentHexCell) {
      setName(currentHexCell.name || '');
      setDescription(currentHexCell.description || '');
      setGmNotes(currentHexCell.gmNotes || '');
      
      // Set icon type and value based on existing data
      if (currentHexCell.terrain) {
        setSelectedIconType('terrain');
        setSelectedIconValue(currentHexCell.terrain);
      } else if (currentHexCell.landmark) {
        setSelectedIconType('landmark');
        setSelectedIconValue(currentHexCell.landmark);
      } else {
        // Default to terrain if no icon exists
        setSelectedIconType('terrain');
        setSelectedIconValue('plains');
      }
    } else if (isPropertyDialogOpen && !currentHexCell) {
      // New hex - set defaults
      setName('');
      setDescription('');
      setGmNotes('');
      setSelectedIconType('terrain');
      setSelectedIconValue('plains');
    }
    
    // Clear errors when dialog opens
    setErrors({});
  }, [isPropertyDialogOpen, currentHexCell]);

  // Get available icons based on selected type
  const availableIcons = React.useMemo(() => {
    if (selectedIconType === 'terrain') {
      return TERRAIN_ICONS;
    } else {
      return [...STRUCTURE_ICONS, ...MARKER_ICONS];
    }
  }, [selectedIconType]);

  // Validation function
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (name.trim().length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }
    
    if (description.trim().length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }
    
    if (gmNotes.trim().length > 1000) {
      newErrors.gmNotes = 'GM notes must be 1000 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = () => {
    if (!validateForm() || !selectedHex) return;
    
    // Prepare icon data based on selection
    const iconData: {
      terrain?: string;
      landmark?: string;
    } = {};
    
    if (selectedIconType === 'terrain') {
      iconData.terrain = selectedIconValue;
    } else {
      iconData.landmark = selectedIconValue;
    }
    
    // Dispatch action to update hex cell
    dispatch(mapActions.placeIcon({
      coordinate: selectedHex,
      ...iconData,
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      gmNotes: gmNotes.trim() || undefined,
    }));
    
    handleClose();
  };

  // Handle dialog close
  const handleClose = () => {
    dispatch(uiActions.closePropertyDialog());
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle icon type change
  const handleIconTypeChange = (newType: 'terrain' | 'landmark') => {
    setSelectedIconType(newType);
    // Set default value for new type
    if (newType === 'terrain') {
      setSelectedIconValue('plains');
    } else {
      setSelectedIconValue('tower');
    }
  };

  if (!isPropertyDialogOpen || !selectedHex) {
    return null;
  }

  return (
    <div className="property-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="property-dialog">
        <div className="property-dialog-header">
          <h2>Edit Hex Properties</h2>
          <p className="hex-coordinate">Hex ({selectedHex.q}, {selectedHex.r})</p>
          <button 
            className="property-dialog-close"
            onClick={handleClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        
        <div className="property-dialog-content">
          {/* Icon Selection */}
          <div className="form-group">
            <label htmlFor="icon-type">Icon Type</label>
            <div className="icon-type-selector">
              <button
                type="button"
                className={`icon-type-button ${selectedIconType === 'terrain' ? 'active' : ''}`}
                onClick={() => handleIconTypeChange('terrain')}
              >
                Terrain
              </button>
              <button
                type="button"
                className={`icon-type-button ${selectedIconType === 'landmark' ? 'active' : ''}`}
                onClick={() => handleIconTypeChange('landmark')}
              >
                Landmark
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="icon-selection">Icon</label>
            <select
              id="icon-selection"
              value={selectedIconValue}
              onChange={(e) => setSelectedIconValue(e.target.value)}
              className="form-select"
            >
              {availableIcons.map((icon) => (
                <option key={icon.id} value={icon.type}>
                  {icon.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="hex-name">Name</label>
            <input
              id="hex-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this location"
              className={`form-input ${errors.name ? 'error' : ''}`}
              maxLength={50}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
            <span className="character-count">{name.length}/50</span>
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label htmlFor="hex-description">Description</label>
            <textarea
              id="hex-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what players see when they explore this hex"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              rows={3}
              maxLength={500}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
            <span className="character-count">{description.length}/500</span>
          </div>

          {/* GM Notes Field */}
          <div className="form-group">
            <label htmlFor="hex-gm-notes">GM Notes</label>
            <textarea
              id="hex-gm-notes"
              value={gmNotes}
              onChange={(e) => setGmNotes(e.target.value)}
              placeholder="Private notes for the GM (not visible to players)"
              className={`form-textarea ${errors.gmNotes ? 'error' : ''}`}
              rows={4}
              maxLength={1000}
            />
            {errors.gmNotes && <span className="error-message">{errors.gmNotes}</span>}
            <span className="character-count">{gmNotes.length}/1000</span>
          </div>
        </div>

        <div className="property-dialog-footer">
          <button 
            type="button" 
            className="button button-secondary"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="button button-primary"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};