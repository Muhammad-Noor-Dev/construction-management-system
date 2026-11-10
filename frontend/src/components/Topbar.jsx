import { Bell, RefreshCw, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, unwrap } from '../lib/api';
export default function Topbar({ title, onRefresh, search, setSearch, token, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const low = unwrap(await api('/completion/inventory/low-stock', { token })) || [];
        const req = unwrap(await api('/material-issuance-requests', { token })) || [];
        const pending = req.filter(x => x.status === 'Pending');
        if (live) setAlerts([...low.map(x => ({ type: 'Low stock', text: `${x.name}: ${x.quantity} ${x.unit || ''} available`, key: `l${x.id}` })), ...pending.map(x => ({ type: 'Approval', text: `Material request awaiting approval`, key: `r${x.id}` }))]);
      } catch { }
    })();
    return () => { live = false }
  }, [token]);
  return <header className="topbar">
    <div>
      <div className="eyebrow">CMS WORKSPACE</div>
      <h1>{title}</h1>
    </div>
    <div className="top-actions">
      <div className="search">
        <Search size={17} />
        <input placeholder="Search records…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="notif-wrap">
        <button className="icon-btn" onClick={() => setOpen(!open)}>
          <Bell size={19} />{alerts.length > 0 && <i />}</button>{open && <div className="notif-panel">
            <div className="notif-head">
              <b>Notifications</b>
              <button className="icon-btn small" onClick={() => setOpen(false)}>
                <X size={15} />
              </button>
            </div>{alerts.length ? alerts.map(a => <button className="notif-row" key={a.key} onClick={() => {
              setOpen(false);
              onNavigate?.(a.type === 'Low stock' ? 'inventory' : 'inventory')
            }}>
              <b>{a.type}</b>
              <span>{a.text}</span>
            </button>) : <div className="notif-empty">No current alerts.</div>}</div>}</div>
      <button className="icon-btn" onClick={onRefresh}>
        <RefreshCw size={18} />
      </button>
    </div>
  </header>
}
