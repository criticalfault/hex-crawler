# Hex Crawl Maker and Player

A web-based application for creating and running hex-based exploration maps for West Marches style D&D campaigns.

## Project Structure

```
src/
├── components/     # React components organized by feature
├── hooks/         # Custom React hooks
├── store/         # Redux store configuration, slices, and selectors
├── types/         # TypeScript type definitions and interfaces
├── utils/         # Utility functions and helper modules
└── assets/        # Static assets (images, icons, etc.)
```

## Tech Stack

- **React 19** with TypeScript for the UI framework
- **Vite** for fast development and building
- **Redux Toolkit** for state management
- **styled-components** for CSS-in-JS styling
- **ESLint** with TypeScript rules for code quality

## Getting Help

The application includes comprehensive user guidance:

- **First Time?** An interactive tutorial will guide you through the basics
- **Quick Reference**: Click the **?** button (bottom right) for essential shortcuts
- **Full Help**: Press **F1** or **?** key for detailed help and all keyboard shortcuts
- **Contextual Tips**: Smart hints appear automatically based on what you're doing
- **Tooltips**: Hover over any button or control for detailed explanations
- **Restart Tutorial**: Press **Ctrl+Shift+H** to restart the interactive tutorial anytime

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Features

- **GM Creation Mode**: Drag and drop terrain and landmark icons to create hex maps
- **Player Exploration Mode**: Progressive map revelation based on player movement and sight distance
- **Projection Ready**: High contrast colors and scalable text for streaming/projection
- **Local Storage**: Persistent map and exploration data
- **Customizable**: Adjustable grid size, appearance, and exploration mechanics

### User Guidance & Help System

- **Interactive Tutorial**: First-time user onboarding with step-by-step guidance
- **Contextual Hints**: Smart tips that appear based on your current actions
- **Comprehensive Help System**: Press F1 or ? for detailed help and keyboard shortcuts
- **Quick Help Button**: Instant access to essential shortcuts and tips (? button in bottom right)
- **Enhanced Tooltips**: Detailed explanations throughout the interface
- **Status Indicator**: Real-time feedback on current mode and actions
- **What's New Banner**: Highlights new features and improvements