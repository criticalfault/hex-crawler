/**
 * Export service for rendering and exporting hex maps
 */

import jsPDF from 'jspdf';
import type { MapData, HexCoordinate, HexCell } from '../types';
import { hexToPixel } from '../utils/hexCoordinates';
import {
  calculateExportDimensions,
  createExportCanvas,
  loadIconsForExport,
  drawExportHexagon,
  drawExportHexContent,
  drawExportPlayerPositions,
  drawExportCoordinates,
  drawExportWatermark,
  canvasToBlob,
  downloadBlob,
  generateExportFilename,
} from '../utils/exportUtils';
import type { ExportOptions, ExportDimensions } from '../utils/exportUtils';

export class ExportService {
  private iconCache: Map<string, HTMLImageElement> | null = null;

  /**
   * Initialize the export service by loading icons
   */
  async initialize(): Promise<void> {
    if (!this.iconCache) {
      this.iconCache = await loadIconsForExport();
    }
  }

  /**
   * Export map as PNG image
   */
  async exportPNG(
    mapData: MapData,
    options: ExportOptions,
    visibleHexes?: Set<string>
  ): Promise<void> {
    await this.initialize();
    
    const dimensions = calculateExportDimensions(mapData, options, visibleHexes);
    const canvas = await this.renderMapToCanvas(mapData, options, dimensions, visibleHexes);
    
    const blob = await canvasToBlob(canvas, 'png');
    const filename = generateExportFilename(mapData.name, 'png', options);
    
    downloadBlob(blob, filename);
  }

  /**
   * Export map as PDF (using canvas and jsPDF)
   */
  async exportPDF(
    mapData: MapData,
    options: ExportOptions,
    visibleHexes?: Set<string>
  ): Promise<void> {
    // For now, we'll implement PDF export as a high-resolution PNG embedded in PDF
    // This can be enhanced later with proper PDF vector graphics
    await this.initialize();
    
    const dimensions = calculateExportDimensions(mapData, options, visibleHexes);
    const canvas = await this.renderMapToCanvas(mapData, options, dimensions, visibleHexes);
    
    // Convert to PDF using a simple approach
    const blob = await this.canvasToPDF(canvas, mapData.name);
    const filename = generateExportFilename(mapData.name, 'pdf', options);
    
    downloadBlob(blob, filename);
  }

  /**
   * Render map to canvas
   */
  private async renderMapToCanvas(
    mapData: MapData,
    options: ExportOptions,
    dimensions: ExportDimensions,
    visibleHexes?: Set<string>
  ): Promise<HTMLCanvasElement> {
    const canvas = createExportCanvas(dimensions);
    const ctx = canvas.getContext('2d');
    
    if (!ctx || !this.iconCache) {
      throw new Error('Failed to get canvas context or icons not loaded');
    }

    // Determine which hexes to render
    const hexesToRender = this.getHexesToRender(mapData, options, visibleHexes);
    
    // Render hexes
    for (const hex of hexesToRender) {
      const center = hexToPixel(hex, dimensions.hexSize);
      const adjustedCenter = {
        x: center.x + dimensions.offsetX,
        y: center.y + dimensions.offsetY,
      };
      
      const hexKey = `${hex.q},${hex.r}`;
      const hexCell = mapData.cells.get(hexKey);
      
      // Determine hex appearance
      const fillColor = this.getHexFillColor(hexCell, mapData.appearance);
      const strokeColor = options.layers.grid ? mapData.appearance.borderColor : 'transparent';
      const strokeWidth = options.layers.grid ? mapData.appearance.borderWidth : 0;
      
      // Draw hexagon
      drawExportHexagon(ctx, adjustedCenter, dimensions.hexSize, fillColor, strokeColor, strokeWidth);
      
      // Draw hex content
      if (hexCell) {
        drawExportHexContent(ctx, adjustedCenter, hexCell, dimensions.hexSize, this.iconCache, options);
      }
      
      // Draw coordinates if enabled
      if (options.layers.coordinates) {
        drawExportCoordinates(ctx, hex, adjustedCenter, dimensions.hexSize);
      }
    }
    
    // Draw player positions
    if (options.layers.playerPositions && mapData.playerPositions.length > 0) {
      drawExportPlayerPositions(ctx, mapData.playerPositions, dimensions.hexSize, dimensions);
    }
    
    // Draw watermark
    if (options.watermark) {
      drawExportWatermark(ctx, options.watermark, dimensions);
    }
    
    return canvas;
  }

