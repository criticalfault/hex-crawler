/**
 * HexGrid component - renders the hexagonal grid using HTML5 Canvas
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { 
  selectMapDimensions, 
  selectGridAppearance, 
  selectMapCells,
  selectCurrentMode,
  selectZoom,
  selectPanOffset,
  selectSelectedHex,
  selectShowCoordinates
} from '../store/selectors';
import { uiActions, mapActions, useAppDispatch, useAppSelector } from '../store';
import { 
  hexToPixel, 
  pixelToHex
} from '../utils/hexCoordinates';
import { hexCellUtils } from './HexCell';
import type { HexCoordinate, PixelCoordinate, HexCell } from '../types/hex';
import type { DragData } from '../types/icons';
import { ALL_ICONS } from '../types/icons';

interface HexGridProps {
  className?: string;
}

export const HexGrid: React.FC<HexGridProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<PixelCoordinate | null>(null);
  const [hoveredHex, setHoveredHex] = useState<HexCoordinate | null>(null);
  const [dragOverHex, setDragOverHex] = useState<HexCoordinate | null>(null);
  const [iconCache, setIconCache] = useState<Map<string, HTMLImageElement>>(new Map());

  // Redux state
  const dispatch = useAppDispatch();
  const dimensions = useAppSelector(selectMapDimensions);
  const appearance = useAppSelector(selectGridAppearance);
  const mapCells = useAppSelector(selectMapCells);
  const currentMode = useAppSelector(selectCurrentMode);
  const zoom = useAppSelector(selectZoom);
  const panOffset = useAppSelector(selectPanOffset);
  const selectedHex = useAppSelector(selectSelectedHex);
  const showCoordinates = useAppSelector(selectShowCoordinates);

  // Handle canvas resize
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.floor(rect.width);
      const newHeight = Math.floor(rect.height);
      
      setCanvasSize({ width: newWidth, height: newHeight });
    }
  }, []);

  // Set up resize observer
  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Initial size
    handleResize();
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  // Preload icons
  useEffect(() => {
    const loadIcons = async () => {
      const cache = new Map<string, HTMLImageElement>();
      
      const loadPromises = ALL_ICONS.map((iconData) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            cache.set(iconData.type, img);
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load icon: ${iconData.type}`);
            resolve(); // Don't reject, just continue
          };
          img.src = iconData.svgPath;
        });
      });
      
      await Promise.all(loadPromises);
      setIconCache(cache);
    };
    
    loadIcons();
  }, []);

  // Draw a single hexagon
  const drawHexagon = useCallback((
    ctx: CanvasRenderingContext2D,
    center: PixelCoordinate,
    size: number,
    fillColor: string,
    strokeColor: string,
    strokeWidth: number = 1
  ) => {
    ctx.beginPath();
    
    // Calculate hexagon vertices (flat-top orientation)
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = center.x + size * Math.cos(angle);
      const y = center.y + size * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    
    // Fill
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    // Stroke
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }, []);

  // Convert screen coordinates to world coordinates (accounting for zoom and pan)
  const screenToWorld = useCallback((screenCoord: PixelCoordinate): PixelCoordinate => {
    return {
      x: (screenCoord.x - panOffset.x) / zoom,
      y: (screenCoord.y - panOffset.y) / zoom
    };
  }, [zoom, panOffset]);



  // Get hex coordinate from mouse position
  const getHexFromMouse = useCallback((event: React.MouseEvent<HTMLCanvasElement>): HexCoordinate | null => {
    if (!canvasRef.current) return null;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const screenCoord = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    // Convert to world coordinates
    const worldCoord = screenToWorld(screenCoord);
    
    // Offset to center of grid
    const offsetCoord = {
      x: worldCoord.x - canvasSize.width / 2,
      y: worldCoord.y - canvasSize.height / 2
    };
    
    return pixelToHex(offsetCoord, appearance.hexSize);
  }, [screenToWorld, canvasSize, appearance.hexSize]);

  // Check if hex coordinate is within grid bounds
  const isHexInBounds = useCallback((hex: HexCoordinate): boolean => {
    // Convert axial coordinates to offset coordinates for bounds checking
    const col = hex.q;
    const row = hex.r + Math.floor(hex.q / 2);
    
    return col >= 0 && col < dimensions.width && row >= 0 && row < dimensions.height;
  }, [dimensions]);

  // Generate all hex coordinates for the grid
  const generateGridHexes = useCallback((): HexCoordinate[] => {
    const hexes: HexCoordinate[] = [];
    
    for (let col = 0; col < dimensions.width; col++) {
      for (let row = 0; row < dimensions.height; row++) {
        // Convert offset coordinates to axial coordinates
        const q = col;
        const r = row - Math.floor(col / 2);
        hexes.push({ q, r });
      }
    }
    
    return hexes;
  }, [dimensions]);

  // Draw icon within a hex cell
  const drawHexIcon = useCallback((
    ctx: CanvasRenderingContext2D,
    center: PixelCoordinate,
    hexCell: HexCell,
    hexSize: number
  ) => {
    // Determine which icon to draw
    const iconType = hexCell.terrain || hexCell.landmark;
    if (!iconType) return;

    // Get preloaded icon from cache
    const img = iconCache.get(iconType);
    if (!img) return;

    // Calculate icon size (about 60% of hex size)
    const iconSize = hexSize * 0.6;
    
    // Draw the icon centered in the hex
    ctx.drawImage(
      img,
      center.x - iconSize / 2,
      center.y - iconSize / 2,
      iconSize,
      iconSize
    );
  }, [iconCache]);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Save context for transformations
    ctx.save();
    
    // Apply zoom and pan transformations
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);
    
    // Center the grid
    ctx.translate(canvasSize.width / 2, canvasSize.height / 2);
    
    // Generate and render all hexes
    const gridHexes = generateGridHexes();
    
    gridHexes.forEach(hex => {
      if (!isHexInBounds(hex)) return;
      
      // Get pixel position for this hex
      const pixelPos = hexToPixel(hex, appearance.hexSize);
      
      // Check if hex has content
      const hexKey = `${hex.q},${hex.r}`;
      const hexCell = mapCells.get(hexKey);

      // Check for hover, selection, and drag over states
      const isHovered = hoveredHex && hoveredHex.q === hex.q && hoveredHex.r === hex.r;
      const isSelected = selectedHex && selectedHex.q === hex.q && selectedHex.r === hex.r;
      const isDragOver = dragOverHex && dragOverHex.q === hex.q && dragOverHex.r === hex.r;

      // Use utility functions to determine appearance
      const fillColor = hexCellUtils.getHexFillColor(
        hexCell || null,
        isHovered || isDragOver,
        isSelected,
        appearance,
        currentMode
      );
      
      const hasContent = Boolean(hexCell?.terrain || hexCell?.landmark);
      const strokeColor = hexCellUtils.getHexStrokeColor(
        isHovered || isDragOver,
        isSelected,
        appearance,
        hasContent
      );
      
      const strokeWidth = hexCellUtils.getHexStrokeWidth(
        isHovered || isDragOver,
        isSelected
      );
      
      // Special styling for drag over state
      const actualFillColor = isDragOver ? 'rgba(0, 123, 255, 0.3)' : fillColor;
      const actualStrokeColor = isDragOver ? '#007bff' : strokeColor;
      const actualStrokeWidth = isDragOver ? 3 : strokeWidth;
      
      // Draw the hexagon
      drawHexagon(
        ctx,
        pixelPos,
        appearance.hexSize,
        actualFillColor,
        actualStrokeColor,
        actualStrokeWidth
      );
      
      // Draw icon if hex has content
      if (hexCell && (hexCell.terrain || hexCell.landmark)) {
        drawHexIcon(ctx, pixelPos, hexCell, appearance.hexSize);
      }
      
      // Draw hex coordinates if enabled or in debug mode
      const isDevelopment = import.meta.env?.DEV || false;
      if (showCoordinates || isDevelopment) {
        ctx.fillStyle = '#666';
        ctx.font = `${Math.max(8, appearance.textSize * 0.7)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${hex.q},${hex.r}`, pixelPos.x, pixelPos.y + appearance.hexSize * 0.3);
      }
    });
    
    // Restore context
    ctx.restore();
  }, [
    canvasSize, 
    panOffset, 
    zoom, 
    generateGridHexes, 
    isHexInBounds, 
    appearance, 
    currentMode, 
    mapCells, 
    drawHexagon,
    drawHexIcon,
    hoveredHex,
    selectedHex,
    showCoordinates,
    dragOverHex
  ]);

  // Render when dependencies change
  useEffect(() => {
    render();
  }, [render]);

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 0) { // Left click
      const hex = getHexFromMouse(event);
      if (hex && isHexInBounds(hex)) {
        // Handle hex selection
        dispatch(uiActions.selectHex(hex));
      }
    } else if (event.button === 1 || event.button === 2) { // Middle or right click for panning
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
      event.preventDefault();
    }
  }, [getHexFromMouse, isHexInBounds, dispatch]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && lastPanPoint) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      
      dispatch(uiActions.setPanOffset({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY
      }));
      
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    } else {
      // Update hover state when not panning
      const hex = getHexFromMouse(event);
      if (hex && isHexInBounds(hex)) {
        // Only update if the hovered hex has changed
        if (!hoveredHex || hoveredHex.q !== hex.q || hoveredHex.r !== hex.r) {
          setHoveredHex(hex);
        }
      } else {
        // Clear hover state if mouse is outside grid
        if (hoveredHex) {
          setHoveredHex(null);
        }
      }
    }
  }, [isPanning, lastPanPoint, panOffset, dispatch, getHexFromMouse, isHexInBounds, hoveredHex]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setLastPanPoint(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    setLastPanPoint(null);
    setHoveredHex(null);
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3.0, zoom * zoomFactor));
    
    dispatch(uiActions.setZoom(newZoom));
  }, [zoom, dispatch]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      setIsPanning(true);
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    }
    event.preventDefault();
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    if (isPanning && lastPanPoint && event.touches.length === 1) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastPanPoint.x;
      const deltaY = touch.clientY - lastPanPoint.y;
      
      dispatch(uiActions.setPanOffset({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY
      }));
      
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    }
    event.preventDefault();
  }, [isPanning, lastPanPoint, panOffset, dispatch]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    setLastPanPoint(null);
  }, []);

  // Drag and drop event handlers
  const handleDragOver = useCallback((event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    
    // Get hex coordinate from drag position
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const screenCoord = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    const worldCoord = screenToWorld(screenCoord);
    const offsetCoord = {
      x: worldCoord.x - canvasSize.width / 2,
      y: worldCoord.y - canvasSize.height / 2
    };
    
    const hex = pixelToHex(offsetCoord, appearance.hexSize);
    
    if (hex && isHexInBounds(hex)) {
      // Only update if the drag over hex has changed
      if (!dragOverHex || dragOverHex.q !== hex.q || dragOverHex.r !== hex.r) {
        setDragOverHex(hex);
      }
    } else {
      if (dragOverHex) {
        setDragOverHex(null);
      }
    }
  }, [screenToWorld, canvasSize, appearance.hexSize, isHexInBounds, dragOverHex]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLCanvasElement>) => {
    // Only clear drag over state if we're actually leaving the canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      setDragOverHex(null);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setDragOverHex(null);
    
    try {
      const dragDataStr = event.dataTransfer.getData('application/json');
      if (!dragDataStr) return;
      
      const dragData: DragData = JSON.parse(dragDataStr);
      
      // Get hex coordinate from drop position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const screenCoord = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      const worldCoord = screenToWorld(screenCoord);
      const offsetCoord = {
        x: worldCoord.x - canvasSize.width / 2,
        y: worldCoord.y - canvasSize.height / 2
      };
      
      const hex = pixelToHex(offsetCoord, appearance.hexSize);
      
      if (hex && isHexInBounds(hex)) {
        // Place the icon on the hex
        const iconPlacement: {
          coordinate: HexCoordinate;
          terrain?: string;
          landmark?: string;
        } = {
          coordinate: hex
        };
        
        if (dragData.category === 'terrain') {
          iconPlacement.terrain = dragData.type;
        } else {
          iconPlacement.landmark = dragData.type;
        }
        
        dispatch(mapActions.placeIcon(iconPlacement));
        
        // Select the hex that received the icon
        dispatch(uiActions.selectHex(hex));
        
        // Open property dialog for the newly placed icon
        dispatch(uiActions.openPropertyDialog(hex));
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [screenToWorld, canvasSize, appearance.hexSize, isHexInBounds, dispatch]);

  return (
    <div 
      ref={containerRef}
      className={`hex-grid-container ${className || ''}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : 'grab'
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};