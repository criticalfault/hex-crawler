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