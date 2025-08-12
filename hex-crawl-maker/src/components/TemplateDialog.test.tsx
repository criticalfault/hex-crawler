/**
 * Tests for TemplateDialog component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import { TemplateDialog } from './TemplateDialog';
import { templateSlice } from '../store/slices/templateSlice';
import { mapSlice } from '../store/slices/mapSlice';
import { TemplateService } from '../services/templateService';
import type { TerrainTemplate } from '../types/templates';

// Mock the TemplateService
vi.mock('../services/templateService');
const mockTemplateService = TemplateService as any;

const mockTemplates: TerrainTemplate[] = [
  {
    id: 'test-1',
    name: 'Forest Region',
    description: 'A forest area with clearings',
    category: 'biome',
    tags: ['forest', 'nature'],
    version: '1.0.0',
    dimensions: { width: 5, height: 5 },
    cells: [],
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'test-2',
    name: 'Mountain Range',
    description: 'Rocky mountains with peaks',
    category: 'biome',
    tags: ['mountains', 'highlands'],
    version: '1.0.0',
    dimensions: { width: 4, height: 6 },
    cells: [],
    isPublic: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
];

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      template: templateSlice.reducer,
      map: mapSlice.reducer
    },
    preloadedState: {
      template: {
        isTemplateDialogOpen: true,
        availableTemplates: [],
        filteredTemplates: [],
        searchFilters: { sortBy: 'name', sortOrder: 'asc' },
        selectedTemplate: null,
        templatePreview: null,
        isApplyingTemplate: false,
        templateApplicationTarget: null,
        biomeGeneratorConfig: {
          biomeType: 'mixed',
          density: 0.6,
          variation: 0.5,
          landmarkChance: 0.1,
          seed: 0.5
        },
        isGeneratingBiome: false,
        generatedBiomeCells: [],
        isTemplateLibraryOpen: false,
        isBiomeGeneratorOpen: false,
        isTemplateCreatorOpen: false,
        templateCreationSelection: [],
        newTemplateName: '',
        newTemplateDescription: '',
        newTemplateCategory: 'custom'
      },
      map: {
        currentMap: {
          id: 'test-map',
          name: 'Test Map',
          dimensions: { width: 10, height: 10 },
          cells: new Map(),
          playerPositions: [],
          sightDistance: 2,
          revealMode: 'permanent',
          appearance: {
            hexSize: 30,
            borderColor: '#333',
            backgroundColor: '#f0f0f0',
            unexploredColor: '#ccc',
            sightColor: '#e6e6fa',
            textSize: 12,
            terrainColors: {
              mountains: '#8B4513',
              plains: '#90EE90',
              swamps: '#556B2F',
              water: '#4169E1',
              desert: '#F4A460'
            },
            borderWidth: 1
          }
        },
        savedMaps: {}
      },
      ...initialState
    }
  });
};

describe('TemplateDialog', () => {
  beforeEach(() => {
    mockTemplateService.getAllTemplates.mockReturnValue(mockTemplates);
    mockTemplateService.searchTemplates.mockReturnValue(mockTemplates);
    mockTemplateService.generateTemplatePreview.mockReturnValue({
      template: mockTemplates[0],
      previewCells: [],
      appliedOptions: {}
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render when dialog is open', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <TemplateDialog />
      </Provider>
    );

    expect(screen.getByText('Template Library')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
  });

  it('should not render when dialog is closed', () => {
    const store = createTestStore({
      template: {
        isTemplateDialogOpen: false
      }
    });
    
    render(
      <Provider store={store}>
        <TemplateDialog />
      </Provider>
    );

    expect(screen.queryByText('Template Library')).not.toBeInTheDocument();
  });

  it('should load templates on mount', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <TemplateDialog />
      </Provider>
    );

    await waitFor(() => {
      expect(mockTemplateService.getAllTemplates).toHaveBeenCalled();
    });
  });

  it('should filter templates when search term changes', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <TemplateDialog />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'forest' } });

    await waitFor(() => {
      expect(mockTemplateService.searchTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'forest'
        })
      );
    });
  });

  it('should filter templates by category', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <TemplateDialog />
      </Provider>
    );

    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'biome' } });

    await waitFor(() => {
      expect(mockTemplateService.searchTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'biome'
        })
      );
    });
  });

  it('should select template when clicked', async () => {
    mockTemplateService.searchTemplates.mockReturnValue([mockTemplates[0]]);
    
    const store = createTestStore({
      template: {
        filteredTemplates: [mockTemplates[0]]
      }
    });
    
    render(
      <Provider store={store}>
        <TemplateDialog />
      </Provider>
    );

    const templateCard = screen.getByText('Forest Region');
    fireEvent.click(templateCard);

    // Check that the template details are shown
    await waitFor(() => {
      expect(screen.getByText('A forest area with clearings')).toBeInTheDocument();
    });
  });

  it('should close dialog when close button is clicked', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <TemplateDialog />
      </Provider>
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    // Check that the dialog is closed by checking the store state
    const state = store.getState();
    expect(state.template.isTemplateDialogOpen).toBe(false);
  });

  it('should update generation options', async () => {
    const store = createTestStore({
      template: {
        selectedTemplate: mockTemplates[0],
        filteredTemplates: [mockTemplates[0]]
      }
    });
    
    render(
      <Provider store={store}>
        <TemplateDialog />
      </Provider>
    );

    // Select the template first
    const templateCard = screen.getByText('Forest Region');
    fireEvent.click(templateCard);

    await waitFor(() => {
      const rotationSlider = screen.getByDisplayValue('0');
      fireEvent.change(rotationSlider, { target: { value: '60' } });
      
      expect(mockTemplateService.generateTemplatePreview).toHaveBeenCalledWith(
        mockTemplates[0],
        expect.objectContaining({
          rotation: 60
        })
      );
    });
  });

  it('should apply template when apply button is clicked', async () => {
    mockTemplateService.applyTemplate.mockReturnValue([]);
    
    const store = createTestStore({
      template: {
        selectedTemplate: mockTemplates[0],
        templatePreview: {
          template: mockTemplates[0],
          previewCells: [],
          appliedOptions: {}
        }
      }
    });
    
    render(
      <Provider store={store}>
        <TemplateDialog />
      </Provider>
    );

    const applyButton = screen.getByText('Apply Template');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockTemplateService.applyTemplate).toHaveBeenCalledWith(
        mockTemplates[0],
        { q: 5, r: 5 }, // Center of 10x10 map
        expect.any(Object)
      );
    });
  });

  it('should disable apply button when no map is loaded', () => {
    const store = createTestStore({
      template: {
        selectedTemplate: mockTemplates[0],
        templatePreview: {
          template: mockTemplates[0],
          previewCells: [],
          appliedOptions: {}
        }
      },
      map: {
        currentMap: null,
        savedMaps: {}
      }
    });
    
    render(
      <Provider store={store}>
        <TemplateDialog />
      </Provider>
    );

    const applyButton = screen.getByText('Apply Template');
    expect(applyButton).toBeDisabled();
  });
});