/**
 * Types for terrain templates and procedural generation
 */

import type { HexCoordinate, TerrainType, LandmarkType } from './hex';

export interface TemplateCell {
  coordinate: HexCoordinate;
  terrain?: TerrainType;
  landmark?: LandmarkType;
  name?: string;
  description?: string;
  gmNotes?: string;
}

export interface TerrainTemplate {
  id: string;
  name: string;
  description: string;
  category: 'biome' | 'campaign' | 'structure' | 'custom';
  tags: string[];
  author?: string;
  version: string;
  dimensions: { width: number; height: number };
  cells: TemplateCell[];
  previewImage?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BiomeGeneratorConfig {
  biomeType: 'forest' | 'mountain' | 'coastal' | 'desert' | 'swamp' | 'mixed';
  density: number; // 0-1, how dense the terrain features are
  variation: number; // 0-1, how much variation in terrain
  landmarkChance: number; // 0-1, chance of landmarks appearing
  seed?: number; // for reproducible generation
  customTerrainWeights?: {
    [key in TerrainType]?: number;
  };
  customLandmarkWeights?: {
    [key in LandmarkType]?: number;
  };
}

export interface TemplateGenerationOptions {
  dimensions?: { width: number; height: number };
  centerPoint?: HexCoordinate;
  rotation?: number; // degrees
  mirror?: 'horizontal' | 'vertical' | 'both';
  scale?: number; // scaling factor
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: TerrainTemplate[];
}

export interface TemplateSearchFilters {
  category?: string;
  tags?: string[];
  author?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'created' | 'updated' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface TemplatePreview {
  template: TerrainTemplate;
  previewCells: TemplateCell[];
  appliedOptions: TemplateGenerationOptions;
}