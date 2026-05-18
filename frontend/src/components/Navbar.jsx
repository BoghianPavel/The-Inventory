import { useState } from 'react';
import * as Icons from 'lucide-react';
 
const Icon = ({ name, ...props }) => {
  const LucideIcon = Icons[name] || Icons.HelpCircle;
  return <LucideIcon {...props} />;
};
 
export default function Navbar({ currentView, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'warehouses', label: 'Depozite',  icon: 'Warehouse' },
    { key: 'suppliers',  label: 'Furnizori', icon: 'Truck'     },
    { key: 'products',   label: 'Produse',   icon: 'Box'       },
  ];
 
  // Găsim item-ul curent, dar oferim un fallback sigur pentru 'home' (LandingPage)
  const currentNavItem = navItems.find(n => n.key === currentView) || { label: 'Acasă', icon: 'Home' };

  const handleNav = (key) => {
    onNavigate(key);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => handleNav('home')}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:rotate-6 transition-transform">
              <Icon name="Package" className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 italic hidden sm:block">
              The Inventory
            </span>
          </div>
        </div>
 
        {/* Center: Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-2xl p-1">
          {navItems.map(({ key, label, icon }) => {
            const active = currentView === key;
            return (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon name={icon} className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : ''}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
 
        {/* Mobile: Toggle Button & Dropdown */}
        <div className="md:hidden relative">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
          >
            <Icon name={currentNavItem.icon} className="w-4 h-4 text-indigo-600" />
            <span>{currentNavItem.label}</span>
            <Icon name="ChevronDown" className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {mobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50">
              <button
                onClick={() => handleNav('home')}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  currentView === 'home' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon name="Home" className="w-4 h-4" />
                Acasă
              </button>
              <div className="h-px bg-slate-100 my-1" />
              {navItems.map(({ key, label, icon }) => {
                const active = currentView === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleNav(key)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                      active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon name={icon} className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}