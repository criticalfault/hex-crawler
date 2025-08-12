/**
 * Tests for TemplateService
 */

import { TemplateService } from './templateService';
import type { BiomeGeneratorConfig, TerrainTemplate, TemplateSearchFilters } from '../types/templates';

describe('TemplateService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getAllTemplates', () => {
    it('should return built-in templates', () => {
      const templates = TemplateService.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
      
      // Check that built-in templates exist
      const builtinTemplates = templates.filter(t => t.id.startsWith('builtin-'));
      expect(builtinTemplates.length).toBeGreaterThan(0);
    });

    it('should include custom templates from localStorage', () => {
      const customTemplate: TerrainTemplate = {
        id: 'custom-test',
        name: 'Test Template',
        description: 'A test template',
        category: 'custom',
        tags: ['test'],
        version: '1.0.0',
        dimensions: { width: 3, height: 3 },
        cells: [],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      TemplateService.saveTemplate(customTemplate);
      
      const templates = TemplateService.getAllTemplates();
      const foundTemplate = templates.find(t => t.id === 'custom-test');
      expect(foundTemplate).toBeDefined();
      expect(foundTemplate?.name).toBe('Test Template');
    });
  });

  describe('searchTemplates', () => {
    it('should filter templates by category', () => {
      const filters: TemplateSearchFilters = {
        category: 'biome'
      };

      const results = TemplateService.searchTemplates(filters);
      results.forEach(template => {
        expect(template.category).toBe('biome');
      });
    });

    it('should filter templates by search term', () => {
      const filters: TemplateSearchFilters = {
        searchTerm: 'forest'
      };

      const results = TemplateService.searchTemplates(filters);
      results.forEach(template => {
        const matchesName = template.name.toLowerCase().includes('forest');
        const matchesDescription = template.description.toLowerCase().includes('forest');
        const matchesTags = template.tags.some(tag => tag.toLowerCase().includes('forest'));
        
        expect(matchesName || matchesDescription || matchesTags).toBe(true);
      });
    });

    it('should sort templates by name', () => {
      const filters: TemplateSearchFilters = {
        sortBy: 'name',
        sortOrder: 'asc'
      };

      const results = TemplateService.searchTemplates(filters);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].name.localeCompare(results[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('generateBiome', () => {
    it('should generate biome cells with correct dimensions', () => {
      const config: BiomeGeneratorConfig = {
        biomeType: 'forest',
        density: 1.0, // 100% density for predictable results
        variation: 0.5,
        landmarkChance: 0,
        seed: 0.5
      };

      const dimensions = { width: 5, height: 5 };
      const cells = TemplateService.generateBiome(dimensions, config);

      // Should generate cells within the specified dimensions
      cells.forEach(cell => {
        expect(cell.coordinate.q).toBeGreaterThanOrEqual(0);
        expect(cell.coordinate.q).toBeLessThan(dimensions.width);
        expect(cell.coordinate.r).toBeGreaterThanOrEqual(0);
        expect(cell.coordinate.r).toBeLessThan(dimensions.height);
      });
    });

    it('should generate appropriate terrain for forest biome', () => {
      const config: BiomeGeneratorConfig = {
        biomeType: 'forest',
        density: 1.0,
        variation: 0.5,
        landmarkChance: 0,
        seed: 0.5
      };

      const cells = TemplateService.generateBiome({ width: 10, height: 10 }, config);
      
      // Forest biomes should have mostly plains and swamps
      const terrainTypes = cells.map(c => c.terrain).filter(Boolean);
      const forestTerrains = terrainTypes.filter(t => 
        t === 'plains' || t === 'swamps' || t === 'water'
      );
      
      expect(forestTerrains.length).toBeGreaterThan(0);
    });

    it('should respect landmark chance setting', () => {
      const configWithLandmarks: BiomeGeneratorConfig = {
        biomeType: 'mixed',
        density: 1.0,
        variation: 0.5,
        landmarkChance: 1.0, // 100% landmark chance
        seed: 0.5
      };

      const cells = TemplateService.generateBiome({ width: 5, height: 5 }, configWithLandmarks);
      const cellsWithLandmarks = cells.filter(c => c.landmark);
      
      expect(cellsWithLandmarks.length).toBeGreaterThan(0);
    });
  });

  describe('createTemplateFromSelection', () => {
    it('should create template with normalized coordinates', () => {
      const cells = [
        {
          coordinate: { q: 5, r: 3 },
          terrain: 'plains' as const,
          name: 'Test Cell 1'
        },
        {
          coordinate: { q: 6, r: 4 },
          terrain: 'mountains' as const,
          name: 'Test Cell 2'
        }
      ];

      const template = TemplateService.createTemplateFromSelection(
        cells,
        'Test Template',
        'A test template',
        'custom'
      );

      expect(template.name).toBe('Test Template');
      expect(template.description).toBe('A test template');
      expect(template.category).toBe('custom');
      expect(template.dimensions).toEqual({ width: 2, height: 2 });
      
      // Coordinates should be normalized to start from (0,0)
      expect(template.cells[0].coordinate).toEqual({ q: 0, r: 0 });
      expect(template.cells[1].coordinate).toEqual({ q: 1, r: 1 });
    });
  });

  describe('generateTemplatePreview', () => {
    it('should apply rotation to template cells', () => {
      const template: TerrainTemplate = {
        id: 'test-template',
        name: 'Test',
        description: 'Test',
        category: 'custom',
        tags: [],
        version: '1.0.0',
        dimensions: { width: 2, height: 2 },
        cells: [
          { coordinate: { q: 0, r: 0 }, terrain: 'plains' },
          { coordinate: { q: 1, r: 0 }, terrain: 'mountains' }
        ],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const preview = TemplateService.generateTemplatePreview(template, {
        rotation: 60
      });

      expect(preview.previewCells.length).toBe(2);
      expect(preview.appliedOptions.rotation).toBe(60);
    });

    it('should apply scaling to template cells', () => {
      const template: TerrainTemplate = {
        id: 'test-template',
        name: 'Test',
        description: 'Test',
        category: 'custom',
        tags: [],
        version: '1.0.0',
        dimensions: { width: 2, height: 2 },
        cells: [
          { coordinate: { q: 0, r: 0 }, terrain: 'plains' },
          { coordinate: { q: 1, r: 1 }, terrain: 'mountains' }
        ],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const preview = TemplateService.generateTemplatePreview(template, {
        scale: 2
      });

      expect(preview.previewCells.length).toBe(2);
      expect(preview.previewCells[1].coordinate).toEqual({ q: 2, r: 2 });
    });
  });

  describe('saveTemplate and deleteTemplate', () => {
    it('should save and retrieve custom templates', () => {
      const template: TerrainTemplate = {
        id: 'save-test',
        name: 'Save Test',
        description: 'Test saving',
        category: 'custom',
        tags: ['test'],
        version: '1.0.0',
        dimensions: { width: 1, height: 1 },
        cells: [],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      TemplateService.saveTemplate(template);
      
      const templates = TemplateService.getAllTemplates();
      const savedTemplate = templates.find(t => t.id === 'save-test');
      expect(savedTemplate).toBeDefined();
      expect(savedTemplate?.name).toBe('Save Test');
    });

    it('should delete custom templates', () => {
      const template: TerrainTemplate = {
        id: 'delete-test',
        name: 'Delete Test',
        description: 'Test deletion',
        category: 'custom',
        tags: [],
        version: '1.0.0',
        dimensions: { width: 1, height: 1 },
        cells: [],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      TemplateService.saveTemplate(template);
      expect(TemplateService.deleteTemplate('delete-test')).toBe(true);
      
      const templates = TemplateService.getAllTemplates();
      const deletedTemplate = templates.find(t => t.id === 'delete-test');
      expect(deletedTemplate).toBeUndefined();
    });

    it('should return false when deleting non-existent template', () => {
      expect(TemplateService.deleteTemplate('non-existent')).toBe(false);
    });
  });
});