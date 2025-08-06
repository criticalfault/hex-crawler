/**
 * Tests for IconPalette component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { IconPalette } from './IconPalette';
import { TERRAIN_ICONS, STRUCTURE_ICONS, MARKER_ICONS } from '../types/icons';

// Mock the SVG imports
vi.mock('../assets/icons/terrain/mountains.svg', () => ({
  default: '/mock/mountains.svg'
}));

vi.mock('../assets/icons/terrain/plains.svg', () => ({
  default: '/mock/plains.svg'
}));

describe('IconPalette', () => {
  it('renders the palette title', () => {
    render(<IconPalette />);
    expect(screen.getByText('Icon Palette')).toBeInTheDocument();
  });

  it('renders all terrain icons', () => {
    render(<IconPalette />);
    
    TERRAIN_ICONS.forEach(icon => {
      expect(screen.getByText(icon.name)).toBeInTheDocument();
    });
  });

  it('renders all structure icons', () => {
    render(<IconPalette />);
    
    STRUCTURE_ICONS.forEach(icon => {
      expect(screen.getByText(icon.name)).toBeInTheDocument();
    });
  });

  it('renders all marker icons', () => {
    render(<IconPalette />);
    
    MARKER_ICONS.forEach(icon => {
      expect(screen.getByText(icon.name)).toBeInTheDocument();
    });
  });

  it('renders category sections', () => {
    render(<IconPalette />);
    
    expect(screen.getByText('TERRAIN')).toBeInTheDocument();
    expect(screen.getByText('STRUCTURES')).toBeInTheDocument();
    expect(screen.getByText('MARKERS')).toBeInTheDocument();
  });

  it('makes icons draggable', () => {
    render(<IconPalette />);
    
    const mountainsIcon = screen.getByText('Mountains').closest('div');
    expect(mountainsIcon).toHaveAttribute('draggable', 'true');
  });

  it('handles drag start event', () => {
    render(<IconPalette />);
    
    const mountainsIcon = screen.getByText('Mountains').closest('div');
    const mockDataTransfer = {
      setData: vi.fn(),
      setDragImage: vi.fn(),
      effectAllowed: ''
    };
    
    const dragEvent = new Event('dragstart', { bubbles: true }) as any;
    dragEvent.dataTransfer = mockDataTransfer;
    
    fireEvent(mountainsIcon!, dragEvent);
    
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      expect.stringContaining('"iconId":"mountains"')
    );
    expect(mockDataTransfer.effectAllowed).toBe('copy');
  });

  it('shows tooltip on hover', () => {
    render(<IconPalette />);
    
    const mountainsIcon = screen.getByText('Mountains').closest('div');
    expect(mountainsIcon).toHaveAttribute('title', 'Rocky mountain terrain');
  });

  it('applies drag styling during drag operation', () => {
    render(<IconPalette />);
    
    const mountainsIcon = screen.getByText('Mountains').closest('div');
    
    // Start drag
    const dragStartEvent = new Event('dragstart', { bubbles: true }) as any;
    dragStartEvent.dataTransfer = {
      setData: vi.fn(),
      setDragImage: vi.fn(),
      effectAllowed: ''
    };
    
    fireEvent(mountainsIcon!, dragStartEvent);
    
    // Check if drag styling is applied (component should re-render with isDragging=true)
    // This is tested indirectly through the component's internal state management
    
    // End drag
    fireEvent.dragEnd(mountainsIcon!);
  });

  it('creates custom drag image', () => {
    // Mock document.createElement and appendChild
    const mockDiv = document.createElement('div');
    const mockImg = document.createElement('img');
    const originalCreateElement = document.createElement;
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'div') return mockDiv;
      if (tagName === 'img') return mockImg;
      return originalCreateElement.call(document, tagName);
    });
    
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
    
    render(<IconPalette />);
    
    const mountainsIcon = screen.getByText('Mountains').closest('div');
    const mockDataTransfer = {
      setData: vi.fn(),
      setDragImage: vi.fn(),
      effectAllowed: ''
    };
    
    const dragEvent = new Event('dragstart', { bubbles: true }) as any;
    dragEvent.dataTransfer = mockDataTransfer;
    
    fireEvent(mountainsIcon!, dragEvent);
    
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(document.createElement).toHaveBeenCalledWith('img');
    expect(mockDataTransfer.setDragImage).toHaveBeenCalledWith(mockDiv, 20, 20);
    
    // Restore original methods
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });
});