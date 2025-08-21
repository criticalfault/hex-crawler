# Design Document

## Overview

The Hex Crawl Maker and Player is a web-based application built using modern web technologies to support West Marches style D&D campaigns. The application features a dual-mode interface: a GM creation mode for map design and a player exploration mode for progressive map revelation. The system uses a hexagonal grid coordinate system and implements drag-and-drop functionality for intuitive map creation.

## Architecture

The application is built as a React application with local storage persistence, using:

- **Frontend Framework**: React 18+ with TypeScript for type safety, component-based architecture, and modern React features (hooks, concurrent rendering)
- **State Management**: Redux Toolkit for managing application state including map data, exploration state, and UI modes
- **Rendering**: HTML5 Canvas with a hexagonal grid rendering engine for smooth performance
- **Drag & Drop**: HTML5 Drag and Drop API for icon placement
- **Persistence**: Browser localStorage for map and exploration data storage
- **Styling**: CSS-in-JS (styled-components) for responsive design and projection-friendly styling

### Key Architectural Decisions

1. **React-based architecture**: Leverages React's component lifecycle, state management, and virtual DOM for efficient UI updates
2. **Client-side only**: Eliminates server dependencies and allows offline usage during gaming sessions
3. **Canvas-based rendering**: Provides smooth performance for large hex grids and real-time updates within React components
4. **Coordinate system**: Uses axial coordinates for hexagonal grids (q, r) for efficient neighbor calculations
5. **Component separation**: Clear separation between GM and Player mode React components for maintainability

## Components and Interfaces

### Core Components

#### HexGrid Component

- Renders the hexagonal grid using HTML5 Canvas
- Handles coordinate conversion between screen pixels and hex coordinates
- Manages zoom and pan functionality
- Supports both GM and Player view modes

#### IconPalette Component

- Displays draggable terrain and landmark icons
- Categories: Terrain (mountains, plains, swamps, water, desert), Structures (towers, towns, cities), Markers (generic)
- Implements HTML5 drag events for icon selection

#### HexCell Component

- Represents individual hexagon cells
- Handles drop events for icon placement
- Manages cell state (explored/unexplored, contents, visibility)
- Renders cell contents (terrain, landmarks, descriptions)

#### ModeToggle Component

- Switches between GM Creation and Player Exploration modes
- Manages UI state transitions
- Handles mode-specific control visibility

#### PlayerControls Component

- Sight distance slider (1-5 hexes)
- Reveal mode toggle (Permanent vs Line of Sight)
- Player position controls
- Exploration reset functionality

#### PropertyDialog Component

- Modal dialog for editing hex contents
- Form fields for name, description, and GM notes
- Icon type selection and modification

### Data Interfaces

```typescript
interface HexCoordinate {
  q: number; // axial coordinate
  r: number; // axial coordinate
}

interface HexCell {
  coordinate: HexCoordinate;
  terrain?: TerrainType;
  landmark?: LandmarkType;
  name?: string;
  description?: string;
  gmNotes?: string;
  isExplored: boolean;
  isVisible: boolean;
}

interface MapData {
  id: string;
  name: string;
  dimensions: { width: number; height: number };
  cells: Map<string, HexCell>; // keyed by "q,r"
  playerPositions: HexCoordinate[];
  sightDistance: number;
  revealMode: "permanent" | "lineOfSight";
  appearance: GridAppearance;
}

interface GridAppearance {
  hexSize: number;
  borderColor: string;
  backgroundColor: string;
  unexploredColor: string;
  textSize: number;
}
```

## Data Models

### Hex Coordinate System

The application uses axial coordinates (q, r) for hexagonal grids, which simplifies distance calculations and neighbor finding. Conversion functions handle translation between axial coordinates and screen pixels.

### Map Storage Structure

Maps are stored as JSON objects in localStorage with the following hierarchy:

- Map metadata (name, dimensions, settings)
- Cell data indexed by coordinate strings
- Exploration state separate from map content
- Appearance customizations

### Icon System

Icons are categorized and stored as SVG assets:

- **Terrain Icons**: Mountains, Plains, Swamps, Water, Desert
- **Structure Icons**: Towers, Towns, Cities
- **Marker Icons**: Generic markers with customizable colors

## Error Handling

### Data Persistence Errors

- **localStorage full**: Graceful degradation with warning message
- **Corrupted data**: Validation with fallback to default state
- **Version conflicts**: Migration system for data format updates

### User Input Validation

- **Coordinate bounds**: Prevent placement outside grid boundaries
- **Icon conflicts**: Handle multiple icons per hex with stacking or replacement options
- **Invalid sight distance**: Clamp values to reasonable ranges (1-10 hexes)

### Rendering Errors

- **Canvas context loss**: Automatic re-initialization and redraw
- **Performance degradation**: Dynamic level-of-detail for large grids
- **Memory management**: Cleanup of unused canvas resources

## Testing Strategy

### Unit Testing

- **Coordinate conversion functions**: Test pixel-to-hex and hex-to-pixel conversions
- **Distance calculations**: Verify sight distance and neighbor finding algorithms
- **State management**: Test Redux reducers and action creators
- **Data validation**: Test input sanitization and bounds checking

### Integration Testing

- **Drag and drop workflow**: Test complete icon placement process
- **Mode switching**: Verify state preservation between GM and Player modes
- **Persistence**: Test save/load functionality with various data scenarios
- **Exploration mechanics**: Test sight distance and reveal mode behaviors

### Visual Testing

- **Cross-browser compatibility**: Test rendering consistency across browsers
- **Responsive design**: Verify layout adaptation to different screen sizes
- **Projection readability**: Test visibility at various resolutions and distances
- **Performance testing**: Measure frame rates with large grids and many icons

### User Acceptance Testing

- **GM workflow**: Test complete map creation and editing process
- **Player experience**: Verify exploration mechanics feel intuitive
- **Streaming compatibility**: Test with actual projection setups
- **Session continuity**: Verify data persistence across browser sessions
