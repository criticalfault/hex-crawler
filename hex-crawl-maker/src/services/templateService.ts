/**
 * Service for managing terrain templates and procedural generation
 */

import type { 
  TerrainTemplate, 
  TemplateCell, 
  BiomeGeneratorConfig, 
  TemplateGenerationOptions,
  TemplateCategory,
  TemplateSearchFilters,
  TemplatePreview
} from '../types/templates';
import type { HexCoordinate, TerrainType, LandmarkType } from '../types/hex';

export class TemplateService {
  private static readonly STORAGE_KEY = 'hex-crawl-templates';
  private static readonly BUILTIN_TEMPLATES_KEY = 'hex-crawl-builtin-templates';

  /**
   * Get all available templates
   */
  static getAllTemplates(): TerrainTemplate[] {
    const builtinTemplates = this.getBuiltinTemplates();
    const customTemplates = this.getCustomTemplates();
    return [...builtinTemplates, ...customTemplates];
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: string): TerrainTemplate[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }

  /**
   * Search templates with filters
   */
  static searchTemplates(filters: TemplateSearchFilters): TerrainTemplate[] {
    let templates = this.getAllTemplates();

    if (filters.category) {
      templates = templates.filter(t => t.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      templates = templates.filter(t => 
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (filters.author) {
      templates = templates.filter(t => 
        t.author?.toLowerCase().includes(filters.author!.toLowerCase())
      );
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Sort templates
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';
    
    templates.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return templates;
  }

  /**
   * Save a custom template
   */
  static saveTemplate(template: TerrainTemplate): void {
    const customTemplates = this.getCustomTemplates();
    const existingIndex = customTemplates.findIndex(t => t.id === template.id);
    
    const updatedTemplate = {
      ...template,
      updatedAt: new Date()
    };

    if (existingIndex >= 0) {
      customTemplates[existingIndex] = updatedTemplate;
    } else {
      customTemplates.push(updatedTemplate);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
  }

  /**
   * Delete a custom template
   */
  static deleteTemplate(templateId: string): boolean {
    const customTemplates = this.getCustomTemplates();
    const filteredTemplates = customTemplates.filter(t => t.id !== templateId);
    
    if (filteredTemplates.length !== customTemplates.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTemplates));
      return true;
    }
    
    return false;
  }

  /**
   * Generate template preview with options applied
   */
  static generateTemplatePreview(
    template: TerrainTemplate, 
    options: TemplateGenerationOptions
  ): TemplatePreview {
    let previewCells = [...template.cells];

    // Apply transformations
    if (options.rotation) {
      previewCells = this.rotateCells(previewCells, options.rotation);
    }

    if (options.mirror) {
      previewCells = this.mirrorCells(previewCells, options.mirror, template.dimensions);
    }

    if (options.scale && options.scale !== 1) {
      previewCells = this.scaleCells(previewCells, options.scale);
    }

    if (options.centerPoint) {
      previewCells = this.translateCells(previewCells, options.centerPoint);
    }

    return {
      template,
      previewCells,
      appliedOptions: options
    };
  }

  /**
   * Apply template to map at specified location
   */
  static applyTemplate(
    template: TerrainTemplate,
    targetCoordinate: HexCoordinate,
    options: TemplateGenerationOptions = {}
  ): TemplateCell[] {
    const preview = this.generateTemplatePreview(template, {
      ...options,
      centerPoint: targetCoordinate
    });

    return preview.previewCells;
  }

  /**
   * Generate procedural biome
   */
  static generateBiome(
    dimensions: { width: number; height: number },
    config: BiomeGeneratorConfig
  ): TemplateCell[] {
    const cells: TemplateCell[] = [];
    const seed = config.seed || Math.random();
    
    // Simple seeded random number generator
    let randomSeed = seed;
    const seededRandom = () => {
      randomSeed = (randomSeed * 9301 + 49297) % 233280;
      return randomSeed / 233280;
    };

    // Get terrain weights for biome type
    const terrainWeights = this.getBiomeTerrainWeights(config.biomeType);
    const landmarkWeights = this.getBiomeLandmarkWeights(config.biomeType);

    // Apply custom weights if provided
    if (config.customTerrainWeights) {
      Object.assign(terrainWeights, config.customTerrainWeights);
    }
    if (config.customLandmarkWeights) {
      Object.assign(landmarkWeights, config.customLandmarkWeights);
    }

    // Generate cells
    for (let q = 0; q < dimensions.width; q++) {
      for (let r = 0; r < dimensions.height; r++) {
        const coordinate: HexCoordinate = { q, r };
        
        // Determine if this cell should have terrain
        if (seededRandom() < config.density) {
          const terrain = this.selectWeightedTerrain(terrainWeights, seededRandom);
          
          const cell: TemplateCell = {
            coordinate,
            terrain
          };

          // Add landmark chance
          if (seededRandom() < config.landmarkChance) {
            cell.landmark = this.selectWeightedLandmark(landmarkWeights, seededRandom);
          }

          cells.push(cell);
        }
      }
    }

    return cells;
  }

  /**
   * Create template from current map selection
   */
  static createTemplateFromSelection(
    cells: TemplateCell[],
    name: string,
    description: string,
    category: TerrainTemplate['category'] = 'custom'
  ): TerrainTemplate {
    // Calculate dimensions
    const minQ = Math.min(...cells.map(c => c.coordinate.q));
    const maxQ = Math.max(...cells.map(c => c.coordinate.q));
    const minR = Math.min(...cells.map(c => c.coordinate.r));
    const maxR = Math.max(...cells.map(c => c.coordinate.r));

    // Normalize coordinates to start from (0,0)
    const normalizedCells = cells.map(cell => ({
      ...cell,
      coordinate: {
        q: cell.coordinate.q - minQ,
        r: cell.coordinate.r - minR
      }
    }));

    const template: TerrainTemplate = {
      id: crypto.randomUUID(),
      name,
      description,
      category,
      tags: [],
      version: '1.0.0',
      dimensions: {
        width: maxQ - minQ + 1,
        height: maxR - minR + 1
      },
      cells: normalizedCells,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return template;
  }

  // Private helper methods

  private static getCustomTemplates(): TerrainTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const templates = JSON.parse(stored);
        // Convert date strings back to Date objects
        return templates.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading custom templates:', error);
    }
    return [];
  }

  private static getBuiltinTemplates(): TerrainTemplate[] {
    // Return built-in templates - these would be loaded from a separate file or API
    return [
      this.createForestRegionTemplate(),
      this.createMountainRangeTemplate(),
      this.createCoastalAreaTemplate(),
      this.createVillageSurroundingsTemplate(),
      this.createDungeonApproachTemplate()
    ];
  }

  private static rotateCells(cells: TemplateCell[], degrees: number): TemplateCell[] {
    // Implement hex coordinate rotation
    const radians = (degrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    return cells.map(cell => ({
      ...cell,
      coordinate: {
        q: Math.round(cell.coordinate.q * cos - cell.coordinate.r * sin),
        r: Math.round(cell.coordinate.q * sin + cell.coordinate.r * cos)
      }
    }));
  }

  private static mirrorCells(
    cells: TemplateCell[], 
    mirror: 'horizontal' | 'vertical' | 'both',
    dimensions: { width: number; height: number }
  ): TemplateCell[] {
    return cells.map(cell => {
      let { q, r } = cell.coordinate;

      if (mirror === 'horizontal' || mirror === 'both') {
        q = dimensions.width - 1 - q;
      }

      if (mirror === 'vertical' || mirror === 'both') {
        r = dimensions.height - 1 - r;
      }

      return {
        ...cell,
        coordinate: { q, r }
      };
    });
  }

  private static scaleCells(cells: TemplateCell[], scale: number): TemplateCell[] {
    return cells.map(cell => ({
      ...cell,
      coordinate: {
        q: Math.round(cell.coordinate.q * scale),
        r: Math.round(cell.coordinate.r * scale)
      }
    }));
  }

  private static translateCells(cells: TemplateCell[], offset: HexCoordinate): TemplateCell[] {
    return cells.map(cell => ({
      ...cell,
      coordinate: {
        q: cell.coordinate.q + offset.q,
        r: cell.coordinate.r + offset.r
      }
    }));
  }

  private static getBiomeTerrainWeights(biomeType: BiomeGeneratorConfig['biomeType']): Record<TerrainType, number> {
    const weights: Record<TerrainType, number> = {
      mountains: 0,
      plains: 0,
      swamps: 0,
      water: 0,
      desert: 0,
      hills: 0,
      shallowWater: 0,
      deepWater: 0,
      oceanWater: 0
    };

    switch (biomeType) {
      case 'forest':
        weights.plains = 0.6;
        weights.swamps = 0.2;
        weights.water = 0.15;
        weights.mountains = 0.05;
        break;
      case 'mountain':
        weights.mountains = 0.7;
        weights.plains = 0.2;
        weights.water = 0.1;
        break;
      case 'coastal':
        weights.water = 0.4;
        weights.plains = 0.3;
        weights.swamps = 0.2;
        weights.mountains = 0.1;
        break;
      case 'desert':
        weights.desert = 0.8;
        weights.mountains = 0.15;
        weights.water = 0.05;
        break;
      case 'swamp':
        weights.swamps = 0.6;
        weights.water = 0.3;
        weights.plains = 0.1;
        break;
      case 'mixed':
        weights.plains = 0.3;
        weights.mountains = 0.2;
        weights.water = 0.2;
        weights.swamps = 0.15;
        weights.desert = 0.15;
        break;
    }

    return weights;
  }

  private static getBiomeLandmarkWeights(biomeType: BiomeGeneratorConfig['biomeType']): Record<LandmarkType, number> {
    const weights: Record<LandmarkType, number> = {
      village: 0.2,
      hamlet: 0.3,
      town: 0.3,
      city: 0.1,
      ruinsAncient: 0.1,
      ruinsRecent: 0.1,
      castle: 0.05,
      fortress: 0.05,
      watchtower: 0.1,
      tower: 0.1,
      signalFire: 0.1,
      mineEntrance: 0.1,
      caveMouth: 0.1,
      standingStones: 0.1,
      stoneCircle: 0.1,
      temple: 0.1,
      shrine: 0.1,
      wizardTower: 0.05,
      tradingPost: 0.1,
      roadhouse: 0.1,
      bridge: 0.1,
      ford: 0.1,
      ferryCrossing: 0.1,
      campsite: 0.2,
      huntersLodge: 0.1,
      marker: 0.5
    };

    // Adjust based on biome type
    switch (biomeType) {
      case 'mountain':
        weights.tower = 0.3;
        weights.town = 0.1;
        weights.city = 0.05;
        weights.marker = 0.55;
        break;
      case 'coastal':
        weights.town = 0.4;
        weights.city = 0.2;
        weights.tower = 0.1;
        weights.marker = 0.3;
        break;
    }

    return weights;
  }

  private static selectWeightedTerrain(weights: Record<TerrainType, number>, random: () => number): TerrainType {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let randomValue = random() * totalWeight;

    for (const [terrain, weight] of Object.entries(weights)) {
      randomValue -= weight;
      if (randomValue <= 0) {
        return terrain as TerrainType;
      }
    }

    return 'plains'; // fallback
  }

  private static selectWeightedLandmark(weights: Record<LandmarkType, number>, random: () => number): LandmarkType {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let randomValue = random() * totalWeight;

    for (const [landmark, weight] of Object.entries(weights)) {
      randomValue -= weight;
      if (randomValue <= 0) {
        return landmark as LandmarkType;
      }
    }

    return 'marker'; // fallback
  }

  // Built-in template creators

  private static createForestRegionTemplate(): TerrainTemplate {
    const cells: TemplateCell[] = [
      // Create a forest clearing with surrounding trees
      { coordinate: { q: 2, r: 2 }, terrain: 'plains', name: 'Forest Clearing' },
      { coordinate: { q: 1, r: 1 }, terrain: 'plains' },
      { coordinate: { q: 3, r: 1 }, terrain: 'plains' },
      { coordinate: { q: 1, r: 3 }, terrain: 'plains' },
      { coordinate: { q: 3, r: 3 }, terrain: 'plains' },
      { coordinate: { q: 0, r: 0 }, terrain: 'swamps' },
      { coordinate: { q: 4, r: 0 }, terrain: 'swamps' },
      { coordinate: { q: 0, r: 4 }, terrain: 'swamps' },
      { coordinate: { q: 4, r: 4 }, terrain: 'swamps' },
      { coordinate: { q: 2, r: 0 }, terrain: 'water', name: 'Forest Stream' },
    ];

    return {
      id: 'builtin-forest-region',
      name: 'Forest Region',
      description: 'A typical forest area with clearings, dense woods, and a stream',
      category: 'biome',
      tags: ['forest', 'nature', 'wilderness'],
      version: '1.0.0',
      dimensions: { width: 5, height: 5 },
      cells,
      isPublic: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };
  }

  private static createMountainRangeTemplate(): TerrainTemplate {
    const cells: TemplateCell[] = [
      { coordinate: { q: 1, r: 0 }, terrain: 'mountains' },
      { coordinate: { q: 2, r: 0 }, terrain: 'mountains' },
      { coordinate: { q: 3, r: 0 }, terrain: 'mountains' },
      { coordinate: { q: 0, r: 1 }, terrain: 'mountains' },
      { coordinate: { q: 1, r: 1 }, terrain: 'mountains' },
      { coordinate: { q: 2, r: 1 }, terrain: 'mountains' },
      { coordinate: { q: 3, r: 1 }, terrain: 'mountains' },
      { coordinate: { q: 4, r: 1 }, terrain: 'mountains' },
      { coordinate: { q: 1, r: 2 }, terrain: 'mountains' },
      { coordinate: { q: 2, r: 2 }, terrain: 'mountains', landmark: 'tower', name: 'Mountain Watchtower' },
      { coordinate: { q: 3, r: 2 }, terrain: 'mountains' },
      { coordinate: { q: 0, r: 3 }, terrain: 'plains' },
      { coordinate: { q: 4, r: 3 }, terrain: 'plains' },
    ];

    return {
      id: 'builtin-mountain-range',
      name: 'Mountain Range',
      description: 'A mountain range with a watchtower and foothills',
      category: 'biome',
      tags: ['mountains', 'highlands', 'watchtower'],
      version: '1.0.0',
      dimensions: { width: 5, height: 4 },
      cells,
      isPublic: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };
  }

  private static createCoastalAreaTemplate(): TerrainTemplate {
    const cells: TemplateCell[] = [
      { coordinate: { q: 0, r: 0 }, terrain: 'water' },
      { coordinate: { q: 1, r: 0 }, terrain: 'water' },
      { coordinate: { q: 2, r: 0 }, terrain: 'water' },
      { coordinate: { q: 3, r: 0 }, terrain: 'water' },
      { coordinate: { q: 4, r: 0 }, terrain: 'water' },
      { coordinate: { q: 0, r: 1 }, terrain: 'water' },
      { coordinate: { q: 1, r: 1 }, terrain: 'plains' },
      { coordinate: { q: 2, r: 1 }, terrain: 'plains', landmark: 'town', name: 'Coastal Village' },
      { coordinate: { q: 3, r: 1 }, terrain: 'plains' },
      { coordinate: { q: 4, r: 1 }, terrain: 'water' },
      { coordinate: { q: 1, r: 2 }, terrain: 'plains' },
      { coordinate: { q: 2, r: 2 }, terrain: 'plains' },
      { coordinate: { q: 3, r: 2 }, terrain: 'plains' },
      { coordinate: { q: 2, r: 3 }, terrain: 'swamps', name: 'Salt Marsh' },
    ];

    return {
      id: 'builtin-coastal-area',
      name: 'Coastal Area',
      description: 'A coastal region with a fishing village and salt marshes',
      category: 'biome',
      tags: ['coast', 'water', 'village', 'marsh'],
      version: '1.0.0',
      dimensions: { width: 5, height: 4 },
      cells,
      isPublic: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };
  }

  private static createVillageSurroundingsTemplate(): TerrainTemplate {
    const cells: TemplateCell[] = [
      { coordinate: { q: 2, r: 2 }, terrain: 'plains', landmark: 'town', name: 'Village Center' },
      { coordinate: { q: 1, r: 1 }, terrain: 'plains', name: 'Farmland' },
      { coordinate: { q: 3, r: 1 }, terrain: 'plains', name: 'Farmland' },
      { coordinate: { q: 1, r: 3 }, terrain: 'plains', name: 'Farmland' },
      { coordinate: { q: 3, r: 3 }, terrain: 'plains', name: 'Farmland' },
      { coordinate: { q: 2, r: 1 }, terrain: 'plains', name: 'Village Road' },
      { coordinate: { q: 2, r: 3 }, terrain: 'plains', name: 'Village Road' },
      { coordinate: { q: 1, r: 2 }, terrain: 'plains', name: 'Village Road' },
      { coordinate: { q: 3, r: 2 }, terrain: 'plains', name: 'Village Road' },
      { coordinate: { q: 0, r: 2 }, terrain: 'water', name: 'Village Well' },
      { coordinate: { q: 4, r: 2 }, terrain: 'swamps', name: 'Village Common' },
    ];

    return {
      id: 'builtin-village-surroundings',
      name: 'Village Surroundings',
      description: 'A small village with surrounding farmland and roads',
      category: 'campaign',
      tags: ['village', 'farmland', 'settlement', 'roads'],
      version: '1.0.0',
      dimensions: { width: 5, height: 5 },
      cells,
      isPublic: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };
  }

  private static createDungeonApproachTemplate(): TerrainTemplate {
    const cells: TemplateCell[] = [
      { coordinate: { q: 2, r: 0 }, terrain: 'mountains', landmark: 'tower', name: 'Ancient Ruins' },
      { coordinate: { q: 1, r: 1 }, terrain: 'mountains' },
      { coordinate: { q: 3, r: 1 }, terrain: 'mountains' },
      { coordinate: { q: 2, r: 1 }, terrain: 'plains', name: 'Overgrown Path' },
      { coordinate: { q: 2, r: 2 }, terrain: 'plains', name: 'Crumbling Bridge' },
      { coordinate: { q: 1, r: 3 }, terrain: 'swamps', name: 'Cursed Bog' },
      { coordinate: { q: 3, r: 3 }, terrain: 'swamps', name: 'Cursed Bog' },
      { coordinate: { q: 2, r: 3 }, terrain: 'water', name: 'Dark Pool' },
      { coordinate: { q: 0, r: 2 }, terrain: 'plains', landmark: 'marker', name: 'Warning Stones' },
      { coordinate: { q: 4, r: 2 }, terrain: 'plains', landmark: 'marker', name: 'Old Campsite' },
    ];

    return {
      id: 'builtin-dungeon-approach',
      name: 'Dungeon Approach',
      description: 'The dangerous path leading to an ancient dungeon',
      category: 'campaign',
      tags: ['dungeon', 'ruins', 'danger', 'adventure'],
      version: '1.0.0',
      dimensions: { width: 5, height: 4 },
      cells,
      isPublic: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };
  }
}