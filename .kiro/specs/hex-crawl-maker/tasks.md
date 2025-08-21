# Implementation Plan

- [x] 1. Set up React project structure and core dependencies

  - Initialize React TypeScript project with Create React App or Vite
  - Install required dependencies: Redux Toolkit, styled-components, canvas utilities
  - Set up project folder structure for components, hooks, types, and utilities
  - Configure TypeScript strict mode and ESLint rules
  - _Requirements: All requirements depend on proper project setup_

- [x] 2. Implement core data types and coordinate system

  - Create TypeScript interfaces for HexCoordinate, HexCell, MapData, and GridAppearance
  - Implement axial coordinate conversion functions (hex-to-pixel, pixel-to-hex)
  - Write utility functions for hex distance calculation and neighbor finding
  - Create unit tests for coordinate system functions
  - _Requirements: 1.3, 2.3, 2.1.4, 5.3_

- [x] 3. Create Redux store and state management

  - Set up Redux Toolkit store with slices for map data, UI state, and exploration state
  - Implement actions and reducers for map creation, icon placement, and mode switching
  - Create selectors for accessing hex data, visibility state, and current mode
  - Add middleware for localStorage persistence of map and exploration data
  - _Requirements: 1.6, 4.1, 4.2, 4.4_

- [x] 4. Build basic hex grid rendering component

  - Create HexGrid React component with HTML5 Canvas
  - Implement basic hexagon drawing functions with proper spacing and alignment
  - Add coordinate system integration to render hexes at correct positions
  - Implement zoom and pan functionality with mouse/touch events
  - Create responsive canvas sizing that adapts to container dimensions
  - _Requirements: 5.1, 5.2, 3.2, 3.4_

- [x] 5. Implement hex cell interaction and selection

  - Add click detection for individual hex cells using coordinate conversion
  - Create visual feedback for hex hover and selection states
  - Implement HexCell component logic for managing individual cell state
  - Add support for displaying hex coordinates for debugging/development
  - Write tests for click detection and coordinate conversion accuracy
  - _Requirements: 1.7, 2.2, 2.1.5_

- [x] 6. Create icon palette and drag-and-drop system

  - Design and implement IconPalette component with categorized icon sections
  - Create SVG icon assets for terrain types (mountains, plains, swamps, water, desert)
  - Add structure icons (towers, towns, cities) and generic markers
  - Implement HTML5 drag-and-drop functionality for icons from palette to hex grid
  - Add visual feedback during drag operations (ghost image, drop zones)
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 7. Implement icon placement and hex content management

  - Add drop event handling to hex cells for receiving dragged icons
  - Create logic for placing icons on hexes and updating cell state
  - Implement icon rendering within hex cells on the canvas
  - Add support for replacing existing icons when dropping new ones
  - Create visual indicators for hexes that contain icons
  - _Requirements: 1.3, 1.4, 1.7_

- [x] 8. Build property dialog for hex content editing

  - Create PropertyDialog modal component for editing hex properties
  - Add form fields for name, description, and GM notes with proper validation
  - Implement dialog opening when icons are placed or existing hexes are clicked
  - Add icon type selection dropdown for changing placed icons
  - Connect dialog to Redux state for saving and loading hex properties
  - _Requirements: 1.4, 1.5, 1.7_

-
-

- [x] 9. Implement GM and Player mode switching

  - Create ModeToggle component for switching between creation and exploration modes
  - Add UI state management for hiding/showing mode-specific controls
  - Implement different rendering logic for GM view (all visible) vs Player view (exploration-based)
  - Add smooth transitions between modes without losing current state
  - Create mode-specific styling and layout adjustments
  - _Requirements: 2.1, 2.5, 3.5_

- [x] 10. Build player positioning and movement system

  - Add player position markers that can be placed and moved on the hex grid
  - Implement click-to-move functionality for updating player positions
  - Create visual representation of player tokens on the grid
  - Add support for multiples2, 2.1.4, 2.1.5\_

