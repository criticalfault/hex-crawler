/**
 * What's New banner component - shows new features and improvements
 */

import React, { useState, useEffect } from 'react';
import './WhatsNewBanner.css';

interface NewFeature {
  version: string;
  title: string;
  description: string;
  icon: string;
}

const NEW_FEATURES: NewFeature[] = [
  {
    version: '2.1.0',
    title: 'Enhanced User Guidance',
    description: 'New interactive tutorial, contextual hints, and improved tooltips to help you get started faster!',
    icon: '🎯'
  },
  {
    version: '2.0.5',
    title: 'Quick Help Button',
    description: 'Access essential shortcuts and tips instantly with the new ? button in the bottom right.',
    icon: '❓'
  },
  {
    version: '2.0.0',
    title: 'Improved Tooltips',
    description: 'Better explanations and contextual help throughout the interface.',
    icon: '💡'
  }
];

export const WhatsNewBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  useEffect(() => {
    // Check if user has seen the latest features
    const lastSeenVersion = localStorage.getItem('hex-crawl-last-seen-version');
    const latestVersion = NEW_FEATURES[0]?.version;
    
    if (!lastSeenVersion || lastSeenVersion !== latestVersion) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const handleDismiss = () => {
    const latestVersion = NEW_FEATURES[0]?.version;
    localStorage.setItem('hex-crawl-last-seen-version', latestVersion);
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentFeatureIndex < NEW_FEATURES.length - 1) {
      setCurrentFeatureIndex(currentFeatureIndex + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrevious = () => {
    if (currentFeatureIndex > 0) {
      setCurrentFeatureIndex(currentFeatureIndex - 1);
    }
  };

  if (!isVisible || NEW_FEATURES.length === 0) return null;

  const currentFeature = NEW_FEATURES[currentFeatureIndex];
  const isLastFeature = currentFeatureIndex === NEW_FEATURES.length - 1;

  return (
    <div className="whats-new-banner">
      <div className="whats-new-content">
        <div className="whats-new-icon">
          {currentFeature.icon}
        </div>
        
        <div className="whats-new-text">
          <h4>
            What's New in v{currentFeature.version}
          </h4>
          <h5>{currentFeature.title}</h5>
          <p>{currentFeature.description}</p>
        </div>

        <div className="whats-new-actions">
          {currentFeatureIndex > 0 && (
            <button 
              className="whats-new-button whats-new-button--secondary"
              onClick={handlePrevious}
            >
              ←
            </button>
          )}
          
          <button 
            className="whats-new-button whats-new-button--primary"
            onClick={handleNext}
          >
            {isLastFeature ? 'Got it!' : 'Next →'}
          </button>
          
          <button 
            className="whats-new-button whats-new-button--close"
            onClick={handleDismiss}
            aria-label="Dismiss what's new"
          >
            ×
          </button>
        </div>
      </div>

      {NEW_FEATURES.length > 1 && (
        <div className="whats-new-progress">
          {NEW_FEATURES.map((_, index) => (
            <div 
              key={index}
              className={`whats-new-dot ${index === currentFeatureIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};