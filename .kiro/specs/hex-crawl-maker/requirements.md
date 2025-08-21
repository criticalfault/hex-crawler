# Requirements Document

## Introduction

The Hex Crawl Maker and Player is a web-based application designed to support West Marches style D&D games by providing two distinct modes: a GM creation mode for designing hex-based maps with landmarks and points of interest, and a player mode that reveals the map progressively as players explore. The application should be suitable for streaming to TVs or projectors during live gaming sessions.

## Requirements

### Requirement 1

**User Story:** As a Game Master, I want to create hex-based maps by dragging and dropping terrain and landmark icons, so that I can quickly design exploration content for my West Marches campaign.

#### Acceptance Criteria

1. WHEN the GM opens the application THEN the system SHALL display a GM creation mode interface with a palette of draggable icons
2. WHEN the GM views the icon palette THEN the system SHALL provide terrain icons including mountains, plains, swamps, water, desert, and structure icons including towers, towns, cities, and generic markers
3. WHEN the GM drags an icon from the palette THEN the system SHALL allow dropping it onto any hex on the grid
4. WHEN an icon is dropped onto a hex THEN the system SHALL place the icon and open a dialog for adding name, description, and GM notes
5. WHEN the GM adds description and notes THEN the system SHALL store this information with the placed icon
6. WHEN the GM saves the map THEN the system SHALL persist all placed icons, their positions, and associated text data
7. IF the GM wants to edit an existing icon THEN the system SHALL allow modification of its type, description, and notes by clicking on it

### Requirement 2

**User Story:** As a Game Master, I want to switch to a player mode that hides unexplored areas and reveals them based on player movement and sight distance, so that I can create realistic exploration during gameplay.

#### Acceptance Criteria

1. WHEN the GM switches to player mode THEN the system SHALL hide all unexplored hexes from view
2. WHEN the GM places players on a hex THEN the system SHALL reveal hexes within the configured sight distance from that position
3. WHEN the GM adjusts sight distance THEN the system SHALL allow setting how many hexes in all directions players can see (1 hex = adjacent hexes, 2 hexes = two rings out, etc.)
4. WHEN hexes are revealed by sight THEN the system SHALL display the hex contents including any terrain or landmark icons
5. WHEN the GM switches back to creation mode THEN the system SHALL restore full map visibility

### Requirement 2.1

**User Story:** As a Game Master, I want to choose between permanent reveals and line-of-sight reveals, so that I can adapt the exploration mechanics to different gameplay styles.

#### Acceptance Criteria

1. WHEN the GM enables "permanent reveals" mode THEN the system SHALL keep all previously revealed hexes visible even when players move away
2. WHEN the GM enables "line of sight" mode THEN the system SHALL only show hexes currently within sight distance of player positions
3. WHEN switching between reveal modes THEN the system SHALL immediately update the visible hexes according to the selected mode
4. WHEN in line-of-sight mode and players move THEN the system SHALL hide previously visible hexes that are now out of range
5. IF players return to a previously visited area in line-of-sight mode THEN the system SHALL re-reveal those hexes based on current sight distance

### Requirement 3

**User Story:** As a Game Master, I want the player view to be suitable for streaming or projection, so that remote and in-person players can follow the exploration together.

#### Acceptance Criteria

1. WHEN displaying the player view THEN the system SHALL use high contrast colors suitable for projection
2. WHEN the map is displayed THEN the system SHALL scale appropriately for different screen sizes and resolutions
3. WHEN text is shown on landmarks THEN the system SHALL use fonts large enough to be readable from a distance
4. IF the display is projected THEN the system SHALL maintain visual clarity at various projection sizes
5. WHEN switching between modes THEN the system SHALL provide smooth transitions without jarring visual changes

### Requirement 4

**User Story:** As a Game Master, I want to track player movement and exploration history, so that I can maintain consistency in revealed areas across sessions.

#### Acceptance Criteria

1. WHEN a hex is revealed THEN the system SHALL mark it as explored and keep it visible in future sessions
2. WHEN the GM loads a saved map THEN the system SHALL restore the previous exploration state
3. WHEN players move to a new hex THEN the system SHALL allow the GM to mark their current position
4. IF the GM needs to hide a previously revealed hex THEN the system SHALL allow toggling hex visibility
5. WHEN exploration data is saved THEN the system SHALL preserve both map content and exploration progress

### Requirement 5

**User Story:** As a Game Master, I want to customize the hex grid size and appearance, so that I can adapt the tool to different campaign scales and visual preferences.

#### Acceptance Criteria

1. WHEN creating a new map THEN the system SHALL allow selection of grid dimensions (width and height in hexes)
2. WHEN customizing appearance THEN the system SHALL allow modification of hex size, colors, and border styles
3. WHEN changing grid settings THEN the system SHALL preserve existing landmark placements relative to their hex positions
4. IF the GM wants different terrain types THEN the system SHALL provide visual differentiation options for hex backgrounds
5. WHEN appearance changes are made THEN the system SHALL apply them consistently across both GM and player modes