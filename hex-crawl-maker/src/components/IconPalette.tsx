/**
 * IconPalette component for displaying draggable terrain and landmark icons
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { TERRAIN_ICONS, STRUCTURE_ICONS, MARKER_ICONS, IconData, DragData } from '../types/icons';

const PaletteContainer = styled.div`
  width: 250px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 600px;
  overflow-y: auto;
`;

const PaletteTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #343a40;
  text-align: center;
`;

const CategorySection = styled.div`
  margin-bottom: 20px;
`;

const CategoryTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 4px;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const IconItem = styled.div<{ isDragging: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 2px solid ${props => props.isDragging ? '#007bff' : '#e9ecef'};
  border-radius: 6px;
  background: ${props => props.isDragging ? '#e3f2fd' : '#ffffff'};
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    border-color: #007bff;
    background: #f8f9ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  }

  &:active {
    cursor: grabbing;
    transform: translateY(0);
  }
`;

const IconImage = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  pointer-events: none;
`;

const IconLabel = styled.span`
  font-size: 10px;
  color: #6c757d;
  text-align: center;
  line-height: 1.2;
  pointer-events: none;
`;

const DragGhost = styled.div`
  position: fixed;
  top: -1000px;
  left: -1000px;
  width: 40px;
  height: 40px;
  background: rgba(0, 123, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
`;

interface IconPaletteProps {
  className?: string;
}

export const IconPalette: React.FC<IconPaletteProps> = ({ className }) => {
  const [draggedIcon, setDraggedIcon] = useState<string | null>(null);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, icon: IconData) => {
    const dragData: DragData = {
      iconId: icon.id,
      category: icon.category,
      type: icon.type
    };

    // Set drag data
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'copy';

    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.width = '40px';
    dragImage.style.height = '40px';
    dragImage.style.background = 'rgba(0, 123, 255, 0.8)';
    dragImage.style.borderRadius = '50%';
    dragImage.style.display = 'flex';
    dragImage.style.alignItems = 'center';
    dragImage.style.justifyContent = 'center';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    
    const iconImg = document.createElement('img');
    iconImg.src = icon.svgPath;
    iconImg.style.width = '24px';
    iconImg.style.height = '24px';
    iconImg.style.filter = 'brightness(0) invert(1)';
    dragImage.appendChild(iconImg);
    
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 20, 20);

    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);

    setDraggedIcon(icon.id);
  };

  const handleDragEnd = () => {
    setDraggedIcon(null);
  };

  const renderIconCategory = (title: string, icons: IconData[]) => (
    <CategorySection key={title}>
      <CategoryTitle>{title}</CategoryTitle>
      <IconGrid>
        {icons.map((icon) => (
          <IconItem
            key={icon.id}
            draggable
            isDragging={draggedIcon === icon.id}
            onDragStart={(e) => handleDragStart(e, icon)}
            onDragEnd={handleDragEnd}
            title={icon.description}
          >
            <IconImage src={icon.svgPath} alt={icon.name} />
            <IconLabel>{icon.name}</IconLabel>
          </IconItem>
        ))}
      </IconGrid>
    </CategorySection>
  );

  return (
    <PaletteContainer className={className}>
      <PaletteTitle>Icon Palette</PaletteTitle>
      {renderIconCategory('Terrain', TERRAIN_ICONS)}
      {renderIconCategory('Structures', STRUCTURE_ICONS)}
      {renderIconCategory('Markers', MARKER_ICONS)}
    </PaletteContainer>
  );
};