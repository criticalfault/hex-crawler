/**
 * HexGrid component - renders the hexagonal grid using HTML5 Canvas
 */

import { useRef, useEffect, useCallback, useState } from "react";
import {
  selectMapDimensions,
  selectGridAppearance,
  selectMapCells,
  selectCurrentMode,
  selectZoom,
  selectPanOffset,
  selectSelectedHex,
  selectShowCoordinates,
  selectHexVisibility,
  selectIsGMMode,
  selectIsPlayerMode,
  selectPlayerPositions,
  selectSightDistance,
  selectIsProjectionMode,
  selectProjectionSettings,
  selectQuickTerrainMode,
  selectSelectedQuickTerrain,
  selectBrushMode,
  selectBrushSize,
  selectBrushShape,
  selectBrushPreviewHexes,
  selectFloodFillMode,
  selectFloodFillPreviewHexes,
  selectFloodFillTargetTerrain,
  selectFloodFillTargetLandmark,
  selectSelectionMode,
  selectSelectionStart,
  selectSelectionEnd,
  selectSelectedRegion,
  selectPastePreviewHexes,
} from "../store/selectors";
import {
  uiActions,
  mapActions,
  explorationActions,
  useAppDispatch,
  useAppSelector,
  store,
} from "../store";
import {
  hexToPixel,
  pixelToHex,
  hexesInRange,
  hexEquals,
} from "../utils/hexCoordinates";
import { getBrushHexes } from "../utils/brushUtils";
import { floodFillHexes, getFloodFillPreview } from "../utils/floodFillUtils";
import { getHexesInRectangularSelection } from "../utils/copyPasteUtils";
import { hexCellUtils } from "./HexCell";
import type { HexCoordinate, PixelCoordinate, HexCell } from "../types/hex";
import type { DragData } from "../types/icons";
import { ALL_ICONS } from "../types/icons";

interface HexGridProps {
  className?: string;
}