  /**
   * Get hexes to render based on export options
   */
  private getHexesToRender(
    mapData: MapData,
    options: ExportOptions,
    visibleHexes?: Set<string>
  ): HexCoordinate[] {
    if (options.area === 'full') {
      // Return all hexes in the map
      const hexes: HexCoordinate[] = [];
      for (let row = 0; row < mapData.dimensions.height; row++) {
        for (let col = 0; col < mapData.dimensions.width; col++) {
          const q = col - Math.floor(row / 2);
          const r = row;
          hexes.push({ q, r });
        }
      }
      return hexes;
    } else if (options.area === 'visible' && visibleHexes) {
      // Return only visible hexes
      return Array.from(visibleHexes).map(key => {
        const [q, r] = key.split(',').map(Number);
        return { q, r };
      });
    } else if (options.area === 'selection' && options.selection) {
      // Return hexes in selection
      const hexes: HexCoordinate[] = [];
      const { topLeft, bottomRight } = options.selection;
      for (let r = topLeft.r; r <= bottomRight.r; r++) {
        for (let q = topLeft.q; q <= bottomRight.q; q++) {
          hexes.push({ q, r });
        }
      }
      return hexes;
    }
    
    // Fallback to full map
    return this.getHexesToRender(mapData, { ...options, area: 'full' }, visibleHexes);
  }

  /**
   * Get hex fill color based on content and appearance settings
   */
  private getHexFillColor(hexCell: HexCell | undefined, appearance: any): string {
    if (!hexCell) {
      return appearance.backgroundColor;
    }
    
    if (hexCell.terrain && appearance.terrainColors[hexCell.terrain]) {
      return appearance.terrainColors[hexCell.terrain];
    }
    
    return appearance.backgroundColor;
  }

  /**
   * Convert canvas to PDF blob using jsPDF
   */
  private async canvasToPDF(canvas: HTMLCanvasElement, mapName: string): Promise<Blob> {
    const imageData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions (convert pixels to mm at 96 DPI)
    const pxToMm = 0.264583; // 1 pixel = 0.264583 mm at 96 DPI
    const widthMm = canvas.width * pxToMm;
    const heightMm = canvas.height * pxToMm;
    
    // Determine orientation and page size
    const isLandscape = widthMm > heightMm;
    const orientation = isLandscape ? 'landscape' : 'portrait';
    
    // Use A4 as base, but scale if image is larger
    const a4Width = 210; // mm
    const a4Height = 297; // mm
    
    let pageWidth = isLandscape ? a4Height : a4Width;
    let pageHeight = isLandscape ? a4Width : a4Height;
    
    // If image is larger than A4, use custom page size
    if (widthMm > pageWidth || heightMm > pageHeight) {
      pageWidth = widthMm + 20; // Add 10mm margin on each side
      pageHeight = heightMm + 20; // Add 10mm margin on each side
    }
    
    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [pageWidth, pageHeight]
    });
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(mapName, 10, 15);
    
    // Calculate image position to center it
    const imgX = (pageWidth - widthMm) / 2;
    const imgY = Math.max(25, (pageHeight - heightMm) / 2); // Leave space for title
    
    // Add image to PDF
    pdf.addImage(imageData, 'PNG', imgX, imgY, widthMm, heightMm);
    
    // Add metadata
    pdf.setProperties({
      title: mapName,
      subject: 'Hex Crawl Map',
      author: 'Hex Crawl Maker',
      creator: 'Hex Crawl Maker',
      producer: 'Hex Crawl Maker'
    });
    
    // Return as blob
    return new Promise((resolve) => {
      const pdfBlob = pdf.output('blob');
      resolve(pdfBlob);
    });
  }

  /**
   * Batch export multiple versions of the map
   */
  async batchExport(
    mapData: MapData,
    exportConfigs: ExportOptions[],
    visibleHexes?: Set<string>
  ): Promise<void> {
    await this.initialize();
    
    for (const config of exportConfigs) {
      try {
        if (config.format === 'png') {
          await this.exportPNG(mapData, config, visibleHexes);
        } else if (config.format === 'pdf') {
          await this.exportPDF(mapData, config, visibleHexes);
        }
        
        // Small delay between exports to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to export with config:`, config, error);
      }
    }
  }

  /**
   * Get preview of export dimensions
   */
  getExportPreview(
    mapData: MapData,
    options: ExportOptions,
    visibleHexes?: Set<string>
  ): ExportDimensions {
    return calculateExportDimensions(mapData, options, visibleHexes);
  }
}

// Export singleton instance
export const exportService = new ExportService();