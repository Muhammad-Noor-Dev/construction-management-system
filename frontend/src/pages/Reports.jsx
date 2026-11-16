import { useEffect, useMemo, useState } from 'react';
import { api, nice } from '../lib/api';
import { hasPermission, roleLabel } from '../config/modules';

const tabs = [['projects', 'Project report', '/completion/reports/projects'], ['financial', 'Financial report', '/completion/reports/financial'], ['materials', 'Material report', '/completion/reports/materials'], ['payroll', 'Payroll report', '/completion/reports/payroll']];
function rowsOf(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return Object.entries(data).flatMap(([section, value]) => Array.isArray(value) ? value : [{ section, value }]);
  return [];
}
const excluded = new Set(['id', 'project_id', 'client_id', 'employee_id', 'site_id', 'contractor_id', 'period_id', 'user_id']);
function ReportVisuals({ records }) {
  const [view, setView] = useState('bar');
  const fields = records.length ? Object.keys(records[0]) : [];
  const labelKey = fields.find(k => !excluded.has(k) && records.some(r => typeof r?.[k] === 'string' && r[k].trim())) || fields[0];
  const numericKeys = fields.filter(k => !excluded.has(k) && records.some(r => r?.[k] !== null && r?.[k] !== '' && Number.isFinite(Number(r?.[k])) && typeof r?.[k] !== 'boolean'));
  const metric = numericKeys[0];
  const points = records.slice(0, 12).map((r, i) => ({ label: String(r?.[labelKey] ?? `Record ${i + 1}`), value: Number(r?.[metric]) || 0 })).filter(p => Number.isFinite(p.value));
  if (!metric || !points.length) return <div className="report-chart-empty">The report has no numeric fields suitable for a chart. The complete data table is shown below.</div>;
  const max = Math.max(1, ...points.map(p => Math.abs(p.value)));
  const total = points.reduce((s, p) => s + Math.max(0, p.value), 0);
  const coords = points.map((p, i) => `${points.length === 1 ? 50 : 30 + i * (540 / (points.length - 1))},${170 - (p.value / max) * 135}`).join(' ');
  return <section className="report-visual panel">
    <div className="report-visual-head"><div><span className="eyebrow">DATA VISUALIZATION</span><h3>{nice(metric)} by {nice(labelKey)}</h3><p className="muted">Showing up to 12 records. Choose the view that best helps compare the figures.</p></div>
      <div className="report-view-switch" role="group" aria-label="Chart type">
        {[['bar','Bar'],['line','Trend'],['share','Share']].map(([k, label]) => <button type="button" key={k} className={view === k ? 'active' : ''} onClick={() => setView(k)}>{label}</button>)}
      </div>
    </div>
    {view === 'bar' && <div className="report-graph-bars">{points.map((p,i) => <div className="report-graph-bar-row" key={`${p.label}-${i}`}><span title={p.label}>{p.label}</span><div className="report-graph-track"><i style={{width:`${Math.max(1, Math.abs(p.value) / max * 100)}%`}}/></div><b>{nice(p.value)}</b></div>)}</div>}
    {view === 'line' && <div className="report-line-wrap"><svg viewBox="0 0 600 205" role="img" aria-label={`Trend of ${metric} across report records`}><line x1="25" y1="170" x2="575" y2="170" stroke="currentColor" opacity=".2"/><polyline points={coords} fill="none" stroke="#d66b2d" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>{points.map((p,i)=>{const x=points.length===1?300:30+i*(540/(points.length-1));const y=170-(p.value/max)*135;return <g key={i}><circle cx={x} cy={y} r="5" fill="#d66b2d"/><text x={x} y="192" textAnchor="middle">{String(p.label).slice(0,10)}</text></g>})}</svg></div>}
    {view === 'share' && <div className="report-share-list">{points.map((p,i)=>{const share=total>0?Math.max(0,p.value)/total*100:0;return <div className="report-graph-bar-row" key={`${p.label}-${i}`}><span title={p.label}>{p.label}</span><div className="report-graph-track"><i style={{width:`${share}%`}}/></div><b>{share.toFixed(1)}%</b></div>})}{total<=0 && <p className="muted">Share view is not meaningful because the values do not have a positive total. Use Bar or Trend instead.</p>}</div>}
    <p className="report-chart-note">Metric: {nice(metric)} · {points.length} records visualized</p>
  </section>;
}
export default function Reports({ token, user }) {
  const [tab, setTab] = useState('projects'), [data, setData] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const allowed = useMemo(() => tabs.filter(([key]) => hasPermission(user, key === 'projects' ? 'projects' : key === 'financial' ? 'client-payments' : key === 'materials' ? 'stock' : 'payroll-periods', 'read')), [user]);
  useEffect(() => {
    let live = true;
    const path = allowed.find(x => x[0] === tab)?.[2] || allowed[0]?.[2];
    if (!path) return;
    setLoading(true); setError('');
    api(path, { token }).then(r => { if (live) setData(r?.data ?? r) }).catch(e => { if (live) setError(e.message) }).finally(() => live && setLoading(false));
    return () => { live = false };
  }, [tab, token, allowed]);
  if (!allowed.length) return <div className="page"><div className="access-denied"><h2>Access restricted</h2><p>Your {roleLabel(user)} role has no report access.</p></div></div>;
  const records = rowsOf(data);
  const columns = records.length ? Object.keys(records[0]).slice(0, 8) : [];
  return <div className="page">
    <div className="page-head"><div><span className="eyebrow">INSIGHTS</span><h2>Reports</h2><p className="muted">Explore your report data using different chart views, then review the detailed figures below.</p></div></div>
    <div className="tabs report-tabs">{allowed.map(([key, label]) => <button key={key} className={tab === key ? 'tab active' : 'tab'} onClick={() => setTab(key)}>{label}</button>)}</div>
    {error && <div className="error" role="alert">{error}</div>}
    {loading ? <div className="panel loading">Loading report…</div> : records.length ? <><ReportVisuals records={records}/><div className="panel table-panel"><div className="panel-head"><div><h3>Detailed report data</h3><p className="muted">Use this table to verify the exact values behind the charts.</p></div></div><div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c}>{nice(c.replaceAll('_', ' '))}</th>)}</tr></thead><tbody>{records.map((r, i) => <tr key={r.id || r.period_id || i}>{columns.map(c => <td key={c}>{nice(r[c])}</td>)}</tr>)}</tbody></table></div></div></> : <div className="panel empty">No report data returned.</div>}
  </div>;
}
export function ReportNavigation() { return null; }
export const reportTabs = tabs;
