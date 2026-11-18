import { useEffect, useMemo, useState } from 'react';
import { api, nice } from '../lib/api';
import { hasPermission, roleLabel } from '../config/modules';

const tabs = [
  ['projects', 'Project report', '/completion/reports/projects'],
  ['financial', 'Financial report', '/completion/reports/financial'],
  ['materials', 'Material report', '/completion/reports/materials'],
  ['payroll', 'Payroll report', '/completion/reports/payroll']
];

const viewOptions = [
  { key: 'bar', label: 'Bar chart' },
  { key: 'line', label: 'Line chart' },
  { key: 'pie', label: 'Pie chart' },
  { key: 'table', label: 'Data table' }
];

const ignoredKeys = /(^id$|_id$|password|token|created_at|updated_at|deleted_at)/i;
const categoryKeys = ['status', 'category', 'type', 'role', 'month', 'period', 'stage', 'name', 'project_name', 'item_name'];

function rowsOf(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const entries = Object.entries(data);
  const arrayGroups = entries.filter(([, value]) => Array.isArray(value));
  if (arrayGroups.length) {
    return arrayGroups.flatMap(([section, value]) => value.map(row =>
      row && typeof row === 'object' && !Array.isArray(row) ? { report_section: section, ...row } : { report_section: section, value: row }
    ));
  }
  return entries.map(([section, value]) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? { report_section: section, ...value }
      : { report_section: section, value }
  );
}

