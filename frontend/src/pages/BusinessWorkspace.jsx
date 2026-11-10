import { Children, cloneElement, isValidElement, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Building2, CalendarDays, CheckCircle2,
  ChevronRight, CircleDollarSign, Edit3, HardHat, MapPin, Package,
  Plus, Star, Truck, Users, WalletCards, X
} from 'lucide-react';
import { api, unwrap, nice } from '../lib/api';
import { hasPermission } from '../config/modules';
import PayrollWorkspace from './PayrollWorkspace';
import AttendanceWorkspace from './AttendanceWorkspace';

const cents = v => Math.round((Number(v || 0) + Number.EPSILON) * 100) / 100;
const money = (v) => `Rs. ${cents(v).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v) => Math.max(0, Math.min(100, Number(v || 0)));
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

function Field({ label, children }) {
  const lower = String(label).toLowerCase();
  const optional = /\boptional\b|notes|address|phone|specialization|comment|reference|project context|location|site$/i.test(lower) || (lower.includes('email') && !lower.includes('login'));
  const enhanced = Children.map(children, child => {
    if (!isValidElement(child) || !['input', 'select', 'textarea'].includes(child.type)) return child;
    const isPhone = /phone|mobile|contact number/i.test(String(label));
    const isDate = child.type === 'input' && child.props.type === 'date';
    const originalChange = child.props.onChange;
    const enhancedProps = { required: child.props.required ?? !optional, 'aria-label': child.props['aria-label'] || String(label) };
    if (isPhone && child.type === 'input') {
      enhancedProps.type = 'tel'; enhancedProps.inputMode = 'tel'; enhancedProps.placeholder = child.props.placeholder || '+92 3XX XXXXXXX or 03XX XXXXXXX';
      enhancedProps.onChange = e => { let v = e.target.value.replace(/[^0-9+\s()-]/g, '').replace(/(?!^)\+/g, ''); originalChange?.({ ...e, target: { ...e.target, value: v } }); };
      enhancedProps.onBlur = e => { const raw=e.target.value; const digits=raw.replace(/\D/g,''); let formatted=raw; if(digits.startsWith('92') && digits.length>=12) formatted=`+92 ${digits.slice(2,5)} ${digits.slice(5)}`; else if(digits.startsWith('0') && digits.length===11) formatted=`${digits.slice(0,4)} ${digits.slice(4)}`; else if(digits.startsWith('3') && digits.length===10) formatted=`+92 ${digits.slice(0,3)} ${digits.slice(3)}`; if(formatted!==raw) originalChange?.({ ...e, target: { ...e.target, value: formatted } }); child.props.onBlur?.(e); };
    } else if (isDate && originalChange) {
      enhancedProps.onChange = e => { const value = e.target.value; const todayValue = today(); if (value && value < todayValue && !window.confirm(`You selected ${value}, which is before today. Do you want to keep this past date?`)) return; originalChange(e); };
    }
    return cloneElement(child, enhancedProps);
  });
  return <label className="biz-field"><span>{label}{enhanced?.some?.(child => isValidElement(child) && child.props.required) ? <em className="required-mark" aria-label="required"> *</em> : null}</span>{enhanced}</label>;
}

function Modal({ title, onClose, children, actions }) {
  return <div className="modal-backdrop">
    <div className="modal biz-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-head">
        <h3>{title}</h3>
        <button className="icon-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="form-grid">{children}</div>{actions && <div className="modal-actions">{actions}</div>}</div>
  </div>;
}

function Stat({ label, value, sub, tone = '' }) {
  return <div className={`biz-stat ${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>{sub && <small>{sub}</small>}</div>;
}

function Progress({ value }) {
  return <div className="biz-progress">
    <div>
      <i style={{ width: `${pct(value)}%` }} />
    </div>
    <b>{pct(value)}%</b>
  </div>;
}

function Card({ title, subtitle, meta, onClick, icon: Icon = Building2, actions }) {
  return <article className="biz-card" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={e => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}>
    <div className="biz-card-icon">
      <Icon size={20} />
    </div>
    <div className="biz-card-body">
      <div className="biz-card-title">
        <h4>{title}</h4>
        <ChevronRight size={17} />
      </div>{subtitle && <p>{subtitle}</p>}{meta && <div className="biz-meta">{meta.map((m, i) => <span key={i}>{m}</span>)}</div>}</div>
    {actions && <div className="biz-card-actions" onClick={e => e.stopPropagation()}>{actions}</div>}
  </article>;
}

export default function BusinessWorkspace({ root, routeIds = [], routeStack = null, token, user, search, onNavigate }) {
  const [stack, setStack] = useState(() => Array.isArray(routeStack) && routeStack.length ? routeStack : []);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  const current = stack[stack.length - 1] || { type: root };

  // Restore the selected detail page from the URL after refresh or direct navigation.
  useEffect(() => {
    if (Array.isArray(routeStack) && routeStack.length) { setStack(routeStack); return; }
    if (!routeIds?.length) return;
    const id = Number(routeIds[0]);
    if (!Number.isInteger(id) || id <= 0) return;
    const detailByRoot = { projects: 'project', clients: 'client', contractors: 'contractor', warehouses: 'warehouse', inventory: 'item' };
    const detail = detailByRoot[root];
    if (detail) setStack([{ type: detail, id }]);
  }, [root, routeIds?.[0], routeStack]);

  function open(type, id, data = null) {
    const next = [...stack, { type, id, data }];
    setStack(next);
    onNavigate?.(root, next);
  }
  function back() {
    const next = stack.slice(0, -1);
    setStack(next);
    onNavigate?.(root, next);
  }
  function notify(message) {
    setToast(String(message || 'Something went wrong. Please try again.'));
    setTimeout(() => setToast(''), 6500);
  }

  const common = { token, user, search, open, back, modal, setModal, notify, root, onNavigate };
  let content;
  if (current.type === 'projects') content = <ProjectsHome {...common} />;
  else if (current.type === 'project') content = <ProjectDetail {...common} id={current.id} />;
  else if (current.type === 'site') content = <SiteDetail {...common} id={current.id} />;
  else if (current.type === 'clients') content = <ClientsHome {...common} />;
  else if (current.type === 'client') content = <ClientDetail {...common} id={current.id} />;
  else if (current.type === 'contractors') content = <ContractorsHome {...common} />;
  else if (current.type === 'contractor') content = <ContractorDetail {...common} id={current.id} />;
  else if (current.type === 'employees') content = <EmployeesHome {...common} />;
  else if (current.type === 'employee') content = <EmployeeDetail {...common} id={current.id} />;
  else if (current.type === 'warehouses') content = <WarehousesHome {...common} />;
  else if (current.type === 'warehouse') content = <WarehouseDetail {...common} id={current.id} />;
  else if (current.type === 'inventory') content = <InventoryHome {...common} />;
  else if (current.type === 'item') content = <ItemDetail {...common} id={current.id} />;
  else if (current.type === 'finance') content = <FinanceHome {...common} />;
  else if (current.type === 'issuances') content = <MaterialRequestsHome {...common} />;
  else if (current.type === 'workforce') content = <WorkforceHome {...common} />;
  else if (current.type === 'payroll') content = <PayrollWorkspace token={token} user={user} notify={notify} />;
  else if (current.type === 'attendance') content = <AttendanceWorkspace token={token} user={user} notify={notify} />;
  else if (current.type === 'admin') content = <GenericHome {...common} title="Administration" icon={Users} endpoint="/users" />;
  else if (current.type === 'audit') content = <AuditHome {...common} />;
  else if (current.type === 'reports') content = <ReportsHome {...common} />;
  else content = <ProjectsHome {...common} />;
  return <>{content}<ModalRouter token={token} user={user} modal={modal} setModal={setModal} notify={notify} />{toast && <div className="biz-toast" role="alert" aria-live="assertive">{toast}</div>}
  </>;
}

function ViewToggle({ value, onChange }) {
  return <div className="view-toggle" role="group" aria-label="Choose display mode">
    <button type="button" className={value === 'grid' ? 'active' : ''} onClick={() => onChange('grid')} aria-pressed={value === 'grid'}>Cards</button>
    <button type="button" className={value === 'list' ? 'active' : ''} onClick={() => onChange('list')} aria-pressed={value === 'list'}>List</button>
  </div>;
}

function WorkspaceHeader({ title, eyebrow, back, action, children }) {
  return <div className="biz-head">
    <div>{back && <button className="back-btn" onClick={back}>
      <ArrowLeft size={15} /> Back</button>}<span className="eyebrow">{eyebrow || 'WORKSPACE'}</span>
      <h2>{title}</h2>{children}</div>{action}</div>;
}

