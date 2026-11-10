import { useEffect, useMemo, useState } from 'react';
import { FileText, Pencil, Plus, RefreshCw, ShieldCheck, Trash2, UserX } from 'lucide-react';
import { api, nice } from '../lib/api';
import { hasPermission, roleLabel, MODULE_ACTIONS, RELATION_FIELDS } from '../config/modules';
import Modal from './Modal';
import Empty from './Empty';

function rowsFrom(response) {
  const d = response?.data ?? response ?? [];
  return Array.isArray(d) ? d : (d?.rows || d?.items || d?.records || []);
}

export default function CrudPage({ module, token, user, search = '' }) {
  const [rows, setRows] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [modal, setModal] = useState(null), [form, setForm] = useState({}), [saving, setSaving] = useState(false), [lookups, setLookups] = useState({});
  const canRead = hasPermission(user, module.key, 'read');
  const canWrite = hasPermission(user, module.key, 'write') && !module.readOnly;
  const actions = MODULE_ACTIONS[module.key] || {};

  async function load() {
    setLoading(true);
    try { setRows(rowsFrom(await api(module.base, { token }))); setError(''); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [module.key, token]);

  useEffect(() => {
    let active = true;
    const fields = module.fields.filter(f => RELATION_FIELDS[f[0]]);
    const unique = [...new Set(fields.map(f => RELATION_FIELDS[f[0]].endpoint))];
    Promise.all(unique.map(async endpoint => {
      try { return [endpoint, rowsFrom(await api(endpoint, { token }))]; }
      catch { return [endpoint, []]; }
    })).then(results => { if (active) setLookups(Object.fromEntries(results)); });
    return () => { active = false; };
  }, [module.key, token]);

  const filtered = useMemo(() => rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())), [rows, search]);
  const cols = useMemo(() => {
    if (!rows.length) return module.fields.slice(0, 6).map(x => x[0]);
    const preferred = module.fields.map(x => x[0]).filter(k => rows.some(r => r[k] !== undefined));
    const extra = Object.keys(rows[0]).filter(k => !preferred.includes(k) && !['password_hash'].includes(k));
    return [...preferred, ...extra].slice(0, 7);
  }, [rows, module.fields]);
  const hasRowActions = canWrite && (actions.edit || actions.delete || actions.deactivate);

  function openCreate() {
    setForm(Object.fromEntries(module.fields.map(f => [f[0], f[3]?.[0] || ''])));
    setModal({ mode: 'create' });
  }
  function openEdit(row) {
    setForm(Object.fromEntries(module.fields.map(f => [f[0], row[f[0]] ?? ''])));
    setModal({ mode: 'edit', id: row.id });
  }
  async function save() {
    setSaving(true);
    try {
      const payload = { ...form };
      module.fields.forEach(([k, , type]) => {
        if (payload[k] === '') delete payload[k];
        else if (type === 'number' || RELATION_FIELDS[k]) payload[k] = Number(payload[k]);
        else if (type === 'checkbox') payload[k] = Boolean(payload[k]);
      });
      const editing = modal.mode === 'edit';
      await api(editing ? `${module.base}/${modal.id}` : module.base, { method: editing ? 'PUT' : 'POST', body: payload, token });
      setModal(null); await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function remove(row) {
    const id = row.id;
    if (!id || !confirm('Delete this record? This cannot be undone.')) return;
    try { await api(`${module.base}/${id}`, { method: 'DELETE', token }); await load(); }
    catch (e) { setError(e.message); }
  }
  async function deactivate(row) {
    if (!row.id || !confirm(`Deactivate ${row.full_name || row.fullName || 'this employee'}?`)) return;
    try { await api(`${module.base}/${row.id}/deactivate`, { method: 'PATCH', token, body: {} }); await load(); }
    catch (e) { setError(e.message); }
  }

  if (!canRead) return <div className="page"><div className="access-denied"><ShieldCheck size={42} /><h2>Access restricted</h2><p>Your <b>{roleLabel(user)}</b> role does not have access to {module.label.toLowerCase()}.</p></div></div>;

  return <div className="page">
    <div className="page-head"><div><span className="eyebrow">{module.key.replaceAll('-', ' ').toUpperCase()}</span><h2>{module.label}</h2><p className="muted">Manage {module.label.toLowerCase()} connected to the CMS backend.</p></div>
      {canWrite && actions.create && <button className="primary" onClick={openCreate}><Plus size={18} /> Add {module.label.replace(/s$/, '')}</button>}
    </div>
    {error && <div className="error">{error}</div>}
    <div className="panel table-panel"><div className="table-tools"><div className="result-count">{filtered.length} records</div><button className="secondary" onClick={load}><RefreshCw size={16} /> Refresh</button></div>
      {loading ? <div className="loading">Loading records…</div> : filtered.length ? <div className="table-wrap"><table><thead><tr>{cols.map(c => <th key={c}>{c.replaceAll('_', ' ')}</th>)}{hasRowActions && <th>Actions</th>}</tr></thead>
        <tbody>{filtered.map((r, i) => <tr key={r.id || i}>{cols.map(c => <td key={c}>{nice(r[c])}</td>)}{hasRowActions && <td><div className="row-actions">
          {actions.edit && <button className="icon-btn small" title="Edit" onClick={() => openEdit(r)}><Pencil size={15} /></button>}
          {actions.deactivate && r.is_active !== false && <button className="icon-btn small" title="Deactivate" onClick={() => deactivate(r)}><UserX size={15} /></button>}
          {actions.delete && <button className="icon-btn small danger" title="Delete" onClick={() => remove(r)}><Trash2 size={15} /></button>}
        </div></td>}</tr>)}</tbody></table></div> : <Empty icon={FileText} text="No records found. Add the first record to get started." />}
    </div>
    {modal && <Modal title={`${modal.mode === 'edit' ? 'Edit' : 'Add'} ${module.label}`} onClose={() => setModal(null)} onSave={save} saving={saving}>
      {module.fields.map(([key, label, type, opts]) => {
        const relation = RELATION_FIELDS[key];
        const relationRows = relation ? (lookups[relation.endpoint] || []) : [];
        return <label key={key} className={type === 'textarea' ? 'full-field' : ''}>{relation ? label.replace(/\bID\b/i, '') : label}
          {relation ? <select required value={form[key] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })}><option value="">Select {label.replace(/\bID\b/i, '').trim()} by name…</option>{relationRows.map(r => <option key={r.id} value={r.id}>{relation.label(r)}</option>)}</select>
          : type === 'textarea' ? <textarea value={form[key] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })} rows="3" />
          : type === 'select' ? <select value={form[key] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })}><option value="">Select…</option>{opts.map(o => <option key={o}>{o}</option>)}</select>
          : type === 'checkbox' ? <input type="checkbox" checked={!!form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
          : <input type={type} value={form[key] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />}
        </label>;
      })}
    </Modal>}
  </div>;
}
