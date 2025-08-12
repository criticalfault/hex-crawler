/**
 * Icon-related types and data structures
 */

import type { TerrainType, LandmarkType, RoadType } from './hex';

export interface IconData {
  id: string;
  name: string;
  category: 'terrain' | 'structure' | 'marker' | 'road';
  type: TerrainType | LandmarkType | RoadType;
  svgPath: string;
  description: string;
}

export interface DragData {
  iconId: string;
  category: 'terrain' | 'structure' | 'marker' | 'road';
  type: TerrainType | LandmarkType | RoadType;
}

export const TERRAIN_ICONS: IconData[] = [
  {
    id: 'mountains',
    name: 'Mountains',
    category: 'terrain',
    type: 'mountains' as TerrainType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNSAxNkw4IDEwTDEyIDE0TDE2IDhMMTkgMTZINVoiIGZpbGw9IiM4QjQ1MTMiIHN0cm9rZT0iIzY1NDMyMSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHBhdGggZD0iTTYgMTVMOC41IDExTDExIDEzTDE0LjUgOUwxNyAxNSIgZmlsbD0iI0EwNTIyRCIgc3Ryb2tlPSJub25lIi8+Cjwvc3ZnPg==',
    description: 'Rocky mountain terrain'
  },
  {
    id: 'plains',
    name: 'Plains',
    category: 'terrain',
    type: 'plains' as TerrainType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIyIiB5PSIxMiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjgiIGZpbGw9IiM5MEVFOTAiIHN0cm9rZT0iIzIyOEIyMiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHBhdGggZD0iTTMgMTRDNSAxMyA3IDE1IDkgMTRDMTEgMTMgMTMgMTUgMTUgMTRDMTcgMTMgMTkgMTUgMjEgMTQiIHN0cm9rZT0iIzMyQ0QzMiIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTMgMTZDNSAxNSA3IDE3IDkgMTZDMTEgMTUgMTMgMTcgMTUgMTZDMTcgMTUgMTkgMTcgMjEgMTYiIHN0cm9rZT0iIzMyQ0QzMiIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==',
    description: 'Open grassland'
  },
  {
    id: 'swamps',
    name: 'Swamps',
    category: 'terrain',
    type: 'swamps' as TerrainType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIyIiB5PSIxNCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjYiIGZpbGw9IiM1NTZCMUYiIHN0cm9rZT0iIzJGNEYyRiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPGNpcmNsZSBjeD0iNiIgY3k9IjE2IiByPSIxLjUiIGZpbGw9IiM4RkJDOEYiLz4KICA8Y2lyY2xlIGN4PSIxMCIgY3k9IjE3IiByPSIxIiBmaWxsPSIjOEZCQzhGIi8+CiAgPGNpcmNsZSBjeD0iMTQiIGN5PSIxNiIgcj0iMS41IiBmaWxsPSIjOEZCQzhGIi8+CiAgPGNpcmNsZSBjeD0iMTgiIGN5PSIxNyIgcj0iMSIgZmlsbD0iIzhGQkM4RiIvPgogIDxwYXRoIGQ9Ik00IDEyQzQgMTAgNiA4IDggMTBDMTAgOCAxMiAxMCAxNCA4QzE2IDEwIDE4IDggMjAgMTAiIHN0cm9rZT0iIzIyOEIyMiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==',
    description: 'Marshy wetlands'
  },
  {
    id: 'water',
    name: 'Water',
    category: 'terrain',
    type: 'water' as TerrainType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIyIiB5PSI4IiB3aWR0aD0iMjAiIGhlaWdodD0iMTIiIGZpbGw9IiM0MTY5RTEiIHN0cm9rZT0iIzE5MTk3MCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHBhdGggZD0iTTMgMTJDNSAxMSA3IDEzIDkgMTJDMTEgMTEgMTMgMTMgMTUgMTJDMTcgMTEgMTkgMTMgMjEgMTIiIHN0cm9rZT0iIzg3Q0VFQiIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICA8cGF0aCBkPSJNMyAxNUM1IDE0IDcgMTYgOSAxNUMxMSAxNCAxMyAxNiAxNSAxNUMxNyAxNCAxOSAxNiAyMSAxNSIgc3Ryb2tlPSIjODdDRUVCIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zIDE4QzUgMTcgNyAxOSA5IDE4QzExIDE3IDEzIDE5IDE1IDE4QzE3IDE3IDE5IDE5IDIxIDE4IiBzdHJva2U9IiM4N0NFRUIiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==',
    description: 'Rivers, lakes, and seas'
  },
  {
    id: 'desert',
    name: 'Desert',
    category: 'terrain',
    type: 'desert' as TerrainType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIyIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRjRBNDYwIiBzdHJva2U9IiNEMjY5MUUiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxwYXRoIGQ9Ik0zIDE0QzUgMTMgNyAxNSA5IDE0QzExIDEzIDEzIDE1IDE1IDE0QzE3IDEzIDE5IDE1IDIxIDE0IiBzdHJva2U9IiNERUI4ODciIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zIDE3QzUgMTYgNyAxOCA5IDE3QzExIDE2IDEzIDE4IDE1IDE3QzE3IDE2IDE5IDE4IDIxIDE3IiBzdHJva2U9IiNERUI4ODciIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPgogIDxjaXJjbGUgY3g9IjgiIGN5PSI4IiByPSIxIiBmaWxsPSIjRkZENzAwIi8+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSI2IiByPSIxIiBmaWxsPSIjRkZENzAwIi8+Cjwvc3ZnPg==',
    description: 'Arid desert landscape'
  },
  {
    id: 'hills',
    name: 'Hills',
    category: 'terrain',
    type: 'hills' as TerrainType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMiAxOEM0IDE2IDYgMTQgOCAxNkMxMCAxNCAxMiAxNiAxNCAxNEMxNiAxNiAxOCAxNCAxOCAxNkMyMCAxNCAyMiAxNiAyMiAxOFYyMEgyVjE4WiIgZmlsbD0iIzY1QTMzMCIgc3Ryb2tlPSIjMzY3NTFGIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cGF0aCBkPSJNMyAxN0M1IDE1IDcgMTMgOSAxNUMxMSAxMyAxMyAxNSAxNSAxM0MxNyAxNSAxOSAxMyAxOSAxNUMyMSAxMyAyMSAxNSAyMSAxNyIgZmlsbD0iIzc0QjM0NyIgc3Ryb2tlPSJub25lIi8+CiAgPHBhdGggZD0iTTQgMTZDNiAxNCA4IDEyIDEwIDE0QzEyIDEyIDE0IDE0IDE2IDEyQzE4IDE0IDIwIDEyIDIwIDE0IiBzdHJva2U9IiM4NEMzNTciIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=',
    description: 'Rolling hills and elevated terrain'
  },
  {
    id: 'shallowWater',
    name: 'Shallow Water',
    category: 'terrain',
    type: 'shallowWater' as TerrainType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIyIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjODdDRUVCIiBzdHJva2U9IiM0Njg0QkQiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxwYXRoIGQ9Ik0zIDEzQzUgMTIgNyAxNCA5IDEzQzExIDEyIDEzIDE0IDE1IDEzQzE3IDEyIDE5IDE0IDIxIDEzIiBzdHJva2U9IiNBRERGRjIiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTMgMTZDNSAxNSA3IDE3IDkgMTZDMTEgMTUgMTMgMTcgMTUgMTZDMTcgMTUgMTkgMTcgMjEgMTYiIHN0cm9rZT0iI0FEREZGMiIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICA8Y2lyY2xlIGN4PSI2IiBjeT0iMTQiIHI9IjAuNSIgZmlsbD0iI0ZGRiIvPgogIDxjaXJjbGUgY3g9IjEwIiBjeT0iMTciIHI9IjAuNSIgZmlsbD0iI0ZGRiIvPgogIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTUiIHI9IjAuNSIgZmlsbD0iI0ZGRiIvPgo8L3N2Zz4=',
    description: 'Shallow water, streams, and ponds'
  },
  {
    id: 'deepWater',
    name: 'Deep Water',
    category: 'terrain',
    type: 'deepWater' as TerrainType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIyIiB5PSI4IiB3aWR0aD0iMjAiIGhlaWdodD0iMTIiIGZpbGw9IiMyNTYzRUIiIHN0cm9rZT0iIzE5MTk3MCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHBhdGggZD0iTTMgMTJDNSAxMSA3IDEzIDkgMTJDMTEgMTEgMTMgMTMgMTUgMTJDMTcgMTEgMTkgMTMgMjEgMTIiIHN0cm9rZT0iIzYzOTZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KICA8cGF0aCBkPSJNMyAxNUM1IDE0IDcgMTYgOSAxNUMxMSAxNCAxMyAxNiAxNSAxNUMxNyAxNCAxOSAxNiAyMSAxNSIgc3Ryb2tlPSIjNjM5NkZGIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zIDE4QzUgMTcgNyAxOSA5IDE4QzExIDE3IDEzIDE5IDE1IDE4QzE3IDE3IDE5IDE5IDIxIDE4IiBzdHJva2U9IiM2Mzk2RkYiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==',
    description: 'Deep lakes and large rivers'
  },
  {
    id: 'oceanWater',
    name: 'Ocean Water',
    category: 'terrain',
    type: 'oceanWater' as TerrainType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIyIiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIGZpbGw9IiMxRTNBOEEiIHN0cm9rZT0iIzBGMTQyOSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHBhdGggZD0iTTMgMTBDNSA5IDcgMTEgOSAxMEMxMSA5IDEzIDExIDE1IDEwQzE3IDkgMTkgMTEgMjEgMTAiIHN0cm9rZT0iIzM3NzNGRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTMgMTNDNSAxMiA3IDE0IDkgMTNDMTEgMTIgMTMgMTQgMTUgMTNDMTcgMTIgMTkgMTQgMjEgMTMiIHN0cm9rZT0iIzM3NzNGRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTMgMTZDNSAxNSA3IDE3IDkgMTZDMTEgMTUgMTMgMTcgMTUgMTZDMTcgMTUgMTkgMTcgMjEgMTYiIHN0cm9rZT0iIzM3NzNGRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTMgMTlDNSAxOCA3IDIwIDkgMTlDMTEgMTggMTMgMjAgMTUgMTlDMTcgMTggMTkgMjAgMjEgMTkiIHN0cm9rZT0iIzM3NzNGRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==',
    description: 'Deep ocean and seas'
  }
];
export const ROAD_ICONS: IconData[] = [
  {
    id: 'path',
    name: 'Path',
    category: 'road',
    type: 'path' as RoadType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMiAxMkM2IDEwIDEwIDEwIDE0IDEyQzE4IDEwIDIyIDEwIDIyIDEyIiBzdHJva2U9IiM4QjQ1MTMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWRhc2hhcnJheT0iMiwyIi8+CiAgPGNpcmNsZSBjeD0iNiIgY3k9IjExIiByPSIwLjUiIGZpbGw9IiM4QjQ1MTMiLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIwLjUiIGZpbGw9IiM4QjQ1MTMiLz4KICA8Y2lyY2xlIGN4PSIxOCIgY3k9IjExIiByPSIwLjUiIGZpbGw9IiM4QjQ1MTMiLz4KPC9zdmc+',
    description: 'Dirt path or trail'
  },
  {
    id: 'road',
    name: 'Road',
    category: 'road',
    type: 'road' as RoadType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMiAxMEMyIDEwIDEwIDEwIDE0IDEyQzE4IDEwIDIyIDEwIDIyIDEwVjE0QzIyIDE0IDE4IDE0IDE0IDEyQzEwIDE0IDIgMTQgMiAxNFYxMFoiIGZpbGw9IiM2OTY5NjkiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHBhdGggZD0iTTIgMTJIMjIiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmF5PSIzLDIiLz4KPC9zdmc+',
    description: 'Paved road'
  },
  {
    id: 'highway',
    name: 'Highway',
    category: 'road',
    type: 'highway' as RoadType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMiA5QzIgOSAxMCA5IDE0IDExQzE4IDkgMjIgOSAyMiA5VjE1QzIyIDE1IDE4IDE1IDE0IDEzQzEwIDE1IDIgMTUgMiAxNVY5WiIgZmlsbD0iIzMzMzMzMyIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cGF0aCBkPSJNMiAxMUgyMiIgc3Ryb2tlPSIjRkZGRjAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWRhc2hhcnJheT0iNCwyIi8+CiAgPHBhdGggZD0iTTIgMTNIMjIiIHN0cm9rZT0iI0ZGRkYwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjQsMiIvPgo8L3N2Zz4=',
    description: 'Major highway or trade route'
  }
];