function useRows(endpoint, token) {
  const [rows, setRows] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() {
    setLoading(true);
    try {
      const raw = unwrap(await api(endpoint, { token }));
      setData(raw);
      setRows(Array.isArray(raw) ? raw : []);
      setError('');
    } catch (e) {
      setData(null);
      setRows([]);
      setError(e.message);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [endpoint, token]);
  return { rows, data, loading, error, reload: load };
}

function ProjectsHome({ token, user, search, open, setModal, notify }) {
  const [viewMode, setViewMode] = useState('grid');
  const { rows, loading, error, reload } = useRows('/projects', token);
  const allSites = useRows('/sites', token).rows;
  const clients = useRows('/clients', token).rows;
  const list = rows.filter(p => JSON.stringify(p).toLowerCase().includes(search.toLowerCase()));
  const canWrite = hasPermission(user, 'projects', 'write');
  return <div className="page biz-page">
    <WorkspaceHeader eyebrow="PROJECT DELIVERY" title="Projects" action={<div className="head-actions"><ViewToggle value={viewMode} onChange={setViewMode} />{canWrite && <button className="primary" onClick={() => setModal({ type: 'project', clients, reload })}>
      <Plus size={16} /> New project</button>}<button className="secondary" onClick={reload}>Refresh</button>
    </div>}>
      <p className="muted">Choose a project to enter its workspace. Sites, contractors, costs, client money and progress live inside the project.</p>
    </WorkspaceHeader>{error && <div className="error">{error}</div>}{loading ? <div className="loading">Loading projects…</div> : <div className={viewMode === 'grid' ? 'biz-grid' : 'biz-list'}>{list.map(p => <Card key={p.id} icon={Building2} title={p.name} subtitle={`${p.client_name || p.clientName || 'Client'} • ${p.status || 'Active'}`} meta={[money(p.budget), `${pct(p.completion_percentage ?? p.completionPercentage)}% complete`, `${allSites.filter(s => Number(s.project_id) === Number(p.id)).length} sites`]} onClick={() => open('project', p.id)} actions={canWrite ? <><button className="secondary small-btn" onClick={() => setModal({ type: 'project', project: p, clients, reload })}>Edit</button><select aria-label={`Change status for ${p.name}`} value={p.status || 'Active'} onChange={async e => { let status=e.target.value; let completionPercentage=Number(p.completion_percentage ?? p.completionPercentage ?? 0); if (status === 'Completed' && completionPercentage !== 100) { if (!window.confirm('A completed project must be 100% complete. Set completion to 100% and mark this project Completed?')) { e.target.value=p.status || 'Active'; return; } completionPercentage=100; } try { await api(`/projects/${p.id}`, { method: 'PUT', token, body: { name:p.name, clientId:Number(p.client_id ?? p.clientId), budget:Number(p.budget), startDate:String(p.start_date ?? p.startDate).slice(0,10), endDate:String(p.end_date ?? p.endDate).slice(0,10), status, completionPercentage } }); await reload(); notify(`Project status changed to ${status}${completionPercentage === 100 ? ' (100% complete)' : ''}.`); } catch(err) { await reload(); notify(`Project status was not changed: ${err.message}`); } }}><option>Active</option><option>On Hold</option><option>Completed</option><option>Delayed</option></select></> : null} />)}</div>}{!loading && !list.length && <div className="biz-empty">No projects found.</div>}</div>;
}

function ProjectModal({ modal, setModal, token, user, notify }) {
  if (!modal || modal.type !== 'project') return null;
  const clients = modal.clients || [];
  const existing = modal.project || {};
  const [form, setForm] = useState({ name: existing.name || '', clientId: String(existing.client_id || existing.clientId || ''), budget: existing.budget ?? '', startDate: String(existing.start_date || existing.startDate || '').slice(0, 10), endDate: String(existing.end_date || existing.endDate || '').slice(0, 10), status: existing.status || 'Active', completionPercentage: existing.completion_percentage ?? existing.completionPercentage ?? 0 });
  const [saving, setSaving] = useState(false);
  useEffect(() => { setForm({ name: existing.name || '', clientId: String(existing.client_id || existing.clientId || ''), budget: existing.budget ?? '', startDate: String(existing.start_date || existing.startDate || '').slice(0, 10), endDate: String(existing.end_date || existing.endDate || '').slice(0, 10), status: existing.status || 'Active', completionPercentage: existing.completion_percentage ?? existing.completionPercentage ?? 0 }); }, [existing.id, existing.name, existing.client_id, existing.budget, existing.start_date, existing.end_date, existing.status, existing.completion_percentage]);
  const save = async () => {
    if (!form.name.trim() || !form.clientId || !form.budget || !form.startDate || !form.endDate) { notify('Please complete the project name, client, budget and dates.'); return; }
    if (Number(form.budget) <= 0 || !Number.isFinite(Number(form.completionPercentage)) || Number(form.completionPercentage) < 0 || Number(form.completionPercentage) > 100 || form.endDate < form.startDate) { notify('Budget must be positive, completion must be 0–100%, and end date cannot be before start date.'); return; }
    if (form.status === 'Completed' && Number(form.completionPercentage) !== 100) { notify('A project can only be marked Completed when completion is 100%. Update completion to 100% or choose another status.'); return; }
    setSaving(true);
    try {
      await api(existing.id ? `/projects/${existing.id}` : '/projects', { method: existing.id ? 'PUT' : 'POST', token, body: { name: form.name.trim(), clientId: Number(form.clientId), budget: Number(form.budget), startDate: form.startDate, endDate: form.endDate, status: form.status, completionPercentage: Number(form.completionPercentage) } });
      await modal.reload?.();
      setModal(null);
      notify(existing.id ? 'Project updated successfully.' : 'Project created successfully.');
    } catch (e) { notify(`Project was not saved: ${e.message}`); } finally { setSaving(false); }
  };
  return <Modal title={existing.id ? 'Edit project' : 'Create project'} onClose={() => setModal(null)} actions={<>
    <button className="secondary" onClick={() => setModal(null)}>Cancel</button>
    <button className="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save project'}</button>
  </>}>
    <Field label="Project name">
      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
    </Field>
    <Field label="Client">
      <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
        <option value="">Select client by name</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    </Field>
    <Field label="Budget (PKR)">
      <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
    </Field>
    <Field label="Start date">
      <input type="date" value={form.startDate} onChange={e => { const v=e.target.value; if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setForm({ ...form, startDate: v }); }} />
    </Field>
    <Field label="End date">
      <input type="date" min={form.startDate || undefined} value={form.endDate} onChange={e => { const v=e.target.value; if (v && v < form.startDate) { notify('Project end date cannot be before the start date.'); return; } if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setForm({ ...form, endDate: v }); }} />
    </Field>
    <Field label="Completion percentage">
      <input type="number" min="0" max="100" step="1" value={form.completionPercentage} onChange={e => setForm({ ...form, completionPercentage: e.target.value })} />
    </Field>
    <Field label="Status">
      <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{['Active', 'On Hold', 'Completed', 'Delayed'].map(x => <option key={x}>{x}</option>)}</select>
    </Field>
  </Modal>;
}

function ProjectDetail({ token, user, id, back, open, setModal, notify }) {
  const [siteViewMode, setSiteViewMode] = useState('grid');
  const projectState = useRows(`/projects/${id}`, token);
  const p = projectState.data;
  const sitesState = useRows('/sites', token);
  const sites = sitesState.rows.filter(s => Number(s.project_id) === Number(id));
  const assignmentsState = useRows('/project-contractors', token);
  const assignments = assignmentsState.rows.filter(a => Number(a.project_id) === Number(id));
  const costsState = useRows('/project-costs', token);
  const costs = costsState.rows.filter(c => Number(c.project_id || id) === Number(id));
  const clientPaymentsState = useRows('/client-payments', token);
  const clientPayments = clientPaymentsState.rows.filter(x => Number(x.project_id) === Number(id));
  const contractorPaymentsState = useRows('/contractor-payments', token);
  const contractorPayments = contractorPaymentsState.rows.filter(x => Number(x.project_id) === Number(id));
  const clientsState = useRows('/clients', token);
  const clients = clientsState.rows;
  const contractorsState = useRows('/contractors', token);
  const contractors = contractorsState.rows;
  const reportState = useRows('/completion/reports/projects', token);
  const report = reportState.rows.find(x => Number(x.id) === Number(id));
  const project = p?.id ? p : null;
  const clientStatementState = useRows(project?.client_id || project?.clientId ? `/completion/clients/${project.client_id || project.clientId}/statement` : '/clients', token);
  const clientStatement = clientStatementState.data;
  const reloadProjectData = async () => { await Promise.all([projectState.reload(), sitesState.reload(), assignmentsState.reload(), costsState.reload(), clientPaymentsState.reload(), contractorPaymentsState.reload(), clientsState.reload(), contractorsState.reload(), reportState.reload(), clientStatementState.reload()]); };
  const projectInvoices = (clientStatement?.invoices || []).filter(i => Number(i.project_id) === Number(id));
  const projectClientInvoiced = projectInvoices.reduce((s, x) => s + Number(x.amount || 0), 0);
  const projectClientPaid = projectInvoices.reduce((s, x) => s + Number(x.paid || 0), 0);
  const budget = Number(project?.budget || report?.budget || 0);
  const actual = Number(report?.actual_cost || 0);
  const clientPaid = clientPayments.reduce((s, x) => s + Number(x.amount || 0), 0);
  const clientOutstanding = Math.max(0, projectClientInvoiced - projectClientPaid);
  const contractorPaid = contractorPayments.reduce((s, x) => s + Number(x.amount || 0), 0);
  const payable = assignments.reduce((s, x) => s + Number(x.payable_amount || 0), 0);
  const completion = project?.completion_percentage ?? project?.completionPercentage ?? report?.completion_percentage ?? 0;
  const canWrite = hasPermission(user, 'projects', 'write');
  async function updateCompletion() { if (!project) { notify('Project details are still loading. Please wait and try again.'); return; } setModal({ type: 'completion', project, token, notify, reload: reloadProjectData }); }
  return <div className="page biz-page">
    <WorkspaceHeader back={back} eyebrow="PROJECT WORKSPACE" title={project?.name || 'Project'} action={canWrite && <button className="secondary" onClick={() => setModal({ type: 'project', project, clients, reload: reloadProjectData })}>
      <Edit3 size={15} /> Edit project</button>}>
      <p className="muted">Everything connected to this project is managed from this view.</p>
    </WorkspaceHeader>
    <div className="project-layout">
      <main>
        <section className="biz-hero">
          <div>
            <span className={`status-pill status-${String(project?.status || 'Active').toLowerCase().replaceAll(' ','-')}`}>{project?.status || 'Active'}</span>
            <h3>{project?.name}</h3>
            <p>{project?.client_name || clients.find(c => Number(c.id) === Number(project?.client_id))?.name || 'Client not loaded'}</p>
          </div>
          <div className="completion-block">
            <span>Project completion</span>
            <Progress value={completion} />
            {canWrite && <button className="text-btn" onClick={updateCompletion}>Update percentage</button>}
          </div>
        </section>
        <section className="stats-grid biz-stats">
          <Stat label="Approved project budget" value={money(budget)} sub="Planned spending limit" />
          <Stat label="Actual costs recorded" value={money(actual)} sub={`${budget ? ((actual / budget) * 100).toFixed(1) : 0}% of approved budget consumed`} />
          <Stat label="Client receipts" value={money(clientPaid)} sub={`${money(clientOutstanding)} invoice balance`} />
          <Stat label="Contractor payments" value={money(contractorPaid)} sub={`${money(Math.max(0, payable - contractorPaid))} payable balance`} />
        </section>
        <Section title="Sites" eyebrow={`${sites.length} SITES`} action={<div className="head-actions"><ViewToggle value={siteViewMode} onChange={setSiteViewMode} />{canWrite && <button className="secondary small-btn" onClick={() => setModal({ type: 'site', projectId: id, reload: reloadProjectData })}>
          <Plus size={14} /> Add site</button>}</div>}>{sites.length ? <div className={siteViewMode === 'grid' ? 'biz-grid compact-grid' : 'biz-list'}>{sites.map(s => <Card key={s.id} icon={MapPin} title={s.name} subtitle={s.location || 'Location not set'} meta={[`${assignments.filter(a => Number(a.site_id) === Number(s.id)).length} contractors`]} onClick={() => open('site', s.id)} actions={canWrite ? <button className="secondary small-btn" onClick={() => setModal({ type: 'site', site: s, projectId: id, reload: reloadProjectData })}>Edit</button> : null} />)}</div> : <div className="inline-empty">No sites yet. Add the first site here.</div>}</Section>
        <Section title="Project financials" eyebrow="COST & MONEY">
          <div className="project-finance-overview">
            <div className="project-finance-heading"><div><span className="eyebrow">BUDGET TRACKER</span><h4>Budget used vs remaining</h4></div><strong>{budget ? `${Math.min(100, Math.max(0, actual / budget * 100)).toFixed(1)}% used` : 'Budget not set'}</strong></div>
            <div className="project-finance-track"><span style={{ width: `${budget ? Math.min(100, Math.max(0, actual / budget * 100)) : 0}%` }} /></div>
            <div className="project-finance-foot"><span><i className="finance-dot spent" /> Actual recorded cost <b>{money(actual)}</b></span><span><i className="finance-dot remaining" /> {budget - actual < 0 ? 'Over budget' : 'Budget remaining'} <b>{money(Math.abs(budget - actual))}</b></span></div>
            <p>Actual cost is based on costs included in the backend project report. Client invoice balances and contractor balances below are separate obligations and should not be added to budget consumption a second time.</p>
          </div>
          <div className="finance-strip">
            <Stat label="Client invoice balance" value={money(clientOutstanding)} sub="Invoiced minus received" />
            <Stat label="Contractor agreed payable" value={money(payable)} sub="Across assignments" />
            <Stat label="Contractor balance due" value={money(Math.max(0, payable - contractorPaid))} sub="Payable minus paid" />
            <Stat label="Budget variance" value={money(budget - actual)} sub={budget - actual < 0 ? "Over budget: actual costs exceed budget" : "Remaining budget: budget less actual costs"} tone={budget - actual < 0 ? 'danger' : 'success'} />
          </div>
          <div className="action-row">{hasPermission(user, 'client-payments', 'write') && <button className="secondary" onClick={() => setModal({ type: 'clientPayment', projectId: id, clientId: project?.client_id || project?.clientId, token, notify, onPaid: reloadProjectData })}>
            <CircleDollarSign size={15} /> Record client payment</button>}{hasPermission(user, 'project-contractors', 'write') && <button className="secondary" onClick={() => setModal({ type: 'contractorAssignment', projectId: id, sites, contractors, reload: reloadProjectData, token, notify })}>
              <HardHat size={15} /> Assign contractor</button>}{hasPermission(user, 'project-costs', 'write') && <button className="secondary" onClick={() => setModal({ type: 'cost', projectId: id, sites, reload: reloadProjectData, token, notify })}>
                <CircleDollarSign size={15} /> Add project cost</button>}</div>
        </Section>
        <Section title="Contractors on this project" eyebrow={`${assignments.length} ASSIGNMENTS`}>{assignments.length ? <div className="stack-list">{assignments.map(a => <div className="list-row" key={a.id}>
          <div>
            <b>{a.contractor_name}</b>
            <span>{a.site_name} • payable {money(a.payable_amount)}</span>
          </div>
          <div>
            <b>{money(contractorPayments.filter(p => Number(p.contractor_id) === Number(a.contractor_id)).reduce((s, x) => s + Number(x.amount || 0), 0))}</b>
            <span>paid on this project</span>
          </div>
          <button className="icon-btn small" onClick={() => open('contractor', a.contractor_id)}>
            <ChevronRight size={17} />
          </button>
        </div>)}</div> : <div className="inline-empty">No contractor assignments yet.</div>}</Section>
      </main>
      <aside className="project-sidebar">
        <div className="completion-side">
          <span className="eyebrow">LIVE PROJECT CONTROL</span>
          <h3>{pct(completion)}%</h3>
          <Progress value={completion} />
          <p>Keep completion updated after meaningful project updates and payments.</p>
          {canWrite && <button className="primary wide" onClick={updateCompletion}>Update completion</button>}
        </div>
        <div className="money-card">
          <h4>Client account</h4>
          <div>
            <span>Received</span>
            <b>{money(clientPaid)}</b>
          </div>
          <div>
            <span>Project budget</span>
            <b>{money(budget)}</b>
          </div>
          <small>Invoices and client payments are handled from the connected client account.</small>
        </div>
        <div className="money-card">
          <h4>Contractor account</h4>
          <div>
            <span>Payable</span>
            <b>{money(payable)}</b>
          </div>
          <div>
            <span>Paid</span>
            <b>{money(contractorPaid)}</b>
          </div>
          <div>
            <span>Outstanding</span>
            <b>{money(Math.max(0, payable - contractorPaid))}</b>
          </div>
        </div>
      </aside>
    </div>
  </div>;
}

function Section({ title, eyebrow, action, children }) {
  return <section className="biz-section">
    <div className="section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
      </div>{action}</div>{children}</section>;
}


function SiteDetail({ token, user, id, back, open, setModal, notify }) {
  const [contractorViewMode, setContractorViewMode] = useState('grid');
  const [employeeViewMode, setEmployeeViewMode] = useState('grid');
  const siteState = useRows(`/sites/${id}`, token);
  const s = siteState.data?.id ? siteState.data : null;
  const assignmentsState = useRows('/project-contractors', token);
  const assignments = assignmentsState.rows.filter(a => Number(a.site_id) === Number(id));
  const employees = useRows('/employees', token).rows;
  const employeeAssignmentsState = useRows('/employee-site-assignments', token);
  const employeeAssignments = employeeAssignmentsState.rows.filter(a => Number(a.site_id) === Number(id));
  const contractors = useRows('/contractors', token).rows;
  const materialsState = useRows(`/completion/sites/${id}/material-consumption`, token);
  const materials = materialsState.rows;
  const inventoryItems = useRows('/inventory-items', token).rows;
  const warehouses = useRows('/warehouses', token).rows;
  const canWrite = hasPermission(user, 'sites', 'write');
  return <div className="page biz-page">
    <WorkspaceHeader back={back} eyebrow="SITE WORKSPACE" title={s?.name || 'Site'} action={canWrite && <button className="secondary" onClick={() => setModal({ type: 'site', site: s, reload: siteState.reload })}>
      <Edit3 size={15} /> Edit site</button>}>
      <p className="muted">Site team, contractor responsibility and material consumption stay together here.</p>
    </WorkspaceHeader>
    <div className="biz-hero site-hero">
      <div>
        <span className="status-pill">SITE</span>
        <h3>{s?.location || 'Location not set'}</h3>
        <p>Project: {s?.project_name || '—'}</p>
      </div>
      <div>
        <Stat label="Contractors" value={assignments.length} />
        <Stat label="Employees" value={employeeAssignments.length} />
      </div>
    </div>
    <div className="two-col">
      <Section title="Site team" eyebrow="CONTRACTORS" action={<div className="head-actions"><ViewToggle value={contractorViewMode} onChange={setContractorViewMode} />{hasPermission(user, 'project-contractors', 'write') && <button className="secondary small-btn" onClick={() => setModal({ type: 'contractorAssignment', siteId: id, projectId: s?.project_id, contractors, sites: [s], reload: assignmentsState.reload, token, notify })}>
        <Plus size={14} /> Assign contractor</button>}</div>}>{assignments.length ? <div className={contractorViewMode === 'grid' ? 'biz-grid compact-grid' : 'stack-list'}>{assignments.map(a => contractorViewMode === 'grid' ? <Card key={a.id} icon={HardHat} title={a.contractor_name || 'Contractor'} subtitle={a.contractor_specialization || 'Contractor'} meta={[`${money(a.payable_amount)} payable`, a.start_date ? `From ${a.start_date}` : 'Start date not set']} onClick={() => open('contractor', a.contractor_id)} /> : <div className="list-row" key={a.id}>
          <div><b>{a.contractor_name}</b><span>{a.contractor_specialization || 'Contractor'} • {money(a.payable_amount)} payable</span></div>
          <button className="icon-btn small" onClick={() => open('contractor', a.contractor_id)}><ChevronRight size={17} /></button>
        </div>)}</div> : <div className="inline-empty">No contractor assigned. Use Assign contractor here.</div>}</Section>
      <Section title="Employees" eyebrow="SITE ROSTER" action={<div className="head-actions"><ViewToggle value={employeeViewMode} onChange={setEmployeeViewMode} />{hasPermission(user, 'assignments', 'write') && <button className="secondary small-btn" onClick={() => setModal({ type: 'employeeAssignment', siteId: id, projectId: s?.project_id, employees, reload: employeeAssignmentsState.reload, token, notify })}>
        <Plus size={14} /> Assign employee</button>}</div>}>{employeeAssignments.length ? <div className={employeeViewMode === 'grid' ? 'biz-grid compact-grid' : 'stack-list'}>{employeeAssignments.map(a => {
          const e = employees.find(x => Number(x.id) === Number(a.employee_id));
          return employeeViewMode === 'grid' ? <Card key={a.id} icon={Users} title={e?.full_name || e?.fullName || 'Employee'} subtitle={e?.job_title || e?.jobTitle || 'Worker'} meta={[`From ${a.start_date || '—'}`]} onClick={() => open('employee', a.employee_id)} /> : <div className="list-row" key={a.id}>
            <div><b>{e?.full_name || e?.fullName || 'Employee'}</b><span>{e?.job_title || e?.jobTitle || 'Worker'} • from {a.start_date}</span></div>
            <button className="icon-btn small" onClick={() => open('employee', a.employee_id)}><ChevronRight size={17} /></button>
          </div>;
        })}</div> : <div className="inline-empty">No employees assigned yet.</div>}</Section>
    </div>
    <Section title="Material consumption" eyebrow="SITE MATERIALS" action={<div className="action-row">{hasPermission(user, 'issuances', 'write') && <button className="primary small-btn" onClick={() => setModal({ type: 'materialRequest', siteId: id, sites: [s].filter(Boolean), items: inventoryItems, warehouses, token, notify, onSaved: materialsState.reload })}><Plus size={14}/> Request material</button>}{hasPermission(user, 'site-materials', 'write') && <button className="secondary small-btn" onClick={() => setModal({ type: 'siteMaterial', siteId: id, siteName: s?.name, items: inventoryItems.filter(i => !materials.some(m => Number(m.item_id) === Number(i.id))), reload: materialsState.reload })}><Plus size={14}/> Record material</button>}</div>}>
      <div className="biz-table">{materials.length ? <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Received</th>
            <th>Estimated</th>
            <th>Actual</th>
            <th>Waste</th>
            {hasPermission(user, 'site-materials', 'write') && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>{materials.map(m => <tr key={m.item_id || m.id}>
          <td>{m.item_name || m.name || 'Item'}</td>
          <td>{nice(m.received_quantity)}</td>
          <td>{nice(m.estimated_consumption)}</td>
          <td>{nice(m.actual_consumption)}</td>
          <td>{nice(m.waste_quantity)}</td>
          {hasPermission(user, 'site-materials', 'write') && <td><button className="secondary small-btn" onClick={() => setModal({ type: 'siteMaterial', siteId: id, siteName: s?.name, record: m, items: inventoryItems, reload: materialsState.reload })}>Update usage</button></td>}
        </tr>)}</tbody>
      </table> : <div className="inline-empty">No material consumption records yet.</div>}</div>
    </Section>
  </div>;
}

function ClientsHome({ token, user, search, open, setModal, notify }) {
  const [viewMode, setViewMode] = useState('grid');
  const { rows, loading, error, reload } = useRows('/clients', token);
  const list = rows.filter(x => JSON.stringify(x).toLowerCase().includes(search.toLowerCase()));
  return <div className="page biz-page">
    <WorkspaceHeader eyebrow="CLIENT ACCOUNTS" title="Clients" action={<div className="head-actions"><ViewToggle value={viewMode} onChange={setViewMode} />{hasPermission(user, 'clients', 'write') && <button className="primary" onClick={() => setModal({ type: 'client', reload })}>
      <Plus size={16} /> New client</button>}</div>}>
      <p className="muted">Open a client to see their projects, invoices, received payments and outstanding balance.</p>
    </WorkspaceHeader>{error && <div className="error">{error}</div>}{loading ? <div className="loading">Loading clients…</div> : <div className={viewMode === 'grid' ? 'biz-grid' : 'biz-list'}>{list.map(c => <Card key={c.id} icon={Users} title={c.name} subtitle={c.email || c.phone || 'Contact details not set'} meta={[c.phone || 'No phone']} onClick={() => open('client', c.id)} />)}</div>}{!loading && !list.length && <div className="inline-empty">No clients found. Create a client to get started.</div>}</div>;
}
function ClientDetail({ token, user, id, back, open, setModal, notify }) {
  const [projectViewMode, setProjectViewMode] = useState('grid');
  const statementState = useRows(`/completion/clients/${id}/statement`, token);
  const s = statementState.data?.id ? statementState.data : null;
  const clientsState = useRows('/clients', token);
  const clientRecord = clientsState.rows.find(c => Number(c.id) === Number(id));
  const projects = useRows('/projects', token).rows.filter(p => Number(p.client_id) === Number(id));
  const canPay = hasPermission(user, 'client-payments', 'write');
  return <div className="page biz-page">
    <WorkspaceHeader back={back} eyebrow="CLIENT ACCOUNT" title={s?.name || 'Client'} action={hasPermission(user, 'clients', 'write') && clientRecord && <button className="secondary" onClick={() => setModal({ type: 'client', client: clientRecord, reload: clientsState.reload })}><Edit3 size={15}/> Edit client</button>}>
      <p className="muted">Invoices, receipts and outstanding amount for this client.</p>
    </WorkspaceHeader>
    <div className="stats-grid biz-stats">
      <Stat label="Invoiced" value={money(s?.total_invoiced)} />
      <Stat label="Received" value={money(s?.total_received)} tone="success" />
      <Stat label="Outstanding" value={money(s?.outstanding)} tone={Number(s?.outstanding) > 0 ? 'danger' : 'success'} />
    </div>
    <Section title="Projects" eyebrow={`${projects.length} PROJECTS`} action={<ViewToggle value={projectViewMode} onChange={setProjectViewMode} />}>{projects.length ? <div className={projectViewMode === 'grid' ? 'biz-grid compact-grid' : 'biz-list'}>{projects.map(p => <Card key={p.id} icon={Building2} title={p.name} subtitle={p.status} meta={[money(p.budget)]} onClick={() => open('project', p.id)} />)}</div> : <div className="inline-empty">No projects linked.</div>}</Section>
    <Section title="Invoices & payments" eyebrow="ACCOUNT HISTORY" action={<div className="action-row">{hasPermission(user, 'client-payments', 'write') && <button className="secondary small-btn" onClick={() => setModal({ type: 'invoice', clientId: id, projects, token, notify, onCreated: statementState.reload })}>
      <Plus size={14} /> New invoice</button>}{canPay && <button className="secondary small-btn" onClick={() => setModal({ type: 'clientPayment', clientId: id, token, notify, onPaid: statementState.reload })}>
        <CircleDollarSign size={14} /> Record payment</button>}</div>}>
      <div className="biz-table">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>{(s?.invoices || []).map(i => <tr key={i.id}>
            <td>{i.invoice_number}</td>
            <td>{money(i.amount)}</td>
            <td>{money(i.paid)}</td>
            <td>{money(Number(i.amount) - Number(i.paid))}</td>
            <td>{i.status}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </Section>
  </div>
}
function ClientModal() { return null }

function ContractorsHome({ token, user, search, open, setModal }) {
  const [viewMode, setViewMode] = useState('grid');
  const { rows, loading, error, reload } = useRows('/contractors', token);
  const list = rows.filter(x => JSON.stringify(x).toLowerCase().includes(search.toLowerCase()));
  return <div className="page biz-page">
    <WorkspaceHeader eyebrow="CONTRACTOR MANAGEMENT" title="Contractors" action={<div className="head-actions"><ViewToggle value={viewMode} onChange={setViewMode} />{hasPermission(user, 'contractors', 'write') && <button className="primary" onClick={() => setModal({ type: 'contractor', reload })}>
      <Plus size={16} /> New contractor</button>}</div>}>
      <p className="muted">Open a contractor once. Their assignments, payable amount, payments, ratings and activity are inside the profile.</p>
    </WorkspaceHeader>{error && <div className="error">{error}</div>}{loading ? <div className="loading">Loading contractors…</div> : <div className={viewMode === 'grid' ? 'biz-grid' : 'biz-list'}>{list.map(c => <Card key={c.id} icon={HardHat} title={c.name} subtitle={c.specialization || 'General contractor'} meta={[c.phone || 'No phone', c.email || 'No email']} onClick={() => open('contractor', c.id)} actions={hasPermission(user, 'contractors', 'write') ? <button className="secondary small-btn" onClick={() => setModal({ type: 'contractor', contractor: c, reload })}>Edit</button> : null} />)}</div>}{!loading && !list.length && <div className="inline-empty">No contractors found.</div>}</div>
}
function ContractorDetail({ token, user, id, back, open, setModal, notify }) {
  const [assignmentViewMode, setAssignmentViewMode] = useState('grid');
  const statementState = useRows(`/completion/contractors/${id}/statement`, token);
  const c = statementState.data?.id ? statementState.data : null;
  const projects = useRows('/projects', token).rows;
  const contractorPaymentsState = useRows('/contractor-payments', token);
  const contractorPayments = contractorPaymentsState.rows.filter(payment => Number(payment.contractor_id) === Number(id));
  const ratingsState = useRows('/contractor-ratings', token);
  const ratings = ratingsState.rows.filter(rating => Number(rating.contractor_id) === Number(id));
  const canPay = hasPermission(user, 'contractor-payments', 'write');
  const canAssign = hasPermission(user, 'project-contractors', 'write');
  return <div className="page biz-page">
    <WorkspaceHeader back={back} eyebrow="CONTRACTOR PROFILE" title={c?.name || 'Contractor'} action={hasPermission(user, 'contractors', 'write') && c && <button className="secondary" onClick={() => setModal({ type: 'contractor', contractor: c, reload: statementState.reload })}><Edit3 size={15}/> Edit contractor</button>}>
      <p className="muted">Assignments, finance and ratings are organized separately.</p>
    </WorkspaceHeader>
    <div className="stats-grid biz-stats">
      <Stat label="Total payable" value={money(c?.total_payable)} />
      <Stat label="Paid" value={money(c?.total_paid)} tone="success" />
      <Stat label="Outstanding" value={money(c?.outstanding)} tone={Number(c?.outstanding) > 0 ? 'danger' : 'success'} />
      <Stat label="Specialization" value={c?.specialization || '—'} />
    </div>
    <Section title="Assignments" eyebrow="PROJECT / SITE" action={<div className="head-actions"><ViewToggle value={assignmentViewMode} onChange={setAssignmentViewMode} />{canAssign && <button className="secondary small-btn" onClick={() => setModal({ type: 'contractorAssignment', contractorId: id, projects, reload: statementState.reload, token, notify })}>
      <Plus size={14} /> Assign</button>}</div>}>{(c?.assignments || []).length ? <div className={assignmentViewMode === 'grid' ? 'biz-grid compact-grid' : 'biz-list'}>{c.assignments.map(a => <Card key={a.id} icon={MapPin} title={a.site_name} subtitle={a.project_name} meta={[money(a.payable_amount), 'start ' + a.start_date]} onClick={() => open('project', a.project_id)} />)}</div> : <div className="inline-empty">No assignments yet.</div>}</Section>
    <Section title="Ratings" eyebrow="PERFORMANCE" action={canAssign && <button className="secondary small-btn" onClick={() => setModal({ type: 'rating', contractorId: id, projects, token, notify, onSaved: ratingsState.reload })}>
      <Star size={14} /> Rate contractor</button>}>
      {ratings.length ? <div className="biz-table"><table><thead><tr><th>Project</th><th>Rating</th><th>Comment</th><th>Date</th></tr></thead><tbody>{ratings.map(rating=><tr key={rating.id}><td>{rating.project_name || projects.find(p=>Number(p.id)===Number(rating.project_id))?.name || '—'}</td><td>{rating.rating} / 5</td><td>{rating.comment || '—'}</td><td>{String(rating.created_at || '').slice(0,10) || '—'}</td></tr>)}</tbody></table></div> : <div className="inline-empty">No ratings recorded yet. Rate the contractor against a project assignment.</div>}
    </Section>
    <Section title="Payments" eyebrow="ACCOUNT" action={canPay && <button className="secondary small-btn" onClick={() => setModal({ type: 'contractorPayment', contractorId: id, assignment: null, projects, token, notify, onPaid: async () => { await statementState.reload(); await contractorPaymentsState.reload(); } })}>
      <CircleDollarSign size={14} /> Record payment</button>}>
      {contractorPayments.length ? <div className="biz-table"><table><thead><tr><th>Date</th><th>Project</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead><tbody>{contractorPayments.map(payment=><tr key={payment.id}><td>{String(payment.payment_date || payment.paymentDate || '').slice(0,10) || '—'}</td><td>{payment.project_name || projects.find(p=>Number(p.id)===Number(payment.project_id))?.name || '—'}</td><td>{money(payment.amount)}</td><td>{payment.payment_method || payment.paymentMethod || '—'}</td><td>{payment.reference || '—'}</td></tr>)}</tbody></table></div> : <div className="inline-empty">No contractor payments recorded yet.</div>}
    </Section>
  </div>
}

function EmployeesHome({ token, user, search, open, setModal, notify }) {
  const [viewMode, setViewMode] = useState('grid');
  const { rows, loading, error, reload } = useRows('/employees', token);
  const list = rows.filter(x => JSON.stringify(x).toLowerCase().includes(search.toLowerCase()));
  return <div className="page biz-page">
    <WorkspaceHeader eyebrow="WORKFORCE" title="Employees" action={<div className="head-actions"><ViewToggle value={viewMode} onChange={setViewMode} />{hasPermission(user, 'employees', 'write') && <button className="primary" onClick={() => setModal({ type: 'employee', reload, token, notify, user })}>
      <Plus size={16} /> New employee</button>}</div>}>
      <p className="muted">Open an employee to see site assignment and payroll-related information without entering IDs.</p>
    </WorkspaceHeader>{error && <div className="error">{error}</div>}{loading ? <div className="loading">Loading employees…</div> : <div className={viewMode === 'grid' ? 'biz-grid' : 'biz-list'}>{list.map(e => <Card key={e.id} icon={Users} title={e.full_name || e.fullName} subtitle={e.job_title || e.jobTitle || 'Employee'} meta={[e.payment_type || e.paymentType || 'Payment type not set', e.phone || 'No phone', (e.is_active ?? e.isActive) === false ? 'Inactive' : 'Active']} onClick={() => open('employee', e.id)} actions={hasPermission(user, 'employees', 'write') && (e.is_active ?? e.isActive) !== false ? <button className="secondary small-btn" onClick={async () => { if (!window.confirm(`Deactivate ${e.full_name || e.fullName}? They will remain in HR history but should not be assigned to new work.`)) return; try { await api(`/employees/${e.id}/deactivate`, { method: 'PATCH', token, body: {} }); await reload(); } catch (err) { setModal({ type: 'notice', message: `Employee could not be deactivated: ${err.message}` }); } }}>Deactivate</button> : null} />)}</div>}</div>
}
function EmployeeDetail({ token, user, id, back, setModal }) {
  const [assignmentViewMode, setAssignmentViewMode] = useState('grid');
  const employeeState = useRows(`/employees/${id}`, token);
  const emp = employeeState.data?.id ? employeeState.data : null;
  const assigns = useRows('/employee-site-assignments', token).rows.filter(a => Number(a.employee_id) === Number(id));
  const sites = useRows('/sites', token).rows;
  return <div className="page biz-page">
    <WorkspaceHeader back={back} eyebrow="EMPLOYEE PROFILE" title={emp?.full_name || emp?.fullName || 'Employee'} action={hasPermission(user, 'employees', 'write') && emp && <button className="secondary" onClick={() => setModal({ type: 'employee', employee: emp, reload: employeeState.reload, user })}><Edit3 size={15}/> Edit employee</button>}>
      <p className="muted">Assignment and job information stay connected to the employee.</p>
    </WorkspaceHeader>
    <div className="stats-grid biz-stats">
      <Stat label="Payment type" value={emp?.payment_type || emp?.paymentType || '—'} />
      <Stat label="Monthly gross" value={money(emp?.monthly_gross || emp?.monthlyGross)} />
      <Stat label="Daily rate" value={money(emp?.daily_rate || emp?.dailyRate)} />
      <Stat label="Phone" value={emp?.phone || '—'} />
    </div>
    <Section title="Site assignments" eyebrow="WHERE THEY WORK" action={<ViewToggle value={assignmentViewMode} onChange={setAssignmentViewMode} />}>{assigns.length ? <div className={assignmentViewMode === 'grid' ? 'biz-grid compact-grid' : 'biz-list'}>{assigns.map(a => {
      const s = sites.find(x => Number(x.id) === Number(a.site_id));
      return <Card key={a.id} icon={MapPin} title={s?.name || 'Site'} subtitle={s?.location || ''} meta={[`From ${a.start_date}`]} />
    })}</div> : <div className="inline-empty">No site assignments.</div>}</Section>
  </div>
}

function WarehousesHome({ token, user, search, open, setModal }) {
  const [viewMode, setViewMode] = useState('grid');
  const { rows, loading, error, reload } = useRows('/warehouses', token);
  const list = rows.filter(x => JSON.stringify(x).toLowerCase().includes(search.toLowerCase()));
  return <div className="page biz-page">
    <WorkspaceHeader eyebrow="WAREHOUSE CONTROL" title="Warehouses" action={<div className="head-actions"><ViewToggle value={viewMode} onChange={setViewMode} />{hasPermission(user, 'warehouses', 'write') && <button className="primary" onClick={() => setModal({ type: 'warehouse', reload })}>
      <Plus size={16} /> New warehouse</button>}</div>}>
      <p className="muted">Choose a warehouse to see its stock, movements, receiving and damage/waste actions.</p>
    </WorkspaceHeader>{error && <div className="error">{error}</div>}{loading ? <div className="loading">Loading warehouses…</div> : <div className={viewMode === 'grid' ? 'biz-grid' : 'biz-list'}>{list.map(w => <Card key={w.id} icon={Truck} title={w.name} subtitle={w.location || 'Location not set'} onClick={() => open('warehouse', w.id)} actions={hasPermission(user, 'warehouses', 'write') ? <button className="secondary small-btn" onClick={() => setModal({ type: 'warehouse', warehouse: w, reload })}>Edit</button> : null} />)}</div>}</div>
}
function WarehouseDetail({ token, user, id, back, setModal, notify }) {
  const [stockViewMode, setStockViewMode] = useState('grid');
  const warehouseState = useRows(`/warehouses/${id}`, token);
  const warehouseListState = useRows('/warehouses', token);
  const wh = warehouseState.data?.id
    ? warehouseState.data
    : warehouseListState.rows.find(warehouse => Number(warehouse.id) === Number(id)) || null;
  const stockState = useRows('/warehouse-stock', token);
  const stock = stockState.rows.filter(x => Number(x.warehouse_id) === Number(id));
  const itemsState = useRows('/inventory-items', token);
  const items = itemsState.rows;
  const txState = useRows('/inventory-transactions', token);
  const tx = txState.rows.filter(x => Number(x.warehouse_id) === Number(id));
  const sites = useRows('/sites', token).rows;
  const requests = useRows('/material-issuance-requests', token);
  const canWrite = hasPermission(user, 'transactions', 'write');
  const canRequest = hasPermission(user, 'issuances', 'write');
  const canApprove = user?.role === 'Admin' || user?.role === 'Store Manager';
  async function reviewRequest(req, action) {
    try {
      if (action === 'approve') await api(`/completion/issuances/${req.id}/approve`, { method: 'POST', token }); else {
        const reason = prompt('Rejection reason');
        if (!reason?.trim()) return;
        await api(`/completion/issuances/${req.id}/reject`, { method: 'POST', token, body: { rejectionReason: reason } })
      }
      requests.reload();
      notify(action === 'approve' ? 'Material request approved.' : 'Material request rejected.')
    } catch (e) { notify(e.message) }
  }
  if (warehouseState.loading || warehouseListState.loading) return <div className="page biz-page"><WorkspaceHeader back={back} eyebrow="WAREHOUSE WORKSPACE" title="Opening warehouse…" /><div className="loading">Loading warehouse details and stock…</div></div>;
  if (!wh && (warehouseState.error || warehouseListState.error)) return <div className="page biz-page"><WorkspaceHeader back={back} eyebrow="WAREHOUSE WORKSPACE" title="Warehouse unavailable" /><div className="error">{warehouseState.error || warehouseListState.error}</div><button className="secondary" onClick={back}>Back to warehouses</button></div>;
  if (!wh) return <div className="page biz-page"><WorkspaceHeader back={back} eyebrow="WAREHOUSE WORKSPACE" title="Warehouse not found" /><p className="muted">This warehouse may have been removed or is not accessible to your account.</p><button className="secondary" onClick={back}>Back to warehouses</button></div>;
  return <div className="page biz-page">
    <WorkspaceHeader back={back} eyebrow="WAREHOUSE WORKSPACE" title={wh?.name || 'Warehouse'} action={hasPermission(user, 'warehouses', 'write') && <button className="secondary" onClick={() => setModal({ type: 'warehouse', warehouse: wh, reload: warehouseListState.reload })}><Edit3 size={15}/> Edit warehouse</button>}>
      <p className="muted">Stock, receiving, material requests, approvals and movement history are kept together.</p>
    </WorkspaceHeader>
    <div className="action-row">{hasPermission(user, 'items', 'write') && <button className="secondary" onClick={() => setModal({
      type: 'stockReceive', warehouseId: id, items, stock, token, notify, onSaved: async () => { await Promise.all([stockState.reload(), txState.reload()]); }
    })}>
      <Plus size={15} /> Receive stock</button>}{canRequest && <button className="primary" onClick={() => setModal({ type: 'materialRequest', warehouseId: id, items, sites, token, notify, onSaved: requests.reload })}>
        <ArrowUpRight size={15} /> Request stock out</button>}{canWrite && <>
          <button className="secondary" onClick={() => setModal({
            type: 'stockAdjustment', warehouseId: id, items, stock, mode: 'damage', token, notify, onSaved: () => {
              stockState.reload();
              txState.reload()
            }
          })}>Record damage</button>
          <button className="secondary" onClick={() => setModal({
            type: 'stockAdjustment', warehouseId: id, items, stock, mode: 'waste', token, notify, onSaved: () => {
              stockState.reload();
              txState.reload()
            }
          })}>Record waste</button>
        </>}</div>
    <div className="two-col">
      <Section title="Current stock" eyebrow="INVENTORY" action={<ViewToggle value={stockViewMode} onChange={setStockViewMode} />}>{stock.length ? <div className={stockViewMode === 'grid' ? 'biz-grid compact-grid' : 'biz-list'}>{stock.map(s => {
        const i = items.find(x => Number(x.id) === Number(s.item_id));
        return <Card key={s.id} icon={Package} title={i?.name || 'Item'} subtitle={`${s.quantity} ${i?.unit || 'units'}`} meta={[Number(s.quantity) <= Number(i?.threshold || 0) ? 'LOW STOCK' : 'In stock']} />
      })}</div> : <div className="inline-empty">No stock in this warehouse.</div>}</Section>
      <Section title="Pending material requests" eyebrow="APPROVALS">
        <div className="stack-list">{requests.rows.filter(r => Number(r.warehouse_id) === Number(id) && r.status === 'Pending').map(r => <div className="list-row" key={r.id}>
          <div>
            <b>Request #{r.id}</b>
            <span>{r.site_name || sites.find(s => Number(s.id) === Number(r.site_id))?.name || 'Site'} • requested {r.requested_at?.slice(0, 10) || '—'}</span>
          </div>{canApprove && <div className="action-row">
            <button className="secondary small-btn" onClick={() => reviewRequest(r, 'reject')}>Reject</button>
            <button className="primary small-btn" onClick={() => reviewRequest(r, 'approve')}>Approve</button>
          </div>}</div>)}</div>{!requests.loading && !requests.rows.filter(r => Number(r.warehouse_id) === Number(id) && r.status === 'Pending').length && <div className="inline-empty">No pending requests.</div>}</Section>
    </div>
    <Section title="Movement history" eyebrow="TRACEABILITY">
      <div className="biz-table">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Reference</th>
              <th>Site</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>{tx.slice(0, 30).map(t => <tr key={t.id}>
            <td>{t.item_name || items.find(i => Number(i.id) === Number(t.item_id))?.name || 'Item'}</td>
            <td>{t.transaction_type}</td>
            <td>{t.quantity}</td>
            <td>{t.reference || '—'}</td>
            <td>{t.site_name || '—'}</td>
            <td>{t.created_at?.slice(0, 10) || '—'}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </Section>
  </div>
}

function InventoryHome({ token, user, search, open, setModal, notify }) {
  const [viewMode, setViewMode] = useState('grid');
  const items = useRows('/inventory-items', token);
  const cats = useRows('/inventory-categories', token);
  const stock = useRows('/warehouse-stock', token);
  const list = items.rows.filter(x => JSON.stringify(x).toLowerCase().includes(search.toLowerCase()));
  const canWrite = hasPermission(user, 'items', 'write');
  return <div className="page biz-page">
    <WorkspaceHeader eyebrow="MATERIAL CONTROL" title="Inventory" action={<div className="head-actions"><ViewToggle value={viewMode} onChange={setViewMode} />
      {canWrite && <button className="primary" onClick={() => setModal({ type: 'item', categories: cats.rows, reload: items.reload })}>
        <Plus size={16} /> New item</button>}
      {canWrite && <button className="secondary" onClick={() => setModal({ type: 'category', reload: cats.reload })}>
        <Plus size={16} /> Add category</button>}
    </div>}>
      <p className="muted">Manage categories and inventory items, then open an item to see stock by warehouse and movement history.</p>
    </WorkspaceHeader>
    {items.error && <div className="error">{items.error}</div>}{cats.error && <div className="error">Categories: {cats.error}</div>}
    <Section title="Inventory categories" eyebrow={`${cats.rows.length} CATEGORIES`}>
      <div className={viewMode === 'grid' ? "biz-grid compact-grid" : "biz-list"}>{cats.rows.map(c => <Card key={c.id} icon={Package} title={c.name} meta={[`Category #${c.id}`]} actions={canWrite && <>
        <button className="secondary small-btn" onClick={() => setModal({ type: 'category', category: c, reload: cats.reload })}>Edit</button>
        <button className="secondary small-btn" onClick={async e => {
          e.stopPropagation();
          if (confirm(`Delete ${c.name}?`)) {
            try {
              await api(`/inventory-categories/${c.id}`, { method: 'DELETE', token });
              cats.reload();
              notifyCategory(setModal, 'Category deleted.')
            } catch (err) { notify(err.message) }
          }
        }}>Delete</button>
      </>} />)}</div>{!cats.loading && !cats.rows.length && <div className="inline-empty">No categories yet. Add a category before creating an item.</div>}</Section>
    <Section title="Inventory items" eyebrow={`${list.length} ITEMS`}>{items.loading ? <div className="loading">Loading inventory…</div> : <div className={viewMode === 'grid' ? "biz-grid" : "biz-list"}>{list.map(i => {
      const q = stock.rows.filter(s => Number(s.item_id) === Number(i.id)).reduce((a, s) => a + Number(s.quantity || 0), 0);
      return <Card key={i.id} icon={Package} title={i.name} subtitle={`${i.unit || 'unit'} • ${cats.rows.find(c => Number(c.id) === Number(i.category_id))?.name || 'Category not set'}`} meta={[`Stock ${q}`, `Threshold ${i.threshold || 0}`]} onClick={() => open('item', i.id)} actions={canWrite ? <button className="secondary small-btn" onClick={() => setModal({ type: 'item', item: i, categories: cats.rows, reload: items.reload })}>Edit</button> : null} />
    })}</div>}{!items.loading && !list.length && <div className="inline-empty">No inventory items found.</div>}</Section>
  </div>
}

function ItemDetail({ token, user, id, back, setModal }) {
  const [stockViewMode, setStockViewMode] = useState('grid');
  const cats = useRows('/inventory-categories', token);
  const itemState = useRows(`/inventory-items/${id}`, token);
  const item = itemState.data?.id ? itemState.data : null;
  const stock = useRows('/warehouse-stock', token).rows.filter(s => Number(s.item_id) === Number(id));
  const wh = useRows('/warehouses', token).rows;
  const tx = useRows('/inventory-transactions', token).rows.filter(t => Number(t.item_id) === Number(id));
  const total = stock.reduce((s, x) => s + Number(x.quantity || 0), 0);
  return <div className="page biz-page">
    <WorkspaceHeader back={back} eyebrow="INVENTORY ITEM" title={item?.name || 'Item'} action={hasPermission(user, 'items', 'write') && item && <button className="secondary" onClick={() => setModal({ type: 'item', item, categories: cats.rows, reload: itemState.reload })}><Edit3 size={15}/> Edit item</button>}>
      <p className="muted">Stock position and transaction history for this material.</p>
    </WorkspaceHeader>
    <div className="stats-grid biz-stats">
      <Stat label="Current stock" value={`${total} ${item?.unit || ''}`} />
      <Stat label="Low-stock threshold" value={nice(item?.threshold)} />
      <Stat label="Unit cost" value={money(item?.unit_cost || item?.unitCost)} />
      <Stat label="Category" value={item?.category_name || '—'} />
    </div>
    <Section title="Warehouse positions" eyebrow="STOCK BY LOCATION" action={<ViewToggle value={stockViewMode} onChange={setStockViewMode} />}>
      <div className={stockViewMode === 'grid' ? 'biz-grid compact-grid' : 'biz-list'}>{stock.map(s => <Card key={s.id} icon={Truck} title={wh.find(w => Number(w.id) === Number(s.warehouse_id))?.name || 'Warehouse'} subtitle={`${s.quantity} ${item?.unit || 'units'}`} />)}</div>
    </Section>
    <Section title="Transactions" eyebrow="HISTORY">
      <div className="biz-table">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Quantity</th>
              <th>Reference</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>{tx.slice(0, 30).map(t => <tr key={t.id}>
            <td>{t.transaction_type}</td>
            <td>{t.quantity}</td>
            <td>{t.reference || '—'}</td>
            <td>{t.created_at?.slice(0, 10) || '—'}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </Section>
  </div>
}

function MaterialRequestsHome({ token, user, notify }) {
  const requests = useRows('/material-issuance-requests', token);
  const itemsState = useRows('/material-issuance-items', token);
  const [viewMode, setViewMode] = useState('list');
  const [busy, setBusy] = useState(null);
  const canApprove = user?.role === 'Admin' || user?.role === 'Store Manager';
  const items = itemsState.rows;
  async function review(request, action) {
    const reason = action === 'reject' ? window.prompt('Enter a reason for rejecting this material request:') : '';
    if (action === 'reject' && !reason?.trim()) return;
    setBusy(request.id);
    try {
      if (action === 'approve') await api(`/completion/issuances/${request.id}/approve`, { method: 'POST', token });
      else await api(`/completion/issuances/${request.id}/reject`, { method: 'POST', token, body: { rejectionReason: reason.trim() } });
      await Promise.all([requests.reload(), itemsState.reload()]);
      notify(action === 'approve' ? 'Material request approved and stock issued.' : 'Material request rejected. Stock was not changed.');
    } catch (e) { notify(`Request #${request.id} was not ${action === 'approve' ? 'approved' : 'rejected'}: ${e.message}`); }
    finally { setBusy(null); }
  }
  const all = requests.rows;
  return <div className="page biz-page"><WorkspaceHeader eyebrow="INVENTORY WORKFLOW" title="Material requests" action={<div className="head-actions"><ViewToggle value={viewMode} onChange={setViewMode}/><button className="secondary" onClick={() => Promise.all([requests.reload(),itemsState.reload()])}>Refresh</button></div>}><p className="muted">Requests stay Pending until an authorized Store Manager or Admin approves them. Approval deducts warehouse stock and records the site issue; rejection leaves stock unchanged.</p></WorkspaceHeader>
    {(requests.error || itemsState.error) && <div className="error">{requests.error || itemsState.error}</div>}
    {requests.loading || itemsState.loading ? <div className="loading">Loading material requests…</div> : all.length ? <div className={viewMode === 'grid' ? 'biz-grid' : 'biz-list'}>{all.map(r=>{const lines=items.filter(x=>Number(x.request_id)===Number(r.id));return <Card key={r.id} icon={Package} title={`Request #${r.id}`} subtitle={`${r.site_name || `Site #${r.site_id}`} · ${r.warehouse_name || `Warehouse #${r.warehouse_id}`}`} meta={[r.status || 'Pending', `Requested by ${r.requester_name || 'staff'}`, ...lines.map(x=>`${x.item_name}: ${x.quantity} ${x.item_unit || 'units'}`), ...(r.rejection_reason ? [`Reason: ${r.rejection_reason}`] : [])]} actions={canApprove && r.status === 'Pending' ? <div className="action-row"><button className="secondary small-btn" disabled={busy===r.id} onClick={()=>review(r,'reject')}>Reject</button><button className="primary small-btn" disabled={busy===r.id || !lines.length} onClick={()=>review(r,'approve')}>{busy===r.id?'Processing…':'Approve & issue'}</button></div> : null}/>})}</div> : <div className="inline-empty">No material requests have been submitted yet. Create a request from a project site.</div>}
  </div>;
}

function FinanceHome({ token, user, open, setModal }) {
  const cp = useRows('/client-payments', token);
  const kp = useRows('/contractor-payments', token);
  const clients = useRows('/clients', token).rows;
  const contractors = useRows('/contractors', token).rows;
  return <div className="page biz-page">
    <WorkspaceHeader eyebrow="FINANCE" title="Payments" action={<div className="head-actions">{hasPermission(user, 'client-payments', 'write') && <button className="primary" onClick={() => setModal({ type: 'clientPayment', token, onPaid: async () => { await cp.reload(); await kp.reload(); } })}><Plus size={16} /> Record client receipt</button>}{hasPermission(user, 'contractor-payments', 'write') && <button className="secondary" onClick={() => setModal({ type: 'contractorPayment', token, onPaid: async () => { await cp.reload(); await kp.reload(); } })}><Plus size={16} /> Record contractor payment</button>}</div>}>
      <p className="muted">Finance is organized around the person/account, with project context shown on every payment.</p>
    </WorkspaceHeader>
    <div className="stats-grid biz-stats">
      <Stat label="Client receipts" value={money(cp.rows.reduce((s, x) => s + Number(x.amount || 0), 0))} />
      <Stat label="Contractor payments" value={money(kp.rows.reduce((s, x) => s + Number(x.amount || 0), 0))} />
    </div>
    <div className="two-col">
      <Section title="Client receipts" eyebrow="MONEY IN">
        <div className="stack-list">{cp.rows.slice(0, 20).map(x => <div className="list-row" key={x.id}>
          <div>
            <b>{x.client_name || clients.find(c => Number(c.id) === Number(x.client_id))?.name}</b>
            <span>{x.project_name || 'Project'} • {x.invoice_reference}</span>
          </div>
          <strong>{money(x.amount)}</strong>
        </div>)}</div>
      </Section>
      <Section title="Contractor payments" eyebrow="MONEY OUT">
        <div className="stack-list">{kp.rows.slice(0, 20).map(x => <div className="list-row" key={x.id}>
          <div>
            <b>{x.contractor_name || contractors.find(c => Number(c.id) === Number(x.contractor_id))?.name}</b>
            <span>{x.project_name || 'Project'} • {x.reference || 'No reference'}</span>
          </div>
          <strong>{money(x.amount)}</strong>
        </div>)}</div>
      </Section>
    </div>
  </div>
}
function WorkforceHome({ token, user, open, setModal, notify }) { return <EmployeesHome token={token} user={user} search="" open={open} setModal={setModal} notify={notify} /> }
function GenericHome({ token, user, title, icon: Icon, endpoint, setModal, notify, onNavigate }) {
  const { rows, loading, error, reload } = useRows(endpoint, token);
  return <div className="page biz-page">
    <WorkspaceHeader eyebrow="WORKSPACE" title={title} action={title === 'Administration' && <button className="secondary" onClick={() => onNavigate?.('audit', [])}>Open audit logs</button>}>
      <p className="muted">{title === 'Administration' ? 'Review, edit, enable, or disable existing login accounts. New staff logins are created from the workforce creation workflow.' : 'Manage this area through the connected records and existing backend workflows.'}</p>
    </WorkspaceHeader>{title === 'Administration' && <div className="account-callout"><b>Administration vs workforce</b><span>Employees are HR/payroll records. System accounts are login identities with roles and permissions. Only give a login to staff who need to access the application, and assign the least-privileged role that fits their duties.</span></div>}{error && <div className="error">{error}</div>}{loading ? <div className="loading">Loading…</div> : <div className="biz-grid">{rows.slice(0, 40).map((r, i) => <Card key={r.id || i} icon={Icon} title={r.name || r.full_name || r.status || `Record ${i + 1}`} subtitle={r.description || r.email || r.role_name || r.role || ''} meta={Object.entries(r).filter(([k]) => !['id', 'password_hash', 'password'].includes(k)).slice(0, 2).map(([k, v]) => `${k.replaceAll('_', ' ')}: ${nice(v)}`)} actions={title === 'Administration' && user?.role === 'Admin' && r.id ? <><button className="secondary small-btn" onClick={() => setModal?.({ type: 'userAccount', user: r, onCreated: reload })}>Edit account</button><button className="secondary small-btn" onClick={async () => { try { const isActive = r.is_active ?? r.isActive ?? true; await api(`/users/${r.id}`, { method: 'PUT', token, body: { fullName: r.full_name || r.fullName, email: r.email, roleId: Number(r.role_id ?? r.roleId), isActive: !isActive } }); await reload(); } catch (e) { notify?.(`Account status was not changed: ${e.message}`); } }}>{(r.is_active ?? r.isActive ?? true) ? 'Disable login' : 'Enable login'}</button></> : null} />)}</div>}</div>
}
function AuditHome({ token, user, search = '' }) {
  const [viewMode, setViewMode] = useState('list');
  const state = useRows('/audit-logs', token);
  const filtered = state.rows.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  if (!hasPermission(user, 'audit', 'read')) return <div className="page biz-page"><div className="access-denied"><h2>Access restricted</h2><p>Audit logs are available to administrators only.</p></div></div>;
  return <div className="page biz-page">
    <WorkspaceHeader eyebrow="SECURITY & TRACEABILITY" title="Audit logs" action={<div className="head-actions"><div className="view-toggle" role="group" aria-label="Audit log layout"><button type="button" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>Table</button><button type="button" className={viewMode === 'timeline' ? 'active' : ''} onClick={() => setViewMode('timeline')}>Timeline</button></div><button className="secondary" onClick={state.reload}>Refresh logs</button></div>}><p className="muted">A read-only activity trail for reviewing recorded system actions. Use search in the top bar to filter events.</p></WorkspaceHeader>
    {state.error && <div className="error">Could not load audit logs: {state.error}</div>}
    {state.loading ? <div className="loading">Loading audit logs…</div> : filtered.length ? (viewMode === 'list' ? <div className="biz-table"><table><thead><tr><th>Time</th><th>Action</th><th>User</th><th>Entity</th><th>Record</th><th>Details</th></tr></thead><tbody>{filtered.map((row,i)=><tr key={row.id || i}><td>{row.created_at ? new Date(row.created_at).toLocaleString() : row.timestamp || '—'}</td><td>{row.action || row.event_type || row.operation || 'System activity'}</td><td>{row.user_name || row.full_name || row.user_email || row.user_id || 'System'}</td><td>{row.entity_type || row.table_name || row.resource || '—'}</td><td>{row.entity_id || row.record_id || '—'}</td><td>{(row.description || row.details || row.message || row.entity_name || 'Recorded system event')} {(row.old_values || row.new_values || row.metadata) && <details><summary>View data</summary><pre>{JSON.stringify({old:row.old_values,new:row.new_values,metadata:row.metadata},null,2)}</pre></details>}</td></tr>)}</tbody></table></div> : <div className="audit-timeline">{filtered.map((row,i)=><article className="audit-event" key={row.id || i}><div className="audit-event-mark"/><div className="audit-event-main"><div className="audit-event-top"><strong>{row.action || row.event_type || row.operation || 'System activity'}</strong><time>{row.created_at ? new Date(row.created_at).toLocaleString() : row.timestamp || 'Time not recorded'}</time></div><p>{row.description || row.details || row.message || row.entity_name || row.table_name || 'Recorded system event'}</p><div className="audit-event-meta"><span>User: {row.user_name || row.full_name || row.user_email || row.user_id || 'System'}</span><span>Entity: {row.entity_type || row.table_name || row.resource || '—'}</span><span>Record: {row.entity_id || row.record_id || '—'}</span></div>{(row.old_values || row.new_values || row.metadata) && <details><summary>Event details</summary><pre>{JSON.stringify({old:row.old_values,new:row.new_values,metadata:row.metadata},null,2)}</pre></details>}</div></article>)}</div>) : <div className="biz-empty">No audit events found for this search.</div>}
  </div>;
}

function ReportsHome({ token, user }) {
  const allowedTabs = ({ Admin: ['projects','finance','materials','payroll'], Management: ['projects','finance','materials','payroll'], Accounts: ['finance','payroll'], 'Project Manager': ['projects','materials'] })[user?.role] || [];
  const [tab, setTab] = useState(user?.role === 'Accounts' ? 'finance' : 'projects');
  useEffect(() => { if (!allowedTabs.includes(tab) && allowedTabs.length) setTab(allowedTabs[0]); }, [user?.role, tab]);
  const endpoint = { projects: '/completion/reports/projects', finance: '/completion/reports/financial', materials: '/completion/reports/materials', payroll: '/completion/reports/payroll' }[tab];
  const active = useRows(endpoint, token);
  const projectRows = tab === 'projects' ? active.rows : [];
  const totalBudget = projectRows.reduce((a, x) => a + Number(x.budget || 0), 0);
  const totalActual = projectRows.reduce((a, x) => a + Number(x.actual_cost || 0), 0);
  const statusCounts = ['Active', 'On Hold', 'Completed', 'Delayed'].map(status => ({ status, count: projectRows.filter(p => p.status === status).length }));
  const maxStatus = Math.max(1, ...statusCounts.map(x => x.count));
  const financialData = tab === 'finance' && active.data && !Array.isArray(active.data) ? active.data : {};
  const materialData = tab === 'materials' && active.data && !Array.isArray(active.data) ? active.data : {};
  const stockRows = materialData.stock || [];
  const lowStockRows = materialData.low_stock || [];
  const monthly = financialData.monthly_trends || [];
  const maxMonthly = Math.max(1, ...monthly.map(x => Math.max(Number(x.revenue || 0), Number(x.contractor_payments || 0))));
  const reportError = active.error;
  return <div className="page biz-page">
    <WorkspaceHeader eyebrow="REPORTING & INSIGHTS" title="Reports">
      <p className="muted">Visual summaries of project delivery, cash flow, inventory and payroll, using live backend report data.</p>
    </WorkspaceHeader>
    <div className="tabs report-tabs">{[['projects','Projects'],['finance','Financial'],['materials','Materials'],['payroll','Payroll']].filter(([key]) => allowedTabs.includes(key)).map(([key,label]) => <button key={key} type="button" aria-pressed={tab === key} className={tab === key ? 'tab active' : 'tab'} onClick={() => setTab(key)}>{label}</button>)}</div>
    {reportError && <div className="error">{reportError}</div>}
    {active.loading && <div className="loading">Loading {tab} report…</div>}
    {tab === 'projects' && !active.loading && <>
      <div className="stats-grid biz-stats">
        <Stat label="Projects" value={projectRows.length} />
        <Stat label="Total budget" value={money(totalBudget)} />
        <Stat label="Actual cost" value={money(totalActual)} />
        <Stat label="Budget remaining" value={money(totalBudget-totalActual)} tone={totalBudget-totalActual < 0 ? 'danger' : 'success'} />
      </div>
      <div className="two-col">
        <Section title="Project status" eyebrow="PORTFOLIO OVERVIEW">
          <div className="report-bars">{statusCounts.map(x => <div className="report-bar-row" key={x.status}><div><span>{x.status}</span><b>{x.count}</b></div><div className="report-bar-track"><i style={{width:`${(x.count/maxStatus)*100}%`}} /></div></div>)}</div>
        </Section>
        <Section title="Budget vs actual cost" eyebrow="COST CONTROL">
          {projectRows.length ? <div className="report-bars">{projectRows.slice(0,8).map(x => { const b=Number(x.budget||0), a=Number(x.actual_cost||0), max=Math.max(1,b,a); return <div className="report-bar-row" key={x.id}><div><span>{x.name}</span><small>{money(a)} actual / {money(b)} budget</small></div><div className="report-bar-track"><i style={{width:`${Math.min(100,a/max*100)}%`}} /></div></div>})}</div> : <div className="inline-empty">Project data will appear here once projects exist.</div>}
        </Section>
      </div>
      <Section title="Project details" eyebrow="DETAILED REPORT"><div className="biz-table"><table><thead><tr><th>Project</th><th>Status</th><th>Completion</th><th>Sites</th><th>Budget</th><th>Actual cost</th><th>Variance</th></tr></thead><tbody>{projectRows.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.status}</td><td>{Number(x.completion_percentage||0)}%</td><td>{x.sites ?? 0}</td><td>{money(x.budget)}</td><td>{money(x.actual_cost)}</td><td>{money(x.variance)}</td></tr>)}</tbody></table></div>{!projectRows.length && <div className="inline-empty">No project report data returned.</div>}</Section>
    </>}
    {tab === 'finance' && !active.loading && <>
      <div className="stats-grid biz-stats"><Stat label="Client receipts" value={money(financialData.revenue)} /><Stat label="Contractor payments" value={money(financialData.contractor_payments)} /><Stat label="Outstanding dues" value={money(financialData.outstanding_dues)} tone="danger" /></div>
      <Section title="Monthly cash flow" eyebrow="REVENUE VS PAYMENTS"><div className="report-bars">{monthly.map(x=>{const rev=Number(x.revenue||0), pay=Number(x.contractor_payments||0);return <div className="report-month" key={x.month}><div className="report-month-bars"><i title={`Client receipts ${money(rev)}`} style={{height:`${Math.max(3,rev/maxMonthly*100)}%`}}/><i title={`Contractor payments ${money(pay)}`} style={{height:`${Math.max(3,pay/maxMonthly*100)}%`}}/></div><span>{x.month}</span><small>In {money(rev)} · Out {money(pay)}</small></div>})}{!monthly.length && <div className="inline-empty">Monthly trends will appear after payments are recorded.</div>}</div><div className="report-legend"><span><i/> Client receipts</span><span><i/> Contractor payments</span></div></Section>
    </>}
    {tab === 'materials' && !active.loading && <>
      <div className="stats-grid biz-stats"><Stat label="Inventory items" value={stockRows.length} /><Stat label="Low-stock alerts" value={lowStockRows.length} tone={lowStockRows.length ? 'danger' : 'success'} /><Stat label="Tracked movements" value={(materialData.movements||[]).length} /></div>
      <Section title="Stock by item" eyebrow="WAREHOUSE INVENTORY"><div className="report-bars">{stockRows.slice(0,15).map(x=>{const q=Number(x.stock||0), threshold=Number(x.threshold||0), max=Math.max(1,...stockRows.map(y=>Number(y.stock||0)));return <div className="report-bar-row" key={x.id}><div><span>{x.name} ({x.unit||'units'})</span><small>{q} in stock · low-stock threshold {threshold}</small></div><div className="report-bar-track"><i className={q<=threshold?'warning':''} style={{width:`${Math.min(100,q/max*100)}%`}} /></div></div>})}{!stockRows.length && <div className="inline-empty">No inventory data available.</div>}</div></Section>
      <Section title="Low-stock alerts" eyebrow="ACTION REQUIRED"><div className="biz-table"><table><thead><tr><th>Item</th><th>On hand</th><th>Threshold</th><th>Unit</th></tr></thead><tbody>{lowStockRows.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.quantity}</td><td>{x.threshold}</td><td>{x.unit||'—'}</td></tr>)}</tbody></table></div>{!lowStockRows.length && <div className="inline-empty">No low-stock alerts.</div>}</Section>
    </>}
    {tab === 'payroll' && !active.loading && <Section title="Payroll report" eyebrow="PAYROLL RECORDS"><div className="biz-table"><table><thead><tr><th>Period</th><th>Employee</th><th>Status</th><th>Gross</th><th>Deductions</th><th>Net pay</th></tr></thead><tbody>{active.rows.map(x=><tr key={x.payroll_record_id || `${x.period_id}-${x.employee_id}`}><td>{x.year}-{String(x.month||'').padStart(2,'0')}</td><td>{x.full_name||'—'}</td><td>{x.status||'—'}</td><td>{money(x.gross_salary)}</td><td>{money(x.total_deductions)}</td><td>{money(x.net_pay)}</td></tr>)}</tbody></table></div>{!active.rows.length && <div className="inline-empty">No payroll report data returned.</div>}</Section>}
  </div>
}

function FormButton({ onClick, children, primary = false }) {
  return <button type="button" className={primary ? 'primary' : 'secondary'} onClick={event => {
    if (primary) {
      const modal = event.currentTarget.closest('.biz-modal');
      const invalid = [...(modal?.querySelectorAll('input,select,textarea') || [])].find(field => field.required && !field.disabled && !field.checkValidity());
      if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
    }
    onClick?.();
  }}>{children}</button>;
}

function ModalRouter({ token, user, modal, setModal, notify }) {
  if (!modal) return null;
  const close = () => setModal(null);
  if (modal.type === 'notice') return <Modal title="Action failed" onClose={close} actions={<FormButton primary onClick={close}>Close</FormButton>}><div className="error">{modal.message}</div></Modal>;
  if (modal.type === 'userAccount') return <UserAccountForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'project') return <ProjectModal key={`project-${modal.project?.id || 'new'}`} modal={modal} setModal={setModal} token={token} user={user} notify={notify} />;
  if (modal.type === 'site') return <SiteForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'siteMaterial') return <SiteMaterialForm key={`site-material-${modal.record?.id || modal.siteId}`} modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'contractor') return <ContractorForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'client') return <ClientForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'employee') return <EmployeeForm modal={modal} close={close} token={token} notify={notify} user={user} />;
  if (modal.type === 'warehouse') return <WarehouseForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'item') return <ItemForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'category') return <CategoryForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'materialRequest') return <MaterialRequestForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'contractorAssignment') return <ContractorAssignmentForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'employeeAssignment') return <EmployeeAssignmentForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'invoice') return <InvoiceForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'clientPayment') return <ClientPaymentForm modal={modal} close={close} token={token} notify={notify} setModal={setModal} />;
  if (modal.type === 'rating') return <RatingForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'contractorPayment') return <ContractorPaymentForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'cost') return <CostForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'completion') return <CompletionForm modal={modal} close={close} token={token} notify={notify} />;
  if (modal.type === 'stockReceive') return <StockForm modal={modal} close={close} token={token} notify={notify} mode="receive" />;
  if (modal.type === 'stockAdjustment') return <StockForm modal={modal} close={close} token={token} notify={notify} mode={modal.mode} />;
  return null;
}

