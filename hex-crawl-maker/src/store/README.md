# Redux Store Documentation

This directory contains the Redux store implementation for the Hex Crawl Maker application.

## Structure

```
store/
├── index.ts              # Main store configuration and exports
├── hooks.ts              # Typed React Redux hooks
├── initialization.ts     # Store initialization utilities
├── selectors.ts          # Redux selectors for accessing state
├── testUtils.tsx         # Test utilities for Redux testing
├── slices/
│   ├── mapSlice.ts       # Map data management
│   ├── uiSlice.ts        # UI state management
│   └── explorationSlice.ts # Exploration state management
├── middleware/
│   └── localStorage.ts   # localStorage persistence middleware
└── tests/
    ├── store.test.ts     # Unit tests for store functionality
    └── integration.test.ts # Integration tests with selectors
```

## Usage

### Basic Setup

```typescript
import { store, initializeStore } from './store';
import { Provider } from 'react-redux';

// Initialize store with persisted data
initializeStore();

// Wrap your app with the Redux provider
function App() {
  return (
    <Provider store={store}>
      <YourAppComponents />
    </Provider>
  );
}
```

### Using Typed Hooks

```typescript
import { useAppDispatch, useAppSelector } from './store/hooks';
import { mapActions, selectCurrentMap } from './store';

function MyComponent() {
  const dispatch = useAppDispatch();
  const currentMap = useAppSelector(selectCurrentMap);
  
  const createMap = () => {
    dispatch(mapActions.createNewMap({
      name: 'New Map',
      dimensions: { width: 10, height: 10 }
    }));
  };
  
  return (
    <div>
      <button onClick={createMap}>Create Map</button>
      {currentMap && <p>Current map: {currentMap.name}</p>}
    </div>
  );
}
```

## State Structure

### Map State
- `currentMap`: Currently active map data
- `savedMaps`: All saved maps indexed by ID

### UI State
- `currentMode`: 'gm' or 'player' mode
- `selectedHex`: Currently selected hex coordinate
- `isPropertyDialogOpen`: Property dialog visibility
- `isDragging`: Drag and drop state
- `zoom` and `panOffset`: View transformation state

### Exploration State
- `exploredHexes`: Set of explored hex coordinate keys
- `visibleHexes`: Set of currently visible hex coordinate keys
- `explorationHistory`: History of exploration events

## Key Actions

### Map Actions
- `createNewMap(payload)`: Create a new map
- `placeIcon(payload)`: Place an icon on a hex
- `updateSightDistance(distance)`: Update sight distance
- `updateRevealMode(mode)`: Switch between 'permanent' and 'lineOfSight'

### UI Actions
- `setMode(mode)`: Switch between 'gm' and 'player' modes
- `selectHex(coordinate)`: Select a hex
- `startDrag(icon)` / `endDrag()`: Manage drag and drop state

### Exploration Actions
- `exploreHex(coordinate)`: Mark a hex as explored
- `setVisibleHexes(coordinates)`: Set currently visible hexes
- `resetExploration()`: Clear all exploration data

## Selectors

### Map Selectors
- `selectCurrentMap`: Get current map data
- `selectMapDimensions`: Get map dimensions
- `selectHexCell(coordinate)`: Get specific hex cell data

### UI Selectors
- `selectCurrentMode`: Get current mode ('gm' or 'player')
- `selectSelectedHex`: Get currently selected hex
- `selectIsGMMode` / `selectIsPlayerMode`: Mode boolean selectors

### Exploration Selectors
- `selectIsHexExplored(coordinate)`: Check if hex is explored
- `selectHexVisibility(coordinate)`: Get hex visibility logic
- `selectMapStats`: Get exploration statistics

## Persistence

The store automatically persists data to localStorage:
- Map data and current map selection
- Exploration state (explored/visible hexes)
- UI preferences (zoom, coordinates display)

Data is automatically loaded on app initialization.

## Testing

Use the provided test utilities for testing components that use the store:

```typescript
import { TestProvider, createTestStore } from './store/testUtils';
import { render } from '@testing-library/react';

test('my component', () => {
  const store = createTestStore();
  render(
    <TestProvider store={store}>
      <MyComponent />
    </TestProvider>
  );
  // ... test assertions
});
```

## Performance Considerations

- Map and Set objects are used for efficient hex coordinate lookups
- Selectors are memoized using `createSelector` for performance
- localStorage operations are debounced through middleware
- Non-serializable data (Map/Set) is handled properly in middleware