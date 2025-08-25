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
  selectIsFullscreen,
  selectQuickTerrainMode,
  selectShowShortcutsOverlay
} from './store/selectors';
import { uiActions } from './store';
import { HexGrid } from './components/HexGrid';
import { IconPalette } from './components/IconPalette';
import { MobileIconPalette } from './components/MobileIconPalette';
import { MobileLayout } from './components/MobileLayout';
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
import { GMControls } from './components/GMControls';
import { KeyboardShortcutsOverlay } from './components/KeyboardShortcutsOverlay';
import { TemplateDialog } from './components/TemplateDialog';
import { BiomeGenerator } from './components/BiomeGenerator';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { ContextualHints } from './components/ContextualHints';
import { QuickHelpButton } from './components/QuickHelpButton';
import { WhatsNewBanner } from './components/WhatsNewBanner';
import { StatusIndicator } from './components/StatusIndicator';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { isTouchDevice } from './utils/touchUtils';
import './App.css';
import './styles/projection.css';
import './styles/mobile.css';

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
  const quickTerrainMode = useAppSelector(selectQuickTerrainMode);
  const showShortcutsOverlay = useAppSelector(selectShowShortcutsOverlay);
  
  // State for mode transition animation
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousMode = useRef(currentMode);

  // Detect if this is a touch device
  const isMobile = isTouchDevice();

  // Enable keyboard shortcuts (disabled on mobile to prevent conflicts)
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

  const handleCloseShortcutsOverlay = () => {
    dispatch(uiActions.setShowShortcutsOverlay(false));
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
    quickTerrainMode && 'app--quick-terrain-mode',
  ].filter(Boolean).join(' ');

  // Header content for mobile layout
  const headerContent = (
    <>
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
    </>
  );

  // Sidebar content for mobile layout
  const sidebarContent = (
    <>
      <ModeToggle />
      {isGMMode && (
        <AnimatedTransition
          isVisible={isGMMode}
          type="slide"
          direction="down"
          duration={300}
        >
          <UndoRedoControls className="sidebar-undo-redo" />
          <GMControls />
          {isMobile ? <MobileIconPalette /> : <IconPalette />}
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
    </>
  );

  // Main content
  const mainContent = <HexGrid className="touch-gesture-area pinch-zoom-enabled" />;

  return (
    <div className={appClasses}>
      {isMobile ? (
        <MobileLayout
          header={headerContent}
          sidebar={sidebarContent}
        >
          {mainContent}
        </MobileLayout>
      ) : (
        <>
          <header className="app-header">
            <div className="app-header__content">
              {headerContent}
            </div>
          </header>
          <main className="app-main">
            <div className={`app-sidebar ${isPlayerMode ? 'app-sidebar--player-mode' : ''}`}>
              {sidebarContent}
            </div>
            <div className="app-content">
              {mainContent}
            </div>
          </main>
        </>
      )}
      
      {isGMMode && <PropertyDialog />}
      <TemplateDialog />
      <BiomeGenerator />
      <SettingsPanel isOpen={isSettingsPanelOpen} onClose={handleCloseSettings} />
      <MapManager isOpen={isMapManagerOpen} onClose={handleCloseMapManager} />
      <HelpSystem />
      {!isMobile && (
        <KeyboardShortcutsOverlay 
          isVisible={showShortcutsOverlay} 
          onClose={handleCloseShortcutsOverlay} 
        />
      )}
      
      {/* Enhanced user guidance */}
      <WhatsNewBanner />
      <OnboardingOverlay />
      <ContextualHints />
      <StatusIndicator />
      <QuickHelpButton />
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