- [x] 11. Implement sight distance and exploration mechanics

  - Create PlayerControls component with sight distance slider (1-5 hexes)
  - Implement hex visibility calculation based on player position and sight distance
  - Add logic for revealing hexes within sight range when players move
  - Create visual distinction between explored, visible, and unexplored hexes
  - Write tests for sight distance calculations and hex visibility logic
  - _Requirements: 2.2, 2.3, 2.1.1, 2.1.2_

- [x] 12. Add permanent vs line-of-sight reveal modes

  - Implement toggle switch for permanent reveals vs line-of-sight mode
  - Create logic for permanent reveal mode (keep all revealed hexes visible)
  - Add line-of-sight mode that hides hexes when players move away
  - Update hex visibility rendering based on selected reveal mode
  - Add state persistence for reveal mode preference
  - _Requirements: 2.1.1, 2.1.2, 2.1.3, 2.1.4, 2.1.5_

- [x] 13. Implement map customization and appearance settings

  - Create settings panel for customizing grid dimensions (width/height)
  - Add controls for hex size, colors, and border styles
  - Implement terrain type visual differentiation with background colors/patterns
  - Add font size controls for projection-friendly text display
  - Connect appearance settings to Redux state and localStorage persistence
  - _Requirements: 5.1, 5.2, 5.4, 5.5, 3.1, 3.3_

- [x] 14. Add map persistence and loading functionality

  - Implement save/load system using localStorage for map data
  - Create map management UI for creating, naming, and selecting maps
  - Add export/import functionality for sharing maps between sessions
  - Implement data validation and error handling for corrupted save data
  - Add automatic save functionality to prevent data loss
  - _Requirements: 1.6, 4.1, 4.2, 4.3_

- [x] 15. Optimize for projection and streaming display

  - Implement high contrast color schemes suitable for projection
  - Add fullscreen mode for distraction-free player view
  - Optimize text sizing and icon scaling for various screen resolutions
  - Create projection-specific CSS styles with larger fonts and clearer visuals
  - Add keyboard shortcuts for common GM operations during live play
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 16. Add comprehensive testing and error handling

  - Write unit tests for all utility functions and Redux reducers
  - Create integration tests for drag-and-drop workflow and mode switching
  - Add error boundaries for graceful handling of rendering errors
  - Implement localStorage error handling with fallback to default state
  - Add performance monitoring for large grids and optimization warnings
  - _Requirements: All requirements - testing ensures reliability_

- [x] 17. Polish UI/UX and add final features

  - Implement smooth animations for mode transitions and hex reveals
  - Add tooltips and help text for new users
  - Create keyboard shortcuts reference and help documentation
  - Add undo/redo functionality for map editing operations
  - Implement final styling polish and responsive design improvements
  - _Requirements: 3.5, 5.5 - enhances overall user experience_

- [x] 18. Implement comprehensive keyboard shortcuts system

  - Add number key shortcuts (1-9) for quick terrain selection from palette
  - Implement spacebar toggle for GM/Player mode switching
  - Add arrow keys for map panning and +/- keys for zoom control
  - Create Ctrl+Z/Y for undo/redo operations (enhance existing system)
  - Add Escape key to cancel current operations and clear selections
  - Implement Tab key for cycling through terrain types in quick mode
  - Create keyboard shortcuts help overlay (F1 or ?) with visual reference
  - _Requirements: Enhances productivity and professional workflow_

- [x] 19. Add brush size tools for area painting

  - Implement brush size selector (1x1, 3x3, 5x5, 7x7 hex areas)
  - Create brush preview overlay showing affected hexes on hover
  - Add brush shape options (circle, square, diamond patterns)
  - Implement smart brush logic that respects hex boundaries
  - Add brush size keyboard shortcuts (B key + number)
  - Create visual feedback for brush size and shape selection
  - Optimize rendering performance for large brush operations
  - _Requirements: Enables rapid terrain placement for large areas_

- [x] 20. Implement flood fill tool for connected areas

  - Add flood fill button/tool to GM controls panel
  - Implement flood fill algorithm for connected hexes of same terrain type
  - Create preview mode showing which hexes will be affected
  - Add confirmation dialog for large flood fill operations
  - Implement flood fill with terrain type selection
  - Add keyboard shortcut (F key) for quick flood fill access
  - Create undo support specifically for flood fill operations
  - _Requirements: One-click filling of large connected regions_

