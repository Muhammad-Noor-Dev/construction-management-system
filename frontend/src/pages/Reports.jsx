import { useEffect, useMemo, useState } from 'react';
import { api, nice } from '../lib/api';
import { hasPermission, roleLabel } from '../config/modules';

const tabs = [['projects', 'Project report', '/completion/reports/projects'], ['financial', 'Financial report', '/completion/reports/financial'], ['materials', 'Material report', '/completion/reports/materials'], ['payroll', 'Payroll report', '/completion/reports/payroll']];
function rowsOf(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return Object.entries(data).flatMap(([section, value]) => Array.isArray(value) ? value : [{ section, value }]);
  return []
}
export default function Reports({ token, user }) {
  const [tab, setTab] = useState('projects'), [data, setData] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const allowed = useMemo(() => tabs.filter(([key]) => hasPermission(user, key === 'projects' ? 'projects' : key === 'financial' ? 'client-payments' : key === 'materials' ? 'stock' : 'payroll-periods', 'read')), [user]);
  useEffect(() => {
    let live = true;
    const path = allowed.find(x => x[0] === tab)?.[2] || allowed[0]?.[2];
    if (!path) return;
    setLoading(true);
    setError('');
    api(path, { token }).then(r => { if (live) setData(r?.data ?? r) }).catch(e => { if (live) setError(e.message) }).finally(() => live && setLoading(false));
    return () => { live = false }
  }, [tab, token, allowed]);
  if (!allowed.length) return <div className="page">
    <div className="access-denied">
      <h2>Access restricted</h2>
      <p>Your {roleLabel(user)} role has no report access.</p>
    </div>
  </div>;
  const records = rowsOf(data);
  const columns = records.length ? Object.keys(records[0]).slice(0, 8) : [];
  return <div className="page">
    <div className="page-head">
      <div>
        <span className="eyebrow">INSIGHTS</span>
        <h2>Reports</h2>
        <p className="muted">Authoritative summaries from the CMS backend.</p>
      </div>
    </div>
    <div className="tabs">{allowed.map(([key, label]) => <button key={key} className={tab === key ? 'tab active' : 'tab'} onClick={() => setTab(key)}>{label}</button>)}</div>{error && <div className="error">{error}</div>}<div className="panel table-panel">{loading ? <div className="loading">Loading report…</div> : records.length ? <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map(c => <th key={c}>{c.replaceAll('_', ' ')}</th>)}</tr>
        </thead>
        <tbody>{records.map((r, i) => <tr key={r.id || r.period_id || i}>{columns.map(c => <td key={c}>{nice(r[c])}</td>)}</tr>)}</tbody>
      </table>
    </div> : <div className="empty">No report data returned.</div>}</div>
  </div>
}

export function ReportNavigation() { return null }

export const reportTabs = tabs;