function numericValue(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !value.trim()) return null;
  const cleaned = value.replace(/,/g, '').replace(/[^\d.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.') return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function humanize(value) {
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function labelFor(row, index, preferredKey) {
  const preferred = [preferredKey, ...categoryKeys, 'employee_name', 'client_name', 'site_name', 'title', 'date']
    .filter(Boolean);
  const key = preferred.find(k => row?.[k] !== undefined && row[k] !== null &&
    typeof row[k] !== 'object' && String(row[k]).trim());
  if (key) return String(row[key]);
  const fallback = Object.entries(row || {}).find(([k, v]) =>
    !ignoredKeys.test(k) && k !== 'report_section' && v !== null && typeof v !== 'object'
  );
  return fallback ? String(fallback[1]) : `Record ${index + 1}`;
}

function metricOptions(records) {
  if (!records.length) return [];
  const keys = [...new Set(records.flatMap(row => Object.keys(row || {})))];
  return keys.filter(key => !ignoredKeys.test(key) &&
    records.some(row => numericValue(row?.[key]) !== null)
  ).map(key => ({ key, label: humanize(key) }));
}

function categoryOptions(records) {
  if (!records.length) return [];
  const keys = [...new Set(records.flatMap(row => Object.keys(row || {})))];
  const preferred = categoryKeys.find(key => keys.includes(key) &&
    records.some(row => row?.[key] !== null && row?.[key] !== undefined && typeof row[key] !== 'object'));
  return preferred ? [{ key: preferred, label: humanize(preferred) }] : [];
}

function buildChartRows(records, metric, categoryKey) {
  if (metric === '__record_count__') {
    const counts = new Map();
    records.forEach((row, index) => {
      const label = labelFor(row, index, categoryKey);
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return [...counts.entries()].map(([label, value]) => ({ label, value }));
  }
  return records.map((row, index) => ({
    label: labelFor(row, index, categoryKey),
    value: numericValue(row?.[metric]) ?? 0
  }));
}

function ChartControls({ view, setView, metrics, metric, setMetric, pieAllowed, hasData }) {
  return <div className="report-chart-toolbar">
    <div className="report-view-buttons" role="group" aria-label="Choose chart or table type">
      {viewOptions.map(option => {
        const disabled = option.key !== 'table' && !hasData;
        return <button
          key={option.key}
          type="button"
          className={`report-view-btn${view === option.key ? ' active' : ''}`}
          aria-pressed={view === option.key}
          disabled={disabled}
          title={disabled ? 'No report records are available to display.' :
            option.key === 'pie' && !pieAllowed ? 'Pie chart is unavailable because this report has negative or zero-only values.' : ''}
          onClick={() => setView(option.key)}
        >{option.label}</button>;
      })}
    </div>
    {metrics.length > 1 && <label className="report-metric-control">
      <span>Measure</span>
      <select value={metric} onChange={e => setMetric(e.target.value)}>
        {metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
      </select>
    </label>}
  </div>;
}

function ReportTable({ records, columns }) {
  return <div className="table-wrap report-table-wrap">
    <table>
      <thead><tr>{columns.map(c => <th key={c}>{humanize(c)}</th>)}</tr></thead>
      <tbody>{records.map((row, i) => <tr key={row.id || row.period_id || `${i}`}>
        {columns.map(c => <td key={c}>{nice(row[c])}</td>)}
      </tr>)}</tbody>
    </table>
  </div>;
}

function BarChart({ rows }) {
  const max = Math.max(1, ...rows.map(x => Math.abs(x.value)));
  return <div className="report-bars" role="img" aria-label="Bar chart of report values">
    {rows.map((item, i) => <div className="report-bar-row" key={`${item.label}-${i}`}>
      <span className="report-bar-label" title={item.label}>{item.label}</span>
      <div className="report-bar-track"><span className="report-bar-fill" style={{ width: `${Math.max(1, Math.abs(item.value) / max * 100)}%` }} /></div>
      <b className="report-bar-value">{nice(item.value)}</b>
    </div>)}
  </div>;
}

function LineChart({ rows }) {
  const width = 760, height = 290, padX = 42, padY = 28;
  const min = Math.min(0, ...rows.map(x => x.value));
  const max = Math.max(1, ...rows.map(x => x.value));
  const range = max - min || 1;
  const points = rows.map((item, i) => ({
    ...item,
    x: rows.length === 1 ? width / 2 : padX + i * (width - padX * 2) / (rows.length - 1),
    y: height - padY - ((item.value - min) / range) * (height - padY * 2)
  }));
  const line = points.map(p => `${p.x},${p.y}`).join(' ');
  return <div className="report-line-wrap">
    <svg className="report-line-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart of report values" preserveAspectRatio="none">
      {[0, 1, 2, 3, 4].map(i => {
        const y = padY + i * (height - padY * 2) / 4;
        return <line key={i} x1={padX} x2={width - padX} y1={y} y2={y} className="report-chart-gridline" />;
      })}
      {points.length > 1 && <polyline points={line} className="report-line-path" />}
      {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="5" className="report-line-point">
        <title>{`${p.label}: ${nice(p.value)}`}</title>
      </circle>)}
    </svg>
    <div className="report-line-labels">{points.map((p, i) => <span key={i} title={p.label}>{p.label}</span>)}</div>
    <div className="report-line-values">{points.map((p, i) => <span key={i}>{nice(p.value)}</span>)}</div>
  </div>;
}

function PieChart({ rows }) {
  const positive = rows.filter(x => x.value > 0);
  const total = positive.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const segments = positive.map((item, i) => {
    const start = cursor;
    cursor += item.value / total * 100;
    return `var(--report-pie-${(i % 8) + 1}) ${start}% ${cursor}%`;
  });
  return <div className="report-pie-layout">
    <div className="report-pie" style={{ background: `conic-gradient(${segments.join(', ')})` }} role="img" aria-label="Pie chart of report values">
      <div className="report-pie-hole"><b>{nice(total)}</b><span>Total</span></div>
    </div>
    <div className="report-pie-legend">
      {positive.map((item, i) => <div className="report-pie-legend-item" key={`${item.label}-${i}`}>
        <span className={`report-pie-swatch report-pie-swatch-${(i % 8) + 1}`} />
        <span className="report-pie-legend-label" title={item.label}>{item.label}</span>
        <b>{nice(item.value)}</b><small>{(item.value / total * 100).toFixed(1)}%</small>
      </div>)}
    </div>
  </div>;
}

export default function Reports({ token, user }) {
  const [tab, setTab] = useState('projects');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [views, setViews] = useState({});
  const [metricsByTab, setMetricsByTab] = useState({});

  const allowed = useMemo(() => tabs.filter(([key]) =>
    hasPermission(user, key === 'projects' ? 'projects' : key === 'financial' ? 'client-payments' : key === 'materials' ? 'stock' : 'payroll-periods', 'read')
  ), [user]);

  useEffect(() => {
    let live = true;
    const path = allowed.find(x => x[0] === tab)?.[2] || allowed[0]?.[2];
    if (!path) { setLoading(false); return undefined; }
    setLoading(true);
    setError('');
    setData(null);
    api(path, { token })
      .then(r => { if (live) setData(r?.data ?? r); })
      .catch(e => { if (live) setError(e.message || 'Unable to load this report.'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [tab, token, allowed]);

  if (!allowed.length) return <div className="page"><div className="access-denied">
    <h2>Access restricted</h2><p>Your {roleLabel(user)} role has no report access.</p>
  </div></div>;

  const records = rowsOf(data);
  const columns = records.length ? [...new Set(records.flatMap(row => Object.keys(row || {})))].filter(k => k !== 'report_section').slice(0, 12) : [];
  const numericMetrics = metricOptions(records);
  const categories = categoryOptions(records);
  const chartMetrics = numericMetrics.length ? numericMetrics : [{ key: '__record_count__', label: 'Record count' }];
  const metric = metricsByTab[tab] && chartMetrics.some(m => m.key === metricsByTab[tab])
    ? metricsByTab[tab] : chartMetrics[0].key;
  const requestedView = views[tab] || 'bar';
  const chartRows = buildChartRows(records, metric, categories[0]?.key);
  const chartRecords = chartRows.slice(0, 30);
  const pieAllowed = chartRecords.some(x => x.value > 0) && chartRecords.every(x => x.value >= 0);
  const view = requestedView === 'pie' && !pieAllowed ? 'bar' : requestedView;

  return <div className="page reports-page">
    <div className="page-head"><div>
      <span className="eyebrow">INSIGHTS</span><h2>Reports</h2>
      <p className="muted">Choose how you want to view each report. Your selection is kept separately for each section.</p>
    </div></div>
    <div className="tabs report-tabs" role="tablist" aria-label="Report sections">
      {allowed.map(([key, label]) => <button key={key} type="button" role="tab"
        aria-selected={tab === key} className={tab === key ? 'tab active' : 'tab'}
        onClick={() => setTab(key)}>{label}</button>)}
    </div>
    {error && <div className="error" role="alert">{error}</div>}
    <section className="panel table-panel report-panel">
      <div className="report-content-heading">
        <div><span className="eyebrow">CURRENT REPORT</span>
          <h3>{allowed.find(x => x[0] === tab)?.[1] || 'Report'}</h3>
          {!loading && !error && <p className="muted">{records.length} record{records.length === 1 ? '' : 's'} returned</p>}
        </div>
        <ChartControls
          view={view}
          setView={next => setViews(old => ({ ...old, [tab]: next }))}
          metrics={chartMetrics}
          metric={metric}
          setMetric={next => setMetricsByTab(old => ({ ...old, [tab]: next }))}
          pieAllowed={pieAllowed}
          hasData={!loading && !error && records.length > 0}
        />
      </div>
      {loading ? <div className="loading">Loading report…</div> :
        error ? <div className="empty">The report could not be loaded. Please try again later.</div> :
        !records.length ? <div className="empty">No report data returned. The chart options will become available when this report contains records.</div> :
        <div className="report-chart-area">
          {view === 'table' ? <ReportTable records={records} columns={columns} /> :
            view === 'line' ? <LineChart rows={chartRecords} /> :
            view === 'pie' ? <PieChart rows={chartRecords} /> :
            <BarChart rows={chartRecords} />}
          {view !== 'table' && <p className="report-chart-note">
            {numericMetrics.length ? 'Chart uses the selected numeric measure.' : 'Chart shows the number of records in each category.'}
            {' '}Showing up to {chartRecords.length} of {records.length} records. Choose Data table to see every record.
          </p>}
        </div>}
    </section>
  </div>;
}

export function ReportNavigation() { return null; }
export const reportTabs = tabs;
