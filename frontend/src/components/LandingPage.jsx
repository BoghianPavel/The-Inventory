import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

// Helper robust pentru iconițe Lucide
const Icon = ({ name, ...props }) => {
  const LucideIcon = Icons[name] || Icons.HelpCircle;
  return <LucideIcon {...props} />;
};

// Componentă vizuală pentru tabelele ERD
const ERDTable = ({ title, columns, icon, colorClass }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-slate-800/60 backdrop-blur-md border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl min-w-60 flex-1 max-w-75"
  >
    <div className={`p-3 ${colorClass} flex items-center gap-2 border-b border-white/10`}>
      <Icon name={icon} className="w-4 h-4 text-white" />
      <span className="text-xs font-bold text-white uppercase tracking-wider">{title}</span>
    </div>
    <div className="p-4 space-y-2.5">
      {columns.map((col, i) => (
        <div key={i} className="flex justify-between items-center text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-200 font-medium">{col.name}</span>
            {col.keyType && (
              <span className={`text-[9px] px-1 py-0.5 rounded-md font-bold ${
                col.keyType === 'PK' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              }`}>
                {col.keyType}
              </span>
            )}
          </div>
          <span className="text-slate-400 text-[11px]">{col.type}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

export default function LandingPage({ currentView = 'home', onNavigate }) {
  // Funcție simplă pentru a evidenția butonul activ în nav
  const getNavClass = (path) => {
    const base = "transition-colors cursor-pointer font-semibold text-sm ";
    return currentView === path 
      ? base + "text-indigo-600 font-bold" 
      : base + "text-slate-600 hover:text-indigo-600";
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* --- FUNDAL MESH GRADIENT FIN --- */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-linear-to-br from-indigo-200/50 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-linear-to-tl from-blue-200/40 to-transparent blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
              <Icon name="Package" className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 italic">The Inventory</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => onNavigate('warehouses')} className={getNavClass('warehouses')}>Depozite</button>
            <button onClick={() => onNavigate('suppliers')} className={getNavClass('suppliers')}>Furnizori</button>
            <button onClick={() => onNavigate('products')} className={getNavClass('products')}>Produse</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-20">
        {/* --- HERO SECTION --- */}
        <div className="text-center mb-32">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-tight mb-8">
            Gestiune <span className="text-indigo-600">Profesională</span>
          </h1>
          <button 
            onClick={() => onNavigate('warehouses')}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-2xl flex items-center gap-3 mx-auto cursor-pointer"
          >
            Explorează Sistemul <Icon name="ArrowRight" className="w-5 h-5" />
          </button>
        </div>

        {/* --- ARHITECTURA SISTEMULUI (Cele 3 Tabele Mapate Exact) --- */}
        <section className="bg-slate-900 rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)]" />
          
          <div className="relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-white mb-4">Arhitectura Sistemului</h2>
              <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full" />
            </div>

            {/* Container ERD */}
            <div className="flex flex-col md:flex-row justify-center gap-8 items-start md:items-stretch">
              
              {/* TABEL: SUPPLIERS */}
              <ERDTable 
                title="suppliers" 
                icon="Truck" 
                colorClass="bg-blue-600/50"
                columns={[
                  { name: "id", type: "Integer", keyType: "PK" },
                  { name: "name", type: "String" },
                  { name: "contact_email", type: "String" }
                ]} 
              />

              {/* TABEL: PRODUCTS (Motorul central, cu UUID) */}
              <div className="relative flex-1 max-w-75 w-full mx-auto md:mx-0">
                <div className="absolute -inset-2 bg-indigo-500/10 blur-lg rounded-2xl pointer-events-none" />
                <ERDTable 
                  title="products" 
                  icon="Box" 
                  colorClass="bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.25)]"
                  columns={[
                    { name: "id", type: "String (UUID)", keyType: "PK" },
                    { name: "warehouse_id", type: "Integer", keyType: "FK" },
                    { name: "name", type: "String" },
                    { name: "sku", type: "String" },
                    { name: "description", type: "String" },
                    { name: "price", type: "Float" },
                    { name: "category", type: "String" },
                    { name: "stockQuantity", type: "Integer" }
                  ]} 
                />
              </div>

              {/* TABEL: WAREHOUSES */}
              <ERDTable 
                title="warehouses" 
                icon="Warehouse" 
                colorClass="bg-emerald-600/50"
                columns={[
                  { name: "id", type: "Integer", keyType: "PK" },
                  { name: "name", type: "String" },
                  { name: "location", type: "String" }
                ]} 
              />

            </div>
            
            <p className="text-center mt-16 text-slate-500 text-xs font-mono uppercase tracking-[0.2em]">
              "Sincronizare atomică între baza de date și interfața utilizator."
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}