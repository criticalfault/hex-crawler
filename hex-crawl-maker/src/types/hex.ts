/**
 * Core data types for the hex crawl maker application
 */

export interface HexCoordinate {
  q: number; // axial coordinate (column)
  r: number; // axial coordinate (row)
}

export type TerrainType = 
  | 'mountains'
  | 'plains'
  | 'swamps'
  | 'water'
  | 'desert';

export type LandmarkType = 
  | 'tower'
  | 'town'
  | 'city'
  | 'marker';

export interface HexCell {
  coordinate: HexCoordinate;
  terrain?: TerrainType;
  landmark?: LandmarkType;
  name?: string;
  description?: string;
  gmNotes?: string;
  isExplored: boolean;
  isVisible: boolean;
}

export interface GridAppearance {
  hexSize: number;
  borderColor: string;
  backgroundColor: string;
  unexploredColor: string;
  textSize: number;
  terrainColors: {
    mountains: string;
    plains: string;
    swamps: string;
    water: string;
    desert: string;
  };
  borderWidth: number;
}

export type RevealMode = 'permanent' | 'lineOfSight';

export interface MapData {
  id: string;
  name: string;
  dimensions: { width: number; height: number };
  cells: Map<string, HexCell>; // keyed by "q,r"
  playerPositions: HexCoordinate[];
  sightDistance: number;
  revealMode: RevealMode;
  appearance: GridAppearance;
}

export interface PixelCoordinate {
  x: number;
  y: number;
}