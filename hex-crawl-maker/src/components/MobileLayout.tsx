/**
 * Mobile-responsive layout component that adapts the UI for touch devices
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../store/hooks';
import { selectCurrentMode, selectIsGMMode, selectIsPlayerMode } from '../store/selectors';
import { isTouchDevice, getTouchSizeMultiplier } from '../utils/touchUtils';

const MobileLayoutContainer = styled.div<{ $isMobile: boolean; $sizeMultiplier: number }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  
  ${props => props.$isMobile && `
    /* Mobile-specific layout adjustments */
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    
    /* Ensure proper viewport handling */
    min-height: 100vh;
    min-height: -webkit-fill-available;
  `}
`;

const MobileHeader = styled.header<{ $isMobile: boolean; $sizeMultiplier: number }>`
  background-color: #2c3e50;
  color: white;
  padding: ${props => props.$isMobile ? '12px 16px' : '16px'};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 100;
  flex-shrink: 0;
  
  ${props => props.$isMobile && `
    /* Account for mobile browser UI */
    padding-top: max(12px, env(safe-area-inset-top));
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
  `}
`;

const MobileHeaderContent = styled.div<{ $isMobile: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
  
  ${props => props.$isMobile && `
    flex-wrap: wrap;
    gap: 8px;
  `}
`;

const MobileTitle = styled.h1<{ $isMobile: boolean }>`
  margin: 0;
  font-size: ${props => props.$isMobile ? '18px' : '24px'};
  font-weight: 600;
  flex: 1;
  min-width: 0;
  
  ${props => props.$isMobile && `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}
`;

const MobileControls = styled.div<{ $isMobile: boolean; $sizeMultiplier: number }>`
  display: flex;
  align-items: center;
  gap: ${props => props.$isMobile ? '12px' : '16px'};
  flex-shrink: 0;
  
  button {
    min-height: ${props => (props.$isMobile ? 44 : 36) * props.$sizeMultiplier}px;
    min-width: ${props => (props.$isMobile ? 44 : 36) * props.$sizeMultiplier}px;
    font-size: ${props => props.$isMobile ? '14px' : '12px'};
    padding: ${props => props.$isMobile ? '8px 12px' : '6px 10px'};
    border-radius: ${props => props.$isMobile ? '8px' : '6px'};
    touch-action: manipulation;
  }
`;

const MobileMain = styled.main<{ $isMobile: boolean }>`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  
  ${props => props.$isMobile && `
    flex-direction: column;
    min-height: 0;
  `}
`;

const MobileSidebar = styled.aside<{ 
  $isMobile: boolean; 
  $isVisible: boolean; 
  $isPlayerMode: boolean;
  $sizeMultiplier: number;
}>`
  background-color: ${props => props.$isPlayerMode ? '#e3f2fd' : '#f8f9fa'};
  border-right: 1px solid ${props => props.$isPlayerMode ? '#90caf9' : '#dee2e6'};
  transition: all 0.3s ease;
  z-index: 90;
  
  ${props => props.$isMobile ? `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translateY(${props.$isVisible ? '0' : '100%'});
    border-right: none;
    border-top: 1px solid ${props.$isPlayerMode ? '#90caf9' : '#dee2e6'};
    overflow-y: auto;
    padding: 16px;
    padding-top: max(16px, env(safe-area-inset-top) + 60px);
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  ` : `
    width: 280px;
    flex-shrink: 0;
    overflow-y: auto;
    padding: 16px;
  `}
`;

const MobileContent = styled.div<{ $isMobile: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  ${props => props.$isMobile && `
    min-height: 0;
  `}
`;

const MobileOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 85;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  touch-action: none;
`;

const MobileToggleButton = styled.button<{ $isMobile: boolean; $sizeMultiplier: number }>`
  display: ${props => props.$isMobile ? 'flex' : 'none'};
  position: fixed;
  bottom: ${props => Math.max(20, 20 * props.$sizeMultiplier)}px;
  right: ${props => Math.max(20, 20 * props.$sizeMultiplier)}px;
  width: ${props => 56 * props.$sizeMultiplier}px;
  height: ${props => 56 * props.$sizeMultiplier}px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
  align-items: center;
  justify-content: center;
  font-size: ${props => 20 * props.$sizeMultiplier}px;
  z-index: 95;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  
  &:hover {
    background: #0056b3;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  /* Account for safe areas */
  bottom: max(${props => 20 * props.$sizeMultiplier}px, env(safe-area-inset-bottom) + 10px);
  right: max(${props => 20 * props.$sizeMultiplier}px, env(safe-area-inset-right) + 10px);
`;

const MobileStatusBar = styled.div<{ $isMobile: boolean; $isPlayerMode: boolean }>`
  display: ${props => props.$isMobile ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: ${props => props.$isPlayerMode ? '#1565c0' : '#28a745'};
  color: white;
  font-size: 12px;
  font-weight: 500;
  position: relative;
  z-index: 80;
`;

interface MobileLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  sidebar,
  header
}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  
  const currentMode = useAppSelector(selectCurrentMode);
  const isGMMode = useAppSelector(selectIsGMMode);
  const isPlayerMode = useAppSelector(selectIsPlayerMode);
  
  const isMobile = isTouchDevice();
  const sizeMultiplier = getTouchSizeMultiplier();

  // Handle viewport height changes (mobile browser UI)
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    const handleOrientationChange = () => {
      // Delay to allow browser UI to settle
      setTimeout(() => {
        setViewportHeight(window.innerHeight);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Set CSS custom property for viewport height
  useEffect(() => {
    document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
  }, [viewportHeight]);

  // Close sidebar when mode changes
  useEffect(() => {
    setIsSidebarVisible(false);
  }, [currentMode]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const closeSidebar = () => {
    setIsSidebarVisible(false);
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarVisible) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile, isSidebarVisible]);

  return (
    <MobileLayoutContainer 
      $isMobile={isMobile} 
      $sizeMultiplier={sizeMultiplier}
      style={{ height: isMobile ? 'calc(var(--vh, 1vh) * 100)' : '100vh' }}
    >
      <MobileHeader $isMobile={isMobile} $sizeMultiplier={sizeMultiplier}>
        <MobileHeaderContent $isMobile={isMobile}>
          {header}
        </MobileHeaderContent>
      </MobileHeader>

      {isMobile && (
        <MobileStatusBar $isMobile={isMobile} $isPlayerMode={isPlayerMode}>
          {isGMMode ? '🎲 GM Mode - Tap to edit hexes' : '🗺️ Player Mode - Tap to move'}
        </MobileStatusBar>
      )}

      <MobileMain $isMobile={isMobile}>
        {!isMobile && (
          <MobileSidebar
            $isMobile={isMobile}
            $isVisible={true}
            $isPlayerMode={isPlayerMode}
            $sizeMultiplier={sizeMultiplier}
          >
            {sidebar}
          </MobileSidebar>
        )}

        <MobileContent $isMobile={isMobile}>
          {children}
        </MobileContent>

        {isMobile && (
          <>
            <MobileOverlay 
              $isVisible={isSidebarVisible} 
              onClick={closeSidebar}
            />
            
            <MobileSidebar
              $isMobile={isMobile}
              $isVisible={isSidebarVisible}
              $isPlayerMode={isPlayerMode}
              $sizeMultiplier={sizeMultiplier}
            >
              {sidebar}
            </MobileSidebar>

            <MobileToggleButton
              $isMobile={isMobile}
              $sizeMultiplier={sizeMultiplier}
              onClick={toggleSidebar}
              aria-label="Toggle controls"
            >
              {isSidebarVisible ? '✕' : '☰'}
            </MobileToggleButton>
          </>
        )}
      </MobileMain>
    </MobileLayoutContainer>
  );
};