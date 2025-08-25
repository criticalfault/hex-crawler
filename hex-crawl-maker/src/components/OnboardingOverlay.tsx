/**
 * Onboarding overlay for first-time users
 */

import React, { useState, useEffect } from "react";
import "./OnboardingOverlay.css";

interface OnboardingStep {
  title: string;
  content: React.ReactNode;
  target?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Welcome to Hex Crawl Maker! 🎲",
    content: (
      <div>
        <p>
          This tool helps you create and run hex-based exploration maps for
          tabletop RPGs like D&D.
        </p>
        <p>
          <strong>Two main modes:</strong>
        </p>
        <ul>
          <li>
            <strong>🎲 GM Mode:</strong> Create and edit your hex crawl
          </li>
          <li>
            <strong>🗺️ Player Mode:</strong> Progressive exploration during
            gameplay
          </li>
        </ul>
        <p>Let's get you started with a quick tour!</p>
      </div>
    ),
    position: "center",
  },
  {
    title: "Mode Toggle",
    content: (
      <div>
        <p>
          Switch between <strong>GM Mode</strong> (for creating) and{" "}
          <strong>Player Mode</strong> (for gameplay).
        </p>
        <p>
          <strong>Quick tip:</strong> Press <kbd>Space</kbd> or <kbd>M</kbd> to
          quickly switch modes!
        </p>
      </div>
    ),
    target: ".mode-toggle",
    position: "right",
  },
  {
    title: "Icon Palette",
    content: (
      <div>
        <p>
          Drag terrain and structure icons from here onto the hex grid to build
          your world.
        </p>
        <p>
          <strong>Pro tips:</strong>
        </p>
        <ul>
          <li>
            Press number keys <kbd>1-8</kbd> for quick terrain selection
          </li>
          <li>
            Use <kbd>Tab</kbd> to cycle through terrain types
          </li>
          <li>Enable Quick Terrain mode for faster painting</li>
        </ul>
      </div>
    ),
    target: ".app-sidebar",
    position: "left",
  },
  {
    title: "Hex Grid",
    content: (
      <div>
        <p>This is your hex crawl map! Click on hexes to:</p>
        <ul>
          <li>
            <strong>GM Mode:</strong> Edit properties, add names & descriptions
          </li>
          <li>
            <strong>Player Mode:</strong> Move players and reveal new areas
          </li>
        </ul>
        <p>
          <strong>Navigation:</strong> Use <kbd>WASD</kbd> or arrow keys to pan,{" "}
          <kbd>+/-</kbd> to zoom
        </p>
      </div>
    ),
    target: ".hex-grid-container",
    position: "top",
  },
  {
    title: "GM Controls",
    content: (
      <div>
        <p>Access powerful GM tools:</p>
        <ul>
          <li>
            <strong>Brush Tools:</strong> Paint multiple hexes at once
          </li>
          <li>
            <strong>Templates:</strong> Apply pre-made terrain patterns
          </li>
          <li>
            <strong>Export:</strong> Save your map as PNG or PDF
          </li>
          <li>
            <strong>Undo/Redo:</strong> <kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd>
          </li>
        </ul>
      </div>
    ),
    target: ".gm-controls",
    position: "left",
  },
  {
    title: "Settings & Help",
    content: (
      <div>
        <p>Don't forget about these helpful features:</p>
        <ul>
          <li>
            <strong>⚙️ Settings:</strong> Customize grid appearance and
            projection mode
          </li>
          <li>
            <strong>📁 Map Manager:</strong> Save and load multiple maps
          </li>
          <li>
            <strong>❓ Help:</strong> Press <kbd>F1</kbd> or <kbd>?</kbd>{" "}
            anytime for help
          </li>
        </ul>
        <p>
          <strong>Ready to create your first hex crawl?</strong>
        </p>
      </div>
    ),
    target: ".app-header__controls",
    position: "bottom",
  },
];

export const OnboardingOverlay: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem(
      "hex-crawl-onboarding-completed"
    );
    if (!hasSeenOnboarding) {
      // Small delay to let the app render first
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("hex-crawl-onboarding-completed", "true");
    setIsVisible(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  // Allow manual restart of onboarding
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "H") {
        handleRestart();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  // For now, let's use a simpler approach and just center all tooltips
  // This ensures the onboarding works reliably while we can improve positioning later

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-backdrop" onClick={handleSkip} />

      <div
        className="onboarding-tooltip onboarding-tooltip--center"
      >
        <div className="onboarding-tooltip__header">
          <h3>{step.title}</h3>
          <button
            className="onboarding-tooltip__close"
            onClick={handleSkip}
            aria-label="Skip onboarding"
          >
            ×
          </button>
        </div>

        <div className="onboarding-tooltip__content">{step.content}</div>

        <div className="onboarding-tooltip__footer">
          <div className="onboarding-progress">
            <span>
              {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <div className="onboarding-progress-bar">
              <div
                className="onboarding-progress-fill"
                style={{
                  width: `${
                    ((currentStep + 1) / ONBOARDING_STEPS.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="onboarding-actions">
            {currentStep > 0 && (
              <button
                className="onboarding-button onboarding-button--secondary"
                onClick={handlePrevious}
              >
                Previous
              </button>
            )}

            <button
              className="onboarding-button onboarding-button--secondary"
              onClick={handleSkip}
            >
              Skip Tour
            </button>

            <button
              className="onboarding-button onboarding-button--primary"
              onClick={handleNext}
            >
              {isLastStep ? "Get Started!" : "Next"}
            </button>
          </div>
        </div>
      </div>

      {step.target && (
        <div className="onboarding-highlight">
          <style>
            {`
              ${step.target} {
                position: relative !important;
                z-index: 99998 !important;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2) !important;
                border-radius: 8px !important;
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
};
