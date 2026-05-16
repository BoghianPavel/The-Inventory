import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import Navbar from './Navbar'; // 👈 Am adăugat importul pentru noul fișier Navbar.jsx

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
  // 💡 Notă: Funcția getNavClass a fost ștearsă deoarece logica ei este acum tratată în interiorul Navbar.jsx

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* --- FUNDAL MESH GRADIENT --- */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-200/50 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      {/* 👈 Am înlocuit nav-ul hardcodat cu noua componentă modulară */}
      <Navbar currentView={currentView} onNavigate={onNavigate} />

      {/* flex-1 asigură că main ocupă spațiul, dar pb-12 reduce distanța până la footer */}
      <main className="flex-1 max-w-7xl mx-auto px-8 pt-20 pb-12">
        
        {/* --- HERO SECTION --- */}
        <div className="text-center mb-24 relative">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Sistem Integrat de Gestiune v2.0
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-tight mb-6">
            Gestiune <span className="text-indigo-600">Profesională</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
            Optimizează fluxul de lucru al depozitului tău cu o arhitectură modernă, 
            sincronizare în timp real și interfață intuitivă.
          </p>

          <button 
            onClick={() => onNavigate('warehouses')}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-2xl flex items-center gap-3 mx-auto cursor-pointer"
          >
            Explorează Sistemul <Icon name="ArrowRight" className="w-5 h-5" />
          </button>
        </div>

        {/* --- STATISTICI RAPIDE --- */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-32 px-4">
          {[
            { value: "99.9%", label: "Acuratețe" },
            { value: "⚡ < 10ms", label: "Latență" },
            { value: "UUID v4", label: "Securitate" },
            { value: "Real-time", label: "Sync" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center border-r last:border-0 border-slate-200">
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* --- ARHITECTURA SISTEMULUI --- */}
        <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden mb-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)]" />
          
          <div className="relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-white mb-4">Arhitectura Sistemului</h2>
              <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full" />
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-8 items-start md:items-stretch">
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
                    { name: "price", type: "Float" },
                    { name: "stockQuantity", type: "Integer" }
                  ]} 
                />
              </div>

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
          </div>
        </section>

        {/* --- BENEFICII (Bento Grid) --- */}
        <section className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-2">De ce The Inventory?</h2>
            <p className="text-slate-500">Funcționalități gândite pentru eficiență maximă.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Control Multi-Depozit", desc: "Transferă și alocă stocuri instant între locații fizice diferite.", icon: "MapPin" },
              { title: "Relații Eficiente", desc: "Corelează automat produsele cu furnizorii pentru re-aprovizionare.", icon: "Users" },
              { title: "Performanță Nativă", desc: "Interfață optimizată pentru procesarea a mii de SKU-uri fără lag.", icon: "Zap" }
            ].map((feat, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="p-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                  <Icon name={feat.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Partea stângă: Logo */}
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <Icon name="Package" className="w-5 h-5 text-slate-900" />
            <span className="font-bold text-slate-900 italic">The Inventory</span>
          </div>
          
          {/* Centru: Link-uri */}
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Documentație</span>
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">API</span>
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Contact</span>
          </div>
          
          {/* Partea dreaptă: Copyright + GitHub */}
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} - Construit pentru Excelență</p>
            
            {/* Butonul/Link-ul spre GitHub */}
            <a 
              href="https://github.com/BoghianPavel/The-Inventory" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              title="Vezi codul sursă pe GitHub"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.2 5.2 0 0 0-1.39-3.6 4.9 4.9 0 0 0-.12-3.5s-1.13-.36-3.7 1.36a12.8 12.8 0 0 0-6.8 0C6.13 2 5 2.36 5 2.36a4.9 4.9 0 0 0-.12 3.5A5.2 5.2 0 0 0 3.5 9.5c0 5.23 3 6.42 6 6.76-.94.8-1.36 2.02-1.4 3.24v4"></path>
                <path d="M4 19c-2-1.5-2-2-4-2"></path>
              </svg>
            </a>
          </div>
          
        </div>
      </footer>
    </div>
  );
}