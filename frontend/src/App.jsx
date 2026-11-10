import { useEffect, useMemo, useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import BusinessWorkspace from './pages/BusinessWorkspace';
import React from 'react';

class WorkspaceErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error('CMS workspace render error:', error); }
  render() {
    if (this.state.error) return <div className="page"><div className="error-boundary"><h2>This workspace could not be displayed</h2><p>The page hit an unexpected error instead of going blank. Return to the section and try again. If it repeats, share this message with the developer.</p><details><summary>Technical details</summary><pre>{String(this.state.error?.message || this.state.error)}</pre></details><button className="primary" onClick={() => this.setState({ error: null })}>Try again</button></div></div>;
    return this.props.children;
  }
}

function readHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  const root = parts[0] || 'dashboard';
  const tail = parts.slice(1);
  // Typed route segments preserve the exact nested detail page across refreshes.
  if (tail.length >= 2 && tail.length % 2 === 0) {
    const stack = [];
    let valid = true;
    for (let i = 0; i < tail.length; i += 2) {
      const id = Number(tail[i + 1]);
      if (!/^[a-z-]+$/i.test(tail[i]) || !Number.isInteger(id) || id <= 0) { valid = false; break; }
      stack.push({ type: tail[i], id });
    }
    if (valid) return { root, ids: stack.map(x => x.id), stack };
  }
  return { root, ids: tail.map(Number).filter(Boolean), stack: null };
}
export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('cms_user')) } catch { return null } });
  const [token, setToken] = useState(() => localStorage.getItem('cms_token'));
  const [route, setRoute] = useState(readHash());
  const [collapsed, setCollapsed] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [search, setSearch] = useState('');
  useEffect(() => {
    const fn = () => setRoute(readHash());
    const expired = () => {
      localStorage.removeItem('cms_token'); localStorage.removeItem('cms_user');
      setToken(null); setUser(null); setSessionExpired(true);
    };
    window.addEventListener('hashchange', fn);
    window.addEventListener('cms:session-expired', expired);
    return () => { window.removeEventListener('hashchange', fn); window.removeEventListener('cms:session-expired', expired); };
  }, []);
  function go(root, segments = []) {
    const typed = segments.length > 0 && typeof segments[0] === 'object';
    const suffix = typed ? segments.map(x => `${x.type}/${x.id}`).join('/') : segments.join('/');
    const hash = '#/' + root + (suffix ? `/${suffix}` : '');
    if (window.location.hash !== hash) window.location.hash = hash; else setRoute(readHash());
    setSearch('')
  }
  function login(u, t) {
    setSessionExpired(false);
    localStorage.setItem('cms_token', t);
    localStorage.setItem('cms_user', JSON.stringify(u));
    setUser(u);
    setToken(t);
    go('dashboard')
  }
  function logout() {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    setUser(null);
    setToken(null);
    window.location.hash = ''
  }
  if (!token || !user) return <Login onLogin={login} sessionExpired={sessionExpired} />;
  const active = route.root;
  const title = { dashboard: 'Dashboard', attendance: 'Attendance', issuances: 'Material Requests', projects: 'Projects', clients: 'Clients', contractors: 'Contractors', workforce: 'Workforce', inventory: 'Inventory', warehouses: 'Warehouses', finance: 'Payments', payroll: 'Payroll', reports: 'Reports', admin: 'Administration', audit: 'Audit logs' }[active] || 'CMS Workspace';
  return <div className="app">
    <Sidebar active={active} setActive={k => go(k)} user={user} onLogout={logout} collapsed={collapsed} setCollapsed={setCollapsed} />
    <main className="main">
      <Topbar title={title} token={token} onRefresh={() => window.location.reload()} search={search} setSearch={setSearch} onNavigate={k => go(k)} />{active === 'dashboard' ? <Dashboard token={token} user={user} setActive={go} /> : <WorkspaceErrorBoundary key={active}><BusinessWorkspace root={active} routeIds={route.ids} routeStack={route.stack} token={token} user={user} search={search} onNavigate={go} /></WorkspaceErrorBoundary>}<footer>HR Builders CMS • Connected to <b>{import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</b>
      </footer>
    </main>
  </div>
}
