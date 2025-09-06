# Landmark Visual Indicator Feature

## Overview
Added a visual indicator for landmarks in Player Mode to make them easily identifiable without requiring hover interaction.

## What's New
- **Visual Indicator**: Landmarks with names or descriptions now display a small golden question mark (?) circle in the top-right area of the hex
- **Player Mode Only**: The indicator only appears in Player Mode, keeping GM Mode clean
- **Visibility Aware**: The indicator respects exploration and visibility states (appears dimmed for previously explored but not currently visible hexes)
- **Tooltip Compatible**: The indicator works alongside the existing landmark tooltip system

## How to Test

### 1. Add Test Landmarks
Open the browser console and run:
```javascript
addTestLandmarks()
```

This will add several test landmarks with names and descriptions at various coordinates.

### 2. Switch to Player Mode
- Use the mode toggle to switch from GM Mode to Player Mode
- The landmarks should now show golden question mark indicators

### 3. Test Visibility States
- Move player tokens around to test how the indicators appear in different visibility states
- Indicators should be slightly transparent for previously explored but not currently visible hexes

### 4. Test Tooltips
- Hover over landmarks with indicators to see the tooltip with name and description
- The tooltip and indicator work together to provide both visual cues and detailed information

### 5. Clean Up
When done testing, remove test landmarks:
```javascript
removeTestLandmarks()
```

## Technical Details

### Implementation
- Added `drawLandmarkIndicator()` function to HexGrid component
- Indicator is drawn after player tokens but before coordinates
- Uses golden color scheme (#FFD700 background, #B8860B border, #8B4513 text)
- Size is 25% of hex size, positioned at 70% offset from center

### Conditions for Display
The indicator appears when ALL of these conditions are met:
1. Current mode is Player Mode
2. Hex contains a landmark
3. Hex is visible to players (explored/in sight)
4. Landmark has either a name OR description (prevents empty tooltips)

### Styling
- **Background**: Semi-transparent gold (rgba(255, 215, 0, 0.9))
- **Border**: Darker gold (#b8860b)
- **Text**: Dark brown (#8b4513) question mark
- **Size**: 25% of hex size
- **Position**: Top-right area of hex (70% offset from center)