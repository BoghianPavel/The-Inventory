import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Icon = ({ name, ...props }) => {
  const LucideIcon = Icons[name] || Icons.HelpCircle;
  return <LucideIcon {...props} />;
};

const API = 'http://localhost:8000/api/suppliers';

// ─── Modal creare / editare ───────────────────────────────────────────────────
function SupplierModal({ supplier, onClose, onSave }) {
  const isEdit = !!supplier?.id;
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contact_email: supplier?.contact_email || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [method, setMethod] = useState('patch');
  
  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = 'Minim 3 caractere';
    if (!form.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email))
      e.contact_email = 'Email invalid';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      if (isEdit) {
        const numericId = parseInt(supplier.id.replace('S', ''));

        if (method === 'put') {
          await axios.put(`${API}/${numericId}`, form);
        } else {
          await axios.patch(`${API}/${numericId}`, form);
        }
        toast.success('Furnizor actualizat!');
      } else {
        await axios.post(`${API}/`, form);
        toast.success('Furnizor creat!');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Icon name="Truck" className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Editează Furnizor' : 'Furnizor Nou'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>

        {isEdit && (
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Tip actualizare
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMethod('patch')}
                className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition ${
                  method === 'patch'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                PATCH (parțial)
              </button>

              <button
                type="button"
                onClick={() => setMethod('put')}
                className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition ${
                  method === 'put'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                PUT (total)
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Nume furnizor</label>
            <input
              className={`w-full bg-slate-700/60 border ${errors.name ? 'border-red-500' : 'border-slate-600'} rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
              placeholder="ex: Tech Supplies SRL"
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: undefined })); }}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Email contact</label>
            <input
              type="email"
              className={`w-full bg-slate-700/60 border ${errors.contact_email ? 'border-red-500' : 'border-slate-600'} rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
              placeholder="contact@furnizor.ro"
              value={form.contact_email}
              onChange={e => { setForm(f => ({ ...f, contact_email: e.target.value })); setErrors(er => ({ ...er, contact_email: undefined })); }}
            />
            {errors.contact_email && <p className="text-red-400 text-xs mt-1">{errors.contact_email}</p>}
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors font-medium cursor-pointer"
          >
            Anulează
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Icon name="Loader2" className="w-4 h-4 animate-spin" /> : <Icon name="Check" className="w-4 h-4" />}
            {isEdit ? 'Salvează' : 'Creează'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Modal ștergere ───────────────────────────────────────────────────────────
function DeleteConfirm({ supplier, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const numericId = parseInt(supplier.id.replace('S', ''));
      await axios.delete(`${API}/${numericId}`);
      toast.success('Furnizor șters!');
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare la ștergere');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="Trash2" className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white text-center mb-2">Șterge furnizor?</h2>
        <p className="text-slate-400 text-center text-sm mb-6">
          <span className="text-white font-medium">{supplier.name}</span> va fi șters permanent. Această acțiune nu poate fi anulată.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors font-medium cursor-pointer">
            Anulează
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Icon name="Loader2" className="w-4 h-4 animate-spin" /> : <Icon name="Trash2" className="w-4 h-4" />}
            Șterge
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Pagina principală ────────────────────────────────────────────────────────
export default function SuppliersPage({ onNavigate }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/`);
      setSuppliers(res.data);
    } catch {
      toast.error('Nu s-au putut încărca furnizorii');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/`);
        setSuppliers(res.data);
      } catch {
        toast.error('Nu s-au putut încărca furnizorii');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
              <Icon name="Package" className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 italic">The Inventory</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => onNavigate('warehouses')} className="transition-colors cursor-pointer font-semibold text-sm text-slate-600 hover:text-indigo-600">Depozite</button>
            <button onClick={() => onNavigate('suppliers')} className="transition-colors cursor-pointer font-semibold text-sm text-indigo-600">Furnizori</button>
            <button onClick={() => onNavigate('products')} className="transition-colors cursor-pointer font-semibold text-sm text-slate-600 hover:text-indigo-600">Produse</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-900">Furnizori</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {suppliers.length} furnizor{suppliers.length !== 1 ? 'i' : ''} înregistrat{suppliers.length !== 1 ? 'i' : ''}
            </p>
          </div>
          <button
            onClick={() => setModal({ type: 'create' })}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg cursor-pointer"
          >
            <Icon name="Plus" className="w-4 h-4" />
            Furnizor Nou
          </button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full max-w-sm bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 shadow-sm transition-colors"
            placeholder="Caută furnizori..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Icon name="Loader2" className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Truck" className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              {search ? 'Niciun rezultat găsit' : 'Niciun furnizor înregistrat'}
            </p>
            {!search && (
              <button onClick={() => setModal({ type: 'create' })} className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold text-sm cursor-pointer">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Icon name="Truck" className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                      {supplier.id}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{supplier.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Icon name="Mail" className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{supplier.contact_email}</span>
                  </div>
                  <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setModal({ type: 'edit', supplier })}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <Icon name="Pencil" className="w-3.5 h-3.5" />
                      Editează
                    </button>
                    <button
                      onClick={() => setModal({ type: 'delete', supplier })}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Icon name="Trash2" className="w-3.5 h-3.5" />
                      Șterge
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AnimatePresence>
        {modal?.type === 'create' && (
          <SupplierModal onClose={() => setModal(null)} onSave={fetchSuppliers} />
        )}
        {modal?.type === 'edit' && (
          <SupplierModal supplier={modal.supplier} onClose={() => setModal(null)} onSave={fetchSuppliers} />
        )}
        {modal?.type === 'delete' && (
          <DeleteConfirm supplier={modal.supplier} onClose={() => setModal(null)} onDeleted={fetchSuppliers} />
        )}
      </AnimatePresence>
    </div>
  );
}
