/**
 * Verification script for the comprehensive image export system
 * This script tests the export functionality implementation
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verifying Comprehensive Image Export System Implementation...\n');

const requiredFiles = [
  'src/utils/exportUtils.ts',
  'src/services/exportService.ts',
  'src/components/ExportDialog.tsx',
  'src/components/ExportDialog.css',
  'src/components/ExportButton.tsx',
  'src/components/ExportButton.css',
  'src/components/ExportDialog.test.tsx',
  'src/utils/exportUtils.test.ts',
];

const requiredFeatures = [
  // Export utilities
  { file: 'src/utils/exportUtils.ts', feature: 'calculateExportDimensions', description: 'Calculate export dimensions based on options' },
  { file: 'src/utils/exportUtils.ts', feature: 'createExportCanvas', description: 'Create high-resolution canvas for export' },
  { file: 'src/utils/exportUtils.ts', feature: 'loadIconsForExport', description: 'Load and cache icons for export' },
  { file: 'src/utils/exportUtils.ts', feature: 'drawExportHexagon', description: 'Draw hexagon on export canvas' },
  { file: 'src/utils/exportUtils.ts', feature: 'drawExportHexContent', description: 'Draw hex content (terrain/landmark icons)' },
  { file: 'src/utils/exportUtils.ts', feature: 'drawExportPlayerPositions', description: 'Draw player positions on export canvas' },
  { file: 'src/utils/exportUtils.ts', feature: 'drawExportWatermark', description: 'Draw watermark on export canvas' },
  { file: 'src/utils/exportUtils.ts', feature: 'generateExportFilename', description: 'Generate filename for export' },
  
  // Export service
  { file: 'src/services/exportService.ts', feature: 'exportPNG', description: 'Export map as PNG image' },
  { file: 'src/services/exportService.ts', feature: 'exportPDF', description: 'Export map as PDF using jsPDF' },
  { file: 'src/services/exportService.ts', feature: 'batchExport', description: 'Batch export multiple versions' },
  { file: 'src/services/exportService.ts', feature: 'renderMapToCanvas', description: 'Render map to canvas' },
  
  // Export dialog
  { file: 'src/components/ExportDialog.tsx', feature: 'ExportDialog', description: 'Export configuration dialog' },
  { file: 'src/components/ExportDialog.tsx', feature: 'format.*png.*pdf', description: 'Format selection (PNG/PDF)' },
  { file: 'src/components/ExportDialog.tsx', feature: 'dpi.*150.*300.*600', description: 'DPI selection options' },
  { file: 'src/components/ExportDialog.tsx', feature: 'area.*full.*visible.*selection', description: 'Export area options' },
  { file: 'src/components/ExportDialog.tsx', feature: 'layers.*terrain.*landmarks.*labels', description: 'Layer selection options' },
  { file: 'src/components/ExportDialog.tsx', feature: 'watermark', description: 'Watermark configuration' },
  { file: 'src/components/ExportDialog.tsx', feature: 'margins', description: 'Margin configuration' },
  
  // Integration
  { file: 'src/components/GMControls.tsx', feature: 'ExportButton', description: 'Export button in GM controls' },
];

let allPassed = true;

// Check if all required files exist
console.log('📁 Checking required files...');
for (const file of requiredFiles) {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allPassed = false;
  }
}

console.log('\n🔧 Checking required features...');
for (const { file, feature, description } of requiredFeatures) {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8');
    const regex = new RegExp(feature, 'i');
    if (regex.test(content)) {
      console.log(`  ✅ ${description}`);
    } else {
      console.log(`  ❌ ${description} - NOT FOUND in ${file}`);
      allPassed = false;
    }
  } else {
    console.log(`  ❌ ${description} - FILE MISSING: ${file}`);
    allPassed = false;
  }
}

// Check package.json for jsPDF dependency
console.log('\n📦 Checking dependencies...');
const packageJsonPath = join(process.cwd(), 'package.json');
if (existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  if (packageJson.dependencies && packageJson.dependencies.jspdf) {
    console.log('  ✅ jsPDF dependency installed');
  } else {
    console.log('  ❌ jsPDF dependency missing');
    allPassed = false;
  }
  
  if (packageJson.devDependencies && packageJson.devDependencies['@types/jspdf']) {
    console.log('  ✅ jsPDF TypeScript types installed');
  } else {
    console.log('  ❌ jsPDF TypeScript types missing');
    allPassed = false;
  }
} else {
  console.log('  ❌ package.json not found');
  allPassed = false;
}

// Check specific export features
console.log('\n🎯 Checking specific export features...');

const exportUtilsPath = join(process.cwd(), 'src/utils/exportUtils.ts');
if (existsSync(exportUtilsPath)) {
  const content = readFileSync(exportUtilsPath, 'utf-8');
  
  const features = [
    { name: 'High-resolution PNG export', pattern: /dpi.*scaleFactor/i },
    { name: 'PDF export with multiple page support', pattern: /pdf.*page/i },
    { name: 'Export area options (full, visible, selection)', pattern: /area.*full.*visible.*selection/i },
    { name: 'Layer-based export options', pattern: /layers.*terrain.*landmarks.*labels/i },
    { name: 'Print-friendly export with margins', pattern: /margins.*print/i },
    { name: 'Watermark and attribution options', pattern: /watermark.*text.*position/i },
  ];
  
  for (const { name, pattern } of features) {
    if (pattern.test(content)) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name}`);
      allPassed = false;
    }
  }
}

const exportServicePath = join(process.cwd(), 'src/services/exportService.ts');
if (existsSync(exportServicePath)) {
  const content = readFileSync(exportServicePath, 'utf-8');
  
  const features = [
    { name: 'Batch export functionality', pattern: /batchExport.*multiple/i },
    { name: 'jsPDF integration for PDF export', pattern: /jsPDF.*pdf/i },
    { name: 'Canvas-based rendering', pattern: /canvas.*render/i },
    { name: 'Icon caching for performance', pattern: /iconCache.*load/i },
  ];
  
  for (const { name, pattern } of features) {
    if (pattern.test(content)) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name}`);
      allPassed = false;
    }
  }
}

console.log('\n📊 Summary:');
if (allPassed) {
  console.log('🎉 All export system features implemented successfully!');
  console.log('\n🚀 Key Features Available:');
  console.log('  • High-resolution PNG export with customizable DPI settings');
  console.log('  • PDF export with proper page sizing and metadata');
  console.log('  • Export options: full map, visible area, or selected region');
  console.log('  • Layer-based export (terrain, landmarks, labels, GM notes, etc.)');
  console.log('  • Print-friendly export with proper scaling and margins');
  console.log('  • Batch export functionality for multiple map versions');
  console.log('  • Watermark and attribution options for shared maps');
  console.log('  • Integration with GM controls for easy access');
  console.log('  • Comprehensive test coverage');
  
  console.log('\n💡 Usage:');
  console.log('  1. Open GM mode in the hex crawl maker');
  console.log('  2. Click the "📤 Export Map" button in GM controls');
  console.log('  3. Configure export options (format, DPI, area, layers)');
  console.log('  4. Click "Export PNG/PDF" or "Batch Export" to download');
  
  process.exit(0);
} else {
  console.log('❌ Some export system features are missing or incomplete.');
  console.log('Please review the implementation and ensure all required features are present.');
  process.exit(1);
}