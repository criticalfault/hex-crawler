/**
 * Tests for ExportDialog component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ExportDialog } from './ExportDialog';
import { mapSlice } from '../store/slices/mapSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { explorationSlice } from '../store/slices/explorationSlice';
import type { MapData } from '../types';
import type { ExportOptions } from '../utils/exportUtils';

import { vi } from 'vitest';

// Mock the export service
vi.mock('../services/exportService', () => ({
  exportService: {
    getExportPreview: vi.fn(() => ({
      width: 800,
      height: 600,
      hexSize: 30,
      offsetX: 0,
      offsetY: 0,
    })),
    exportPNG: vi.fn(),
    exportPDF: vi.fn(),
    batchExport: vi.fn(),
  },
}));

const createTestStore = (initialMapData?: MapData) => {
  return configureStore({
    reducer: {
      map: mapSlice.reducer,
      ui: uiSlice.reducer,
      exploration: explorationSlice.reducer,
    },
    preloadedState: {
      map: {
        currentMap: initialMapData || {
          id: 'test-map',
          name: 'Test Map',
          dimensions: { width: 10, height: 10 },
          cells: new Map(),
          playerPositions: [],
          sightDistance: 2,
          revealMode: 'permanent' as const,
          appearance: {
            hexSize: 30,
            borderColor: '#333333',
            backgroundColor: '#f0f0f0',
            unexploredColor: '#cccccc',
            sightColor: '#e6e6fa',
            textSize: 12,
            terrainColors: {
              mountains: '#8B4513',
              plains: '#90EE90',
              swamps: '#556B2F',
              water: '#4169E1',
              desert: '#F4A460',
            },
            borderWidth: 1,
          },
        },
        savedMaps: {},
      },
      ui: {
        currentMode: 'gm',
        selectedHex: null,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
        showCoordinates: false,
        isPropertyDialogOpen: false,
        propertyDialogHex: null,
        quickTerrainMode: false,
        selectedQuickTerrain: '',
        brushMode: false,
        brushSize: 1,
        brushShape: 'circle',
        brushPreviewHexes: [],
        floodFillMode: false,
        floodFillPreviewHexes: [],
        floodFillTargetTerrain: '',
        floodFillTargetLandmark: '',
        isProjectionMode: false,
        projectionSettings: {
          fontSize: 16,
          highContrast: true,
          hideUI: false,
        },
      },
      exploration: {
        exploredHexes: new Set(),
        visibleHexes: new Set(),
        explorationHistory: [],
      },
    },
  });
};

describe('ExportDialog', () => {
  it('renders when open', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={() => {}} />
      </Provider>
    );

    expect(screen.getByText('Export Map')).toBeInTheDocument();
    expect(screen.getByText('PNG (High Quality Image)')).toBeInTheDocument();
    expect(screen.getByText('PDF (Print Ready)')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={false} onClose={() => {}} />
      </Provider>
    );

    expect(screen.queryByText('Export Map')).not.toBeInTheDocument();
  });

  it('shows export options', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={() => {}} />
      </Provider>
    );

    // Format options
    expect(screen.getByText('PNG (High Quality Image)')).toBeInTheDocument();
    expect(screen.getByText('PDF (Print Ready)')).toBeInTheDocument();

    // DPI options
    expect(screen.getByText('150 DPI (Web/Screen)')).toBeInTheDocument();
    expect(screen.getByText('300 DPI (Print Quality)')).toBeInTheDocument();
    expect(screen.getByText('600 DPI (High Print Quality)')).toBeInTheDocument();

    // Area options
    expect(screen.getByText('Full Map')).toBeInTheDocument();
    expect(screen.getByText('Visible Area Only')).toBeInTheDocument();

    // Layer options
    expect(screen.getByText('Terrain')).toBeInTheDocument();
    expect(screen.getByText('Landmarks')).toBeInTheDocument();
    expect(screen.getByText('Labels')).toBeInTheDocument();
    expect(screen.getByText('GM Notes')).toBeInTheDocument();
    expect(screen.getByText('Player Positions')).toBeInTheDocument();
    expect(screen.getByText('Grid Lines')).toBeInTheDocument();
    expect(screen.getByText('Hex Coordinates')).toBeInTheDocument();
  });

  it('shows preview information', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={() => {}} />
      </Provider>
    );

    expect(screen.getByText('Export Preview')).toBeInTheDocument();
    expect(screen.getByText(/Dimensions:/)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Size:/)).toBeInTheDocument();
    expect(screen.getByText(/Print Size:/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const store = createTestStore();
    const onClose = vi.fn();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    fireEvent.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    const store = createTestStore();
    const onClose = vi.fn();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('updates format when radio button is selected', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={() => {}} />
      </Provider>
    );

    const pdfRadio = screen.getByDisplayValue('pdf');
    fireEvent.click(pdfRadio);
    expect(pdfRadio).toBeChecked();
  });

  it('updates DPI when option is selected', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={() => {}} />
      </Provider>
    );

    const dpi600Radio = screen.getByDisplayValue('600');
    fireEvent.click(dpi600Radio);
    expect(dpi600Radio).toBeChecked();
  });

  it('toggles layer options', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={() => {}} />
      </Provider>
    );

    const terrainCheckbox = screen.getByRole('checkbox', { name: /terrain/i });
    expect(terrainCheckbox).toBeChecked(); // Should be checked by default

    fireEvent.click(terrainCheckbox);
    expect(terrainCheckbox).not.toBeChecked();
  });

  it('shows watermark options when enabled', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={() => {}} />
      </Provider>
    );

    const watermarkCheckbox = screen.getByRole('checkbox', { name: /add watermark/i });
    fireEvent.click(watermarkCheckbox);

    expect(screen.getByPlaceholderText('Watermark text')).toBeInTheDocument();
    expect(screen.getByDisplayValue('bottom-right')).toBeInTheDocument();
  });

  it('handles export button click', async () => {
    const { exportService } = await import('../services/exportService');
    const store = createTestStore();
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const exportButton = screen.getByText('Export PNG');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(exportService.exportPNG).toHaveBeenCalled();
    });
  });

  it('handles batch export button click', async () => {
    const { exportService } = await import('../services/exportService');
    const store = createTestStore();
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const batchExportButton = screen.getByText('Batch Export (Multiple Formats)');
    fireEvent.click(batchExportButton);

    await waitFor(() => {
      expect(exportService.batchExport).toHaveBeenCalled();
    });
  });

  it('disables export buttons when exporting', async () => {
    const { exportService } = await import('../services/exportService');
    exportService.exportPNG.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const store = createTestStore();
    render(
      <Provider store={store}>
        <ExportDialog isOpen={true} onClose={() => {}} />
      </Provider>
    );

    const exportButton = screen.getByText('Export PNG');
    fireEvent.click(exportButton);

    expect(screen.getByText('Exporting...')).toBeInTheDocument();
    expect(exportButton).toBeDisabled();
  });
});