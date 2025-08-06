/**
 * Icon-related types and data structures
 */

import { TerrainType, LandmarkType } from './hex';

export interface IconData {
  id: string;
  name: string;
  category: 'terrain' | 'structure' | 'marker';
  type: TerrainType | LandmarkType;
  svgPath: string;
  description: string;
}

export interface DragData {
  iconId: string;
  category: 'terrain' | 'structure' | 'marker';
  type: TerrainType | LandmarkType;
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
  }
];

export const STRUCTURE_ICONS: IconData[] = [
  {
    id: 'tower',
    name: 'Tower',
    category: 'structure',
    type: 'tower' as LandmarkType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSI5IiB5PSI2IiB3aWR0aD0iNiIgaGVpZ2h0PSIxNCIgZmlsbD0iIzY5Njk2OSIgc3Ryb2tlPSIjMkYyRjJGIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSI4IiB5PSIxOCIgd2lkdGg9IjgiIGhlaWdodD0iMiIgZmlsbD0iIzY5Njk2OSIgc3Ryb2tlPSIjMkYyRjJGIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSIxMCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iMyIgZmlsbD0iIzhCNDUxMyIgc3Ryb2tlPSIjNjU0MzIxIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSIxMC41IiB5PSI4IiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjMDAwIi8+CiAgPHJlY3QgeD0iMTIuNSIgeT0iOCIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjEwLjUiIHk9IjEyIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjMDAwIi8+CiAgPHJlY3QgeD0iMTIuNSIgeT0iMTIiIHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiLz4KICA8cmVjdCB4PSIxMC41IiB5PSIxNiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iIzAwMCIvPgogIDxyZWN0IHg9IjEyLjUiIHk9IjE2IiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjMDAwIi8+Cjwvc3ZnPg==',
    description: 'Watchtower or wizard tower'
  },
  {
    id: 'town',
    name: 'Town',
    category: 'structure',
    type: 'town' as LandmarkType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSI0IiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNiIgZmlsbD0iIzhCNDUxMyIgc3Ryb2tlPSIjNjU0MzIxIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSI5IiB5PSIxMCIgd2lkdGg9IjQiIGhlaWdodD0iOCIgZmlsbD0iIzhCNDUxMyIgc3Ryb2tlPSIjNjU0MzIxIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSIxNCIgeT0iMTQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM4QjQ1MTMiIHN0cm9rZT0iIzY1NDMyMSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI0LDEyIDYsOCA4LDEyIiBmaWxsPSIjREMxNDNDIiBzdHJva2U9IiM4QjAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxwb2x5Z29uIHBvaW50cz0iOSwxMCAxMSw2IDEzLDEwIiBmaWxsPSIjREMxNDNDIiBzdHJva2U9IiM4QjAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxwb2x5Z29uIHBvaW50cz0iMTQsMTQgMTYsMTAgMTgsMTQiIGZpbGw9IiNEQzE0M0MiIHN0cm9rZT0iIzhCMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHJlY3QgeD0iNSIgeT0iMTQiIHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiLz4KICA8cmVjdCB4PSIxMCIgeT0iMTIiIHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiLz4KICA8cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiLz4KICA8cmVjdCB4PSIxOSIgeT0iMTgiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiMyMjhCMjIiLz4KPC9zdmc+',
    description: 'Small settlement'
  },
  {
    id: 'city',
    name: 'City',
    category: 'structure',
    type: 'city' as LandmarkType,
    svgPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIyIiB5PSIxNCIgd2lkdGg9IjMiIGhlaWdodD0iNiIgZmlsbD0iIzY5Njk2OSIgc3Ryb2tlPSIjMkYyRjJGIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSI2IiB5PSIxMCIgd2lkdGg9IjMiIGhlaWdodD0iMTAiIGZpbGw9IiM2OTY5NjkiIHN0cm9rZT0iIzJGMkYyRiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHJlY3QgeD0iMTAiIHk9IjgiIHdpZHRoPSI0IiBoZWlnaHQ9IjEyIiBmaWxsPSIjNjk2OTY5IiBzdHJva2U9IiMyRjJGMkYiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxyZWN0IHg9IjE1IiB5PSIxMiIgd2lkdGg9IjMiIGhlaWdodD0iOCIgZmlsbD0iIzY5Njk2OSIgc3Ryb2tlPSIjMkYyRjJGIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cmVjdCB4PSIxOSIgeT0iMTYiIHdpZHRoPSIzIiBoZWlnaHQ9IjQiIGZpbGw9IiM2OTY5NjkiIHN0cm9rZT0iIzJGMkYyRiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHJlY3QgeD0iMi41IiB5PSIxNSIgd2lkdGg9IjAuNSIgaGVpZ2h0PSIxIiBmaWxsPSIjRkZENzAwIi8+CiAgPHJlY3QgeD0iNCIgeT0iMTUiIHdpZHRoPSIwLjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGRDcwMCIvPgogIDxyZWN0IHg9IjYuNSIgeT0iMTIiIHdpZHRoPSIwLjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGRDcwMCIvPgogIDxyZWN0IHg9IjgiIHk9IjEyIiB3aWR0aD0iMC41IiBoZWlnaHQ9IjEiIGZpbGw9IiNGRkQ3MDAiLz4KICA8cmVjdCB4PSIxMSIgeT0iMTAiIHdpZHRoPSIwLjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGRDcwMCIvPgogIDxyZWN0IHg9IjEyLjUiIHk9IjEwIiB3aWR0aD0iMC41IiBoZWlnaHQ9IjEiIGZpbGw9IiNGRkQ3MDAiLz4KICA8cmVjdCB4PSIxNiIgeT0iMTQiIHdpZHRoPSIwLjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGRDcwMCIvPgogIDxyZWN0IHg9IjIwIiB5PSIxNyIgd2lkdGg9IjAuNSIgaGVpZ2h0PSIxIiBmaWxsPSIjRkZENzAwIi8+Cjwvc3ZnPg==',
    description: 'Large urban center'
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

export const ALL_ICONS = [...TERRAIN_ICONS, ...STRUCTURE_ICONS, ...MARKER_ICONS];