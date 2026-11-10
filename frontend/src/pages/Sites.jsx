import { useEffect, useMemo, useState } from 'react';
import { Eye, FileText, Pencil, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { api, nice } from '../lib/api';
import { modules, hasPermission, roleLabel } from '../config/modules';
import Modal from '../components/Modal';
import Empty from '../components/Empty';
export default function Sites({ token, user, search = '' }) {
  const module = modules.find(item => item.key === 'sites');
  const [rows, setRows] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [modal, setModal] = useState(null), [form, setForm] = useState({}), [saving, setSaving] = useState(false);
  const canRead = hasPermission(user, module.key, 'read'), canWrite = !module.readOnly && hasPermission(user, module.key, 'write');
  async function load() {
    setLoading(true);
    try {
      const r = await api(module.base, { token });
      const d = r?.data ?? r ?? [];
      setRows(Array.isArray(d) ? d : (d?.rows || d?.items || d?.records || []));
      setError('')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [module.key, token]);
  const filtered = useMemo(() => rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())), [rows, search]);
  const cols = useMemo(() => {
    if (!rows.length) return module.fields.slice(0, 6).map(x => x[0]);
    const preferred = module.fields.map(x => x[0]).filter(k => rows.some(r => r[k] !== undefined));
    const extra = Object.keys(rows[0]).filter(k => !preferred.includes(k) && !['password_hash'].includes(k));
    return [...preferred, ...extra].slice(0, 7)
  }, [rows, module.fields]);
  function openCreate() {
    setForm(Object.fromEntries(module.fields.map(f => [f[0], f[3]?.[0] || ''])));
    setModal({ mode: 'create' })
  }
  function openEdit(row) {
    setForm(Object.fromEntries(module.fields.map(f => [f[0], row[f[0]] ?? ''])));
    setModal({ mode: 'edit', id: row.id })
  }
  async function save() {
    setSaving(true);
    try {
      const payload = { ...form };
      module.fields.forEach(([k, , type]) => { if (payload[k] === '') delete payload[k]; else if (type === 'number') payload[k] = Number(payload[k]); else if (type === 'checkbox') payload[k] = Boolean(payload[k]) });
      await api(modal.mode === 'edit' ? `${module.base}/${modal.id}` : module.base, { method: modal.mode === 'edit' ? 'PUT' : 'POST', body: payload, token });
      setModal(null);
      await load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }
  async function remove(id) {
    if (!confirm('Delete this record?')) return;
    try {
      await api(`${module.base}/${id}`, { method: 'DELETE', token });
      await load()
    } catch (e) { setError(e.message) }
  }
  if (!canRead) return <div className="page">
    <div className="access-denied">
      <ShieldCheck size={42} />
      <h2>Access restricted</h2>
      <p>Your <b>{roleLabel(user)}</b> role does not have access to {module.label.toLowerCase()}.</p>
    </div>
  </div>;
  return <div className="page">
    <div className="page-head">
      <div>
        <span className="eyebrow">{module.key.replaceAll('-', ' ').toUpperCase()}</span>
        <h2>{module.label}</h2>
        <p className="muted">Manage {module.label.toLowerCase()} connected to the CMS backend.</p>
      </div>{canWrite && <button className="primary" onClick={openCreate}>
        <Plus size={18} /> Add {module.label.replace(/s$/, '')}</button>}</div>{error && <div className="error">{error}</div>}<div className="panel table-panel">
      <div className="table-tools">
        <div className="result-count">{filtered.length} records</div>
        <button className="secondary" onClick={load}>
          <RefreshCw size={16} /> Refresh</button>
      </div>{loading ? <div className="loading">Loading records…</div> : filtered.length ? <div className="table-wrap">
        <table>
          <thead>
            <tr>{cols.map(c => <th key={c}>{c.replaceAll('_', ' ')}</th>)}{(canWrite || !module.readOnly) && <th>Actions</th>}</tr>
          </thead>
          <tbody>{filtered.map((r, i) => <tr key={r.id || i}>{cols.map(c => <td key={c}>{nice(r[c])}</td>)}{(canWrite || !module.readOnly) && <td>
            <div className="row-actions">
              <button className="icon-btn small">
                <Eye size={15} />
              </button>{canWrite && module.noEdit !== true && <button className="icon-btn small" onClick={() => openEdit(r)}>
                <Pencil size={15} />
              </button>}{canWrite && !module.noEdit && r.id && <button className="icon-btn small danger" onClick={() => remove(r.id)}>
                <Trash2 size={15} />
              </button>}</div>
          </td>}</tr>)}</tbody>
        </table>
      </div> : <Empty icon={FileText} text="No records found. Add the first record to get started." />}</div>{modal && <Modal title={`${modal.mode === 'edit' ? 'Edit' : 'Add'} ${module.label}`} onClose={() => setModal(null)} onSave={save} saving={saving}>{module.fields.map(([key, label, type, opts]) => <label key={key} className={type === 'textarea' ? 'full-field' : ''}>{label}{type === 'textarea' ? <textarea value={form[key] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })} rows="3" /> : type === 'select' ? <select value={form[key] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })}>
        <option value="">Select…</option>{opts.map(o => <option key={o}>{o}</option>)}</select> : type === 'checkbox' ? <input type="checkbox" checked={!!form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} /> : <input type={type} value={form[key] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />}</label>)}</Modal>}</div>
}