function UserAccountForm({ modal, close, token, notify }) {
  const employee = modal.employee || {};
  const existing = modal.user || {};
  const [f, setF] = useState({ fullName: existing.full_name || existing.fullName || employee.full_name || employee.fullName || '', email: existing.email || employee.email || '', password: '', roleId: String(existing.role_id ?? existing.roleId ?? ''), isActive: existing.is_active ?? existing.isActive ?? true });
  const [saving, setSaving] = useState(false);
  const editing = Boolean(existing.id);
  const roles = [{ id: 2, name: 'Management' }, { id: 3, name: 'Accounts' }, { id: 4, name: 'Project Manager' }, { id: 5, name: 'Supervisor' }, { id: 6, name: 'Store Manager' }, { id: 7, name: 'Warehouse Worker' }, ...(editing && Number(f.roleId) === 1 ? [{ id: 1, name: 'Admin' }] : [])];
  const save = async () => {
    if (f.fullName.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) || !f.roleId) { notify('Enter a valid name, email, and system role.'); return; }
    if ((!editing || f.password) && (f.password.length < 8 || !/[A-Z]/.test(f.password))) { notify('Password must be at least 8 characters and contain one uppercase letter.'); return; }
    setSaving(true);
    try {
      const body = { fullName: f.fullName.trim(), email: f.email.trim(), roleId: Number(f.roleId), isActive: Boolean(f.isActive) };
      if (!editing) body.password = f.password;
      await api(editing ? `/users/${existing.id}` : '/users', { method: editing ? 'PUT' : 'POST', token, body });
      if (editing && f.password) await api(`/users/${existing.id}/password`, { method: 'PATCH', token, body: { password: f.password } });
      await modal.onCreated?.();
      close(); notify(editing ? 'System account updated.' : 'System account created. Share the login securely with the staff member.');
    } catch (e) { notify(`System account was not saved: ${e.message}`); } finally { setSaving(false); }
  };
  return <Modal title={editing ? `Edit account · ${existing.full_name || existing.fullName || existing.email}` : employee.id ? `Create login for ${employee.full_name || employee.fullName || 'employee'}` : 'Create system account'} onClose={close} actions={<><FormButton onClick={close}>Cancel</FormButton><FormButton primary onClick={save}>{saving ? 'Saving…' : editing ? 'Save account' : 'Create account'}</FormButton></>}>
    <div className="account-callout"><b>{editing ? 'Account settings' : 'Account access'}</b><span>{editing ? 'Update identity details, role, active status, and optionally set a new password. The existing password is never displayed.' : 'This creates a login identity, not an employee-to-user database link. Admin accounts are not offered for new staff accounts.'}</span></div>
    <Field label="Full name"><input value={f.fullName} onChange={e=>setF({...f,fullName:e.target.value})} autoComplete="name" /></Field>
    <Field label="Login email"><input type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} autoComplete="email" /></Field>
    <Field label={editing ? 'New password (optional)' : 'Temporary password'}><input type="password" required={!editing} value={f.password} onChange={e=>setF({...f,password:e.target.value})} autoComplete="new-password" /><small>{editing ? 'Leave blank to keep the current password. If set, use at least 8 characters and one uppercase letter.' : 'At least 8 characters and one uppercase letter.'}</small></Field>
    <Field label="System role"><select required value={f.roleId} onChange={e=>setF({...f,roleId:e.target.value})}><option value="">Choose role based on duties</option>{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
    {editing && <Field label="Account status"><select value={String(f.isActive)} onChange={e=>setF({...f,isActive:e.target.value==='true'})}><option value="true">Active — can sign in</option><option value="false">Disabled — sign-in blocked</option></select></Field>}
  </Modal>;
}

