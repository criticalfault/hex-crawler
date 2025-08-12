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
    // Selection takes priority over all other states
    if (isSelected) return '#d4edda';
    
    // Hover state takes priority over content/exploration states
    if (isHovered) return '#e6f3ff';
    
    // Get base color - terrain color if terrain exists, otherwise background
    const getBaseColor = (): string => {
      if (hexCell?.terrain && appearance.terrainColors) {
        return appearance.terrainColors[hexCell.terrain] || appearance.backgroundColor;
      }
      return appearance.backgroundColor;
    };
    
    // In player mode, handle exploration states
    if (currentMode === 'player') {
      // Unexplored hexes get the unexplored color
      if (!hexCell?.isExplored) {
        return appearance.unexploredColor;
      }
      
      const baseColor = getBaseColor();
      
      // Explored hexes that are currently visible get terrain color or normal background
      if (hexCell.isVisible) {
        return baseColor;
      }
      
      // Explored hexes that are not currently visible (for line-of-sight mode)
      // get the sight color to distinguish from unexplored
      return appearance.sightColor;
    }
    
    // In GM mode, use terrain color if available, otherwise background color
    return getBaseColor();
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
    isSelected: boolean,
    baseBorderWidth: number = 1
  ): number => {
    if (isSelected) return Math.max(3, baseBorderWidth * 2);
    if (isHovered) return Math.max(2, baseBorderWidth * 1.5);
    return baseBorderWidth;
  }
};