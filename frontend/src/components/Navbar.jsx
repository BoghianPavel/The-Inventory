import * as Icons from 'lucide-react';
 
const Icon = ({ name, ...props }) => {
  const LucideIcon = Icons[name] || Icons.HelpCircle;
  return <LucideIcon {...props} />;
};
 
export default function Navbar({ currentView, onNavigate, onBack }) {
  const navItems = [
    { key: 'warehouses', label: 'Depozite',  icon: 'Warehouse' },
    { key: 'suppliers',  label: 'Furnizori', icon: 'Truck'     },
    { key: 'products',   label: 'Produse',   icon: 'Box'       },
  ];
 
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: back + logo */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer group"
              title="Înapoi"
            >
              <Icon name="ChevronLeft" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:rotate-6 transition-transform">
              <Icon name="Package" className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 italic hidden sm:block">
              The Inventory
            </span>
          </div>
        </div>
 
        {/* Center: nav links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-2xl p-1">
          {navItems.map(({ key, label, icon }) => {
            const active = currentView === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon name={icon} className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : ''}`} />
                {label}
              </button>
            );
          })}
        </div>
 
        {/* Mobile: current page indicator */}
        <div className="md:hidden flex items-center gap-2 text-sm font-semibold text-slate-700">
          {navItems.find(n => n.key === currentView) && (
            <>
              <Icon name={navItems.find(n => n.key === currentView).icon} className="w-4 h-4 text-indigo-600" />
              {navItems.find(n => n.key === currentView).label}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