function SiteMaterialForm({ modal, close, token, notify }) {
  const record = modal.record || {};
  const [f, setF] = useState({ itemId: String(record.item_id || ''), received: String(record.received_quantity ?? 0), estimated: String(record.estimated_consumption ?? 0), actual: String(record.actual_consumption ?? 0), waste: String(record.waste_quantity ?? 0) });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const values = [f.received, f.estimated, f.actual, f.waste].map(Number);
    if ((!record.id && !f.itemId) || values.some(v => !Number.isInteger(v) || v < 0)) { notify('Choose an item and enter whole-number quantities of zero or more.'); return; }
    setSaving(true);
    try {
      const body = { received_quantity: values[0], estimated_consumption: values[1], actual_consumption: values[2], waste_quantity: values[3] };
      if (!record.id) { body.site_id = Number(modal.siteId); body.item_id = Number(f.itemId); }
      await api(record.id ? `/site-material-records/${record.id}` : '/site-material-records', { method: record.id ? 'PUT' : 'POST', token, body });
      await modal.reload?.(); close(); notify('Site material record saved.');
    } catch (e) { notify(e.message); } finally { setSaving(false); }
  };
  return <Modal title={record.id ? `Update material usage · ${record.item_name || 'Item'}` : `Record material · ${modal.siteName || 'Site'}`} onClose={close} actions={<><FormButton onClick={close}>Cancel</FormButton><FormButton primary onClick={save}>{saving ? 'Saving…' : 'Save record'}</FormButton></>}>
    {!record.id && <Field label="Inventory item"><select value={f.itemId} onChange={e=>setF({...f,itemId:e.target.value})}><option value="">Select item</option>{modal.items.map(i=><option key={i.id} value={i.id}>{i.name} · {i.unit||'units'}</option>)}</select></Field>}
    <Field label="Quantity received"><input type="number" min="0" step="1" value={f.received} onChange={e=>setF({...f,received:e.target.value})}/></Field>
    <Field label="Estimated consumption"><input type="number" min="0" step="1" value={f.estimated} onChange={e=>setF({...f,estimated:e.target.value})}/></Field>
    <Field label="Actual consumption"><input type="number" min="0" step="1" value={f.actual} onChange={e=>setF({...f,actual:e.target.value})}/></Field>
    <Field label="Waste quantity"><input type="number" min="0" step="1" value={f.waste} onChange={e=>setF({...f,waste:e.target.value})}/></Field>
    <div className="account-callout"><span>This records site-level consumption and waste. Warehouse stock changes only through warehouse receiving and approved material requests.</span></div>
  </Modal>;
}

