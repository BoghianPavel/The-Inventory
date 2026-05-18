import { motion } from 'framer-motion';
import Navbar from './Navbar';

// SVG Icons (fără lucide-react)
const icons = {
  ArrowRight: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  ),
  Truck: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M3 7h12v10H3z" />
      <path strokeWidth="2" d="M15 10h4l2 3v4h-6z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  ),
  Box: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path strokeWidth="2" d="M3 8v8l9 5 9-5V8" />
    </svg>
  ),
  Warehouse: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M3 21V9l9-6 9 6v12" />
      <path strokeWidth="2" d="M9 21V12h6v9" />
    </svg>
  ),
  MapPin: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z" />
    </svg>
  ),
  Users: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
    </svg>
  ),
  Zap: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  ),
  Package: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M21 16V8l-9-5-9 5v8l9 5 9-5z" />
      <path strokeWidth="2" d="M3.3 7l8.7 5 8.7-5" />
    </svg>
  ),
  HelpCircle: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" d="M9 9a3 3 0 016 0c0 2-3 2-3 4" />
      <circle cx="12" cy="17" r="1" />
    </svg>
  ),
  Github: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.12.82-.26.82-.58v-2.2c-3.34.73-4.04-1.4-4.04-1.4-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.22.08 1.86 1.25 1.86 1.25 1.08 1.86 2.84 1.32 3.54 1 .1-.8.42-1.32.76-1.62-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.24-3.25-.12-.3-.54-1.52.12-3.18 0 0 1.02-.33 3.34 1.24a11.6 11.6 0 016.08 0c2.32-1.57 3.34-1.24 3.34-1.24.66 1.66.24 2.88.12 3.18.77.85 1.24 1.93 1.24 3.25 0 4.63-2.8 5.66-5.48 5.96.43.37.81 1.1.81 2.22v3.3c0 .32.22.7.82.58A12 12 0 0024 12C24 5.37 18.63 0 12 0z"/>
    </svg>
  )
};

const Icon = ({ name, ...props }) => {
  const Cmp = icons[name] || icons.HelpCircle;
  return <Cmp {...props} />;
};

// ERD Table
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
                col.keyType === 'PK'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
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
  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-200/50 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px]" />
      </div>

      <Navbar currentView={currentView} onNavigate={onNavigate} />

      <main className="flex-1 max-w-7xl mx-auto px-8 pt-20 pb-12">

        {/* HERO */}
        <div className="text-center mb-24">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-6">
            Gestiune <span className="text-indigo-600">Profesională</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10">
            Sistem modern de gestiune pentru depozite.
          </p>

          <button
            onClick={() => onNavigate('warehouses')}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 flex items-center gap-3 mx-auto"
          >
            Explorează Sistemul <Icon name="ArrowRight" className="w-5 h-5" />
          </button>
        </div>

        {/* ERD */}
        <section className="bg-slate-900 rounded-[3rem] p-12 mb-24">

          <div className="flex flex-col md:flex-row justify-center gap-8">

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

            <ERDTable
              title="products"
              icon="Box"
              colorClass="bg-indigo-600"
              columns={[
                { name: "id", type: "UUID", keyType: "PK" },
                { name: "warehouse_id", type: "Integer", keyType: "FK" },
                { name: "name", type: "String" },
                { name: "sku", type: "String" },
                { name: "description", type: "String" },
                { name: "price", type: "Float" },
                { name: "category", type: "String" },
                { name: "stockQuantity", type: "Integer" }
              ]}
            />

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
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">

          <div className="flex items-center gap-2">
            <Icon name="Package" className="w-5 h-5" />
            <span>The Inventory</span>
          </div>

          <a
            href="https://github.com/BoghianPavel/The-Inventory"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-black"
          >
            <Icon name="Github" className="w-5 h-5" />
          </a>

        </div>
      </footer>
    </div>
  );
}