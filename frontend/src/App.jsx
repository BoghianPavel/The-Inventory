import { useState } from 'react';
import LandingPage from './components/LandingPage';
import WarehousesPage from './components/WarehousesPage';
import SuppliersPage from './components/SuppliersPage';

function App() {
  const [viewStack, setViewStack] = useState([
    { view: 'home', params: null }
  ]);

  const current = viewStack[viewStack.length - 1];

  const navigate = (view, params = null) => {
    setViewStack(prev => [...prev, { view, params }]);
  };

  const goBack = () => {
    setViewStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const renderPage = () => {
    switch (current.view) {
      case 'home':
        return <LandingPage onNavigate={navigate} />;

      case 'warehouses':
        return (
          <WarehousesPage
            onNavigate={navigate}
            params={current.params}
            onBack={goBack}
          />
        );

      case 'suppliers':
        return (
          <SuppliersPage
            onNavigate={navigate}
            params={current.params}
            onBack={goBack}
          />
        );

      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return renderPage();
}

export default App;