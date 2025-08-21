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
  | 'desert'
  | 'hills'
  | 'shallowWater'
  | 'deepWater'
  | 'oceanWater';

export type LandmarkType = 
  | 'village'
  | 'hamlet'
  | 'town'
  | 'city'
  | 'ruinsAncient'
  | 'ruinsRecent'
  | 'castle'
  | 'fortress'
  | 'watchtower'
  | 'tower'
  | 'signalFire'
  | 'mineEntrance'
  | 'caveMouth'
  | 'standingStones'
  | 'stoneCircle'
  | 'temple'
  | 'shrine'
  | 'wizardTower'
  | 'tradingPost'
  | 'roadhouse'
  | 'bridge'
  | 'ford'
  | 'ferryCrossing'
  | 'campsite'
  | 'huntersLodge'
  | 'marker';

export type RoadType = 
  | 'path'
  | 'road'
  | 'highway';

export interface HexCell {
  coordinate: HexCoordinate;
  terrain?: TerrainType;
  landmark?: LandmarkType;
  road?: RoadType;
  roadConnections?: ('north' | 'northeast' | 'southeast' | 'south' | 'southwest' | 'northwest')[];
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
  sightColor: string;
  textSize: number;
  terrainColors: {
    mountains: string;
    plains: string;
    swamps: string;
    water: string;
    desert: string;
    hills: string;
    shallowWater: string;
    deepWater: string;
    oceanWater: string;
  };
  roadColors: {
    path: string;
    road: string;
    highway: string;
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