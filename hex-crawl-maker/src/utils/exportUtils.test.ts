/**
 * Tests for export utilities
 */

import { vi } from 'vitest';
import {
  calculateExportDimensions,
  createExportCanvas,
  generateExportFilename,
  drawExportHexagon,
  canvasToBlob,
} from './exportUtils';
import type { MapData } from '../types';
import type { ExportOptions } from './exportUtils';

// Mock canvas context
const mockContext = {
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  arc: vi.fn(),
  set fillStyle(value: string) {},
  set strokeStyle(value: string) {},
  set lineWidth(value: number) {},
  set font(value: string) {},
  set textAlign(value: string) {},
  set textBaseline(value: string) {},
  set globalAlpha(value: number) {},
  set imageSmoothingEnabled(value: boolean) {},
  set imageSmoothingQuality(value: string) {},
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => mockContext),
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: vi.fn((callback) => {
    const blob = new Blob(['mock'], { type: 'image/png' });
    callback(blob);
  }),
});

const createTestMapData = (): MapData => ({
  id: 'test-map',
  name: 'Test Map',
  dimensions: { width: 5, height: 5 },
  cells: new Map(),
  playerPositions: [],
  sightDistance: 2,
  revealMode: 'permanent',
  appearance: {
    hexSize: 30,
    borderColor: '#333333',
    backgroundColor: '#f0f0f0',
    unexploredColor: '#cccccc',
    sightColor: '#e6e6fa',
    textSize: 12,
    terrainColors: {
      mountains: '#8B4513',
      plains: '#90EE90',
      swamps: '#556B2F',
      water: '#4169E1',
      desert: '#F4A460',
    },
    borderWidth: 1,
  },
});

const createTestExportOptions = (): ExportOptions => ({
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

describe('exportUtils', () => {
  describe('calculateExportDimensions', () => {
    it('calculates dimensions for full map export', () => {
      const mapData = createTestMapData();
      const options = createTestExportOptions();
      
      const dimensions = calculateExportDimensions(mapData, options);
      
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
      expect(dimensions.hexSize).toBeGreaterThan(0);
      expect(dimensions.offsetX).toBeDefined();
      expect(dimensions.offsetY).toBeDefined();
    });

    it('scales dimensions based on DPI', () => {
      const mapData = createTestMapData();
      const options150 = { ...createTestExportOptions(), dpi: 150 };
      const options300 = { ...createTestExportOptions(), dpi: 300 };
      
      const dimensions150 = calculateExportDimensions(mapData, options150);
      const dimensions300 = calculateExportDimensions(mapData, options300);
      
      expect(dimensions300.width).toBeGreaterThan(dimensions150.width);
      expect(dimensions300.height).toBeGreaterThan(dimensions150.height);
      expect(dimensions300.hexSize).toBeGreaterThan(dimensions150.hexSize);
    });

    it('includes margins in calculations', () => {
      const mapData = createTestMapData();
      const optionsWithMargins = {
        ...createTestExportOptions(),
        margins: { top: 100, right: 100, bottom: 100, left: 100 },
      };
      const optionsWithoutMargins = {
        ...createTestExportOptions(),
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
      };
      
      const withMargins = calculateExportDimensions(mapData, optionsWithMargins);
      const withoutMargins = calculateExportDimensions(mapData, optionsWithoutMargins);
      
      expect(withMargins.width).toBeGreaterThan(withoutMargins.width);
      expect(withMargins.height).toBeGreaterThan(withoutMargins.height);
    });

    it('handles visible area export', () => {
      const mapData = createTestMapData();
      const options = { ...createTestExportOptions(), area: 'visible' as const };
      const visibleHexes = new Set(['0,0', '1,0', '0,1']);
      
      const dimensions = calculateExportDimensions(mapData, options, visibleHexes);
      
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
    });

    it('handles selection area export', () => {
      const mapData = createTestMapData();
      const options = {
        ...createTestExportOptions(),
        area: 'selection' as const,
        selection: {
          topLeft: { q: 0, r: 0 },
          bottomRight: { q: 2, r: 2 },
        },
      };
      
      const dimensions = calculateExportDimensions(mapData, options);
      
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
    });
  });

  describe('createExportCanvas', () => {
    it('creates canvas with correct dimensions', () => {
      const dimensions = {
        width: 800,
        height: 600,
        hexSize: 30,
        offsetX: 0,
        offsetY: 0,
      };
      
      const canvas = createExportCanvas(dimensions);
      
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
      expect(canvas.getContext('2d')).toBeTruthy();
    });

    it('sets up high-quality rendering', () => {
      const dimensions = {
        width: 800,
        height: 600,
        hexSize: 30,
        offsetX: 0,
        offsetY: 0,
      };
      
      const canvas = createExportCanvas(dimensions);
      const ctx = canvas.getContext('2d');
      
      expect(ctx).toBeTruthy();
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });
  });

  describe('drawExportHexagon', () => {
    it('draws hexagon with correct parameters', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      drawExportHexagon(
        ctx,
        { x: 100, y: 100 },
        30,
        '#ff0000',
        '#000000',
        2
      );
      
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.closePath).toHaveBeenCalled();
      expect(mockContext.fill).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('skips stroke when width is 0', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      vi.clearAllMocks();
      
      drawExportHexagon(
        ctx,
        { x: 100, y: 100 },
        30,
        '#ff0000',
        '#000000',
        0
      );
      
      expect(mockContext.fill).toHaveBeenCalled();
      expect(mockContext.stroke).not.toHaveBeenCalled();
    });
  });

  describe('generateExportFilename', () => {
    it('generates filename with correct format', () => {
      const filename = generateExportFilename('My Map', 'png', {
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
      });
      
      expect(filename).toMatch(/^My Map_full_300dpi_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png$/);
    });

    it('handles different areas and formats', () => {
      const filename = generateExportFilename('Test', 'pdf', {
        format: 'pdf',
        dpi: 150,
        area: 'visible',
        layers: {
          terrain: true,
          landmarks: true,
          labels: true,
          gmNotes: false,
          playerPositions: true,
          grid: true,
          coordinates: false,
        },
      });
      
      expect(filename).toMatch(/^Test_visible_150dpi_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.pdf$/);
    });
  });

  describe('canvasToBlob', () => {
    it('converts canvas to blob', async () => {
      const canvas = document.createElement('canvas');
      
      const blob = await canvasToBlob(canvas);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('handles different formats', async () => {
      const canvas = document.createElement('canvas');
      
      const blob = await canvasToBlob(canvas, 'jpeg', 0.8);
      
      expect(blob).toBeInstanceOf(Blob);
    });
  });
});