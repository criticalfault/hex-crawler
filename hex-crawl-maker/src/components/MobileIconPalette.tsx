/**
 * Mobile-optimized IconPalette component with swipe navigation and touch-friendly interface
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { TERRAIN_ICONS, STRUCTURE_ICONS, MARKER_ICONS } from '../types/icons';
import type { IconData, DragData } from '../types/icons';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { isTouchDevice, getTouchSizeMultiplier, triggerHapticFeedback } from '../utils/touchUtils';

const MobilePaletteContainer = styled.div<{ $isMobile: boolean }>`
  width: 100%;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  ${props => props.$isMobile && `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    border-radius: 12px 12px 0 0;
    max-height: 60vh;
  `}
`;

const PaletteHeader = styled.div<{ $isMobile: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.$isMobile ? '16px 20px' : '12px 16px'};
  background: #ffffff;
  border-bottom: 1px solid #dee2e6;
  ${props => props.$isMobile && `
    padding-bottom: 8px;
  `}
`;

const PaletteTitle = styled.h3<{ $isMobile: boolean }>`
  margin: 0;
  font-size: ${props => props.$isMobile ? '18px' : '16px'};
  font-weight: 600;
  color: #343a40;
`;

const CollapseButton = styled.button<{ $isMobile: boolean }>`
  background: none;
  border: none;
  font-size: ${props => props.$isMobile ? '24px' : '20px'};
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-width: ${props => props.$isMobile ? '44px' : '32px'};
  min-height: ${props => props.$isMobile ? '44px' : '32px'};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e9ecef;
    color: #495057;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const CategoryTabs = styled.div<{ $isMobile: boolean }>`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  ${props => props.$isMobile && `
    padding: 0 8px;
  `}
`;

const CategoryTab = styled.button<{ $isActive: boolean; $isMobile: boolean }>`
  flex: 1;
  min-width: ${props => props.$isMobile ? '120px' : '80px'};
  padding: ${props => props.$isMobile ? '16px 12px' : '12px 8px'};
  background: ${props => props.$isActive ? '#ffffff' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.$isActive ? '#007bff' : 'transparent'};
  font-size: ${props => props.$isMobile ? '14px' : '12px'};
  font-weight: ${props => props.$isActive ? '600' : '500'};
  color: ${props => props.$isActive ? '#007bff' : '#6c757d'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$isActive ? '#ffffff' : '#e9ecef'};
    color: ${props => props.$isActive ? '#007bff' : '#495057'};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const PaletteContent = styled.div<{ $isCollapsed: boolean; $isMobile: boolean }>`
  max-height: ${props => props.$isCollapsed ? '0' : props.$isMobile ? '400px' : '500px'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  ${props => props.$isMobile && `
    overflow-y: auto;
  `}
`;

const CategoryContent = styled.div<{ $isMobile: boolean }>`
  padding: ${props => props.$isMobile ? '20px' : '16px'};
`;

const IconGrid = styled.div<{ $isMobile: boolean }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$isMobile ? '4' : '3'}, 1fr);
  gap: ${props => props.$isMobile ? '16px' : '12px'};
`;

const IconItem = styled.div<{ $isDragging: boolean; $isMobile: boolean; $sizeMultiplier: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => props.$isMobile ? '16px 12px' : '12px 8px'};
  border: 2px solid ${props => props.$isDragging ? '#007bff' : '#e9ecef'};
  border-radius: 12px;
  background: ${props => props.$isDragging ? '#e3f2fd' : '#ffffff'};
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  min-height: ${props => (props.$isMobile ? 80 : 60) * props.$sizeMultiplier}px;
  position: relative;

  &:hover {
    border-color: #007bff;
    background: #f8f9ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  }

  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
  }

  ${props => props.$isMobile && `
    &::before {
      content: '';
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      border-radius: 16px;
      background: transparent;
      pointer-events: none;
    }
  `}
`;

const IconImage = styled.img<{ $isMobile: boolean; $sizeMultiplier: number }>`
  width: ${props => (props.$isMobile ? 40 : 32) * props.$sizeMultiplier}px;
  height: ${props => (props.$isMobile ? 40 : 32) * props.$sizeMultiplier}px;
  margin-bottom: ${props => props.$isMobile ? '8px' : '6px'};
  pointer-events: none;
  transition: transform 0.2s ease;
`;

const IconLabel = styled.span<{ $isMobile: boolean }>`
  font-size: ${props => props.$isMobile ? '12px' : '10px'};
  color: #6c757d;
  text-align: center;
  line-height: 1.2;
  pointer-events: none;
  font-weight: 500;
`;

const SwipeIndicator = styled.div<{ $isMobile: boolean }>`
  display: ${props => props.$isMobile ? 'flex' : 'none'};
  justify-content: center;
  padding: 8px;
  color: #6c757d;
  font-size: 12px;
  background: #f8f9fa;
`;

interface MobileIconPaletteProps {
  className?: string;
  onIconSelect?: (icon: IconData) => void;
  selectedIcon?: string;
}

const categories = [
  { id: 'terrain', name: 'Terrain', icons: TERRAIN_ICONS },
  { id: 'structures', name: 'Buildings', icons: STRUCTURE_ICONS },
  { id: 'markers', name: 'Markers', icons: MARKER_ICONS }
];

export const MobileIconPalette: React.FC<MobileIconPaletteProps> = ({ 
  className, 
  onIconSelect,
  selectedIcon 
}) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draggedIcon, setDraggedIcon] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isMobile = isTouchDevice();
  const sizeMultiplier = getTouchSizeMultiplier();

  // Touch gesture handling for swipe navigation
  const touchGestures = useTouchGestures({
    onSwipe: (direction) => {
      if (direction === 'left' && activeCategory < categories.length - 1) {
        setActiveCategory(prev => prev + 1);
        triggerHapticFeedback('light');
      } else if (direction === 'right' && activeCategory > 0) {
        setActiveCategory(prev => prev - 1);
        triggerHapticFeedback('light');
      }
    },
    onTap: (point) => {
      // Handle icon selection on tap
      const element = document.elementFromPoint(point.x, point.y);
      const iconItem = element?.closest('[data-icon-id]') as HTMLElement;
      if (iconItem) {
        const iconId = iconItem.dataset.iconId;
        const icon = categories[activeCategory].icons.find(i => i.id === iconId);
        if (icon) {
          handleIconInteraction(icon);
        }
      }
    },
    onLongPress: (point) => {
      // Handle long press for additional options
      const element = document.elementFromPoint(point.x, point.y);
      const iconItem = element?.closest('[data-icon-id]') as HTMLElement;
      if (iconItem) {
        triggerHapticFeedback('heavy');
        // Could show context menu or additional options here
      }
    }
  }, {
    enableSwipe: isMobile,
    enableTap: isMobile,
    enableLongPress: isMobile
  });

  const handleIconInteraction = (icon: IconData) => {
    triggerHapticFeedback('light');
    
    if (onIconSelect) {
      onIconSelect(icon);
    }
    
    // For mobile, also trigger drag start simulation
    if (isMobile) {
      setDraggedIcon(icon.id);
      setTimeout(() => setDraggedIcon(null), 200);
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, icon: IconData) => {
    const dragData: DragData = {
      iconId: icon.id,
      category: icon.category,
      type: icon.type
    };

    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'copy';

    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.width = '48px';
    dragImage.style.height = '48px';
    dragImage.style.background = 'rgba(0, 123, 255, 0.9)';
    dragImage.style.borderRadius = '50%';
    dragImage.style.display = 'flex';
    dragImage.style.alignItems = 'center';
    dragImage.style.justifyContent = 'center';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)';
    
    const iconImg = document.createElement('img');
    iconImg.src = icon.svgPath;
    iconImg.style.width = '28px';
    iconImg.style.height = '28px';
    iconImg.style.filter = 'brightness(0) invert(1)';
    dragImage.appendChild(iconImg);
    
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 24, 24);

    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);

    setDraggedIcon(icon.id);
  };

  const handleDragEnd = () => {
    setDraggedIcon(null);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    triggerHapticFeedback('light');
  };

  const switchCategory = (index: number) => {
    setActiveCategory(index);
    triggerHapticFeedback('light');
  };

  // Prevent default touch behaviors on the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMobile) return;

    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchstart', preventDefault, { passive: false });
    container.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      container.removeEventListener('touchstart', preventDefault);
      container.removeEventListener('touchmove', preventDefault);
    };
  }, [isMobile]);

  return (
    <MobilePaletteContainer 
      ref={containerRef}
      className={className} 
      $isMobile={isMobile}
      {...(isMobile ? touchGestures : {})}
    >
      <PaletteHeader $isMobile={isMobile}>
        <PaletteTitle $isMobile={isMobile}>
          {isMobile ? 'Icons' : 'Icon Palette'}
        </PaletteTitle>
        {isMobile && (
          <CollapseButton 
            $isMobile={isMobile}
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand palette' : 'Collapse palette'}
          >
            {isCollapsed ? '▲' : '▼'}
          </CollapseButton>
        )}
      </PaletteHeader>

      <CategoryTabs $isMobile={isMobile}>
        {categories.map((category, index) => (
          <CategoryTab
            key={category.id}
            $isActive={activeCategory === index}
            $isMobile={isMobile}
            onClick={() => switchCategory(index)}
          >
            {category.name}
          </CategoryTab>
        ))}
      </CategoryTabs>

      {isMobile && (
        <SwipeIndicator $isMobile={isMobile}>
          ← Swipe to navigate categories →
        </SwipeIndicator>
      )}

      <PaletteContent $isCollapsed={isCollapsed} $isMobile={isMobile}>
        <CategoryContent $isMobile={isMobile}>
          <IconGrid $isMobile={isMobile}>
            {categories[activeCategory].icons.map((icon) => (
              <IconItem
                key={icon.id}
                data-icon-id={icon.id}
                draggable={!isMobile}
                $isDragging={draggedIcon === icon.id}
                $isMobile={isMobile}
                $sizeMultiplier={sizeMultiplier}
                onDragStart={!isMobile ? (e) => handleDragStart(e, icon) : undefined}
                onDragEnd={!isMobile ? handleDragEnd : undefined}
                onClick={isMobile ? () => handleIconInteraction(icon) : undefined}
                title={icon.description}
              >
                <IconImage 
                  src={icon.svgPath} 
                  alt={icon.name}
                  $isMobile={isMobile}
                  $sizeMultiplier={sizeMultiplier}
                />
                <IconLabel $isMobile={isMobile}>
                  {icon.name}
                </IconLabel>
              </IconItem>
            ))}
          </IconGrid>
        </CategoryContent>
      </PaletteContent>
    </MobilePaletteContainer>
  );
};