function SiteForm({ modal, close, token, notify }) {
  const x = modal.site || {};
  const [f, setF] = useState({ name: x.name || '', location: x.location || '', projectId: modal.projectId || x.project_id || '' });
  const save = async () => {
    try {
      await api(x.id ? `/sites/${x.id}` : '/sites', { method: x.id ? 'PUT' : 'POST', token, body: { ...f, projectId: Number(f.projectId) } });
      await modal.reload?.();
      close();
      notify(x.id ? 'Site updated.' : 'Site created.')
    } catch (e) { notify(e.message) }
  };
  return <Modal title={x.id ? 'Edit site' : 'Add site'} onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Save site</FormButton>
  </>}>
    <Field label="Site name">
      <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
    </Field>
    <Field label="Location">
      <textarea value={f.location} onChange={e => setF({ ...f, location: e.target.value })} />
    </Field>
  </Modal>
}

function ClientForm({ modal, close, token, notify }) {
  const x = modal.client || {};
  const [f, setF] = useState({ name: x.name || '', email: x.email || '', phone: x.phone || '', address: x.address || '' });
  const save = async () => {
    try {
      await api(x.id ? `/clients/${x.id}` : '/clients', { method: x.id ? 'PUT' : 'POST', token, body: { ...f, email: f.email.trim() || null } });
      await modal.reload?.();
      close();
      notify('Client saved.')
    } catch (e) { notify(e.message) }
  };
  return <Modal title={x.id ? 'Edit client' : 'New client'} onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Save client</FormButton>
  </>}>
    <Field label="Name">
      <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
    </Field>
    <Field label="Email">
      <input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
    </Field>
    <Field label="Phone">
      <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
    </Field>
    <Field label="Address">
      <textarea value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />
    </Field>
  </Modal>
}

