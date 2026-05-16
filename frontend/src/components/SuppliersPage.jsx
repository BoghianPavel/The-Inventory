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
 
const API = 'http://localhost:8000/api/suppliers';
 
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
function SupplierModal({ supplier, onClose, onSave }) {
  const isEdit = !!supplier?.id;
  const [form, setForm] = useState({ name: supplier?.name || '', contact_email: supplier?.contact_email || '' });
  const [method, setMethod] = useState('patch');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
 
  const set = (field, val) => { setForm(f => ({ ...f, [field]: val })); setErrors(e => ({ ...e, [field]: undefined })); };
 
  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = 'Minim 3 caractere';
    if (!form.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) e.contact_email = 'Email invalid';
    return e;
  };
 
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      if (isEdit) {
        const id = parseInt(supplier.id.replace('S', ''));
        method === 'put' ? await axios.put(`${API}/${id}`, form) : await axios.patch(`${API}/${id}`, form);
        toast.success('Furnizor actualizat cu succes!');
      } else {
        await axios.post(`${API}/`, form);
        toast.success('Furnizor creat cu succes!');
      }
      onSave(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare server');
    } finally { setLoading(false); }
  };
 
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/15 to-indigo-600/10 border-b border-slate-700/80 px-7 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/15 border border-blue-500/25 rounded-2xl flex items-center justify-center">
                <Icon name="Truck" className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{isEdit ? 'Editează Furnizor' : 'Furnizor Nou'}</h2>
                <p className="text-slate-500 text-xs">{isEdit ? supplier.id : 'Completează informațiile'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
              <Icon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>
 
        <div className="px-7 py-6 space-y-5">
          {/* Selector PATCH/PUT */}
          {isEdit && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tip actualizare</label>
              <div className="flex gap-1.5 p-1 bg-slate-800 rounded-xl">
                {[{ v: 'patch', l: 'PATCH', sub: 'parțial', c: 'bg-blue-600' }, { v: 'put', l: 'PUT', sub: 'complet', c: 'bg-indigo-600' }].map(m => (
                  <button key={m.v} type="button" onClick={() => setMethod(m.v)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${method === m.v ? `${m.c} text-white shadow` : 'text-slate-500 hover:text-slate-300'}`}>
                    {m.l} <span className={`font-normal ${method === m.v ? 'text-white/60' : 'text-slate-600'}`}>({m.sub})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
 
          {/* Câmpuri */}
          {[
            { label: 'Nume furnizor', field: 'name', type: 'text', placeholder: 'ex: Tech Supplies SRL', icon: 'Building2' },
            { label: 'Email contact', field: 'contact_email', type: 'email', placeholder: 'contact@furnizor.ro', icon: 'Mail' },
          ].map(({ label, field, type, placeholder, icon }) => (
            <div key={field}>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">{label}</label>
              <div className="relative">
                <Icon name={icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type={type}
                  className={`w-full bg-slate-800 border ${errors[field] ? 'border-red-500/70 bg-red-500/5' : 'border-slate-700'} rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-slate-800 transition-all text-sm`}
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={e => set(field, e.target.value)}
                />
              </div>
              {errors[field] && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <Icon name="AlertCircle" className="w-3 h-3" />{errors[field]}
                </p>
              )}
            </div>
          ))}
        </div>
 
        <div className="px-7 pb-7 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium cursor-pointer">
            Anulează
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-blue-500/20">
            {loading ? <Icon name="Loader2" className="w-4 h-4 animate-spin" /> : <Icon name="Check" className="w-4 h-4" />}
            {isEdit ? 'Salvează' : 'Creează furnizorul'}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
 
// ─── Modal ștergere ───────────────────────────────────────────────────────────
function DeleteConfirm({ supplier, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
 
  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API}/${parseInt(supplier.id.replace('S', ''))}`);
      toast.success(`"${supplier.name}" a fost șters.`);
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
        <h2 className="text-lg font-bold text-white mb-1">Șterge furnizor?</h2>
        <p className="text-white font-semibold text-sm mb-1">"{supplier.name}"</p>
        <p className="text-slate-500 text-xs mb-7">{supplier.contact_email} · {supplier.id}</p>
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
export default function SuppliersPage({ onNavigate, onBack }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
 
  const fetchSuppliers = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/`); setSuppliers(res.data); }
    catch { toast.error('Nu s-au putut încărca furnizorii'); }
    finally { setLoading(false); }
  };
 
useEffect(() => {
  const loadSuppliers = async () => {
    await fetchSuppliers();
  };

  loadSuppliers();
}, []);
 
  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_email.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentView="suppliers" onNavigate={onNavigate} onBack={onBack} />
 
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Furnizori</h1>
            <p className="text-slate-400 mt-1 text-sm">{suppliers.length} înregistrați</p>
          </div>
          <button onClick={() => setModal({ type: 'create' })}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer">
            <Icon name="Plus" className="w-4 h-4" />Furnizor Nou
          </button>
        </motion.div>
 
        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="mb-6">
          <div className="relative max-w-sm">
            <Icon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 shadow-sm text-sm transition-colors"
              placeholder="Caută furnizori..."
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
              <Icon name="Truck" className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm">{search ? 'Niciun rezultat.' : 'Niciun furnizor înregistrat.'}</p>
            {!search && (
              <button onClick={() => setModal({ type: 'create' })} className="mt-3 text-blue-600 hover:text-blue-700 font-semibold text-sm cursor-pointer">
                Adaugă primul furnizor →
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((supplier, i) => (
                <motion.div
                  key={supplier.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04 }}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  {/* Top accent */}
                  <div className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
 
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center">
                        <Icon name="Truck" className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                        {supplier.id}
                      </span>
                    </div>
 
                    <h3 className="font-bold text-slate-900 text-base mb-1 truncate">{supplier.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-5">
                      <Icon name="Mail" className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{supplier.contact_email}</span>
                    </div>
 
                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                      <button onClick={() => setModal({ type: 'edit', supplier })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
                        <Icon name="Pencil" className="w-3.5 h-3.5" />Editează
                      </button>
                      <div className="w-px bg-slate-100" />
                      <button onClick={() => setModal({ type: 'delete', supplier })}
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
        {modal?.type === 'create' && <SupplierModal onClose={() => setModal(null)} onSave={fetchSuppliers} />}
        {modal?.type === 'edit'   && <SupplierModal supplier={modal.supplier} onClose={() => setModal(null)} onSave={fetchSuppliers} />}
        {modal?.type === 'delete' && <DeleteConfirm supplier={modal.supplier} onClose={() => setModal(null)} onDeleted={fetchSuppliers} />}
      </AnimatePresence>
    </div>
  );
}