/**
 * Export utilities for generating high-resolution images and PDFs of hex maps
 */

import type { HexCoordinate, HexCell, GridAppearance, MapData } from '../types';
import { hexToPixel, hexesInRange } from './hexCoordinates';
import { ALL_ICONS } from '../types/icons';

export interface ExportOptions {
  format: 'png' | 'pdf';
  dpi: number;
  area: 'full' | 'visible' | 'selection';
  layers: {
    terrain: boolean;
    landmarks: boolean;
    labels: boolean;
    gmNotes: boolean;
    playerPositions: boolean;
    grid: boolean;
    coordinates: boolean;
  };
  selection?: {
    topLeft: HexCoordinate;
    bottomRight: HexCoordinate;
  };
  watermark?: {
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
  };
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ExportDimensions {
  width: number;
  height: number;
  hexSize: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Calculate export dimensions based on options and map data
 */
export function calculateExportDimensions(
  mapData: MapData,
  options: ExportOptions,
  visibleHexes?: Set<string>
): ExportDimensions {
  const baseDPI = 96; // Standard screen DPI
  const scaleFactor = options.dpi / baseDPI;
  
  let hexesToInclude: HexCoordinate[] = [];
  
  if (options.area === 'full') {
    // Include all hexes in the map
    for (let row = 0; row < mapData.dimensions.height; row++) {
      for (let col = 0; col < mapData.dimensions.width; col++) {
        const q = col - Math.floor(row / 2);
        const r = row;
        hexesToInclude.push({ q, r });
      }
    }
  } else if (options.area === 'visible' && visibleHexes) {
    // Include only visible hexes
    hexesToInclude = Array.from(visibleHexes).map(key => {
      const [q, r] = key.split(',').map(Number);
      return { q, r };
    });
  } else if (options.area === 'selection' && options.selection) {
    // Include hexes in selection rectangle
    const { topLeft, bottomRight } = options.selection;
    for (let r = topLeft.r; r <= bottomRight.r; r++) {
      for (let q = topLeft.q; q <= bottomRight.q; q++) {
        hexesToInclude.push({ q, r });
      }
    }
  }
  
  if (hexesToInclude.length === 0) {
    // Fallback to full map
    for (let row = 0; row < mapData.dimensions.height; row++) {
      for (let col = 0; col < mapData.dimensions.width; col++) {
        const q = col - Math.floor(row / 2);
        const r = row;
        hexesToInclude.push({ q, r });
      }
    }
  }
  
  // Calculate bounding box
  const hexSize = mapData.appearance.hexSize * scaleFactor;
  const positions = hexesToInclude.map(hex => hexToPixel(hex, hexSize));
  
  const minX = Math.min(...positions.map(p => p.x)) - hexSize;
  const maxX = Math.max(...positions.map(p => p.x)) + hexSize;
  const minY = Math.min(...positions.map(p => p.y)) - hexSize;
  const maxY = Math.max(...positions.map(p => p.y)) + hexSize;
  
  const margins = options.margins || { top: 50, right: 50, bottom: 50, left: 50 };
  const scaledMargins = {
    top: margins.top * scaleFactor,
    right: margins.right * scaleFactor,
    bottom: margins.bottom * scaleFactor,
    left: margins.left * scaleFactor,
  };
  
  return {
    width: (maxX - minX) + scaledMargins.left + scaledMargins.right,
    height: (maxY - minY) + scaledMargins.top + scaledMargins.bottom,
    hexSize,
    offsetX: -minX + scaledMargins.left,
    offsetY: -minY + scaledMargins.top,
  };
}

/**
 * Create a high-resolution canvas for export
 */
export function createExportCanvas(dimensions: ExportDimensions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  return canvas;
}

/**
 * Load and cache icons for export
 */
export async function loadIconsForExport(): Promise<Map<string, HTMLImageElement>> {
  const iconCache = new Map<string, HTMLImageElement>();
  
  const loadPromises = ALL_ICONS.map(iconData => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        iconCache.set(iconData.type, img);
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to load icon for export: ${iconData.type}`);
        resolve();
      };
      img.src = iconData.svgPath;
    });
  });
  
  await Promise.all(loadPromises);
  return iconCache;
}

/**
 * Draw a hexagon on the export canvas
 */
export function drawExportHexagon(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  size: number,
  fillColor: string,
  strokeColor: string,
  strokeWidth: number = 1
): void {
  ctx.beginPath();
  
  // Calculate hexagon vertices (flat-top orientation)
  for (let i = 0; i < 6; i++) {
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
  if (strokeWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
}

/**
 * Draw hex content (terrain/landmark icons) on export canvas
 */
export function drawExportHexContent(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  hexCell: HexCell,
  hexSize: number,
  iconCache: Map<string, HTMLImageElement>,
  options: ExportOptions
): void {
  // Draw terrain/landmark icon
  if (options.layers.terrain || options.layers.landmarks) {
    const iconType = hexCell.terrain || hexCell.landmark;
    if (iconType) {
      const shouldDraw = (hexCell.terrain && options.layers.terrain) || 
                        (hexCell.landmark && options.layers.landmarks);
      
      if (shouldDraw) {
        const img = iconCache.get(iconType);
        if (img) {
          const iconSize = hexSize * 0.6;
          ctx.drawImage(
            img,
            center.x - iconSize / 2,
            center.y - iconSize / 2,
            iconSize,
            iconSize
          );
        }
      }
    }
  }
  
  // Draw labels
  if (options.layers.labels && hexCell.name) {
    const fontSize = Math.max(8, hexSize * 0.15);
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text with white outline for better visibility
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeText(hexCell.name, center.x, center.y + hexSize * 0.4);
    ctx.fillText(hexCell.name, center.x, center.y + hexSize * 0.4);
  }
  
  // Draw GM notes (smaller text)
  if (options.layers.gmNotes && hexCell.gmNotes) {
    const fontSize = Math.max(6, hexSize * 0.1);
    ctx.fillStyle = '#666666';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Truncate long notes
    const maxLength = 20;
    const displayText = hexCell.gmNotes.length > maxLength 
      ? hexCell.gmNotes.substring(0, maxLength) + '...'
      : hexCell.gmNotes;
    
    ctx.fillText(displayText, center.x, center.y + hexSize * 0.6);
  }
}

/**
 * Draw player positions on export canvas
 */
export function drawExportPlayerPositions(
  ctx: CanvasRenderingContext2D,
  playerPositions: HexCoordinate[],
  hexSize: number,
  dimensions: ExportDimensions
): void {
  const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
  
  playerPositions.forEach((playerPos, index) => {
    const center = hexToPixel(playerPos, hexSize);
    const adjustedCenter = {
      x: center.x + dimensions.offsetX,
      y: center.y + dimensions.offsetY,
    };
    
    const tokenSize = hexSize * 0.4;
    const color = colors[index % colors.length];
    
    // Draw player token circle
    ctx.beginPath();
    ctx.arc(adjustedCenter.x, adjustedCenter.y, tokenSize / 2, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw player number
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(8, tokenSize * 0.6)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((index + 1).toString(), adjustedCenter.x, adjustedCenter.y);
  });
}

/**
 * Draw coordinates on export canvas
 */
export function drawExportCoordinates(
  ctx: CanvasRenderingContext2D,
  hex: HexCoordinate,
  center: { x: number; y: number },
  hexSize: number
): void {
  const fontSize = Math.max(6, hexSize * 0.08);
  ctx.fillStyle = '#666666';
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${hex.q},${hex.r}`, center.x, center.y + hexSize * 0.3);
}

/**
 * Draw watermark on export canvas
 */
export function drawExportWatermark(
  ctx: CanvasRenderingContext2D,
  watermark: NonNullable<ExportOptions['watermark']>,
  dimensions: ExportDimensions
): void {
  const fontSize = Math.max(12, dimensions.width * 0.02);
  ctx.fillStyle = `rgba(0, 0, 0, ${watermark.opacity})`;
  ctx.font = `${fontSize}px Arial`;
  
  let x: number, y: number;
  
  switch (watermark.position) {
    case 'top-left':
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      x = 20;
      y = 20;
      break;
    case 'top-right':
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      x = dimensions.width - 20;
      y = 20;
      break;
    case 'bottom-left':
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      x = 20;
      y = dimensions.height - 20;
      break;
    case 'bottom-right':
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      x = dimensions.width - 20;
      y = dimensions.height - 20;
      break;
    case 'center':
    default:
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      x = dimensions.width / 2;
      y = dimensions.height / 2;
      break;
  }
  
  ctx.fillText(watermark.text, x, y);
}

/**
 * Convert canvas to blob for download
 */
export function canvasToBlob(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png', quality: number = 0.95): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob from canvas'));
      }
    }, `image/${format}`, quality);
  });
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  mapName: string,
  format: string,
  options: ExportOptions
): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const area = options.area === 'full' ? 'full' : options.area === 'visible' ? 'visible' : 'selection';
  const dpi = options.dpi;
  
  return `${mapName}_${area}_${dpi}dpi_${timestamp}.${format}`;
}