function ContractorForm({ modal, close, token, notify }) {
  const x = modal.contractor || {};
  const [f, setF] = useState({ name: x.name || '', specialization: x.specialization || '', phone: x.phone || '', email: x.email || '', address: x.address || '' });
  const save = async () => {
    try {
      await api(x.id ? `/contractors/${x.id}` : '/contractors', { method: x.id ? 'PUT' : 'POST', token, body: { ...f, email: f.email.trim() || undefined } });
      await modal.reload?.();
      close();
      notify('Contractor saved.')
    } catch (e) { notify(e.message) }
  };
  return <Modal title={x.id ? 'Edit contractor' : 'New contractor'} onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Save contractor</FormButton>
  </>}>
    <Field label="Name">
      <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
    </Field>
    <Field label="Specialization">
      <input value={f.specialization} onChange={e => setF({ ...f, specialization: e.target.value })} />
    </Field>
    <Field label="Phone">
      <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
    </Field>
    <Field label="Email">
      <input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
    </Field>
    <Field label="Address">
      <textarea value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />
    </Field>
  </Modal>
}

function EmployeeForm({ modal, close, token, notify, user }) {
  const x = modal.employee || {};
  const [f, setF] = useState({ fullName: x.full_name || x.fullName || '', cnic: x.cnic || '', phone: x.phone || '', email: x.email || '', address: x.address || '', jobTitle: x.job_title || x.jobTitle || '', paymentType: x.payment_type || x.paymentType || 'Monthly Salaried', monthlyGross: x.monthly_gross || x.monthlyGross || '', dailyRate: x.daily_rate || x.dailyRate || '', hireDate: String(x.hire_date || x.hireDate || '').slice(0,10) });
  const [createLogin, setCreateLogin] = useState(false);
  const [login, setLogin] = useState({ password: '', roleId: '' });
  const [saving, setSaving] = useState(false);
  const roles = [{ id: 2, name: 'Management' }, { id: 3, name: 'Accounts' }, { id: 4, name: 'Project Manager' }, { id: 5, name: 'Supervisor' }, { id: 6, name: 'Store Manager' }, { id: 7, name: 'Warehouse Worker' }];
  const save = async () => {
    if (f.fullName.trim().length < 2 || !f.cnic.trim() || !f.jobTitle.trim()) { notify('Enter a full name, CNIC, and job title.'); return; }
    if (f.paymentType === 'Monthly Salaried' && !(Number(f.monthlyGross) > 0) || f.paymentType === 'Daily Rate' && !(Number(f.dailyRate) > 0)) { notify('Enter a salary or daily rate greater than zero for the selected payment type.'); return; }
    if (createLogin && (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) || login.password.length < 8 || !/[A-Z]/.test(login.password) || !login.roleId)) { notify('For the login, enter a valid email, password of at least 8 characters with one uppercase letter, and a system role.'); return; }
    if (f.hireDate < today() && !window.confirm('The hire date is in the past. Are you sure you want to continue?')) return;
    setSaving(true);
    try {
      if (createLogin) {
        const existingUsers = unwrap(await api('/users', { token }));
        if (existingUsers.some(account => String(account.email || '').toLowerCase() === f.email.trim().toLowerCase())) { notify('A login already exists for this email. The employee record was not changed; edit the existing login in Administration.'); return; }
      }
      await api(x.id ? `/employees/${x.id}` : '/employees', { method: x.id ? 'PUT' : 'POST', token, body: { ...f, email: f.email.trim() || null, phone: f.phone.trim() || null, address: f.address.trim() || null, hireDate: f.hireDate || null, monthlyGross: f.paymentType === 'Monthly Salaried' ? Number(f.monthlyGross || 0) : null, dailyRate: f.paymentType === 'Daily Rate' ? Number(f.dailyRate || 0) : null } });
      if (createLogin) {
        try { await api('/users', { method: 'POST', token, body: { fullName: f.fullName.trim(), email: f.email.trim(), password: login.password, roleId: Number(login.roleId), isActive: true } }); }
        catch (accountError) { await modal.reload?.(); close(); notify(`Employee was saved, but the login was not created: ${accountError.message}. The employee record is saved; edit the employee again and retry after resolving the account error.`); return; }
      }
      await modal.reload?.();
      close();
      notify(createLogin ? 'Employee saved and system login created. The login is a separate account record; the current schema does not link it to the employee.' : 'Employee saved successfully.');
    } catch (e) { notify(`Employee was not saved: ${e.message}`); } finally { setSaving(false); }
  };
  return <Modal title={x.id ? 'Edit employee' : 'New employee'} onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>{saving ? 'Saving…' : x.id ? 'Save changes' : 'Create employee'}</FormButton>
  </>}>
    <Field label="Full name">
      <input value={f.fullName} onChange={e => setF({ ...f, fullName: e.target.value })} />
    </Field>
    <Field label="CNIC">
      <input value={f.cnic} onChange={e => setF({ ...f, cnic: e.target.value })} />
    </Field>
    <Field label="Phone">
      <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
    </Field>
    <Field label="Email (optional unless creating login)">
      <input type="email" required={createLogin} value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
    </Field>
    <Field label="Job title">
      <input value={f.jobTitle} onChange={e => setF({ ...f, jobTitle: e.target.value })} />
    </Field>
    <Field label="Payment type">
      <select value={f.paymentType} onChange={e => setF({ ...f, paymentType: e.target.value })}>
        <option>Monthly Salaried</option>
        <option>Daily Rate</option>
      </select>
    </Field>
    <Field label={f.paymentType === 'Monthly Salaried' ? 'Monthly gross (PKR)' : 'Daily rate (PKR)'}>
      <input type="number" value={f.paymentType === 'Monthly Salaried' ? f.monthlyGross : f.dailyRate} onChange={e => setF({ ...f, [f.paymentType === 'Monthly Salaried' ? 'monthlyGross' : 'dailyRate']: e.target.value })} />
    </Field>
    <Field label="Hire date (optional)">
      <input type="date" value={f.hireDate} onChange={e => { const v=e.target.value; if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setF({ ...f, hireDate: v }); }} />
    </Field>
    <Field label="Address (optional)">
      <textarea value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />
    </Field>
    {user?.role === 'Admin' && <div className="full-field account-create-box">
      <b>System login access</b><p className="muted">Should this employee also be able to sign in to the CMS?</p>
      <label className="inline-check"><input type="checkbox" checked={createLogin} onChange={e=>setCreateLogin(e.target.checked)} /> Yes, create a system login now</label>
      {createLogin && <div className="form-grid nested-form-grid">
        <Field label="Temporary password"><input type="password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} autoComplete="new-password" /><small>At least 8 characters and one uppercase letter.</small></Field>
        <Field label="System role"><select value={login.roleId} onChange={e=>setLogin({...login,roleId:e.target.value})}><option value="">Choose role based on duties</option>{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
        <div className="full-field muted">The account will use the employee email above. The current schema stores employee and login records separately, so this workflow creates both records but cannot create a direct database relationship.</div>
      </div>}
    </div>}
  </Modal>
}

