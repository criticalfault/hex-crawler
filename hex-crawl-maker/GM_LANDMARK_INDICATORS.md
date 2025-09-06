# GM Mode Landmark Indicators

## Overview

Added visual indicators for landmarks in GM Mode to make them easily identifiable at a glance, complementing the existing Player Mode indicators.

## What's New

- **GM Visual Indicator**: Landmarks in GM Mode now display a small blue star (★) circle in the top-right area of the hex
- **Always Visible**: Unlike Player Mode indicators, GM indicators are always visible regardless of exploration state
- **Distinct Design**: Uses a steel blue color scheme to distinguish from Player Mode's golden question marks
- **Universal Coverage**: Shows for ALL landmarks in GM Mode, not just those with names/descriptions

## Visual Design

### GM Mode Indicators

- **Shape**: Circular indicator with white star (★) symbol
- **Size**: 25% of hex size
- **Position**: Top-right area of hex
- **Colors**:
  - Background: Steel blue (`rgba(70, 130, 180, 0.9)`)
  - Border: Steel blue (`#4682b4`)
  - Symbol: White star (`#ffffff`)

### Player Mode Indicators (existing)

- **Shape**: Circular indicator with question mark (?)
- **Size**: 30% of hex size
- **Position**: Top-right area of hex
- **Colors**:
  - Background: Gold (`rgba(255, 215, 0, 0.95)`)
  - Border: Dark gold (`#b8860b`)
  - Symbol: Dark brown question mark (`#654321`)

## How to Test

### 1. Add Test Landmarks

Open the browser console and run:

```javascript
addTestLandmarks();
```

### 2. Test GM Mode

- Ensure you're in GM Mode (default mode)
- Look for blue star indicators on hexes with landmarks
- All landmarks should show indicators regardless of content

### 3. Test Player Mode

- Switch to Player Mode using the mode toggle
- Look for golden question mark indicators
- Only landmarks with names/descriptions should show indicators

### 4. Compare Modes

- Switch between GM and Player modes to see the different indicator styles
- Notice that GM mode shows more indicators (all landmarks) while Player mode is selective

### 5. Clean Up

```javascript
removeTestLandmarks();
```

## Use Cases

### For Game Masters

- **Quick Identification**: Instantly spot all landmark locations while designing encounters
- **Content Planning**: See which hexes have landmarks that need development
- **Session Preparation**: Easily identify points of interest for upcoming sessions

### For Players

- **Discovery Hints**: Golden question marks indicate there's something interesting to explore
- **Information Access**: Hover for detailed landmark information
- **Exploration Guidance**: Visual cues help guide exploration decisions

## Technical Implementation

### Display Logic - GM Mode

The GM indicator appears when:

1. Current mode is GM Mode
2. Hex contains a landmark (any landmark type)

### Display Logic - Player Mode (existing)

The Player indicator appears when:

1. Current mode is Player Mode
2. Hex contains a landmark
3. Hex is visible to players (explored/in sight)
4. Landmark has either a name OR description

### Performance

- Minimal rendering overhead
- Only draws when conditions are met
- Scales with hex size and zoom levels
- No impact on existing functionality

## Future Enhancements

- Different indicator colors for different landmark types
- Customizable indicator styles in settings
- Toggle option to hide/show GM indicators
- Keyboard shortcut to temporarily hide indicators
