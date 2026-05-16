import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import WarehousesPage from './components/WarehousesPage';
import SuppliersPage from './components/SuppliersPage';
import ProductsPage from './components/ProductsPage';
 
function App() {
  const [viewStack, setViewStack] = useState([{ view: 'home', params: null }]);
  const current = viewStack[viewStack.length - 1];
 
  const navigate = (view, params = null) => {
    // Dacă navigăm spre aceeași pagină, nu adăugăm în stack
    if (current.view === view && !params) return;
    setViewStack(prev => [...prev, { view, params }]);
  };
 
  const goBack = () => {
    setViewStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };
 
  const canGoBack = viewStack.length > 1;
 
  const renderPage = () => {
    const props = { onNavigate: navigate, onBack: canGoBack ? goBack : null, params: current.params };
    switch (current.view) {
      case 'home':       return <LandingPage {...props} />;
      case 'warehouses': return <WarehousesPage {...props} />;
      case 'suppliers':  return <SuppliersPage {...props} />;
      case 'products':   return <ProductsPage {...props} />;
      default:           return <LandingPage {...props} />;
    }
  };
 
  return (
    <>
      {renderPage()}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 20px 60px -10px rgba(0,0,0,0.5)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0f172a' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
        }}
      />
    </>
  );
}
 
export default App;