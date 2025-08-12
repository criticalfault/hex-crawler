/**
 * ExportButton component - button to open the export dialog
 */

import React, { useState } from 'react';
import { ExportDialog } from './ExportDialog';
import './ExportButton.css';

export const ExportButton: React.FC = () => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      <button
        className="export-button-trigger"
        onClick={() => setIsExportDialogOpen(true)}
        title="Export map as high-resolution image or PDF"
      >
        📤 Export Map
      </button>
      
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </>
  );
};