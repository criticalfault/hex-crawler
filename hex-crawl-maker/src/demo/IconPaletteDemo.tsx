/**
 * Simple demo component to test IconPalette functionality
 */

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { IconPalette } from '../components/IconPalette';
import { HexGrid } from '../components/HexGrid';

export const IconPaletteDemo: React.FC = () => {
  return (
    <Provider store={store}>
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        fontFamily: 'Arial, sans-serif' 
      }}>
        <div style={{ 
          width: '250px', 
          borderRight: '1px solid #ccc',
          overflow: 'auto'
        }}>
          <IconPalette />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            padding: '10px', 
            background: '#f0f0f0',
            borderBottom: '1px solid #ccc'
          }}>
            <h3>Drag and Drop Demo</h3>
            <p>Drag icons from the palette to the hex grid</p>
          </div>
          <div style={{ height: 'calc(100vh - 80px)' }}>
            <HexGrid />
          </div>
        </div>
      </div>
    </Provider>
  );
};