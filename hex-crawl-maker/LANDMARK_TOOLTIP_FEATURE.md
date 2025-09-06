# Landmark Tooltip Feature

## Overview

The landmark tooltip feature allows players to see basic information about landmarks when hovering over hexes in player mode. This provides a quick way to get information about points of interest without needing to open detailed dialogs.

## How It Works

### For Players
- When in **Player Mode**, hover over any hex that contains a landmark
- If the landmark has a name and/or description set by the GM, a tooltip will appear
- The tooltip shows:
  - **Name** (in gold text) - if set
  - **Description** (in light gray text) - if set
- The tooltip only appears for landmarks that are visible to the player (based on exploration and line-of-sight rules)

### For GMs
- In **GM Mode**, tooltips are not shown (GMs can click on hexes to open the full property dialog)
- GMs can set landmark names and descriptions through the property dialog when placing or editing landmarks
- Only landmarks with at least a name OR description will show tooltips to players

## Visibility Rules

The tooltip respects the same visibility rules as the hex grid:
- **Permanent Exploration Mode**: Tooltips only show for explored hexes
- **Line of Sight Mode**: Tooltips only show for currently visible hexes
- Unexplored or invisible hexes will not show tooltips, even if they contain landmarks

## Styling

The tooltip features:
- Dark semi-transparent background for good readability
- Gold-colored landmark names for emphasis
- Light gray descriptions for secondary information
- Smooth fade-in/fade-out animations
- Automatic positioning to avoid screen edges
- Responsive design that works on mobile devices
- Support for projection mode and high contrast accessibility

## Technical Implementation

### Components
- `LandmarkTooltip.tsx` - The tooltip component that renders landmark information
- `LandmarkTooltip.css` - Styling for the tooltip with accessibility support

### Integration
- Integrated into `HexGrid.tsx` component
- Uses mouse move events to detect hover state
- Checks hex visibility and landmark data before showing tooltip
- Positioned relative to mouse cursor with offset to avoid blocking the hex

### Data Requirements
For a tooltip to appear, a hex must have:
1. A landmark (any landmark type)
2. At least one of: name or description
3. Be visible to the player (explored/in line of sight)

## Usage Examples

### Setting Up Landmarks for Tooltips (GM Mode)
1. Switch to GM Mode
2. Place a landmark on a hex (drag from icon palette or use quick terrain)
3. Click on the hex to open the property dialog
4. Set a **Name** (e.g., "Riverside Village")
5. Set a **Description** (e.g., "A small farming community by the river")
6. Save the changes

### Viewing Landmark Information (Player Mode)
1. Switch to Player Mode
2. Ensure the hex with the landmark is explored/visible
3. Hover over the hex
4. The tooltip will appear showing the landmark's name and description

## Testing

The feature includes comprehensive unit tests covering:
- Tooltip rendering with name and description
- Tooltip rendering with only name or only description
- Proper hiding when not visible or when hex has no landmark
- Correct positioning and styling
- Accessibility considerations

Run tests with: `npm test LandmarkTooltip.test.tsx`