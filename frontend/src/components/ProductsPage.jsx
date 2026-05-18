import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
 
const Icon = ({ name, ...props }) => {
  const LucideIcon = Icons[name] || Icons.HelpCircle;
  return <LucideIcon {...props} />;
};
 
const BASE = 'https://the-inventory-backend.onrender.com/api';
const parseWId = (id) => {
  if (!id) return null;
  return parseInt(String(id).replace('W', ''));
};
const formatRON = (v) => Number(v).toLocaleString('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 2 });
 
const CAT = {
  Electronics: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   bar: 'from-blue-500 to-indigo-500' },
  Food:        { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  bar: 'from-green-500 to-emerald-500' },
  Clothing:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', bar: 'from-purple-500 to-pink-500' },
  Tools:       { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'from-orange-500 to-amber-500' },
  Furniture:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  bar: 'from-amber-500 to-yellow-500' },
  Automotive:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    bar: 'from-red-500 to-rose-500' },
};
const getCat = (c) => CAT[c] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', bar: 'from-slate-400 to-slate-500' };
 
// ─── Reusable ─────────────────────────────────────────────────────────────────
function ModalBackdrop({ onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}
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
 
function StockBadge({ qty }) {
  if (qty === 0)   return <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Fără stoc</span>;
  if (qty < 10)   return <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-200"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />{qty} buc.</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{qty} buc.</span>;
}
 
function FormField({
  label,
  field,
  type = 'text',
  placeholder,
  value,
  onChange,
  errors,
  children
}) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
        {label}
      </label>

      {children ?? (
        <input
          type={type}
          className={`w-full bg-slate-800 border ${
            errors[field] ? 'border-red-500/70' : 'border-slate-700'
          } rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-400 text-sm transition-all`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}

      {errors[field] && (
        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
          <Icon name="AlertCircle" className="w-3 h-3" />
          {errors[field]}
        </p>
      )}
    </div>
  );
}

// ─── Modal Produs ─────────────────────────────────────────────────────────────
function ProductModal({ product, warehouseId, onClose, onSave }) {
  const isEdit = !!product?.id;
  const initialFormState = {
    name: product?.name || '', sku: product?.sku || '',
    description: product?.description || '', price: product?.price ?? '',
    category: product?.category || '', stockQuantity: product?.stockQuantity ?? 0,
  };

  const [form, setForm] = useState(initialFormState);
  const [initialForm] = useState(initialFormState);

  const [method, setMethod] = useState('patch');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
 
  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: undefined })); };
 
  const validate = () => {
    const e = {};
    if (!form.name?.trim() || form.name.trim().length < 3) e.name = 'Minim 3 caractere';
    if (!form.sku?.trim()  || form.sku.trim().length  < 3) e.sku  = 'Minim 3 caractere';
    if (!form.description?.trim()) e.description = 'Obligatoriu';
    if (!form.price || Number(form.price) <= 0) e.price = 'Preț > 0';
    if (!form.category?.trim()) e.category = 'Obligatorie';
    if (!isEdit && (form.stockQuantity === '' || Number(form.stockQuantity) < 0)) e.stockQuantity = 'Stoc ≥ 0';
    return e;
  };
 
  const handleSubmit = async () => {
    // 🚨 3. Validarea UX care oprește salvarea inutilă
    if (isEdit && method == 'patch' && isEdit && JSON.stringify(form) === JSON.stringify(initialForm)) {
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
      const wId = parseWId(warehouseId);
      const payload = { name: form.name, sku: form.sku, description: form.description, price: Number(form.price), category: form.category };
      if (isEdit) {
        const url = `${BASE}/warehouses/${wId}/products/${product.id}`;
        method === 'put' ? await axios.put(url, payload) : await axios.patch(url, payload);
        toast.success('Produs actualizat!');
      } else {
        await axios.post(`${BASE}/warehouses/${wId}/products/`, { ...payload, stockQuantity: Number(form.stockQuantity) });
        toast.success('Produs creat!');
      }
      onSave(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare server');
    } finally { setLoading(false); }
  };
 
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-600/15 to-violet-600/10 border-b border-slate-700/80 px-7 py-5 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/15 border border-indigo-500/25 rounded-2xl flex items-center justify-center">
                <Icon name="Box" className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{isEdit ? 'Editează Produs' : 'Produs Nou'}</h2>
                <p className="text-slate-500 text-xs">{isEdit ? String(product.id).slice(0,8) + '...' : 'Completează câmpurile'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
              <Icon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>
 
        <div className="px-7 py-6 space-y-4">
          {isEdit && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tip actualizare</label>
              <div className="flex gap-1.5 p-1 bg-slate-800 rounded-xl">
                {[{ v: 'patch', l: 'PATCH', sub: 'parțial', c: 'bg-indigo-600' }, { v: 'put', l: 'PUT', sub: 'complet', c: 'bg-violet-600' }].map(m => (
                  <button key={m.v} type="button" onClick={() => setMethod(m.v)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${method === m.v ? `${m.c} text-white shadow` : 'text-slate-500 hover:text-slate-300'}`}>
                    {m.l} <span className={`font-normal ${method === m.v ? 'text-white/60' : 'text-slate-600'}`}>({m.sub})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
 
          <FormField
            label="Nume produs"
            field="name"
            placeholder="ex: Laptop Dell XPS 15"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            errors={errors}
          />
 
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="SKU"
              field="sku"
              placeholder="ex: DELL-XPS-001"
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              errors={errors}
            />
            <FormField
              label="Categorie"
              field="category"
              errors={errors}
            >
              <>
                <input
                  className={`w-full bg-slate-800 border ${
                    errors.category
                      ? 'border-red-500/70'
                      : 'border-slate-700'
                  } rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-400 text-sm transition-all`}
                  placeholder="ex: Electronics"
                  value={form.category}
                  list="cat-list"
                  onChange={(e) => set('category', e.target.value)}
                />

                <datalist id="cat-list">
                  {Object.keys(CAT).map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </>
            </FormField>
          </div>
 
          <FormField
            label="Descriere"
            field="description"
            placeholder="Descriere scurtă a produsului"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            errors={errors}
          />
 
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Preț (RON)"
              field="price"
              type="number"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              errors={errors}
            />
            {!isEdit && (
              <FormField
                label="Stoc inițial"
                field="stockQuantity"
                type="number"
                placeholder="0"
                value={form.stockQuantity}
                onChange={(e) => set('stockQuantity', e.target.value)}
                errors={errors}
              />
            )}
          </div>
        </div>
 
        <div className="px-7 pb-7 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium cursor-pointer">Anulează</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-indigo-500/20">
            {loading ? <Icon name="Loader2" className="w-4 h-4 animate-spin" /> : <Icon name="Check" className="w-4 h-4" />}
            {isEdit ? 'Salvează modificările' : 'Creează produsul'}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
 
// ─── Modal Ștergere ───────────────────────────────────────────────────────────
function DeleteConfirm({ product, warehouseId, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
 
  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${BASE}/warehouses/${parseWId(warehouseId)}/products/${product.id}`);
      toast.success(`"${product.name}" a fost șters.`);
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
        <h2 className="text-lg font-bold text-white mb-1">Șterge produs?</h2>
        <p className="text-white font-semibold text-sm mb-0.5">"{product.name}"</p>
        <p className="text-slate-500 text-xs mb-7">SKU: {product.sku} · Stoc: {product.stockQuantity} buc.</p>
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
 
// ─── Modal Stoc ───────────────────────────────────────────────────────────────
function StockModal({ product, warehouseId, warehouses, suppliers, operation, onClose, onSave }) {
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [targetWId, setTargetWId] = useState('');
  const [loading, setLoading] = useState(false);
 
  const CFG = {
    increase: { icon: 'TrendingUp',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', grad: 'from-emerald-600/15', btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20', label: 'Adaugă Stoc',    title: 'Creștere Stoc' },
    decrease: { icon: 'TrendingDown',   color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20',   grad: 'from-orange-600/15',  btn: 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/20',  label: 'Scade Stoc',     title: 'Scădere Stoc'  },
    transfer: { icon: 'ArrowLeftRight', color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20',         grad: 'from-sky-600/15',     btn: 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/20',           label: 'Transferă Stoc', title: 'Transfer Stoc' },
  };
  const cfg = CFG[operation];
  const otherWarehouses = warehouses.filter(w => w.id !== warehouseId);
  const qtyNum = Number(qty) || 0;
  const afterQty = operation === 'increase'
    ? product.stockQuantity + qtyNum
    : Math.max(0, product.stockQuantity - qtyNum);
 
  const handleSubmit = async () => {
    if (!qtyNum || qtyNum <= 0) { toast.error('Cantitatea trebuie să fie > 0'); return; }
    if (operation === 'increase' && !supplierId) { toast.error('Selectează un furnizor'); return; }
    if (operation === 'decrease' && !reason.trim()) { toast.error('Motivul este obligatoriu'); return; }
    if (operation === 'transfer') {
      if (!targetWId) { toast.error('Selectează depozitul destinație'); return; }
      if (!reason.trim()) { toast.error('Motivul este obligatoriu'); return; }
    }
    if ((operation === 'decrease' || operation === 'transfer') && qtyNum > product.stockQuantity) {
      toast.error(`Stoc insuficient. Disponibil: ${product.stockQuantity} buc.`); return;
    }
 
    setLoading(true);
    try {
      const url = `${BASE}/warehouses/${parseWId(warehouseId)}/inventory/${product.id}/${operation}`;
      
      // Am aplicat parseInt pe ID-uri pentru a fi compatibile cu validarea de int din Pydantic
      const payload =
        operation === 'increase' ? { quantity: qtyNum, supplierId: parseInt(supplierId) } :
        operation === 'decrease' ? { quantity: qtyNum, reason } :
        { quantity: qtyNum, targetWarehouseId: parseInt(targetWId), reason };
 
      const res = await axios.post(url, payload);
      const d = res.data;
 
      if (operation === 'increase') {
        toast.success(`+${qtyNum} buc. de la ${d.supplierName || 'Furnizor'}. Stoc nou: ${d.newStockQuantity}`);
      } else if (operation === 'decrease') {
        toast.success(`-${qtyNum} buc. Stoc rămas: ${d.newStockQuantity}. Motiv: ${d.reason}`);
      } else {
        // Căutăm local numele depozitului țintă pentru a evita erorile de undefined în mesajul succesiv
        const targetWarehouseName = warehouses.find(w => w.id === parseInt(targetWId))?.name || 'Depozit';
        toast.success(`Transfer ${qtyNum} buc. → ${targetWarehouseName}. Motiv: ${d.reason}`);
      }
 
      onSave(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare server');
    } finally { setLoading(false); }
  };
 
  const canSubmit = !loading &&
    (operation !== 'transfer' || otherWarehouses.length > 0) &&
    (operation !== 'increase' || suppliers.length > 0);
 
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${cfg.grad} to-transparent border-b border-slate-700/80 px-7 py-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${cfg.bg} border rounded-2xl flex items-center justify-center`}>
                <Icon name={cfg.icon} className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{cfg.title}</h2>
                <p className="text-slate-400 text-xs">{product.name} · <span className="font-mono">{product.sku}</span></p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
              <Icon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>
 
        <div className="px-7 py-6 space-y-4">
          {/* Preview stoc */}
          <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl px-5 py-4">
            <div className="flex-1">
              <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-0.5">Stoc curent</p>
              <p className={`text-2xl font-black ${product.stockQuantity === 0 ? 'text-red-400' : product.stockQuantity < 10 ? 'text-orange-400' : 'text-white'}`}>
                {product.stockQuantity} <span className="text-sm font-normal text-slate-500">buc.</span>
              </p>
            </div>
            {operation !== 'transfer' && qtyNum > 0 && (
              <>
                <Icon name="ArrowRight" className="w-4 h-4 text-slate-600" />
                <div className="flex-1 text-right">
                  <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-0.5">După operație</p>
                  <p className={`text-2xl font-black ${operation === 'increase' ? 'text-emerald-400' : afterQty === 0 ? 'text-red-400' : afterQty < 10 ? 'text-orange-400' : 'text-white'}`}>
                    {afterQty} <span className="text-sm font-normal text-slate-500">buc.</span>
                  </p>
                </div>
              </>
            )}
          </div>
 
          {/* Cantitate */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Cantitate</label>
            <input type="number" min="1"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-xl font-bold placeholder-slate-600 focus:outline-none focus:border-indigo-400 transition-all"
              placeholder="0" value={qty} onChange={e => setQty(e.target.value)} />
          </div>
 
          {/* Furnizor select (increase) */}
          {operation === 'increase' && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Furnizor</label>
              {suppliers.length === 0 ? (
                <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                  <Icon name="AlertTriangle" className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <p className="text-orange-300 text-sm">Nu există furnizori înregistrați.</p>
                </div>
              ) : (
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 text-sm cursor-pointer transition-all"
                  value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                  <option value="">Selectează furnizor...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                </select>
              )}
            </div>
          )}
 
          {/* Depozit destinație (transfer) */}
          {operation === 'transfer' && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Depozit destinație</label>
              {otherWarehouses.length === 0 ? (
                <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                  <Icon name="AlertTriangle" className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <p className="text-orange-300 text-sm">Nu există alte depozite disponibile.</p>
                </div>
              ) : (
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-400 text-sm cursor-pointer transition-all"
                  value={targetWId} onChange={e => setTargetWId(e.target.value)}>
                  <option value="">Selectează depozit...</option>
                  {otherWarehouses.map(w => <option key={w.id} value={w.id}>{w.name} — {w.location}</option>)}
                </select>
              )}
            </div>
          )}
 
          {/* Motiv */}
          {(operation === 'decrease' || operation === 'transfer') && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Motiv</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-400 text-sm transition-all"
                placeholder={operation === 'transfer' ? 'ex: Rebalansare stoc' : 'ex: Produse deteriorate'}
                value={reason} onChange={e => setReason(e.target.value)} />
            </div>
          )}
        </div>
 
        <div className="px-7 pb-7 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium cursor-pointer">Anulează</button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className={`flex-1 px-4 py-3 rounded-xl ${cfg.btn} disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg`}>
            {loading ? <Icon name="Loader2" className="w-4 h-4 animate-spin" /> : <Icon name={cfg.icon} className="w-4 h-4" />}
            {cfg.label}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
 
// ─── Card Produs ──────────────────────────────────────────────────────────────
function ProductCard({ product, index, onEdit, onDelete, onStock }) {
  const cat = getCat(product.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.035 }}
      className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      {/* Accent bar per categorie */}
      <div className={`h-0.5 bg-gradient-to-r ${cat.bar}`} />
 
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3 gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${cat.bg} ${cat.text} ${cat.border}`}>
            {product.category}
          </span>
          <StockBadge qty={product.stockQuantity} />
        </div>
 
        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-0.5">{product.name}</h3>
        <p className="text-xs font-mono text-slate-400 mb-2">SKU: {product.sku}</p>
        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">{product.description}</p>
 
        <div className="text-lg font-black text-slate-900 mb-4">{formatRON(product.price)}</div>
 
        {/* Operații stoc */}
        <div className="grid grid-cols-3 gap-1 mb-3 p-1 bg-slate-50 rounded-xl border border-slate-100">
          {[
            { op: 'increase', icon: 'TrendingUp',     label: '+Stoc',   cls: 'text-emerald-700 hover:bg-emerald-100', dis: false },
            { op: 'decrease', icon: 'TrendingDown',   label: '-Stoc',   cls: 'text-orange-700 hover:bg-orange-100',   dis: product.stockQuantity === 0 },
            { op: 'transfer', icon: 'ArrowLeftRight', label: 'Transfer', cls: 'text-sky-700 hover:bg-sky-100',        dis: product.stockQuantity === 0 },
          ].map(({ op, icon, label, cls, dis }) => (
            <button key={op} onClick={() => !dis && onStock(product, op)} disabled={dis}
              className={`flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${cls} ${dis ? 'opacity-30 cursor-not-allowed' : ''}`}>
              <Icon name={icon} className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
 
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
            <Icon name="Pencil" className="w-3.5 h-3.5" />Editează
          </button>
          <div className="w-px bg-slate-100" />
          <button onClick={() => onDelete(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer">
            <Icon name="Trash2" className="w-3.5 h-3.5" />Șterge
          </button>
        </div>
      </div>
    </motion.div>
  );
}
 
// ─── Pagina principală ────────────────────────────────────────────────────────
// ─── Pagina principală ────────────────────────────────────────────────────────
export default function ProductsPage({ onNavigate, onBack, params }) {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeWId, setActiveWId] = useState(params?.warehouseId || null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(null);
 
  // 1. Înrcărcăm depozitele și furnizorii o singură dată, la montarea paginii
  useEffect(() => {
    const loadData = async () => {
      try {
        const [wRes, sRes] = await Promise.all([
          axios.get(`${BASE}/warehouses/`),
          axios.get(`${BASE}/suppliers/`)
        ]);

        setWarehouses(wRes.data);
        setSuppliers(sRes.data);

        // Dacă nu avem depozit activ selectat (de exemplu, din params), îl selectăm pe primul
        if (!activeWId && wRes.data.length > 0) {
          setActiveWId(wRes.data[0].id);
        }
      } catch {
        toast.error('Eroare la încărcarea datelor inițiale');
      }
    };

    loadData();
  }, []);
 
  // Funcția de fetch izolată cu useCallback pentru a fi pasată în modale (onSave, onDeleted)
  const fetchProducts = useCallback(async () => {
    if (!activeWId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/warehouses/${parseWId(activeWId)}/products/`);
      setProducts(res.data);
    } catch { 
      toast.error('Nu s-au putut încărca produsele'); 
    } finally { 
      setLoading(false); 
    }
  }, [activeWId]);
 
  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts(); 
  }, [activeWId, fetchProducts]);
 
  const activeWarehouse = warehouses.find(w => w.id === activeWId);
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || p.category === catFilter)
  );
 
  const totalValue = products.reduce((a, p) => a + p.price * p.stockQuantity, 0);
  const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length;
  const noStock  = products.filter(p => p.stockQuantity === 0).length;
 
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentView="products" onNavigate={onNavigate} onBack={onBack} />
 
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Produse</h1>
            {activeWarehouse && (
              <p className="text-slate-400 mt-1 text-sm flex items-center gap-1.5">
                <Icon name="Warehouse" className="w-3.5 h-3.5" />
                {activeWarehouse.name} · {activeWarehouse.location}
              </p>
            )}
          </div>
          <button
            onClick={() => activeWId && setModal({ type: 'create' })}
            disabled={!activeWId}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer"
          >
            <Icon name="Plus" className="w-4 h-4" />Produs Nou
          </button>
        </motion.div>
 
        {/* Selector depozit */}
        {warehouses.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 flex-wrap mb-6">
            {warehouses.map(w => (
              <button key={w.id}
                onClick={() => { setActiveWId(w.id); setSearch(''); setCatFilter(''); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeWId === w.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                <Icon name="Warehouse" className="w-3 h-3" />{w.name}
              </button>
            ))}
          </motion.div>
        )}
 
        {/* Stats */}
        {products.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Produse', value: products.length,         icon: 'Box',           iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600', valColor: 'text-indigo-600' },
              { label: 'Valoare Stoc',  value: formatRON(totalValue),   icon: 'DollarSign',    iconBg: 'bg-slate-100',  iconColor: 'text-slate-700',  valColor: 'text-slate-900'  },
              { label: 'Stoc Mic',      value: `${lowStock} prod.`,     icon: 'AlertTriangle', iconBg: 'bg-orange-50',  iconColor: 'text-orange-500', valColor: 'text-orange-500' },
              { label: 'Fără Stoc',     value: `${noStock} prod.`,      icon: 'XCircle',       iconBg: 'bg-red-50',     iconColor: 'text-red-500',    valColor: 'text-red-500'    },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
                <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon name={s.icon} className={`w-4 h-4 ${s.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide truncate">{s.label}</p>
                  <p className={`font-black text-sm ${s.valColor} truncate`}>{s.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
 
        {/* Filtre */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="relative">
            <Icon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 shadow-sm text-sm w-52 transition-colors"
              placeholder="Caută după nume / SKU..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {categories.length > 0 && (
            <select className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-400 shadow-sm text-sm cursor-pointer"
              value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">Toate categoriile</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {(search || catFilter) && (
            <button onClick={() => { setSearch(''); setCatFilter(''); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer">
              <Icon name="X" className="w-3.5 h-3.5" />Resetează
            </button>
          )}
          {(search || catFilter) && (
            <span className="flex items-center text-xs text-slate-400 font-medium px-1">
              {filtered.length} din {products.length}
            </span>
          )}
        </div>
 
        {/* Content */}
        {warehouses.length === 0 ? (
          <div className="text-center py-40">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Warehouse" className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm mb-3">Nu există depozite.</p>
            <button onClick={() => onNavigate('warehouses')} className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm cursor-pointer">Mergi la Depozite →</button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-40">
            <Icon name="Loader2" className="w-7 h-7 text-indigo-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Box" className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm">
              {search || catFilter ? 'Niciun produs cu aceste filtre.' : 'Niciun produs în acest depozit.'}
            </p>
            {!search && !catFilter && (
              <button onClick={() => setModal({ type: 'create' })} className="mt-3 text-indigo-600 hover:text-indigo-700 font-semibold text-sm cursor-pointer">
                Adaugă primul produs →
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i}
                  onEdit={pr => setModal({ type: 'edit', product: pr })}
                  onDelete={pr => setModal({ type: 'delete', product: pr })}
                  onStock={(pr, op) => setModal({ type: 'stock', product: pr, operation: op })}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
 
      <AnimatePresence>
        {modal?.type === 'create' && <ProductModal warehouseId={activeWId} onClose={() => setModal(null)} onSave={fetchProducts} />}
        {modal?.type === 'edit'   && <ProductModal product={modal.product} warehouseId={activeWId} onClose={() => setModal(null)} onSave={fetchProducts} />}
        {modal?.type === 'delete' && <DeleteConfirm product={modal.product} warehouseId={activeWId} onClose={() => setModal(null)} onDeleted={fetchProducts} />}
        {modal?.type === 'stock'  && (
          <StockModal product={modal.product} warehouseId={activeWId}
            warehouses={warehouses} suppliers={suppliers}
            operation={modal.operation} onClose={() => setModal(null)} onSave={fetchProducts} />
        )}
      </AnimatePresence>
    </div>
  );
}