function WarehouseForm({ modal, close, token, notify }) {
  const x = modal.warehouse || {};
  const [f, setF] = useState({ name: x.name || '', location: x.location || '' });
  const save = async () => {
    try {
      await api(x.id ? `/warehouses/${x.id}` : '/warehouses', { method: x.id ? 'PUT' : 'POST', token, body: f });
      await modal.reload?.();
      close();
      notify('Warehouse saved.')
    } catch (e) { notify(e.message) }
  };
  return <Modal title={x.id ? 'Edit warehouse' : 'New warehouse'} onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Save warehouse</FormButton>
  </>}>
    <Field label="Warehouse name">
      <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
    </Field>
    <Field label="Location">
      <input value={f.location} onChange={e => setF({ ...f, location: e.target.value })} />
    </Field>
  </Modal>
}

function ItemForm({ modal, close, token, notify }) {
  const x = modal.item || {};
  const [f, setF] = useState({ name: x.name || '', unit: x.unit || '', category_id: x.category_id || '', threshold: x.threshold || 0, unit_cost: x.unit_cost || 0 });
  const cats = modal.categories || [];
  const save = async () => {
    try {
      await api(x.id ? `/inventory-items/${x.id}` : '/inventory-items', { method: x.id ? 'PUT' : 'POST', token, body: { ...f, category_id: Number(f.category_id), threshold: Number(f.threshold), unit_cost: Number(f.unit_cost) } });
      await modal.reload?.();
      close();
      notify('Inventory item saved.')
    } catch (e) { notify(e.message) }
  };
  return <Modal title={x.id ? 'Edit item' : 'New inventory item'} onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Save item</FormButton>
  </>}>
    <Field label="Item name">
      <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
    </Field>
    <Field label="Unit">
      <input value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })} />
    </Field>
    <Field label="Category">
      <select value={f.category_id} onChange={e => setF({ ...f, category_id: e.target.value })}>
        <option value="">Select category</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    </Field>
    <Field label="Low-stock threshold">
      <input type="number" value={f.threshold} onChange={e => setF({ ...f, threshold: e.target.value })} />
    </Field>
    <Field label="Unit cost">
      <input type="number" value={f.unit_cost} onChange={e => setF({ ...f, unit_cost: e.target.value })} />
    </Field>
  </Modal>
}

function CategoryForm({ modal, close, token, notify }) {
  const x = modal.category || {};
  const [name, setName] = useState(x.name || '');
  const save = async () => {
    if (!name.trim()) {
      notify('Category name is required.');
      return
    }
    try {
      await api(x.id ? `/inventory-categories/${x.id}` : '/inventory-categories', { method: x.id ? 'PUT' : 'POST', token, body: { name: name.trim() } });
      await modal.reload?.();
      close();
      notify(x.id ? 'Category updated.' : 'Category created.')
    } catch (e) { notify(e.message) }
  };
  return <Modal title={x.id ? 'Edit inventory category' : 'Add inventory category'} onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Save category</FormButton>
  </>}>
    <Field label="Category name">
      <input value={name} onChange={e => setName(e.target.value)} />
    </Field>
  </Modal>
}
function MaterialRequestForm({ modal, close, token, notify }) {
  const items = modal.items || [];
  const stockRows = useRows('/warehouse-stock', token).rows;
  const sites = modal.sites || [];
  const warehouses = modal.warehouses || [];
  const [f, setF] = useState({ siteId: modal.siteId ? String(modal.siteId) : '', warehouseId: modal.warehouseId ? String(modal.warehouseId) : '', itemId: '', quantity: '' });
  const selectedWarehouseId = modal.warehouseId || f.warehouseId;
  const available = Number(stockRows.find(x => Number(x.warehouse_id) === Number(selectedWarehouseId) && Number(x.item_id) === Number(f.itemId))?.quantity || 0);
  const save = async () => {
    const q = Number(f.quantity);
    if (!f.siteId || !f.itemId || !Number.isInteger(q) || q <= 0) {
      notify('Select a site, item and positive quantity.');
      return
    }
    if (q > available) { notify(`Requested quantity exceeds available stock (${available}).`); return; }
    try {
      const warehouseId = Number(selectedWarehouseId);
      if (!warehouseId) { notify('Select a source warehouse.'); return; }
      const req = unwrap(await api('/material-issuance-requests', { method: 'POST', token, body: { site_id: Number(f.siteId), warehouse_id: warehouseId } }));
      const requestId = req?.id || req?.data?.id;
      if (!requestId) throw new Error('Material request was created but its ID was not returned.');
      await api('/material-issuance-items', { method: 'POST', token, body: { request_id: Number(requestId), item_id: Number(f.itemId), quantity: q } });
      close();
      notify('Material request submitted for approval.');
      modal.onSaved?.()
    } catch (e) { notify(e.message) }
  };
  return <Modal title="Request material from warehouse" onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Submit request</FormButton>
  </>}>
    {!modal.warehouseId && <Field label="Source warehouse"><select value={f.warehouseId} onChange={e => setF({ ...f, warehouseId: e.target.value, itemId: '' })}><option value="">Select warehouse</option>{warehouses.map(w=><option key={w.id} value={w.id}>{w.name} · {w.location || 'Location not set'}</option>)}</select></Field>}
    <Field label="Destination site">
      <select value={f.siteId} onChange={e => setF({ ...f, siteId: e.target.value })}>
        <option value="">Select site</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
    </Field>
    <Field label="Inventory item">
      <select value={f.itemId} disabled={!selectedWarehouseId} onChange={e => setF({ ...f, itemId: e.target.value, quantity: '' })}>
        <option value="">{selectedWarehouseId ? 'Select item' : 'Select a warehouse first'}</option>{items.map(i => <option key={i.id} value={i.id}>{i.name} • {i.unit || 'unit'} • available {stockRows.find(x => Number(x.warehouse_id) === Number(selectedWarehouseId) && Number(x.item_id) === Number(i.id))?.quantity || 0}</option>)}</select>
    </Field>
    <Field label="Quantity">
      <input type="number" min="1" max={available || undefined} step="1" value={f.quantity} onChange={e => setF({ ...f, quantity: e.target.value })} />
    </Field>
    <div className="account-callout">
      <span>Stock is deducted only after approval.</span>
    </div>
  </Modal>
}

function ContractorAssignmentForm({ modal, close, token, notify }) {
  const projectsState = useRows('/projects', token);
  const sitesState = useRows('/sites', token);
  const contractorsState = useRows('/contractors', token);
  const projects = modal.projects?.length ? modal.projects : projectsState.rows;
  const sites = modal.sites?.length ? modal.sites : sitesState.rows;
  const contractors = modal.contractors?.length ? modal.contractors : contractorsState.rows;
  const [f, setF] = useState({ projectId: modal.projectId || '', siteId: modal.siteId || '', contractorId: modal.contractorId || '', startDate: today(), endDate: '', payableAmount: '', notes: '' });
  const availableSites = sites.filter(s => !f.projectId || Number(s.project_id) === Number(f.projectId));
  const availableContractors = contractors;
  const save = async () => {
    if (!f.projectId || !f.siteId || !f.contractorId || !f.startDate) { notify('Select a project, site, contractor, and start date.'); return; }
    if (f.endDate && f.endDate < f.startDate) { notify('End date cannot be before the start date.'); return; }
    if (f.startDate < today() && !window.confirm('The assignment start date is in the past. Are you sure you want to continue?')) return;
    try {
      await api('/project-contractors', { method: 'POST', token, body: { ...f, projectId: Number(f.projectId), siteId: Number(f.siteId), contractorId: Number(f.contractorId), payableAmount: Number(f.payableAmount || 0), endDate: f.endDate || null } });
      await modal.reload?.();
      close();
      notify('Contractor assigned.')
    } catch (e) { notify(e.message) }
  };
  return <Modal title="Assign contractor" onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Assign contractor</FormButton>
  </>}>
    <Field label="Project">
      <select value={f.projectId} onChange={e => setF({ ...f, projectId: e.target.value, siteId: '' })}>
        <option value="">Select project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
    </Field>
    <Field label="Site">
      <select value={f.siteId} onChange={e => setF({ ...f, siteId: e.target.value })}>
        <option value="">Select site</option>{availableSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
    </Field>
    <Field label="Contractor">
      <select value={f.contractorId} onChange={e => setF({ ...f, contractorId: e.target.value })}>
        <option value="">Select contractor</option>{availableContractors.map(c => <option key={c.id} value={c.id}>{c.name} • {c.specialization || 'General'}</option>)}</select>
    </Field>
    <Field label="Start date">
      <input type="date" value={f.startDate} onChange={e => { const v=e.target.value; if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setF({ ...f, startDate: v }); }} />
    </Field>
    <Field label="End date">
      <input type="date" min={f.startDate || undefined} value={f.endDate} onChange={e => { const v=e.target.value; if (v && v < f.startDate) { notify('End date cannot be before the start date.'); return; } if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setF({ ...f, endDate: v }); }} />
    </Field>
    <Field label="Payable amount (PKR, optional)">
      <input type="number" value={f.payableAmount} onChange={e => setF({ ...f, payableAmount: e.target.value })} />
    </Field>
    <Field label="Notes">
      <textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} />
    </Field>
  </Modal>
}

function EmployeeAssignmentForm({ modal, close, token, notify }) {
  const employees = modal.employees || [];
  const [f, setF] = useState({ employeeId: '', siteId: modal.siteId || '', startDate: today(), endDate: '', dailyRateOverride: '' });
  const save = async () => {
    if (!f.employeeId || !f.siteId || !f.startDate) { notify('Select an employee, site, and start date.'); return; }
    if (f.endDate && f.endDate < f.startDate) { notify('End date cannot be before the start date.'); return; }
    if (f.startDate < today() && !window.confirm('The assignment start date is in the past. Are you sure you want to continue?')) return;
    try {
      await api('/employee-site-assignments', { method: 'POST', token, body: { ...f, employeeId: Number(f.employeeId), siteId: Number(f.siteId), endDate: f.endDate || null, dailyRateOverride: f.dailyRateOverride ? Number(f.dailyRateOverride) : null } });
      await modal.reload?.();
      close();
      notify('Employee assigned to site.')
    } catch (e) { notify(e.message) }
  };
  return <Modal title="Assign employee to site" onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Assign employee</FormButton>
  </>}>
    <Field label="Employee">
      <select value={f.employeeId} onChange={e => setF({ ...f, employeeId: e.target.value })}>
        <option value="">Select employee</option>{employees.map(e => <option key={e.id} value={e.id}>{e.full_name || e.fullName} • {e.job_title || e.jobTitle || 'Employee'}</option>)}</select>
    </Field>
    <Field label="Start date">
      <input type="date" value={f.startDate} onChange={e => { const v=e.target.value; if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setF({ ...f, startDate: v }); }} />
    </Field>
    <Field label="End date">
      <input type="date" min={f.startDate || undefined} value={f.endDate} onChange={e => { const v=e.target.value; if (v && v < f.startDate) { notify('End date cannot be before the start date.'); return; } if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setF({ ...f, endDate: v }); }} />
    </Field>
    <Field label="Daily rate override (optional)">
      <input type="number" value={f.dailyRateOverride} onChange={e => setF({ ...f, dailyRateOverride: e.target.value })} />
    </Field>
  </Modal>
}

function ClientPaymentForm({ modal, close, token, notify, setModal }) {
  const clients = useRows('/clients', token).rows;
  const projects = useRows('/projects', token).rows;
  const [clientId, setClientId] = useState(modal.clientId || '');
  const [statement, setStatement] = useState(null);
  const projectId = modal.projectId || '';
  useEffect(() => { if (modal.clientId) setClientId(String(modal.clientId)); }, [modal.clientId]);
  useEffect(() => { if (clientId) (async () => { setLoadingStatement(true); try { setStatement(unwrap(await api(`/completion/clients/${clientId}/statement`, { token }))) } catch (e) { setStatement(null); notify(e.message) } finally { setLoadingStatement(false) } })(); else setStatement(null); }, [clientId, token]);
  const invoices = (statement?.invoices || []).filter(i => cents(Number(i.amount || 0) - Number(i.paid || 0)) > 0 && (!projectId || Number(i.project_id) === Number(projectId)));
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [f, setF] = useState({ invoiceReference: '', amount: '', paymentDate: today(), paymentMethod: 'Bank Transfer', notes: '' });
  const inv = invoices.find(x => x.invoice_number === f.invoiceReference);
  const save = async () => {
    const amount = cents(f.amount);
    const outstanding = inv ? cents(Number(inv.amount) - Number(inv.paid)) : 0;
    if (!f.invoiceReference) {
      notify('Select an invoice.');
      return
    }
    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
      notify('Enter a valid payment amount greater than zero.');
      return
    }
    if (cents(amount) > cents(outstanding)) {
      notify(`Payment exceeds the outstanding balance of ${cents(outstanding).toFixed(2)}.`);
      return
    }
    if (f.paymentDate < today() && !window.confirm('The payment date is in the past. Are you sure you want to continue?')) return;
    try {
      await api('/completion/client-payments', { method: 'POST', token, body: { invoiceReference: f.invoiceReference, amount, paymentDate: f.paymentDate, paymentMethod: f.paymentMethod, notes: f.notes } });
      close();
      notify('Client payment recorded.');
      modal.onPaid?.()
    } catch (e) { notify(e.message) }
  };
  return <Modal title="Record client payment" onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Save payment</FormButton>
  </>}>
    {projectId ? <div className="context-strip">
      <span>Project</span>
      <b>{projects.find(p => Number(p.id) === Number(projectId))?.name || '—'}</b>
    </div> : <Field label="Client">
      <select value={clientId} onChange={e => {
        setClientId(e.target.value);
        setF({ ...f, invoiceReference: '', amount: '' })
      }}>
        <option value="">Select client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    </Field>}
    <Field label="Invoice with balance due">
      <select value={f.invoiceReference} onChange={e => setF({ ...f, invoiceReference: e.target.value, amount: '' })} disabled={!clientId || loadingStatement || !invoices.length}>
        <option value="">{loadingStatement ? 'Loading invoices…' : !clientId ? 'Select a client first' : !invoices.length ? 'No unpaid invoices for this client' : 'Choose an outstanding invoice'}</option>{invoices.map(i => <option key={i.id} value={i.invoice_number}>{i.invoice_number} · {i.description || 'Client invoice'} · Due {money(Math.max(0, Number(i.amount) - Number(i.paid)))}</option>)}</select>
    </Field>
    {clientId && !loadingStatement && !invoices.length && <div className="account-callout"><b>No outstanding invoice found</b><span>Create an invoice for this client before recording a payment. This keeps the payment ledger linked to the correct invoice.</span><button className="secondary small-btn" onClick={() => setModal?.({ type: 'invoice', clientId, onCreated: () => setModal?.({ type: 'clientPayment', clientId, token, notify }) })}>Create invoice</button></div>}
    {inv && <div className="account-callout">
      <span>Invoice outstanding</span>
      <strong>{money(cents(Number(inv.amount) - Number(inv.paid)))}</strong>
    </div>}
    <Field label="Payment amount (PKR)">
      <input type="number" min="0.01" max={inv ? cents(Number(inv.amount) - Number(inv.paid)) : undefined} step="0.01" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} />
    </Field>
    <Field label="Payment date">
      <input type="date" value={f.paymentDate} onChange={e => { const v=e.target.value; if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setF({ ...f, paymentDate: v }); }} />
    </Field>
    <Field label="Payment method (optional)">
      <input value={f.paymentMethod} onChange={e => setF({ ...f, paymentMethod: e.target.value })} />
    </Field>
    <Field label="Notes (optional)">
      <textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} />
    </Field>
  </Modal>
}

