/**
 * HexCell component - represents individual hexagon cells with state management
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { uiActions } from '../store/slices/uiSlice';
import { selectHexCell, selectSelectedHex, selectCurrentMode } from '../store/selectors';
import type { HexCoordinate, HexCell as HexCellData } from '../types';

interface HexCellProps {
  coordinate: HexCoordinate;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (coordinate: HexCoordinate | null) => void;
  onClick: (coordinate: HexCoordinate) => void;
}

export const HexCell: React.FC<HexCellProps> = ({
  coordinate,
  isHovered,
  isSelected,
  onHover,
  onClick
}) => {
  const dispatch = useAppDispatch();
  const hexCell = useAppSelector(selectHexCell(coordinate));
  const selectedHex = useAppSelector(selectSelectedHex);
  const currentMode = useAppSelector(selectCurrentMode);

  // Handle cell click
  const handleClick = useCallback(() => {
    onClick(coordinate);
    
    // If this hex has content and is clicked, open property dialog
    if (hexCell && (hexCell.terrain || hexCell.landmark)) {
      dispatch(uiActions.openPropertyDialog(coordinate));
    }
  }, [coordinate, hexCell, onClick, dispatch]);

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    onHover(coordinate);
  }, [coordinate, onHover]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  // Get cell state information
  const getCellState = useCallback((): {
    hasContent: boolean;
    isExplored: boolean;
    isVisible: boolean;
    displayName: string;
  } => {
    const hasContent = Boolean(hexCell?.terrain || hexCell?.landmark);
    const isExplored = hexCell?.isExplored || false;
    const isVisible = hexCell?.isVisible || currentMode === 'gm';
    const displayName = hexCell?.name || '';

    return {
      hasContent,
      isExplored,
      isVisible,
      displayName
    };
  }, [hexCell, currentMode]);

  // Get visual state for styling
  const getVisualState = useCallback(() => {
    const cellState = getCellState();
    
    return {
      ...cellState,
      isHovered,
      isSelected,
      shouldHighlight: isHovered || isSelected,
      opacity: cellState.isVisible ? 1 : 0.3
    };
  }, [getCellState, isHovered, isSelected]);

  // This component is primarily a logic container
  // The actual rendering is handled by the HexGrid canvas
  // This component manages the state and interactions for individual cells
  
  return null; // No visual rendering - handled by canvas
};

// Utility functions for hex cell logic
export const hexCellUtils = {
  /**
   * Check if a hex cell should be visible based on current mode and exploration state
   */
  shouldShowHex: (
    hexCell: HexCellData | null, 
    currentMode: 'gm' | 'player',
    revealMode: 'permanent' | 'lineOfSight'
  ): boolean => {
    if (currentMode === 'gm') return true;
    
    if (!hexCell) return false;
    
    if (revealMode === 'permanent') {
      return hexCell.isExplored;
    } else {
      return hexCell.isVisible;
    }
  },

  /**
   * Get the appropriate fill color for a hex based on its state
   */
  getHexFillColor: (
    hexCell: HexCellData | null,
    isHovered: boolean,
    isSelected: boolean,
    appearance: any,
    currentMode: 'gm' | 'player'
  ): string => {
    // Selection takes priority
    if (isSelected) return '#d4edda';
    
    // Hover state
    if (isHovered) return '#e6f3ff';
    
    // Content-based coloring - slightly different background for hexes with content
    if (hexCell?.terrain || hexCell?.landmark) {
      // Slightly darker background to make icons stand out
      return '#f8f9fa';
    }
    
    // Mode-based default
    if (currentMode === 'player' && !hexCell?.isExplored) {
      return appearance.unexploredColor;
    }
    
    return appearance.backgroundColor;
  },

  /**
   * Get the appropriate stroke color for a hex based on its state
   */
  getHexStrokeColor: (
    isHovered: boolean,
    isSelected: boolean,
    appearance: any,
    hasContent?: boolean
  ): string => {
    if (isSelected) return '#28a745';
    if (isHovered) return '#4a90e2';
    // Slightly darker border for hexes with content
    if (hasContent) return '#6c757d';
    return appearance.borderColor;
  },

  /**
   * Get the appropriate stroke width for a hex based on its state
   */
  getHexStrokeWidth: (
    isHovered: boolean,
    isSelected: boolean
  ): number => {
    if (isSelected) return 3;
    if (isHovered) return 2;
    return 1;
  }
};