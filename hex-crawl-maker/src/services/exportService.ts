/**
 * Export service for generating various map export formats
 */

// import { jsPDF } from 'jspdf';
import type { MapData, HexCoordinate, HexCell } from "../types";
import { hexToPixel } from "../utils/hexCoordinates";

export interface ExportOptions {
  format: "png" | "jpg" | "svg" | "pdf";
  quality?: number; // 0-1 for jpg
  scale?: number; // Scale factor for raster formats
  includeGrid?: boolean;
  includeCoordinates?: boolean;
  includeLabels?: boolean;
  backgroundColor?: string;
  selectedRegion?: {
    topLeft: HexCoordinate;
    bottomRight: HexCoordinate;
  };
}

export interface BatchExportOptions {
  formats: ExportOptions["format"][];
  baseOptions: Omit<ExportOptions, "format">;
  includePlayerVersion?: boolean; // Version without GM-only elements
  includeHighRes?: boolean; // 2x scale version
}

/**
 * Service for exporting maps in various formats
 */
export class ExportService {
  private static instance: ExportService;

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Get export preview dimensions
   */
  getExportPreview(
    mapData: MapData,
    options: any,
    hexesToUse: any
  ): {
    width: number;
    height: number;
    hexSize: number;
    offsetX: number;
    offsetY: number;
  } {
    // Return default dimensions for now
    return { width: 800, height: 600, hexSize: 30, offsetX: 0, offsetY: 0 };
  }

  /**
   * Export map as PNG
   */
  async exportPNG(
    input: HTMLCanvasElement | MapData,
    optionsOrMapName?: any,
    hexesToUse?: any
  ): Promise<Blob> {
    let canvas: HTMLCanvasElement;
    let options: Partial<ExportOptions> = {};

    if (input instanceof HTMLCanvasElement) {
      // Legacy signature: (canvas, mapName, options)
      canvas = input;
      options = hexesToUse || {};
    } else {
      // New signature: (mapData, options, hexesToUse)
      // Create a canvas from MapData (simplified implementation)
      canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      options = optionsOrMapName || {};
      // TODO: Render map data to canvas
    }

    const { quality = 1, scale = 1 } = options;

    if (scale !== 1) {
      // Create scaled canvas
      const scaledCanvas = this.scaleCanvas(canvas, scale);
      return this.canvasToBlob(scaledCanvas, "image/png");
    }

    return this.canvasToBlob(canvas, "image/png");
  }

  /**
   * Export map as JPG
   */
  async exportJPG(
    canvas: HTMLCanvasElement,
    mapName: string,
    options: Partial<ExportOptions> = {}
  ): Promise<Blob> {
    const { quality = 0.9, scale = 1 } = options;

    if (scale !== 1) {
      // Create scaled canvas
      const scaledCanvas = this.scaleCanvas(canvas, scale);
      return this.canvasToBlob(scaledCanvas, "image/jpeg", quality);
    }

    return this.canvasToBlob(canvas, "image/jpeg", quality);
  }

  /**
   * Export map as PDF (temporarily disabled)
   */
  async exportPDF(
    input: HTMLCanvasElement | MapData,
    optionsOrMapName?: any,
    hexesToUse?: any
  ): Promise<Blob> {
    throw new Error("PDF export temporarily disabled");
  }

  /**
   * Export map as SVG
   */
  async exportSVG(
    mapData: MapData,
    mapName: string,
    options: Partial<ExportOptions> = {}
  ): Promise<Blob> {
    const svg = this.generateSVG(mapData, options);
    return new Blob([svg], { type: "image/svg+xml" });
  }

  /**
   * Scale canvas by given factor
   */
  private scaleCanvas(
    canvas: HTMLCanvasElement,
    scale: number
  ): HTMLCanvasElement {
    const scaledCanvas = document.createElement("canvas");
    const ctx = scaledCanvas.getContext("2d")!;

    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);

    return scaledCanvas;
  }

  /**
   * Convert canvas to blob
   */
  private canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality?: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        type,
        quality
      );
    });
  }

  /**
   * Generate SVG from map data
   */
  private generateSVG(
    mapData: MapData,
    options: Partial<ExportOptions> = {}
  ): string {
    const { includeGrid = true, includeCoordinates = false } = options;
    const { cells, dimensions, appearance } = mapData;

    // Calculate SVG dimensions
    const hexSize = appearance.hexSize;
    const width = dimensions.width * hexSize * 1.5;
    const height = dimensions.height * hexSize * Math.sqrt(3);

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Add background
    svg += `<rect width="100%" height="100%" fill="${appearance.backgroundColor}"/>`;

    // Add hexes
    cells.forEach((cell) => {
      const { x, y } = hexToPixel(cell.coordinate, hexSize);
      const terrainColor = appearance.terrainColors[cell.terrain];

      // Create hex path
      const points = this.getHexPoints(x, y, hexSize);
      svg += `<polygon points="${points}" fill="${terrainColor}" stroke="${appearance.borderColor}" stroke-width="${appearance.borderWidth}"/>`;

      // Add coordinates if requested
      if (includeCoordinates) {
        svg += `<text x="${x}" y="${y}" text-anchor="middle" font-size="${appearance.textSize}" fill="black">${cell.coordinate.q},${cell.coordinate.r}</text>`;
      }
    });

    svg += "</svg>";
    return svg;
  }

  /**
   * Get hex polygon points for SVG
   */
  private getHexPoints(centerX: number, centerY: number, size: number): string {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  }

  /**
   * Batch export multiple versions of the map
   */
  async batchExport(
    mapData: MapData,
    configs: any,
    hexesToUse: any
  ): Promise<{ [key: string]: Blob }> {
    const results: { [key: string]: Blob } = {};

    // Simplified implementation for now
    try {
      const blob = await this.exportPNG(mapData, configs, hexesToUse);
      results["png"] = blob;
    } catch (error) {
      console.warn("Failed to export:", error);
    }

    return results;
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get appropriate file extension for format
   */
  getFileExtension(format: ExportOptions["format"]): string {
    switch (format) {
      case "png":
        return ".png";
      case "jpg":
        return ".jpg";
      case "svg":
        return ".svg";
      case "pdf":
        return ".pdf";
      default:
        return ".png";
    }
  }
}

// Export singleton instance
export const exportService = ExportService.getInstance();
