import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
 
const Icon = ({ name, ...props }) => {
  const LucideIcon = Icons[name] || Icons.HelpCircle;
  return <LucideIcon {...props} />;
};
 
const API = 'http://localhost:8000/api/warehouses';
 
// ─── Modal backdrop ───────────────────────────────────────────────────────────
function ModalBackdrop({ onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.82)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
 
// ─── Modal creare / editare ───────────────────────────────────────────────────
function WarehouseModal({ warehouse, onClose, onSave }) {
  const isEdit = !!warehouse?.id;
  
  const initialFormState = { name: warehouse?.name || '', location: warehouse?.location || '' };

  const [form, setForm] = useState(initialFormState);
  const [initialForm] = useState(initialFormState);

  const [method, setMethod] = useState('patch');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
 
  const set = (field, val) => { setForm(f => ({ ...f, [field]: val })); setErrors(e => ({ ...e, [field]: undefined })); };
 
  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = 'Minim 3 caractere';
    if (!form.location) e.location = 'Locația este obligatorie';
    return e;
  };
 
  const handleSubmit = async () => {
    // 🚨 3. Comparația obiectelor înainte de validare/request
    if (isEdit && JSON.stringify(form) === JSON.stringify(initialForm)) {
      toast('Nu ai modificat nicio informație.', {
        icon: '⚠️',
        style: { borderRadius: '12px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }
      });
      return;
    }

    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    
    setLoading(true);
    try {
      if (isEdit) {
        const id = parseInt(warehouse.id.replace('W', ''));
        method === 'put' ? await axios.put(`${API}/${id}`, form) : await axios.patch(`${API}/${id}`, form);
        toast.success('Depozit actualizat!');
      } else {
        await axios.post(`${API}/`, form);
        toast.success('Depozit creat!');
      }
      onSave(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare server');
    } finally { setLoading(false); }
  };
 
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600/15 to-teal-600/10 border-b border-slate-700/80 px-7 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/25 rounded-2xl flex items-center justify-center">
                <Icon name="Warehouse" className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{isEdit ? 'Editează Depozit' : 'Depozit Nou'}</h2>
                <p className="text-slate-500 text-xs">{isEdit ? warehouse.id : 'Completează informațiile'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
              <Icon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>
 
        <div className="px-7 py-6 space-y-5">
          {isEdit && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tip actualizare</label>
              <div className="flex gap-1.5 p-1 bg-slate-800 rounded-xl">
                {[{ v: 'patch', l: 'PATCH', sub: 'parțial', c: 'bg-emerald-600' }, { v: 'put', l: 'PUT', sub: 'complet', c: 'bg-teal-600' }].map(m => (
                  <button key={m.v} type="button" onClick={() => setMethod(m.v)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${method === m.v ? `${m.c} text-white shadow` : 'text-slate-500 hover:text-slate-300'}`}>
                    {m.l} <span className={`font-normal ${method === m.v ? 'text-white/60' : 'text-slate-600'}`}>({m.sub})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
 
          {[
            { label: 'Nume depozit', field: 'name', placeholder: 'ex: Depozit Central Cluj', icon: 'Warehouse' },
            { label: 'Locație', field: 'location', placeholder: 'ex: Cluj-Napoca, Str. Industriilor 12', icon: 'MapPin' },
          ].map(({ label, field, placeholder, icon }) => (
            <div key={field}>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">{label}</label>
              <div className="relative">
                <Icon name={icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  className={`w-full bg-slate-800 border ${errors[field] ? 'border-red-500/70' : 'border-slate-700'} rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-all text-sm`}
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={e => set(field, e.target.value)}
                />
              </div>
              {errors[field] && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><Icon name="AlertCircle" className="w-3 h-3" />{errors[field]}</p>}
            </div>
          ))}
        </div>
 
        <div className="px-7 pb-7 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium cursor-pointer">Anulează</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-emerald-500/20">
            {loading ? <Icon name="Loader2" className="w-4 h-4 animate-spin" /> : <Icon name="Check" className="w-4 h-4" />}
            {isEdit ? 'Salvează' : 'Creează depozitul'}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
 
// ─── Modal ștergere ───────────────────────────────────────────────────────────
function DeleteConfirm({ warehouse, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
 
  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API}/${parseInt(warehouse.id.replace('W', ''))}`);
      toast.success(`"${warehouse.name}" a fost șters.`);
      onDeleted(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare la ștergere');
    } finally { setLoading(false); }
  };
 
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Icon name="Trash2" className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Șterge depozit?</h2>
        <p className="text-white font-semibold text-sm mb-1">"{warehouse.name}"</p>
        <p className="text-slate-500 text-xs mb-7">{warehouse.location} · {warehouse.id}<br/>
          <span className="text-orange-400">Atenție: produsele asociate vor fi afectate.</span>
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all text-sm font-medium cursor-pointer">Anulează</button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer">
            {loading ? <Icon name="Loader2" className="w-4 h-4 animate-spin" /> : <Icon name="Trash2" className="w-4 h-4" />}
            Șterge
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
 
// ─── Pagina principală ────────────────────────────────────────────────────────
export default function WarehousesPage({ onNavigate, onBack }) {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
 
  const fetchWarehouses = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/`); setWarehouses(res.data); }
    catch { toast.error('Nu s-au putut încărca depozitele'); }
    finally { setLoading(false); }
  };
 
useEffect(() => {
  const loadWarehouses = async () => {
    await fetchWarehouses();
  };

  loadWarehouses();
}, []);
 
  const filtered = [...warehouses]
  .sort((a, b) => {
    const idA = parseInt(a.id.replace('W', ''));
    const idB = parseInt(b.id.replace('W', ''));
    return idA - idB;
  })
  .filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.location.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentView="warehouses" onNavigate={onNavigate} onBack={onBack} />
 
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Depozite</h1>
            <p className="text-slate-400 mt-1 text-sm">{warehouses.length} înregistrate</p>
          </div>
          <button onClick={() => setModal({ type: 'create' })}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer">
            <Icon name="Plus" className="w-4 h-4" />Depozit Nou
          </button>
        </motion.div>
 
        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="mb-6">
          <div className="relative max-w-sm">
            <Icon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 shadow-sm text-sm transition-colors"
              placeholder="Caută depozite..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <Icon name="X" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
 
        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Icon name="Loader2" className="w-7 h-7 text-indigo-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Warehouse" className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm">{search ? 'Niciun rezultat.' : 'Niciun depozit înregistrat.'}</p>
            {!search && (
              <button onClick={() => setModal({ type: 'create' })} className="mt-3 text-emerald-600 hover:text-emerald-700 font-semibold text-sm cursor-pointer">
                Adaugă primul depozit →
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((warehouse, i) => (
                <motion.div
                  key={warehouse.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04 }}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center">
                        <Icon name="Warehouse" className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                        {warehouse.id}
                      </span>
                    </div>
 
                    <h3 className="font-bold text-slate-900 text-base mb-1 truncate">{warehouse.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-4">
                      <Icon name="MapPin" className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{warehouse.location}</span>
                    </div>
 
                    {/* CTA produse */}
                    <button
                      onClick={() => onNavigate('products', { warehouseId: warehouse.id })}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer mb-3"
                    >
                      <Icon name="Box" className="w-3.5 h-3.5" />
                      Vezi Produse
                    </button>
 
                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button onClick={() => setModal({ type: 'edit', warehouse })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
                        <Icon name="Pencil" className="w-3.5 h-3.5" />Editează
                      </button>
                      <div className="w-px bg-slate-100" />
                      <button onClick={() => setModal({ type: 'delete', warehouse })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer">
                        <Icon name="Trash2" className="w-3.5 h-3.5" />Șterge
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
 
      <AnimatePresence>
        {modal?.type === 'create' && <WarehouseModal onClose={() => setModal(null)} onSave={fetchWarehouses} />}
        {modal?.type === 'edit'   && <WarehouseModal warehouse={modal.warehouse} onClose={() => setModal(null)} onSave={fetchWarehouses} />}
        {modal?.type === 'delete' && <DeleteConfirm warehouse={modal.warehouse} onClose={() => setModal(null)} onDeleted={fetchWarehouses} />}
      </AnimatePresence>
    </div>
  );
}