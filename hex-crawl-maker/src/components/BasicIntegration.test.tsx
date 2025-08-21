import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('Basic Integration Tests', () => {
  it('renders the main application', () => {
    render(<App />);
    
    // Check that the app renders without crashing
    expect(document.body).toBeTruthy();
  });

  it('renders hex grid container', () => {
    render(<App />);
    
    // Look for main container or grid element
    const container = document.querySelector('.hex-grid-container') || 
                     document.querySelector('[data-testid="hex-grid"]') ||
                     document.querySelector('svg');
    
    expect(container).toBeTruthy();
  });
});