- [ ] 21. Build copy/paste system for terrain patterns

  - Implement rectangular selection tool for choosing hex areas
  - Add copy (Ctrl+C) and paste (Ctrl+V) functionality for selected regions
  - Create visual selection rectangle with drag-to-select behavior
  - Implement pattern clipboard that persists between sessions
  - Add paste preview showing where pattern will be placed
  - Create pattern library for saving and reusing common layouts
  - Add rotation and mirroring options for pasted patterns
  - _Requirements: Reuse common terrain layouts and speed up map creation_

- [x] 22. Enhance mobile and touch device support

  - Implement touch gestures: pinch-to-zoom, two-finger pan
  - Add touch-friendly UI with larger buttons and touch targets
  - Create mobile-optimized palette with swipe navigation
  - Implement long-press for context menus and hex property access
  - Add haptic feedback for touch interactions where supported
  - Create responsive layout that works on tablets and phones
  - Optimize performance for mobile devices and touch rendering
  - _Requirements: Enable map creation and play on tablets during sessions_

- [x] 23. Expand terrain types and implement road overlay system

  - Add new terrain types: Hills, Shallow Water, Deep Water, Ocean Water
  - Create SVG icons and color schemes for new terrain types
  - Implement road system as overlay that works on any terrain type
  - Add road types: Path (dirt trail), Road (paved), Highway (major route)
  - Create road connection system for linking adjacent hexes
  - Add road-specific drag and drop functionality
  - Implement road rendering that overlays on terrain without replacing it
  - Add road colors and styling options to appearance settings
  - Create road-specific flood fill and brush tools
  - Update property dialog to handle road placement and connections
  - _Requirements: Dramatically expand terrain variety and add transportation networks_

- [x] 27. Expand landmark types with comprehensive point of interest system

  - Add settlement types: Village, Hamlet (in addition to existing Town, City)
  - Add ruin types: Ancient Ruins, Recently Abandoned Ruins
  - Add fortification types: Castle, Fortress, Watchtower, Signal Fire
  - Add underground entrances: Mine Entrance, Cave Mouth
  - Add ancient sites: Standing Stones, Stone Circle
  - Add religious sites: Temple, Shrine, Wizard Tower
  - Add trade locations: Trading Post, Roadhouse
  - Add water crossings: Bridge, Ford, Ferry Crossing
  - Add temporary sites: Campsite, Hunter's Lodge
  - Create unique SVG icons for each landmark type with appropriate styling
  - Update type system to support all new landmark categories
  - _Requirements: Provide comprehensive variety of points of interest for rich campaign worlds_

- [ ] 24. Implement session snapshot and version management

  - Create session snapshot system for saving map state at specific points
  - Add snapshot naming and description functionality
  - Implement snapshot comparison view showing changes between versions
  - Create automatic snapshot creation at session start/end
  - Add snapshot restoration with confirmation for data safety
  - Implement snapshot export/import for sharing campaign states
  - Create snapshot timeline view for easy navigation between versions
  - _Requirements: Never lose progress and track campaign evolution_

- [x] 25. Build comprehensive image export system

  - Implement high-resolution PNG export with customizable DPI settings
  - Add PDF export with multiple page support for large maps
  - Create export options: full map, visible area, or selected region
  - Implement layer-based export (terrain only, with labels, GM notes, etc.)
  - Add print-friendly export with proper scaling and margins
  - Create batch export functionality for multiple map versions
  - Implement watermark and attribution options for shared maps
  - _Requirements: Share beautiful maps with players and other GMs_

- [x] 26. Create terrain template and quick-start system

  - Design common terrain templates (forest region, mountain range, coastal area)
  - Implement biome generators with realistic terrain distribution
  - Create campaign starter templates (village surroundings, dungeon approaches)
  - Add procedural generation options with customizable parameters
  - Implement template preview and customization before application
  - Create template sharing system for community-created content
  - Add template categories and search functionality
  - _Requirements: Quick start options and realistic terrain generation_