export const HexGrid: React.FC<HexGridProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<PixelCoordinate | null>(
    null
  );
  const [hoveredHex, setHoveredHex] = useState<HexCoordinate | null>(null);
  const [dragOverHex, setDragOverHex] = useState<HexCoordinate | null>(null);
  const [iconCache, setIconCache] = useState<Map<string, HTMLImageElement>>(
    new Map()
  );

  // Redux state
  const dispatch = useAppDispatch();
  const dimensions = useAppSelector(selectMapDimensions);
  const appearance = useAppSelector(selectGridAppearance);
  const mapCells = useAppSelector(selectMapCells);
  const currentMode = useAppSelector(selectCurrentMode);
  const isGMMode = useAppSelector(selectIsGMMode);
  const isPlayerMode = useAppSelector(selectIsPlayerMode);
  const zoom = useAppSelector(selectZoom);
  const panOffset = useAppSelector(selectPanOffset);
  const selectedHex = useAppSelector(selectSelectedHex);
  const showCoordinates = useAppSelector(selectShowCoordinates);
  const playerPositions = useAppSelector(selectPlayerPositions);
  const sightDistance = useAppSelector(selectSightDistance);
  const isProjectionMode = useAppSelector(selectIsProjectionMode);
  const projectionSettings = useAppSelector(selectProjectionSettings);
  const quickTerrainMode = useAppSelector(selectQuickTerrainMode);
  const selectedQuickTerrain = useAppSelector(selectSelectedQuickTerrain);
  const brushMode = useAppSelector(selectBrushMode);
  const brushSize = useAppSelector(selectBrushSize);
  const brushShape = useAppSelector(selectBrushShape);
  const brushPreviewHexes = useAppSelector(selectBrushPreviewHexes);
  const floodFillMode = useAppSelector(selectFloodFillMode);
  const floodFillPreviewHexes = useAppSelector(selectFloodFillPreviewHexes);
  const floodFillTargetTerrain = useAppSelector(selectFloodFillTargetTerrain);
  const floodFillTargetLandmark = useAppSelector(selectFloodFillTargetLandmark);
  const selectionMode = useAppSelector(selectSelectionMode);
  const selectionStart = useAppSelector(selectSelectionStart);
  const selectionEnd = useAppSelector(selectSelectionEnd);
  const selectedRegion = useAppSelector(selectSelectedRegion);
  const pastePreviewHexes = useAppSelector(selectPastePreviewHexes);

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
  const drawHexagon = useCallback(
    (
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
        // For flat-top hexagons, start at 30 degrees (π/6) and go clockwise
        const angle = Math.PI / 6 + (Math.PI / 3) * i;
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
    },
    []
  );

  // Convert screen coordinates to world coordinates (accounting for zoom and pan)
  const screenToWorld = useCallback(
    (screenCoord: PixelCoordinate): PixelCoordinate => {
      return {
        x: (screenCoord.x - panOffset.x) / zoom,
        y: (screenCoord.y - panOffset.y) / zoom,
      };
    },
    [zoom, panOffset]
  );

  // Get hex coordinate from mouse position
  const getHexFromMouse = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): HexCoordinate | null => {
      if (!canvasRef.current) return null;

      const rect = canvasRef.current.getBoundingClientRect();
      const screenCoord = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      // Convert to world coordinates
      const worldCoord = screenToWorld(screenCoord);

      // Offset to center of grid
      const offsetCoord = {
        x: worldCoord.x - canvasSize.width / 2,
        y: worldCoord.y - canvasSize.height / 2,
      };

      return pixelToHex(offsetCoord, appearance.hexSize);
    },
    [screenToWorld, canvasSize, appearance.hexSize]
  );

  // Check if hex coordinate is within grid bounds
  const isHexInBounds = useCallback(
    (hex: HexCoordinate): boolean => {
      // Convert back to row/col for bounds checking
      // Since we generate with q = col - Math.floor(row / 2) and r = row
      const row = hex.r;
      const col = hex.q + Math.floor(row / 2);

      return (
        row >= 0 &&
        row < dimensions.height &&
        col >= 0 &&
        col < dimensions.width
      );
    },
    [dimensions]
  );

  // Generate all hex coordinates for the grid
  const generateGridHexes = useCallback((): HexCoordinate[] => {
    const hexes: HexCoordinate[] = [];

    // Create a more rectangular pattern by adjusting the coordinate generation
    // This creates a "brick-like" pattern that fills the canvas better
    for (let row = 0; row < dimensions.height; row++) {
      for (let col = 0; col < dimensions.width; col++) {
        // Use axial coordinates directly for a more rectangular pattern
        // Offset every other row by half a hex width to create proper tessellation
        const q = col - Math.floor(row / 2);
        const r = row;
        hexes.push({ q, r });
      }
    }

    return hexes;
  }, [dimensions]);

  // Draw icon within a hex cell
  const drawHexIcon = useCallback(
    (
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
    },
    [iconCache]
  );

  // Draw player token on a hex
  const drawPlayerToken = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      center: PixelCoordinate,
      playerIndex: number,
      hexSize: number
    ) => {
      const tokenSize = hexSize * 0.4;
      const colors = [
        "#ff4444",
        "#44ff44",
        "#4444ff",
        "#ffff44",
        "#ff44ff",
        "#44ffff",
      ];
      const color = colors[playerIndex % colors.length];

      // Draw player token circle
      ctx.beginPath();
      ctx.arc(center.x, center.y, tokenSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw player number
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(10, tokenSize * 0.6)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((playerIndex + 1).toString(), center.x, center.y);
    },
    []
  );

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
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

    gridHexes.forEach((hex) => {
      if (!isHexInBounds(hex)) return;

      // Get pixel position for this hex
      const basePixelPos = hexToPixel(hex, appearance.hexSize);

      // Use the calculated pixel position directly
      const pixelPos = basePixelPos;

      // Check if hex has content
      const hexKey = `${hex.q},${hex.r}`;
      const hexCell = mapCells.get(hexKey);

      // Check hex visibility based on current mode
      const visibility = selectHexVisibility(hex)(store.getState());

      // In player mode, don't render hexes that shouldn't be shown
      if (isPlayerMode && !visibility.shouldShow) {
        // Draw unexplored hex (darker/grayed out)
        drawHexagon(
          ctx,
          pixelPos,
          appearance.hexSize,
          appearance.unexploredColor,
          "#999999",
          appearance.borderWidth
        );
        return;
      }

      // Check for hover, selection, drag over, and preview states
      const isHovered =
        hoveredHex && hoveredHex.q === hex.q && hoveredHex.r === hex.r;
      const isSelected =
        selectedHex && selectedHex.q === hex.q && selectedHex.r === hex.r;
      const isDragOver =
        dragOverHex && dragOverHex.q === hex.q && dragOverHex.r === hex.r;

      // Check for preview states
      const isBrushPreview = brushPreviewHexes.some(previewHex => 
        previewHex && previewHex.q === hex.q && previewHex.r === hex.r
      );
      const isFloodFillPreview = floodFillPreviewHexes.some(previewHex => 
        previewHex && previewHex.q === hex.q && previewHex.r === hex.r
      );
      const isPastePreview = pastePreviewHexes.some(previewHex => 
        previewHex && previewHex.q === hex.q && previewHex.r === hex.r
      );
      const isInSelectedRegion = selectedRegion && selectedRegion.some(regionHex => 
        regionHex && regionHex.q === hex.q && regionHex.r === hex.r
      );

      // Use utility functions to determine appearance
      const isPreview = isBrushPreview || isFloodFillPreview || isPastePreview;
      const fillColor = hexCellUtils.getHexFillColor(
        hexCell || null,
        isHovered || isDragOver || isPreview,
        isSelected,
        appearance,
        currentMode
      );

      const hasContent = Boolean(hexCell?.terrain || hexCell?.landmark);
      const strokeColor = hexCellUtils.getHexStrokeColor(
        isHovered || isDragOver || isPreview,
        isSelected,
        appearance,
        hasContent
      );

      const strokeWidth = hexCellUtils.getHexStrokeWidth(
        isHovered || isDragOver || isBrushPreview,
        isSelected,
        appearance.borderWidth
      );

      // Special styling for different states
      let actualFillColor = fillColor;
      let actualStrokeColor = strokeColor;
      let actualStrokeWidth = strokeWidth;

      if (isDragOver) {
        actualFillColor = "rgba(0, 123, 255, 0.3)";
        actualStrokeColor = "#007bff";
        actualStrokeWidth = 3;
      } else if (isBrushPreview && brushMode && isGMMode) {
        // Brush preview styling
        actualFillColor = "rgba(40, 167, 69, 0.2)";
        actualStrokeColor = "#28a745";
        actualStrokeWidth = 2;
      } else if (isInSelectedRegion && selectionMode && isGMMode) {
        // Selection region styling
        actualFillColor = "rgba(255, 193, 7, 0.3)";
        actualStrokeColor = "#ffc107";
        actualStrokeWidth = 2;
      } else if (isPastePreview && isGMMode) {
        // Paste preview styling
        actualFillColor = "rgba(23, 162, 184, 0.2)";
        actualStrokeColor = "#17a2b8";
        actualStrokeWidth = 2;
      }

      // In player mode, add visual indication for exploration state
      let finalFillColor = actualFillColor;
      if (isPlayerMode) {
        if (visibility.isExplored && !visibility.isCurrentlyVisible) {
          // Previously explored but not currently visible (for line-of-sight mode)
          finalFillColor = `${actualFillColor}88`; // Add transparency
        } else if (visibility.isCurrentlyVisible) {
          // Currently visible - use normal colors
          finalFillColor = actualFillColor;
        }
      }

      // Draw the hexagon
      drawHexagon(
        ctx,
        pixelPos,
        appearance.hexSize,
        finalFillColor,
        actualStrokeColor,
        actualStrokeWidth
      );

      // Draw icon if hex has content and is visible
      if (
        hexCell &&
        (hexCell.terrain || hexCell.landmark) &&
        visibility.shouldShow
      ) {
        // In player mode, make icons slightly transparent if not currently visible
        if (
          isPlayerMode &&
          visibility.isExplored &&
          !visibility.isCurrentlyVisible
        ) {
          ctx.globalAlpha = 0.6;
        }

        drawHexIcon(ctx, pixelPos, hexCell, appearance.hexSize);

        // Reset alpha
        ctx.globalAlpha = 1.0;
      }

      // Draw player tokens if any players are on this hex
      playerPositions.forEach((playerPos, index) => {
        if (hexEquals(playerPos, hex)) {
          drawPlayerToken(ctx, pixelPos, index, appearance.hexSize);
        }
      });

      // Draw hex coordinates if enabled or in debug mode (only in GM mode or if explicitly enabled)
      const isDevelopment = import.meta.env?.DEV || false;
      if ((showCoordinates || isDevelopment) && (isGMMode || showCoordinates)) {
        ctx.fillStyle = isPlayerMode ? "#999" : "#666";
        ctx.font = `${Math.max(8, appearance.textSize * 0.7)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `${hex.q},${hex.r}`,
          pixelPos.x,
          pixelPos.y + appearance.hexSize * 0.3
        );
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
    isGMMode,
    isPlayerMode,
    mapCells,
    drawHexagon,
    drawHexIcon,
    drawPlayerToken,
    hoveredHex,
    selectedHex,
    showCoordinates,
    dragOverHex,
    playerPositions,
    brushPreviewHexes,
    floodFillPreviewHexes,
    brushMode,
    floodFillMode,
    selectionMode,
    selectedRegion,
    pastePreviewHexes,
  ]);

  // Render when dependencies change
  useEffect(() => {
    render();
  }, [render]);

  // Update player visibility when positions change
  const updatePlayerVisibility = useCallback(
    (positions: HexCoordinate[], distance: number) => {
      if (positions.length === 0) {
        dispatch(explorationActions.clearVisibleHexes());
        return;
      }

      // Calculate all hexes within sight distance of any player
      const visibleHexes = new Set<string>();
      const exploredHexes = new Set<string>();

      positions.forEach((playerPos) => {
        const hexesInSight = hexesInRange(playerPos, distance);
        hexesInSight.forEach((hex) => {
          const key = `${hex.q},${hex.r}`;
          visibleHexes.add(key);
          exploredHexes.add(key);
        });
      });

      // Update visible hexes for current sight
      dispatch(
        explorationActions.setVisibleHexes(
          Array.from(visibleHexes).map((key) => {
            const [q, r] = key.split(",").map(Number);
            return { q, r };
          })
        )
      );

      // Mark hexes as explored
      dispatch(
        explorationActions.exploreHexes(
          Array.from(exploredHexes).map((key) => {
            const [q, r] = key.split(",").map(Number);
            return { q, r };
          })
        )
      );
    },
    [dispatch]
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (event.button === 0) {
        // Left click
        const hex = getHexFromMouse(event);
        if (hex && isHexInBounds(hex)) {
          if (isPlayerMode) {
            // In player mode, handle player movement
            const existingPlayerIndex = playerPositions.findIndex((pos) =>
              hexEquals(pos, hex)
            );

            if (existingPlayerIndex >= 0) {
              // If clicking on an existing player, remove it
              dispatch(mapActions.removePlayerPosition(existingPlayerIndex));
              const remainingPositions = playerPositions.filter(
                (_, i) => i !== existingPlayerIndex
              );
              updatePlayerVisibility(remainingPositions, sightDistance);
            } else {
              // If clicking on an empty hex, add a new player or move the first player
              if (playerPositions.length === 0) {
                // Add first player
                dispatch(mapActions.addPlayerPosition(hex));
                updatePlayerVisibility([hex], sightDistance);
              } else {
                // Move the first player (or add a new one if shift is held)
                if (event.shiftKey) {
                  // Add new player when shift is held
                  dispatch(mapActions.addPlayerPosition(hex));
                  const newPositions = [...playerPositions, hex];
                  updatePlayerVisibility(newPositions, sightDistance);
                } else {
                  // Move the first player
                  const newPositions = [hex, ...playerPositions.slice(1)];
                  dispatch(mapActions.updatePlayerPositions(newPositions));
                  updatePlayerVisibility(newPositions, sightDistance);
                }
              }
            }
          } else {
            // In GM mode, handle hex selection and editing
            if (selectionMode) {
              // Selection mode - handle rectangular selection
              if (!selectionStart) {
                // Start new selection
                dispatch(uiActions.startSelection(hex));
              } else {
                // Complete selection
                const selectedHexes = getHexesInRectangularSelection(selectionStart, hex);
                const validHexes = selectedHexes.filter(isHexInBounds);
                dispatch(uiActions.setSelectedRegion(validHexes));
                dispatch(uiActions.updateSelection(hex));
              }
            } else if (quickTerrainMode) {
              // Quick terrain placement mode
              const hexKey = `${hex.q},${hex.r}`;
              const hexCell = mapCells.get(hexKey);

              if (!selectedQuickTerrain && hexCell?.terrain) {
                // No terrain selected but clicked hex has terrain - select that terrain type
                dispatch(uiActions.setSelectedQuickTerrain(hexCell.terrain));
                dispatch(uiActions.selectHex(hex));
              } else if (selectedQuickTerrain) {
                // Terrain is selected - paint the clicked hex with that terrain
                if (floodFillMode) {
                  // Flood fill mode - fill connected areas
                  const preview = getFloodFillPreview(
                    hex,
                    mapCells,
                    floodFillTargetTerrain as any,
                    floodFillTargetLandmark as any
                  );
                  const validFloodFillHexes =
                    preview.hexes.filter(isHexInBounds);

                  if (validFloodFillHexes.length > 0) {
                    // Set preview hexes for user confirmation
                    dispatch(
                      uiActions.setFloodFillPreviewHexes(validFloodFillHexes)
                    );
                    dispatch(
                      uiActions.setFloodFillTarget({
                        terrain: selectedQuickTerrain,
                        landmark: undefined,
                      })
                    );
                  }

                  dispatch(uiActions.selectHex(hex));
                } else if (brushMode) {
                  // Brush mode - paint all hexes in brush pattern
                  const brushHexes = getBrushHexes(hex, brushSize, brushShape);
                  const validBrushHexes = brushHexes.filter(isHexInBounds);

                  // Paint all hexes in the brush pattern
                  validBrushHexes.forEach((brushHex) => {
                    dispatch(
                      mapActions.placeIcon({
                        coordinate: brushHex,
                        terrain: selectedQuickTerrain,
                      })
                    );
                  });

                  dispatch(uiActions.selectHex(hex));
                } else {
                  // Single hex mode
                  if (
                    hexCell?.terrain &&
                    hexCell.terrain !== selectedQuickTerrain
                  ) {
                    // Clicked on different terrain - switch to that terrain type
                    dispatch(
                      uiActions.setSelectedQuickTerrain(hexCell.terrain)
                    );
                    dispatch(uiActions.selectHex(hex));
                  } else {
                    // Paint the hex with selected terrain
                    dispatch(
                      mapActions.placeIcon({
                        coordinate: hex,
                        terrain: selectedQuickTerrain,
                      })
                    );
                    dispatch(uiActions.selectHex(hex));
                  }
                }
              } else {
                // No terrain selected and no terrain on clicked hex - do nothing or show message
                dispatch(uiActions.selectHex(hex));
              }
            } else {
              // Normal GM mode - select hex and potentially open dialog
              dispatch(uiActions.selectHex(hex));

              // Check if this hex has content and open property dialog
              const hexKey = `${hex.q},${hex.r}`;
              const hexCell = mapCells.get(hexKey);

              if (hexCell && (hexCell.terrain || hexCell.landmark)) {
                // For terrain-only hexes, only open dialog if they have additional content (name, description, etc.)
                // For landmarks or hexes with additional content, always open dialog
                const hasAdditionalContent =
                  hexCell.name || hexCell.description || hexCell.gmNotes;
                const hasLandmark = Boolean(hexCell.landmark);

                if (hasLandmark || hasAdditionalContent) {
                  dispatch(uiActions.openPropertyDialog(hex));
                }
              }
            }
          }
        }
      } else if (event.button === 1 || event.button === 2) {
        // Middle or right click for panning
        setIsPanning(true);
        setLastPanPoint({ x: event.clientX, y: event.clientY });
        event.preventDefault();
      }
    },
    [
      getHexFromMouse,
      isHexInBounds,
      dispatch,
      isPlayerMode,
      playerPositions,
      sightDistance,
      updatePlayerVisibility,
      quickTerrainMode,
      selectedQuickTerrain,
      mapCells,
    ]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanning && lastPanPoint) {
        const deltaX = event.clientX - lastPanPoint.x;
        const deltaY = event.clientY - lastPanPoint.y;

        dispatch(
          uiActions.setPanOffset({
            x: panOffset.x + deltaX,
            y: panOffset.y + deltaY,
          })
        );

        setLastPanPoint({ x: event.clientX, y: event.clientY });
      } else {
        // Update hover state when not panning
        const hex = getHexFromMouse(event);
        if (hex && isHexInBounds(hex)) {
          // Only update if the hovered hex has changed
          if (!hoveredHex || hoveredHex.q !== hex.q || hoveredHex.r !== hex.r) {
            setHoveredHex(hex);

            // Update brush preview if in brush mode
            if (
              isGMMode &&
              brushMode &&
              quickTerrainMode &&
              selectedQuickTerrain
            ) {
              const brushHexes = getBrushHexes(hex, brushSize, brushShape);
              // Filter to only include hexes within bounds
              const validBrushHexes = brushHexes.filter(isHexInBounds);
              dispatch(uiActions.setBrushPreviewHexes(validBrushHexes));
            }

            // Update selection preview if in selection mode
            if (isGMMode && selectionMode && selectionStart) {
              const selectedHexes = getHexesInRectangularSelection(selectionStart, hex);
              const validHexes = selectedHexes.filter(isHexInBounds);
              dispatch(uiActions.setSelectedRegion(validHexes));
            }

            // Update paste preview if clipboard has content and not in other modes
            if (isGMMode && !selectionMode && !brushMode && !floodFillMode && !quickTerrainMode) {
              // Import paste preview action dynamically
              import('../utils/copyPasteActions').then(({ updatePastePreview }) => {
                updatePastePreview(dispatch, hex);
              });
            }
          }
        } else {
          // Clear hover state if mouse is outside grid
          if (hoveredHex) {
            setHoveredHex(null);
          }
          // Clear brush preview when outside grid
          if (brushMode && brushPreviewHexes.length > 0) {
            dispatch(uiActions.clearBrushPreview());
          }
          // Clear paste preview when outside grid
          if (pastePreviewHexes.length > 0) {
            dispatch(uiActions.clearPastePreview());
          }
        }
      }
    },
    [
      isPanning,
      lastPanPoint,
      panOffset,
      dispatch,
      getHexFromMouse,
      isHexInBounds,
      hoveredHex,
      isGMMode,
      brushMode,
      quickTerrainMode,
      selectedQuickTerrain,
      brushSize,
      brushShape,
      brushPreviewHexes.length,
      selectionMode,
      selectionStart,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setLastPanPoint(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    setLastPanPoint(null);
    setHoveredHex(null);
    // Clear brush preview when leaving the canvas
    if (brushMode && brushPreviewHexes.length > 0) {
      dispatch(uiActions.clearBrushPreview());
    }
    // Clear flood fill preview when leaving the canvas
    if (floodFillMode && floodFillPreviewHexes.length > 0) {
      dispatch(uiActions.clearFloodFillPreview());
    }
    // Clear paste preview when leaving the canvas
    if (pastePreviewHexes.length > 0) {
      dispatch(uiActions.clearPastePreview());
    }
  }, [
    brushMode,
    brushPreviewHexes.length,
    floodFillMode,
    floodFillPreviewHexes.length,
    pastePreviewHexes.length,
    dispatch,
  ]);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLCanvasElement>) => {
      event.preventDefault();

      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(3.0, zoom * zoomFactor));

      dispatch(uiActions.setZoom(newZoom));
    },
    [zoom, dispatch]
  );

  // Enhanced touch event handlers with gesture support
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchStartPoint, setTouchStartPoint] = useState<PixelCoordinate | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null);
  const [pinchStartZoom, setPinchStartZoom] = useState<number>(1);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const getTouchCenter = useCallback((touches: TouchList): PixelCoordinate => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    
    let x = 0, y = 0;
    for (let i = 0; i < touches.length; i++) {
      x += touches[i].clientX;
      y += touches[i].clientY;
    }
    return { x: x / touches.length, y: y / touches.length };
  }, []);

  const getTouchDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getHexFromTouch = useCallback(
    (touch: Touch): HexCoordinate | null => {
      if (!canvasRef.current) return null;

      const rect = canvasRef.current.getBoundingClientRect();
      const screenCoord = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };

      const worldCoord = screenToWorld(screenCoord);
      const offsetCoord = {
        x: worldCoord.x - canvasSize.width / 2,
        y: worldCoord.y - canvasSize.height / 2,
      };

      return pixelToHex(offsetCoord, appearance.hexSize);
    },
    [screenToWorld, canvasSize, appearance.hexSize]
  );

  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      const touches = event.touches;
      const currentTime = Date.now();
      
      if (touches.length === 1) {
        // Single touch - potential tap, long press, or pan
        const touch = touches[0];
        const touchPoint = { x: touch.clientX, y: touch.clientY };
        
        setTouchStartTime(currentTime);
        setTouchStartPoint(touchPoint);
        setIsPanning(false);
        setLastPanPoint(touchPoint);

        // Set up long press detection
        const timer = setTimeout(() => {
          const hex = getHexFromTouch(touch);
          if (hex && isHexInBounds(hex)) {
            triggerHapticFeedback('heavy');
            
            if (isGMMode) {
              // Long press in GM mode - open property dialog or context menu
              const hexKey = `${hex.q},${hex.r}`;
              const hexCell = mapCells.get(hexKey);
              
              if (hexCell && (hexCell.terrain || hexCell.landmark)) {
                dispatch(uiActions.openPropertyDialog(hex));
              } else {
                // Could show context menu for empty hex
                dispatch(uiActions.selectHex(hex));
              }
            } else {
              // Long press in player mode - show hex info if explored
              const visibility = selectHexVisibility(hex)(store.getState());
              if (visibility.shouldShow) {
                dispatch(uiActions.selectHex(hex));
              }
            }
          }
          clearLongPressTimer();
        }, 500); // 500ms for long press
        
        setLongPressTimer(timer);
        
      } else if (touches.length === 2) {
        // Two touches - pinch to zoom
        clearLongPressTimer();
        setIsPanning(false);
        
        const distance = getTouchDistance(touches);
        const center = getTouchCenter(touches);
        
        setPinchStartDistance(distance);
        setPinchStartZoom(zoom);
        setLastPanPoint(center);
      }

      event.preventDefault();
    },
    [
      getHexFromTouch, 
      isHexInBounds, 
      triggerHapticFeedback, 
      isGMMode, 
      mapCells, 
      dispatch, 
      clearLongPressTimer,
      getTouchDistance,
      getTouchCenter,
      zoom
    ]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      const touches = event.touches;
      
      if (touches.length === 1 && lastPanPoint) {
        // Single touch movement - panning
        const touch = touches[0];
        const currentPoint = { x: touch.clientX, y: touch.clientY };
        
        // Check if we've moved enough to start panning
        if (touchStartPoint) {
          const dx = currentPoint.x - touchStartPoint.x;
          const dy = currentPoint.y - touchStartPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 10) { // 10px threshold to start panning
            clearLongPressTimer();
            
            if (!isPanning) {
              setIsPanning(true);
              triggerHapticFeedback('light');
            }
          }
        }
        
        if (isPanning) {
          const deltaX = currentPoint.x - lastPanPoint.x;
          const deltaY = currentPoint.y - lastPanPoint.y;

          dispatch(
            uiActions.setPanOffset({
              x: panOffset.x + deltaX,
              y: panOffset.y + deltaY,
            })
          );
        }
        
        setLastPanPoint(currentPoint);
        
      } else if (touches.length === 2 && pinchStartDistance && lastPanPoint) {
        // Two touch movement - pinch zoom and pan
        const currentDistance = getTouchDistance(touches);
        const currentCenter = getTouchCenter(touches);
        
        // Handle zoom
        const scale = currentDistance / pinchStartDistance;
        const newZoom = Math.max(0.1, Math.min(3.0, pinchStartZoom * scale));
        
        if (Math.abs(newZoom - zoom) > 0.01) {
          dispatch(uiActions.setZoom(newZoom));
        }
        
        // Handle pan (two-finger pan)
        const deltaX = currentCenter.x - lastPanPoint.x;
        const deltaY = currentCenter.y - lastPanPoint.y;
        
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          dispatch(
            uiActions.setPanOffset({
              x: panOffset.x + deltaX,
              y: panOffset.y + deltaY,
            })
          );
        }
        
        setLastPanPoint(currentCenter);
      }

      event.preventDefault();
    },
    [
      lastPanPoint,
      touchStartPoint,
      clearLongPressTimer,
      isPanning,
      triggerHapticFeedback,
      dispatch,
      panOffset,
      pinchStartDistance,
      pinchStartZoom,
      getTouchDistance,
      getTouchCenter,
      zoom
    ]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      const touches = event.touches;
      const changedTouches = event.changedTouches;
      const endTime = Date.now();
      
      clearLongPressTimer();
      
      // If this was a quick tap (not a pan or long press)
      if (
        touches.length === 0 && 
        changedTouches.length === 1 && 
        !isPanning && 
        touchStartTime &&
        touchStartPoint &&
        endTime - touchStartTime < 300
      ) {
        const touch = changedTouches[0];
        const endPoint = { x: touch.clientX, y: touch.clientY };
        const dx = endPoint.x - touchStartPoint.x;
        const dy = endPoint.y - touchStartPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If movement was minimal, treat as tap
        if (distance < 10) {
          triggerHapticFeedback('light');
          
          const hex = getHexFromTouch(touch);
          if (hex && isHexInBounds(hex)) {
            if (isPlayerMode) {
              // Player mode tap - move player
              const existingPlayerIndex = playerPositions.findIndex((pos) =>
                hexEquals(pos, hex)
              );

              if (existingPlayerIndex >= 0) {
                dispatch(mapActions.removePlayerPosition(existingPlayerIndex));
                const remainingPositions = playerPositions.filter(
                  (_, i) => i !== existingPlayerIndex
                );
                updatePlayerVisibility(remainingPositions, sightDistance);
              } else {
                if (playerPositions.length === 0) {
                  dispatch(mapActions.addPlayerPosition(hex));
                  updatePlayerVisibility([hex], sightDistance);
                } else {
                  const newPositions = [hex, ...playerPositions.slice(1)];
                  dispatch(mapActions.updatePlayerPositions(newPositions));
                  updatePlayerVisibility(newPositions, sightDistance);
                }
              }
            } else {
              // GM mode tap - handle terrain placement or selection
              if (quickTerrainMode && selectedQuickTerrain) {
                if (brushMode) {
                  const brushHexes = getBrushHexes(hex, brushSize, brushShape);
                  const validBrushHexes = brushHexes.filter(isHexInBounds);
                  
                  validBrushHexes.forEach((brushHex) => {
                    dispatch(
                      mapActions.placeIcon({
                        coordinate: brushHex,
                        terrain: selectedQuickTerrain,
                      })
                    );
                  });
                } else {
                  dispatch(
                    mapActions.placeIcon({
                      coordinate: hex,
                      terrain: selectedQuickTerrain,
                    })
                  );
                }
              }
              
              dispatch(uiActions.selectHex(hex));
            }
          }
        }
      }
      
      // Reset touch state
      if (touches.length === 0) {
        setIsPanning(false);
        setLastPanPoint(null);
        setTouchStartTime(0);
        setTouchStartPoint(null);
        setPinchStartDistance(null);
        setPinchStartZoom(1);
      } else if (touches.length === 1) {
        // One finger remaining - reset to single touch state
        const touch = touches[0];
        setLastPanPoint({ x: touch.clientX, y: touch.clientY });
        setPinchStartDistance(null);
        setPinchStartZoom(1);
      }

      event.preventDefault();
    },
    [
      clearLongPressTimer,
      isPanning,
      touchStartTime,
      touchStartPoint,
      triggerHapticFeedback,
      getHexFromTouch,
      isHexInBounds,
      isPlayerMode,
      playerPositions,
      dispatch,
      updatePlayerVisibility,
      sightDistance,
      quickTerrainMode,
      selectedQuickTerrain,
      brushMode,
      brushSize,
      brushShape,
      getBrushHexes
    ]
  );

  // Drag and drop event handlers
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";

      // Get hex coordinate from drag position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenCoord = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const worldCoord = screenToWorld(screenCoord);
      const offsetCoord = {
        x: worldCoord.x - canvasSize.width / 2,
        y: worldCoord.y - canvasSize.height / 2,
      };

      const hex = pixelToHex(offsetCoord, appearance.hexSize);

      if (hex && isHexInBounds(hex)) {
        // Only update if the drag over hex has changed
        if (
          !dragOverHex ||
          dragOverHex.q !== hex.q ||
          dragOverHex.r !== hex.r
        ) {
          setDragOverHex(hex);
        }
      } else {
        if (dragOverHex) {
          setDragOverHex(null);
        }
      }
    },
    [screenToWorld, canvasSize, appearance.hexSize, isHexInBounds, dragOverHex]
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLCanvasElement>) => {
      // Only clear drag over state if we're actually leaving the canvas
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        setDragOverHex(null);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      setDragOverHex(null);

      try {
        const dragDataStr = event.dataTransfer.getData("application/json");
        if (!dragDataStr) return;

        const dragData: DragData = JSON.parse(dragDataStr);

        // Get hex coordinate from drop position
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const screenCoord = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        const worldCoord = screenToWorld(screenCoord);
        const offsetCoord = {
          x: worldCoord.x - canvasSize.width / 2,
          y: worldCoord.y - canvasSize.height / 2,
        };

        const hex = pixelToHex(offsetCoord, appearance.hexSize);

        if (hex && isHexInBounds(hex)) {
          // Place the icon on the hex
          const iconPlacement: {
            coordinate: HexCoordinate;
            terrain?: string;
            landmark?: string;
          } = {
            coordinate: hex,
          };

          if (dragData.category === "terrain") {
            iconPlacement.terrain = dragData.type;
          } else {
            iconPlacement.landmark = dragData.type;
          }

          dispatch(mapActions.placeIcon(iconPlacement));

          // Select the hex that received the icon
          dispatch(uiActions.selectHex(hex));

          // If in quick terrain mode and dropping terrain, set it as selected terrain
          if (quickTerrainMode && dragData.category === "terrain") {
            dispatch(uiActions.setSelectedQuickTerrain(dragData.type));
          }

          // Only open property dialog for landmarks, not terrain
          if (dragData.category !== "terrain") {
            dispatch(uiActions.openPropertyDialog(hex));
          }
        }
      } catch (error) {
        console.error("Error handling drop:", error);
      }
    },
    [
      screenToWorld,
      canvasSize,
      appearance.hexSize,
      isHexInBounds,
      dispatch,
      quickTerrainMode,
    ]
  );

  return (
    <div
      ref={containerRef}
      className={`hex-grid-container ${className || ""}`}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: isPanning
          ? "grabbing"
          : brushMode && isGMMode
          ? "cell"
          : quickTerrainMode && isGMMode
          ? "crosshair"
          : "grab",
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
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
