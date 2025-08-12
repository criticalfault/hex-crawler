/**
 * Redux slice for template management
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  TerrainTemplate, 
  TemplateSearchFilters, 
  TemplatePreview,
  BiomeGeneratorConfig,
  TemplateGenerationOptions
} from '../../types/templates';
import type { HexCoordinate } from '../../types/hex';

interface TemplateState {
  // Template library
  availableTemplates: TerrainTemplate[];
  filteredTemplates: TerrainTemplate[];
  searchFilters: TemplateSearchFilters;
  selectedTemplate: TerrainTemplate | null;
  
  // Template application
  templatePreview: TemplatePreview | null;
  isApplyingTemplate: boolean;
  templateApplicationTarget: HexCoordinate | null;
  
  // Biome generation
  biomeGeneratorConfig: BiomeGeneratorConfig;
  isGeneratingBiome: boolean;
  generatedBiomeCells: any[];
  
  // UI state
  isTemplateDialogOpen: boolean;
  isTemplateLibraryOpen: boolean;
  isBiomeGeneratorOpen: boolean;
  isTemplateCreatorOpen: boolean;
  
  // Template creation
  templateCreationSelection: HexCoordinate[];
  newTemplateName: string;
  newTemplateDescription: string;
  newTemplateCategory: TerrainTemplate['category'];
}

const initialBiomeConfig: BiomeGeneratorConfig = {
  biomeType: 'mixed',
  density: 0.6,
  variation: 0.5,
  landmarkChance: 0.1,
  seed: Math.random()
};

const initialState: TemplateState = {
  availableTemplates: [],
  filteredTemplates: [],
  searchFilters: {
    sortBy: 'name',
    sortOrder: 'asc'
  },
  selectedTemplate: null,
  
  templatePreview: null,
  isApplyingTemplate: false,
  templateApplicationTarget: null,
  
  biomeGeneratorConfig: initialBiomeConfig,
  isGeneratingBiome: false,
  generatedBiomeCells: [],
  
  isTemplateDialogOpen: false,
  isTemplateLibraryOpen: false,
  isBiomeGeneratorOpen: false,
  isTemplateCreatorOpen: false,
  
  templateCreationSelection: [],
  newTemplateName: '',
  newTemplateDescription: '',
  newTemplateCategory: 'custom'
};

export const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    // Template library management
    setAvailableTemplates: (state, action: PayloadAction<TerrainTemplate[]>) => {
      state.availableTemplates = action.payload;
      state.filteredTemplates = action.payload;
    },

    setFilteredTemplates: (state, action: PayloadAction<TerrainTemplate[]>) => {
      state.filteredTemplates = action.payload;
    },

    updateSearchFilters: (state, action: PayloadAction<Partial<TemplateSearchFilters>>) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },

    clearSearchFilters: (state) => {
      state.searchFilters = {
        sortBy: 'name',
        sortOrder: 'asc'
      };
    },

    selectTemplate: (state, action: PayloadAction<TerrainTemplate | null>) => {
      state.selectedTemplate = action.payload;
    },

    // Template application
    setTemplatePreview: (state, action: PayloadAction<TemplatePreview | null>) => {
      state.templatePreview = action.payload;
    },

    setIsApplyingTemplate: (state, action: PayloadAction<boolean>) => {
      state.isApplyingTemplate = action.payload;
    },

    setTemplateApplicationTarget: (state, action: PayloadAction<HexCoordinate | null>) => {
      state.templateApplicationTarget = action.payload;
    },

    clearTemplateApplication: (state) => {
      state.templatePreview = null;
      state.isApplyingTemplate = false;
      state.templateApplicationTarget = null;
    },

    // Biome generation
    updateBiomeGeneratorConfig: (state, action: PayloadAction<Partial<BiomeGeneratorConfig>>) => {
      state.biomeGeneratorConfig = { ...state.biomeGeneratorConfig, ...action.payload };
    },

    resetBiomeGeneratorConfig: (state) => {
      state.biomeGeneratorConfig = { ...initialBiomeConfig, seed: Math.random() };
    },

    setIsGeneratingBiome: (state, action: PayloadAction<boolean>) => {
      state.isGeneratingBiome = action.payload;
    },

    setGeneratedBiomeCells: (state, action: PayloadAction<any[]>) => {
      state.generatedBiomeCells = action.payload;
    },

    clearGeneratedBiome: (state) => {
      state.generatedBiomeCells = [];
    },

    // UI state management
    openTemplateDialog: (state) => {
      state.isTemplateDialogOpen = true;
    },

    closeTemplateDialog: (state) => {
      state.isTemplateDialogOpen = false;
      state.templatePreview = null;
    },

    toggleTemplateDialog: (state) => {
      state.isTemplateDialogOpen = !state.isTemplateDialogOpen;
      if (!state.isTemplateDialogOpen) {
        state.templatePreview = null;
      }
    },

    openTemplateLibrary: (state) => {
      state.isTemplateLibraryOpen = true;
    },

    closeTemplateLibrary: (state) => {
      state.isTemplateLibraryOpen = false;
    },

    toggleTemplateLibrary: (state) => {
      state.isTemplateLibraryOpen = !state.isTemplateLibraryOpen;
    },

    openBiomeGenerator: (state) => {
      state.isBiomeGeneratorOpen = true;
    },

    closeBiomeGenerator: (state) => {
      state.isBiomeGeneratorOpen = false;
      state.generatedBiomeCells = [];
    },

    toggleBiomeGenerator: (state) => {
      state.isBiomeGeneratorOpen = !state.isBiomeGeneratorOpen;
      if (!state.isBiomeGeneratorOpen) {
        state.generatedBiomeCells = [];
      }
    },

    openTemplateCreator: (state) => {
      state.isTemplateCreatorOpen = true;
    },

    closeTemplateCreator: (state) => {
      state.isTemplateCreatorOpen = false;
      state.templateCreationSelection = [];
      state.newTemplateName = '';
      state.newTemplateDescription = '';
      state.newTemplateCategory = 'custom';
    },

    toggleTemplateCreator: (state) => {
      state.isTemplateCreatorOpen = !state.isTemplateCreatorOpen;
      if (!state.isTemplateCreatorOpen) {
        state.templateCreationSelection = [];
        state.newTemplateName = '';
        state.newTemplateDescription = '';
        state.newTemplateCategory = 'custom';
      }
    },

    // Template creation
    setTemplateCreationSelection: (state, action: PayloadAction<HexCoordinate[]>) => {
      state.templateCreationSelection = action.payload;
    },

    addToTemplateCreationSelection: (state, action: PayloadAction<HexCoordinate>) => {
      const exists = state.templateCreationSelection.some(
        coord => coord.q === action.payload.q && coord.r === action.payload.r
      );
      if (!exists) {
        state.templateCreationSelection.push(action.payload);
      }
    },

    removeFromTemplateCreationSelection: (state, action: PayloadAction<HexCoordinate>) => {
      state.templateCreationSelection = state.templateCreationSelection.filter(
        coord => !(coord.q === action.payload.q && coord.r === action.payload.r)
      );
    },

    clearTemplateCreationSelection: (state) => {
      state.templateCreationSelection = [];
    },

    setNewTemplateName: (state, action: PayloadAction<string>) => {
      state.newTemplateName = action.payload;
    },

    setNewTemplateDescription: (state, action: PayloadAction<string>) => {
      state.newTemplateDescription = action.payload;
    },

    setNewTemplateCategory: (state, action: PayloadAction<TerrainTemplate['category']>) => {
      state.newTemplateCategory = action.payload;
    },

    // Template management actions
    addTemplate: (state, action: PayloadAction<TerrainTemplate>) => {
      state.availableTemplates.push(action.payload);
      // Re-apply current filters
      // This would typically trigger a re-filter in a middleware or effect
    },

    updateTemplate: (state, action: PayloadAction<TerrainTemplate>) => {
      const index = state.availableTemplates.findIndex(t => t.id === action.payload.id);
      if (index >= 0) {
        state.availableTemplates[index] = action.payload;
      }
    },

    removeTemplate: (state, action: PayloadAction<string>) => {
      state.availableTemplates = state.availableTemplates.filter(t => t.id !== action.payload);
      state.filteredTemplates = state.filteredTemplates.filter(t => t.id !== action.payload);
      
      if (state.selectedTemplate?.id === action.payload) {
        state.selectedTemplate = null;
      }
    }
  }
});

export const templateActions = templateSlice.actions;