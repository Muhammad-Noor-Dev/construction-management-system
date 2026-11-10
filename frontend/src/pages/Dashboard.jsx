import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Building2, CalendarDays, CheckCircle2, CircleDollarSign, ClipboardCheck, Package, RefreshCw, Users, WalletCards, AlertTriangle } from 'lucide-react';
import { api, unwrap } from '../lib/api';
import { hasPermission } from '../config/modules';
import StatCard from '../components/StatCard';

const toRows = x => Array.isArray(x) ? x : Array.isArray(x?.rows) ? x.rows : Array.isArray(x?.items) ? x.items : [];
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const roles = {
  Admin: { heading: 'Your control center', intro: 'Review approvals, system activity and business health.', actions: [['issuances','Review material requests',ClipboardCheck],['payroll','Review payroll',WalletCards],['audit','Open audit logs',CheckCircle2],['reports','View reports',CircleDollarSign]] },
  Management: { heading: 'Business overview', intro: 'Monitor project delivery, approvals and financial performance.', actions: [['projects','Review projects',Building2],['reports','View reports',CircleDollarSign],['issuances','Track material requests',ClipboardCheck]] },
  Accounts: { heading: 'Finance & payroll workspace', intro: 'Focus on receipts, contractor payments and monthly payroll.', actions: [['finance','Record / review payments',CircleDollarSign],['payroll','Process payroll',WalletCards],['reports','Financial reports',ArrowUpRight]] },
  'Project Manager': { heading: 'Project delivery', intro: 'Keep project progress, site activity and material requests moving.', actions: [['projects','Open projects',Building2],['attendance','Review attendance',CalendarDays],['issuances','Track material requests',ClipboardCheck]] },
  Supervisor: { heading: 'Site operations', intro: 'Record today’s attendance and submit site material requests.', actions: [['attendance','Mark today’s attendance',CalendarDays],['issuances','Material requests',ClipboardCheck],['sites','Open sites',Building2]] },
  'Store Manager': { heading: 'Warehouse operations', intro: 'Prioritize pending material approvals and stock levels.', actions: [['warehouses','Manage warehouses',Package],['issuances','Review material requests',ClipboardCheck],['inventory','Check inventory',Package]] },
  'Warehouse Worker': { heading: 'Warehouse tasks', intro: 'Review warehouse stock and recent material movements.', actions: [['warehouses','Open warehouses',Package],['inventory','Browse inventory',Package]] }
};
export default function Dashboard({ token, setActive, user }) {
  const [data, setData] = useState(null), [projects, setProjects] = useState([]), [requests, setRequests] = useState([]), [requestItems, setRequestItems] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [actionError, setActionError] = useState(''), [busyId, setBusyId] = useState(null);
  const canReadProjects = hasPermission(user, 'projects', 'read');
  const canReadRequests = hasPermission(user, 'issuances', 'read');
  const canApprove = user?.role === 'Admin' || user?.role === 'Store Manager';
  const canSeeStock = hasPermission(user, 'items', 'read') || hasPermission(user, 'stock', 'read');
  async function load() {
    setLoading(true); setError(''); setActionError('');
    const jobs = [api('/completion/dashboard', { token }).then(r => ['dashboard', unwrap(r)])];
    if (canReadProjects) jobs.push(api('/projects', { token }).then(r => ['projects', toRows(unwrap(r))]));
    if (canReadRequests) jobs.push(api('/material-issuance-requests', { token }).then(r => ['requests', toRows(unwrap(r))]));
    if (canApprove) jobs.push(api('/material-issuance-items', { token }).then(r => ['requestItems', toRows(unwrap(r))]));
    const settled = await Promise.allSettled(jobs);
    let failures = [];
    settled.forEach(result => { if (result.status === 'fulfilled') { const [k,v] = result.value; if (k === 'dashboard') setData(v); if (k === 'projects') setProjects(v); if (k === 'requests') setRequests(v); if (k === 'requestItems') setRequestItems(v); } else failures.push(result.reason?.message || 'A dashboard section could not load.'); });
    if (!settled.some(x => x.status === 'fulfilled' && x.value[0] === 'dashboard')) setError(failures[0] || 'Dashboard data is unavailable.');
    else if (failures.length) setError(`Some dashboard sections could not load: ${failures.join(' • ')}`);
    setLoading(false);
  }
  useEffect(() => { load(); }, [token, user?.role]);
  const obj = data && typeof data === 'object' ? data : {};
  const activeProjects = Number(obj.active_projects ?? 0);
  const lowStock = Array.isArray(obj.low_stock_alerts) ? obj.low_stock_alerts : [];
  const recent = Array.isArray(obj.recent_activity) ? obj.recent_activity : [];
  const pending = requests.filter(r => String(r.status || '').toLowerCase() === 'pending');
  const pendingCount = Math.max(pending.length, Number(obj.pending_approvals || 0));
  const roleView = roles[user?.role] || { heading: 'Your workspace', intro: 'Your dashboard shows tasks available to your role.', actions: [] };
  const permissionKey = { finance: 'client-payments', payroll: 'payroll-periods', inventory: 'items', warehouses: 'warehouses', reports: 'projects', sites: 'sites' };
  const quickActions = roleView.actions.filter(([key]) => key === 'dashboard' || (key === 'issuances' ? canReadRequests : hasPermission(user, key === 'attendance' ? 'attendance' : (permissionKey[key] || key), 'read')));
  async function review(req, action) {
    setBusyId(req.id); setActionError('');
    try {
      if (action === 'reject') { const reason = window.prompt('Enter a reason for rejecting this material request:'); if (!reason?.trim()) { setBusyId(null); return; } await api(`/completion/issuances/${req.id}/reject`, { method: 'POST', token, body: { rejectionReason: reason.trim() } }); }
      else await api(`/completion/issuances/${req.id}/approve`, { method: 'POST', token });
      await load();
    } catch (e) { setActionError(`Request #${req.id} was not ${action === 'approve' ? 'approved' : 'rejected'}: ${e.message}`); }
    finally { setBusyId(null); }
  }
  const projectRows = useMemo(() => projects.filter(p => String(p.status || '').toLowerCase() === 'active').slice(0,5), [projects]);
  return <div className="dashboard dashboard-v2">
    <section className="welcome welcome-v2"><div><span className="eyebrow">{user?.role || 'TEAM'} DASHBOARD</span><h2>{roleView.heading}</h2><p className="muted">{roleView.intro}</p><p className="dashboard-date">Today · {new Date().toLocaleDateString('en-PK', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh dashboard</button></section>
    {error && <div className="error" role="alert">{error} <button className="text-btn" onClick={load}>Try again</button></div>}
    {actionError && <div className="error" role="alert">{actionError}</div>}
    {canApprove && !loading && pendingCount > 0 && <section className="pending-material-banner"><div><b>{pendingCount} material request{pendingCount === 1 ? '' : 's'} awaiting approval</b><span>Review the requests before stock is issued or deducted.</span></div><button className="primary small-btn" onClick={() => setActive('issuances')}>Review requests <ArrowUpRight size={15}/></button></section>}
    <div className="stats-grid">{canReadProjects && <StatCard icon={Building2} label="Active projects" value={loading ? '—' : activeProjects} sub="Currently in progress"/>}<StatCard icon={ClipboardCheck} label="Pending requests" value={loading ? '—' : (canReadRequests ? pendingCount : '—')} sub={canApprove ? 'Awaiting your review' : 'Awaiting warehouse review'}/>{canSeeStock && <StatCard icon={Package} label="Low-stock items" value={loading ? '—' : lowStock.length} sub="Review replenishment needs"/>}{user?.role === 'Admin' && <StatCard icon={Users} label="Recent activities" value={loading ? '—' : recent.length} sub="Latest recorded events"/>}</div>
    <div className="dashboard-grid dashboard-grid-v2">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">NEXT STEPS</span><h3>Quick actions</h3></div></div><div className="quick-grid quick-grid-v2">{quickActions.map(([key,label,Icon]) => <button key={key} onClick={() => setActive(key)}><Icon size={19}/><span>{label}</span><ArrowUpRight size={15}/></button>)}</div></section>
      {canSeeStock && <section className="panel"><div className="panel-head"><div><span className="eyebrow">ATTENTION NEEDED</span><h3>Low stock alerts</h3></div>{hasPermission(user,'items','read') && <button className="text-btn" onClick={() => setActive('inventory')}>Inventory <ArrowUpRight size={14}/></button>}</div>{loading ? <div className="loading">Checking stock…</div> : lowStock.length ? <div className="dashboard-alert-list">{lowStock.slice(0,5).map((x,i)=><div className="dashboard-alert" key={x.id || i}><AlertTriangle size={17}/><div><b>{x.name || 'Inventory item'}</b><span>{Number(x.quantity ?? x.stock ?? 0)} {x.unit || 'units'} left · threshold {x.threshold ?? '—'}</span></div></div>)}</div> : <div className="dashboard-empty"><CheckCircle2 size={20}/><span>No low-stock alerts right now.</span></div>}</section>}
    </div>
    {canApprove && <section className="panel dashboard-approvals"><div className="panel-head"><div><span className="eyebrow">WAREHOUSE CONTROL</span><h3>Material requests awaiting approval</h3><p className="muted">Stock is not deducted or assigned to a site until you approve a request.</p></div><span className="count-pill">{pendingCount} pending</span></div>{loading ? <div className="loading">Loading requests…</div> : pending.length ? <div className="approval-list">{pending.slice(0,8).map(r=><div className="approval-row" key={r.id}><div className="approval-symbol"><Package size={19}/></div><div className="approval-main"><b>Request #{r.id} · {r.site_name || `Site #${r.site_id}`}</b><span>Warehouse: {r.warehouse_name || `Warehouse #${r.warehouse_id}`} · Requested by {r.requester_name || 'staff'} · {String(r.requested_at || r.created_at || '').slice(0,10) || 'date unavailable'}</span><small>{requestItems.filter(it=>Number(it.request_id)===Number(r.id)).map(it=>`${it.item_name}: ${it.quantity} ${it.item_unit || 'units'}`).join(' · ') || 'No item lines found — do not approve until the requester fixes this request.'}</small></div><div className="action-row"><button className="secondary small-btn" disabled={busyId === r.id} onClick={() => review(r,'reject')}>Reject</button><button className="primary small-btn" disabled={busyId === r.id || !requestItems.some(it=>Number(it.request_id)===Number(r.id))} onClick={() => review(r,'approve')}>{busyId === r.id ? 'Processing…' : 'Approve & issue'}</button></div></div>)}</div> : <div className="dashboard-empty"><CheckCircle2 size={20}/><span>No material requests are waiting for approval.</span></div>}</section>}
    {canReadProjects && <section className="panel"><div className="panel-head"><div><span className="eyebrow">PROJECT PORTFOLIO</span><h3>Active projects</h3></div><button className="text-btn" onClick={() => setActive('projects')}>All projects <ArrowUpRight size={14}/></button></div>{loading ? <div className="loading">Loading projects…</div> : projectRows.length ? <div className="project-list">{projectRows.map((p,i)=><button className="project-row project-row-button" key={p.id || i} onClick={() => setActive('projects',[p.id])}><div className="project-avatar">{(p.name || 'P').slice(0,1)}</div><div className="project-main"><b>{p.name || `Project #${p.id}`}</b><span>{p.status || 'Active'}</span></div><div className="progress"><div><span style={{width:`${Math.max(0,Math.min(100,Number(p.completion_percentage ?? p.completionPercentage ?? 0)))}%`}}/></div><b>{Number(p.completion_percentage ?? p.completionPercentage ?? 0)}%</b></div><ArrowUpRight size={15}/></button>)}</div> : <div className="dashboard-empty">No active projects to show.</div>}</section>}
    {hasPermission(user,'attendance','write') && <section className="panel dashboard-attendance"><div><span className="eyebrow">WORKFORCE</span><h3>Have you recorded today’s attendance?</h3><p className="muted">Open attendance and use today’s date to mark staff present or absent.</p></div><button className="primary" onClick={() => setActive('attendance')}>Mark today’s attendance <CalendarDays size={16}/></button></section>}
    {user?.role === 'Admin' && <section className="panel"><div className="panel-head"><div><span className="eyebrow">SYSTEM ACTIVITY</span><h3>Recent audit activity</h3></div><button className="text-btn" onClick={() => setActive('audit')}>Open audit logs <ArrowUpRight size={14}/></button></div>{recent.length ? <div className="activity-list">{recent.slice(0,5).map((x,i)=><div className="activity-row" key={x.id || i}><span>{x.action || 'Activity'}</span><b>{x.table_name || 'System'}</b><time>{String(x.created_at || '').replace('T',' ').slice(0,16) || '—'}</time></div>)}</div> : <div className="dashboard-empty">No recent activity returned.</div>}</section>}
  </div>;
}