function ContractorPaymentForm({ modal, close, token, notify }) {
  const contractors = useRows('/contractors', token).rows;
  const projects = useRows('/projects', token).rows;
  const payments = useRows('/contractor-payments', token).rows;
  const c = contractors.find(x => Number(x.id) === Number(modal.contractorId));
  const assignment = modal.assignment;
  const initialProject = assignment?.project_id || modal.projectId || '';
  const [f, setF] = useState({ contractorId: modal.contractorId || '', projectId: initialProject, amount: '', paymentDate: today(), paymentMethod: 'Bank Transfer', notes: '' });
  const [statement, setStatement] = useState(null);
  useEffect(() => { let live = true; setStatement(null); if (f.contractorId) (async () => { try { const result = unwrap(await api(`/completion/contractors/${f.contractorId}/statement`, { token })); if (live) setStatement(result) } catch (e) { if (live) notify(e.message) } })(); return () => { live = false } }, [f.contractorId, token]);
  const assignmentRows = statement?.assignments || [];
  const selectedContractor = contractors.find(x => Number(x.id) === Number(f.contractorId));
  const selectedAssignment = assignmentRows.find(a => Number(a.project_id) === Number(f.projectId)) || assignment;
  const projectPaid = cents(payments.filter(p => Number(p.contractor_id) === Number(f.contractorId) && Number(p.project_id) === Number(f.projectId)).reduce((sum, p) => sum + Number(p.amount || 0), 0));
  const projectPayable = cents(selectedAssignment?.payable_amount || 0);
  const projectOutstanding = cents(Math.max(0, projectPayable - projectPaid));
  const outstanding = cents(selectedAssignment ? projectOutstanding : Number(statement?.outstanding || 0));
  const save = async () => {
    const amount = cents(f.amount);
    if (!f.contractorId || !f.projectId) {
      notify('Select the project assignment before recording payment.');
      return
    }
    if (!amount || amount <= 0) {
      notify('Enter a payment amount greater than zero.');
      return
    }
    if (cents(amount) > cents(outstanding)) {
      notify(`Payment exceeds the outstanding balance of ${cents(outstanding).toFixed(2)}.`);
      return
    }
    if (f.paymentDate < today() && !window.confirm('The payment date is in the past. Are you sure you want to continue?')) return;
    try {
      await api('/contractor-payments', { method: 'POST', token, body: { contractorId: Number(f.contractorId), projectId: Number(f.projectId), amount, paymentDate: f.paymentDate, paymentMethod: f.paymentMethod, notes: f.notes } });
      close();
      notify('Contractor payment recorded.');
      modal.onPaid?.()
    } catch (e) { notify(e.message) }
  };
  return <Modal title="Record contractor payment" onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Save payment</FormButton>
  </>}>
    {!modal.contractorId && <Field label="Contractor"><select value={f.contractorId} onChange={e => setF(v => ({ ...v, contractorId: e.target.value, projectId: '', amount: '' }))}><option value="">Select contractor</option>{contractors.map(x => <option key={x.id} value={x.id}>{x.name}{x.specialization ? ` • ${x.specialization}` : ''}</option>)}</select></Field>}
    <div className="account-callout">
      <b>{c?.name || selectedContractor?.name || 'Contractor'}</b>
      <span>{selectedAssignment?.project_name || projects.find(p => Number(p.id) === Number(f.projectId))?.name || 'Project'}{selectedAssignment?.site_name ? ` • ${selectedAssignment.site_name}` : ''}</span>
      <strong>Outstanding: {money(outstanding)}</strong>
    </div>
    {assignment ? <div className="context-strip">
      <span>Project</span>
      <b>{assignment.project_name || projects.find(p => Number(p.id) === Number(f.projectId))?.name || '—'}</b>
      <span>Site</span>
      <b>{assignment.site_name || '—'}</b>
    </div> : <Field label="Project">
      <select value={f.projectId} onChange={e => setF({ ...f, projectId: e.target.value, amount: '' })} disabled={!f.contractorId}>
        <option value="">Select project assignment</option>{assignmentRows.map(a => <option key={a.id} value={a.project_id}>{a.project_name} • {a.site_name}</option>)}</select>
    </Field>}
    <Field label="Amount (PKR)">
      <input type="number" min="0.01" max={outstanding || undefined} step="0.01" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} />
    </Field>
    <Field label="Payment date">
      <input type="date" value={f.paymentDate} onChange={e => { const v=e.target.value; if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setF({ ...f, paymentDate: v }); }} />
    </Field>
    <Field label="Payment method (optional)">
      <input value={f.paymentMethod} onChange={e => setF({ ...f, paymentMethod: e.target.value })} />
    </Field>
    <Field label="Notes (optional)">
      <textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} />
    </Field>
  </Modal>
}

function CostForm({ modal, close, token, notify }) {
  const sites = modal.sites || [];
  const [f, setF] = useState({ siteId: '', category: '', description: '', amount: '', costDate: today() });
  const save = async () => {
    if (!f.category.trim() || !f.description.trim() || !(Number(f.amount) > 0) || !f.costDate) { notify('Enter a category, description, positive amount, and cost date.'); return; }
    if (f.costDate < today() && !window.confirm('The cost date is in the past. Are you sure you want to continue?')) return;
    try {
      await api('/project-costs', { method: 'POST', token, body: { ...f, siteId: f.siteId ? Number(f.siteId) : undefined, amount: Number(f.amount) } });
      await modal.reload?.();
      close();
      notify('Project cost recorded.');
    } catch (e) { notify(e.message) }
  };
  return <Modal title="Add project cost" onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Save cost</FormButton>
  </>}>
    <Field label="Site">
      <select value={f.siteId} onChange={e => setF({ ...f, siteId: e.target.value })}>
        <option value="">Project-level cost</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
    </Field>
    <Field label="Category">
      <input value={f.category} onChange={e => setF({ ...f, category: e.target.value })} />
    </Field>
    <Field label="Description">
      <input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
    </Field>
    <Field label="Amount (PKR)">
      <input type="number" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} />
    </Field>
    <Field label="Cost date">
      <input type="date" value={f.costDate} onChange={e => { const v=e.target.value; if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setF({ ...f, costDate: v }); }} />
    </Field>
  </Modal>
}

function CompletionForm({ modal, close, token, notify }) {
  const p = modal.project || {};
  const [value, setValue] = useState(String(p.completion_percentage ?? p.completionPercentage ?? 0));
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const completionValue = Number(value);
    if (!p.id) { notify('Cannot update completion because the project record did not load. Close this window and reopen the project.'); return; }
    if (!Number.isFinite(completionValue) || completionValue < 0 || completionValue > 100) { notify('Completion must be a number from 0 to 100.'); return; }
    const startDate = String(p.start_date ?? p.startDate ?? '').slice(0, 10);
    const endDate = String(p.end_date ?? p.endDate ?? '').slice(0, 10);
    if (!startDate || !endDate || !p.client_id && !p.clientId || !p.name || !(Number(p.budget) > 0)) { notify('Project details are incomplete. Edit the project details first, then update completion.'); return; }
    setSaving(true);
    try {
      const nextStatus = (p.status === 'Completed' && completionValue < 100) ? 'Active' : ((completionValue === 100 && p.status === 'Active') ? 'Completed' : (p.status || 'Active'));
      const result = await api(`/projects/${p.id}`, { method: 'PUT', token, body: { name: p.name, clientId: Number(p.client_id ?? p.clientId), budget: Number(p.budget), startDate, endDate, status: nextStatus, completionPercentage: completionValue } });
      await modal.reload?.();
      close();
      notify(result?.message || 'Project completion updated successfully.');
    } catch (e) { notify(`Project completion was not saved: ${e.message}`); } finally { setSaving(false); }
  };
  return <Modal title="Update project completion" onClose={close} actions={<>
    <FormButton onClick={close}>Keep current</FormButton>
    <FormButton primary onClick={save}>{saving ? 'Saving…' : 'Save completion'}</FormButton>
  </>}>
    <Field label="Completion percentage">
      <input type="number" min="0" max="100" value={value} onChange={e => setValue(e.target.value)} />
    </Field>
    <div className="account-callout">
      <b>{p.name}</b>
      <span>Current completion: {pct(p.completion_percentage ?? p.completionPercentage)}%</span><span>Updating to: {pct(value)}%</span><small>Setting completion to 100% marks an Active project as Completed. Lowering a completed project below 100% reopens it as Active.</small>
    </div>
  </Modal>
}

function StockForm({ modal, close, token, notify, mode }) {
  const items = modal.items || [];
  const stock = modal.stock || [];
  const [f, setF] = useState({ itemId: '', quantity: '', reference: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const available = Number(stock.find(x => Number(x.warehouse_id) === Number(modal.warehouseId) && Number(x.item_id) === Number(f.itemId))?.quantity || 0);
  const endpoint = mode === 'receive' ? '/completion/inventory/receive' : `/completion/inventory/${mode}`;
  const save = async () => {
    if (!f.itemId || !Number.isFinite(Number(f.quantity)) || Number(f.quantity) <= 0) { notify('Select an item and enter a quantity greater than zero.'); return; }
    if (mode !== 'receive' && Number(f.quantity) > available) { notify(`Quantity exceeds available stock (${available}).`); return; }
    setSaving(true);
    try {
      await api(endpoint, { method: 'POST', token, body: { ...f, warehouseId: Number(modal.warehouseId), itemId: Number(f.itemId), quantity: Number(f.quantity) } });
      await modal.onSaved?.();
      close();
      notify(`${mode === 'receive' ? 'Stock received' : mode === 'damage' ? 'Damage recorded' : 'Waste recorded'} successfully.`)
    } catch (e) { notify(e.message) } finally { setSaving(false); }
  };
  return <Modal title={mode === 'receive' ? 'Receive stock' : mode === 'damage' ? 'Record damaged material' : 'Record waste'} onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>{saving ? 'Saving…' : 'Save movement'}</FormButton>
  </>}>
    <Field label="Item">
      <select value={f.itemId} onChange={e => setF({ ...f, itemId: e.target.value })}>
        <option value="">Select item</option>{items.map(i => <option key={i.id} value={i.id}>{i.name} • {i.unit || 'unit'}{mode !== 'receive' ? ` • available ${stock.find(x => Number(x.warehouse_id) === Number(modal.warehouseId) && Number(x.item_id) === Number(i.id))?.quantity || 0}` : ''}</option>)}</select>
    </Field>
    <Field label="Quantity">
      <input type="number" min="1" max={mode !== 'receive' ? available || undefined : undefined} value={f.quantity} onChange={e => setF({ ...f, quantity: e.target.value })} />
    </Field>
    <Field label="Reference">
      <input value={f.reference} onChange={e => setF({ ...f, reference: e.target.value })} />
    </Field>
    <Field label="Notes">
      <textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} />
    </Field>
  </Modal>
}

function AccountCallout() { return null }

function InvoiceForm({ modal, close, token, notify }) {
  const clients = useRows('/clients', token).rows;
  const projects = useRows('/projects', token).rows;
  const [f, setF] = useState({ clientId: modal.clientId || '', projectId: '', invoiceNumber: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`, description: '', amount: '', issueDate: today(), dueDate: '' });
  const save = async () => {
    if (!f.clientId || !f.invoiceNumber.trim() || !(Number(f.amount) > 0) || !f.issueDate) { notify('Complete client, invoice reference, positive amount, and issue date.'); return; }
    if (f.dueDate && f.dueDate < f.issueDate) { notify('Due date cannot be before the invoice issue date.'); return; }
    if (f.issueDate < today() && !window.confirm('The invoice issue date is in the past. Are you sure you want to continue?')) return;
    if (f.dueDate && f.dueDate < today() && !window.confirm('The invoice due date is in the past. Are you sure you want to continue?')) return;
    try {
      await api('/completion/invoices', { method: 'POST', token, body: { ...f, clientId: Number(f.clientId), projectId: f.projectId ? Number(f.projectId) : null, amount: Number(f.amount), dueDate: f.dueDate || null } });
      close();
      notify('Invoice created.');
      modal.onCreated?.()
    } catch (e) { notify(e.message) }
  };
  return <Modal title="Create client invoice" onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Create invoice</FormButton>
  </>}>
    <Field label="Client">
      <select value={f.clientId} onChange={e => setF({ ...f, clientId: e.target.value })}>
        <option value="">Select client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    </Field>
    <Field label="Project context">
      <select value={f.projectId} onChange={e => setF({ ...f, projectId: e.target.value, amount: '' })} disabled={!f.contractorId}>
        <option value="">No specific project</option>{projects.filter(p => !f.clientId || Number(p.client_id) === Number(f.clientId)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
    </Field>
    <Field label="Invoice reference">
      <input value={f.invoiceNumber} onChange={e => setF({ ...f, invoiceNumber: e.target.value })} />
    </Field>
    <Field label="Description">
      <input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
    </Field>
    <Field label="Amount (PKR)">
      <input type="number" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} />
    </Field>
    <Field label="Issue date">
      <input type="date" value={f.issueDate} onChange={e => { const v=e.target.value; if (v && v < today() && !window.confirm('This date is in the past. Are you sure you want to continue?')) return; setF({ ...f, issueDate: v }); }} />
    </Field>
    <Field label="Due date">
      <input type="date" value={f.dueDate} onChange={e => { const v=e.target.value; if (v && v < today() && !window.confirm('The due date is in the past. Are you sure you want to continue?')) return; setF({ ...f, dueDate: v }); }} />
    </Field>
  </Modal>
}

function RatingForm({ modal, close, token, notify }) {
  const projects = modal.projects || [];
  const [f, setF] = useState({ contractorId: modal.contractorId || '', projectId: '', rating: 5, comment: '' });
  const save = async () => {
    try {
      await api('/contractor-ratings', { method: 'POST', token, body: { ...f, contractorId: Number(f.contractorId), projectId: Number(f.projectId), rating: Number(f.rating) } });
      await modal.onSaved?.();
      close();
      notify('Contractor rating saved.')
    } catch (e) { notify(e.message) }
  };
  return <Modal title="Rate contractor" onClose={close} actions={<>
    <FormButton onClick={close}>Cancel</FormButton>
    <FormButton primary onClick={save}>Save rating</FormButton>
  </>}>
    <Field label="Project">
      <select value={f.projectId} onChange={e => setF({ ...f, projectId: e.target.value, amount: '' })} disabled={!f.contractorId}>
        <option value="">Select project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
    </Field>
    <Field label="Rating">
      <select value={f.rating} onChange={e => setF({ ...f, rating: e.target.value })}>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select>
    </Field>
    <Field label="Comment">
      <textarea value={f.comment} onChange={e => setF({ ...f, comment: e.target.value })} />
    </Field>
  </Modal>
}
