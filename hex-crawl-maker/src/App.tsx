import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, initializeStore } from './store';
import { HexGrid } from './components/HexGrid';
import { IconPalette } from './components/IconPalette';
import { PropertyDialog } from './components/PropertyDialog';
import './App.css';

function AppContent() {
  useEffect(() => {
    initializeStore();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hex Crawl Maker</h1>
      </header>
      <main className="app-main">
        <div className="app-sidebar">
          <IconPalette />
        </div>
        <div className="app-content">
          <HexGrid />
        </div>
      </main>
      <PropertyDialog />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App