export const STRUCTURE_ICONS: IconData[] = [
  {
    id: 'village',
    name: 'Village',
    category: 'structure',
    type: 'village' as LandmarkType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSI2IiB5PSIxNCIgd2lkdGg9IjMiIGhlaWdodD0iNCIgZmlsbD0iIzhCNDUxMyIgc3Ryb2tlPSIjNjU0MzIxIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSIxMiIgeT0iMTUiIHdpZHRoPSIzIiBoZWlnaHQ9IjMiIGZpbGw9IiM4QjQ1MTMiIHN0cm9rZT0iIzY1NDMyMSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI2LDE0IDcuNSwxMSA5LDE0IiBmaWxsPSIjREMxNDNDIiBzdHJva2U9IiM4QjAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxwb2x5Z29uIHBvaW50cz0iMTIsMTUgMTMuNSwxMiAxNSwxNSIgZmlsbD0iI0RDMTQzQyIgc3Ryb2tlPSIjOEIwMDAwIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSI3IiB5PSIxNiIgd2lkdGg9IjAuNSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+CiAgPHJlY3QgeD0iMTMiIHk9IjE2IiB3aWR0aD0iMC41IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+',
    description: 'Small village settlement'
  },
  {
    id: 'hamlet',
    name: 'Hamlet',
    category: 'structure',
    type: 'hamlet' as LandmarkType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSI5IiB5PSIxNSIgd2lkdGg9IjMiIGhlaWdodD0iMyIgZmlsbD0iIzhCNDUxMyIgc3Ryb2tlPSIjNjU0MzIxIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cG9seWdvbiBwb2ludHM9IjksMTUgMTAuNSwxMiAxMiwxNSIgZmlsbD0iI0RDMTQzQyIgc3Ryb2tlPSIjOEIwMDAwIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSIxMCIgeT0iMTYiIHdpZHRoPSIwLjUiIGhlaWdodD0iMSIgZmlsbD0iIzAwMCIvPgogIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTciIHI9IjEiIGZpbGw9IiMyMjhCMjIiLz4KPC9zdmc+',
    description: 'Tiny hamlet or homestead'
  },
  {
    id: 'town',
    name: 'Town',
    category: 'structure',
    type: 'town' as LandmarkType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSI0IiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNiIgZmlsbD0iIzhCNDUxMyIgc3Ryb2tlPSIjNjU0MzIxIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSI5IiB5PSIxMCIgd2lkdGg9IjQiIGhlaWdodD0iOCIgZmlsbD0iIzhCNDUxMyIgc3Ryb2tlPSIjNjU0MzIxIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSIxNCIgeT0iMTQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM4QjQ1MTMiIHN0cm9rZT0iIzY1NDMyMSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI0LDEyIDYsOCA4LDEyIiBmaWxsPSIjREMxNDNDIiBzdHJva2U9IiM4QjAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxwb2x5Z29uIHBvaW50cz0iOSwxMCAxMSw2IDEzLDEwIiBmaWxsPSIjREMxNDNDIiBzdHJva2U9IiM4QjAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxwb2x5Z29uIHBvaW50cz0iMTQsMTQgMTYsMTAgMTgsMTQiIGZpbGw9IiNEQzE0M0MiIHN0cm9rZT0iIzhCMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHJlY3QgeD0iNSIgeT0iMTQiIHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiLz4KICA8cmVjdCB4PSIxMCIgeT0iMTIiIHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiLz4KICA8cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiLz4KPC9zdmc+',
    description: 'Small settlement'
  },
  {
    id: 'city',
    name: 'City',
    category: 'structure',
    type: 'city' as LandmarkType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIyIiB5PSIxNCIgd2lkdGg9IjMiIGhlaWdodD0iNiIgZmlsbD0iIzY5Njk2OSIgc3Ryb2tlPSIjMkYyRjJGIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSI2IiB5PSIxMCIgd2lkdGg9IjMiIGhlaWdodD0iMTAiIGZpbGw9IiM2OTY5NjkiIHN0cm9rZT0iIzJGMkYyRiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHJlY3QgeD0iMTAiIHk9IjgiIHdpZHRoPSI0IiBoZWlnaHQ9IjEyIiBmaWxsPSIjNjk2OTY5IiBzdHJva2U9IiMyRjJGMkYiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxyZWN0IHg9IjE1IiB5PSIxMiIgd2lkdGg9IjMiIGhlaWdodD0iOCIgZmlsbD0iIzY5Njk2OSIgc3Ryb2tlPSIjMkYyRjJGIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSIxOSIgeT0iMTYiIHdpZHRoPSIzIiBoZWlnaHQ9IjQiIGZpbGw9IiM2OTY5NjkiIHN0cm9rZT0iIzJGMkYyRiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHJlY3QgeD0iMi41IiB5PSIxNSIgd2lkdGg9IjAuNSIgaGVpZ2h0PSIxIiBmaWxsPSIjRkZENzAwIi8+CiAgPHJlY3QgeD0iNCIgeT0iMTUiIHdpZHRoPSIwLjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGRDcwMCIvPgogIDxyZWN0IHg9IjYuNSIgeT0iMTIiIHdpZHRoPSIwLjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGRDcwMCIvPgogIDxyZWN0IHg9IjgiIHk9IjEyIiB3aWR0aD0iMC41IiBoZWlnaHQ9IjEiIGZpbGw9IiNGRkQ3MDAiLz4KICA8cmVjdCB4PSIxMSIgeT0iMTAiIHdpZHRoPSIwLjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGRDcwMCIvPgogIDxyZWN0IHg9IjEyLjUiIHk9IjEwIiB3aWR0aD0iMC41IiBoZWlnaHQ9IjEiIGZpbGw9IiNGRkQ3MDAiLz4KICA8cmVjdCB4PSIxNiIgeT0iMTQiIHdpZHRoPSIwLjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGRDcwMCIvPgogIDxyZWN0IHg9IjIwIiB5PSIxNyIgd2lkdGg9IjAuNSIgaGVpZ2h0PSIxIiBmaWxsPSIjRkZENzAwIi8+Cjwvc3ZnPg==',
    description: 'Large urban center'
  },
  {
    id: 'marker',
    name: 'Generic Marker',
    category: 'marker',
    type: 'marker' as LandmarkType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjRkY2MzQ3IiBzdHJva2U9IiNEQzE0M0MiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNGRkYiIHN0cm9rZT0iI0RDMTQzQyIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iMTIiIHk9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iI0RDMTQzQyI+PzwvdGV4dD4KPC9zdmc+',
    description: 'Generic point of interest'
  }
];

export const MARKER_ICONS: IconData[] = [
  {
    id: 'marker',
    name: 'Generic Marker',
    category: 'marker',
    type: 'marker' as LandmarkType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjRkY2MzQ3IiBzdHJva2U9IiNEQzE0M0MiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNGRkYiIHN0cm9rZT0iI0RDMTQzQyIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iMTIiIHk9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iI0RDMTQzQyI+PzwvdGV4dD4KPC9zdmc+',
    description: 'Generic point of interest'
  }
];

export const ALL_ICONS = [...TERRAIN_ICONS, ...ROAD_ICONS, ...STRUCTURE_ICONS, ...MARKER_ICONS];