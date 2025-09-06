# Testing Landmark Tooltips

## Quick Test Guide

### Automated Test Setup (Recommended)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the browser console** (F12 → Console tab)

3. **Add test landmarks:**
   ```javascript
   addTestLandmarks()
   ```
   This will add 8 test landmarks with various combinations of names and descriptions.

4. **Switch to Player Mode** using the mode toggle button

5. **Test the tooltips:**
   - Hover over the landmarks at these coordinates to see different tooltip behaviors:
     - `(2,3)` - Village with name and description
     - `(5,2)` - Castle with name and description  
     - `(8,5)` - Temple with name and description
     - `(1,7)` - Ruins with name and description
     - `(6,8)` - Trading post with name and description
     - `(10,4)` - Tower with name only (no description)
     - `(3,9)` - Shrine with description only (no name)
     - `(12,6)` - Hamlet with no name or description (no tooltip should appear)

6. **Clean up when done:**
   ```javascript
   removeTestLandmarks()
   ```

### Manual Test Setup

1. **Switch to GM Mode**
2. **Add a landmark:**
   - Drag a landmark icon from the palette onto a hex
   - Or use Quick Terrain mode to place landmarks
3. **Set landmark properties:**
   - Click on the hex with the landmark
   - In the property dialog, set:
     - **Name**: e.g., "Riverside Village"
     - **Description**: e.g., "A peaceful farming community"
   - Save the changes
4. **Switch to Player Mode**
5. **Ensure the hex is explored:**
   - The hex should be visible (not grayed out)
   - If using line-of-sight mode, place a player token nearby
6. **Test the tooltip:**
   - Hover over the landmark hex
   - The tooltip should appear with the name and description

## What to Test

### ✅ Positive Test Cases
- [ ] Tooltip appears when hovering over landmark with name and description
- [ ] Tooltip shows only name when description is empty
- [ ] Tooltip shows only description when name is empty
- [ ] Tooltip appears smoothly with fade-in animation
- [ ] Tooltip disappears when mouse moves away
- [ ] Tooltip follows mouse cursor position
- [ ] Tooltip works in different screen positions (edges, corners)
- [ ] Tooltip respects exploration state (only shows for explored hexes)
- [ ] Tooltip respects line-of-sight mode (only shows for visible hexes)

### ❌ Negative Test Cases
- [ ] No tooltip appears in GM Mode (GMs should use property dialog instead)
- [ ] No tooltip appears for landmarks without name or description
- [ ] No tooltip appears for unexplored hexes in player mode
- [ ] No tooltip appears for hexes that are explored but not currently visible (line-of-sight mode)
- [ ] No tooltip appears for terrain-only hexes (no landmarks)
- [ ] No tooltip appears when hovering over empty hexes

### 🎨 Visual/UX Tests
- [ ] Tooltip has dark background with good contrast
- [ ] Landmark name appears in gold color
- [ ] Description appears in light gray color
- [ ] Tooltip has rounded corners and subtle shadow
- [ ] Tooltip doesn't block the hex being hovered
- [ ] Tooltip positioning adjusts near screen edges
- [ ] Animation is smooth and not jarring
- [ ] Text is readable at different zoom levels

### 📱 Mobile/Accessibility Tests
- [ ] Tooltip works on touch devices (if applicable)
- [ ] Tooltip respects reduced motion preferences
- [ ] Tooltip has sufficient color contrast for accessibility
- [ ] Tooltip works in high contrast mode
- [ ] Tooltip text scales appropriately with browser zoom

## Expected Behavior

### In Player Mode:
- ✅ Tooltips appear for landmarks with name/description on explored/visible hexes
- ❌ No tooltips for unexplored or invisible hexes
- ❌ No tooltips for landmarks without name or description

### In GM Mode:
- ❌ No tooltips appear (GMs use property dialog instead)
- ✅ Clicking landmarks opens property dialog for editing

### Tooltip Content:
- **Name only**: Shows just the landmark name in gold
- **Description only**: Shows just the description in light gray
- **Both**: Shows name in gold, description below in light gray
- **Neither**: No tooltip appears

## Troubleshooting

### Tooltip not appearing?
1. Check you're in Player Mode (not GM Mode)
2. Verify the hex has a landmark (icon visible)
3. Ensure the landmark has a name or description set
4. Confirm the hex is explored/visible (not grayed out)
5. Try refreshing the page and testing again

### Tooltip appearing in wrong position?
1. Check browser zoom level (100% recommended)
2. Try different screen positions
3. Verify canvas is properly sized

### Console errors?
1. Check browser console for JavaScript errors
2. Ensure all dependencies are installed (`npm install`)
3. Try restarting the development server

## Performance Notes

- Tooltips are lightweight and shouldn't impact performance
- Only one tooltip can be visible at a time
- Tooltip state is managed efficiently with React hooks
- No unnecessary re-renders when hovering over non-landmark hexes