import { useEffect, useState, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, initializeStore } from './store';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { 
  selectCurrentMode, 
  selectIsGMMode, 
  selectIsPlayerMode, 
  selectIsSettingsPanelOpen, 
  selectIsMapManagerOpen,
  selectIsProjectionMode,
  selectProjectionSettings,
  selectIsFullscreen
} from './store/selectors';
import { uiActions } from './store';
import { HexGrid } from './components/HexGrid';
import { IconPalette } from './components/IconPalette';
import { PropertyDialog } from './components/PropertyDialog';
import { ModeToggle } from './components/ModeToggle';
import { PlayerControls } from './components/PlayerControls';
import { SettingsPanel } from './components/SettingsPanel';
import { SettingsButton } from './components/SettingsButton';
import { MapManager } from './components/MapManager';
import { MapManagerButton } from './components/MapManagerButton';
import { HelpSystem } from './components/HelpSystem';
import { UndoRedoControls } from './components/UndoRedoControls';
import { AnimatedTransition } from './components/AnimatedTransition';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './App.css';
import './styles/projection.css';

function AppContent() {
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector(selectCurrentMode);
  const isGMMode = useAppSelector(selectIsGMMode);
  const isPlayerMode = useAppSelector(selectIsPlayerMode);
  const isSettingsPanelOpen = useAppSelector(selectIsSettingsPanelOpen);
  const isMapManagerOpen = useAppSelector(selectIsMapManagerOpen);
  const isProjectionMode = useAppSelector(selectIsProjectionMode);
  const projectionSettings = useAppSelector(selectProjectionSettings);
  const isFullscreen = useAppSelector(selectIsFullscreen);
  
  // State for mode transition animation
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousMode = useRef(currentMode);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    initializeStore();
  }, []);

  // Handle mode transition animation
  useEffect(() => {
    if (previousMode.current !== currentMode) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      
      previousMode.current = currentMode;
      
      return () => clearTimeout(timer);
    }
  }, [currentMode]);

  const handleCloseSettings = () => {
    dispatch(uiActions.closeSettingsPanel());
  };

  const handleOpenMapManager = () => {
    dispatch(uiActions.openMapManager());
  };

  const handleCloseMapManager = () => {
    dispatch(uiActions.closeMapManager());
  };

  // Build CSS classes for app container
  const appClasses = [
    'app',
    `app--${currentMode}-mode`,
    isProjectionMode && 'app--projection-mode',
    isFullscreen && 'app--fullscreen',
    isProjectionMode && projectionSettings.largeText && 'app--large-text',
    isProjectionMode && projectionSettings.simplifiedUI && 'app--simplified-ui',
    isTransitioning && 'app--transitioning',
  ].filter(Boolean).join(' ');

  return (
    <div className={appClasses}>
      <header className="app-header">
        <div className="app-header__content">
          <h1>Hex Crawl Maker</h1>
          <div className="app-header__controls">
            <div className="app-header__mode-indicator">
              <span className={`mode-indicator mode-indicator--${currentMode}`}>
                {isGMMode ? '🎲 GM Mode' : '🗺️ Player Mode'}
              </span>
            </div>
            {isGMMode && (
              <>
                <MapManagerButton onClick={handleOpenMapManager} />
                <SettingsButton />
              </>
            )}
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className={`app-sidebar ${isPlayerMode ? 'app-sidebar--player-mode' : ''}`}>
          <ModeToggle />
          {isGMMode && (
            <AnimatedTransition
              isVisible={isGMMode}
              type="slide"
              direction="down"
              duration={300}
            >
              <UndoRedoControls className="sidebar-undo-redo" />
              <IconPalette />
            </AnimatedTransition>
          )}
          {isPlayerMode && (
            <AnimatedTransition
              isVisible={isPlayerMode}
              type="slide"
              direction="down"
              duration={300}
            >
              <div className="player-mode-info">
                <h3>Player View</h3>
                <p>Only explored areas are visible. Move players to reveal new hexes.</p>
              </div>
              <PlayerControls />
            </AnimatedTransition>
          )}
        </div>
        <div className="app-content">
          <HexGrid />
        </div>
      </main>
      {isGMMode && <PropertyDialog />}
      <SettingsPanel isOpen={isSettingsPanelOpen} onClose={handleCloseSettings} />
      <MapManager isOpen={isMapManagerOpen} onClose={handleCloseMapManager} />
      <HelpSystem />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App
