import { useState } from 'react';
import { ArrowUpRight, HardHat } from 'lucide-react';
import { api, API, unwrap } from '../lib/api';
export default function Login({ onLogin, sessionExpired = false }) {
  const [form, setForm] = useState({ email: '', password: '' }), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api('/auth/login', { method: 'POST', body: form });
      const d = unwrap(r);
      localStorage.setItem('cms_token', d.token);
      localStorage.setItem('cms_user', JSON.stringify(d.user));
      onLogin(d.user, d.token)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <div className="login-page">
    <div className="login-art">
      <div className="brand-mark">
        <HardHat size={30} />
      </div>
      <div>
        <span className="eyebrow">HR BUILDERS</span>
        <h1>Construction<br />
          <em>Management</em> System</h1>
        <p>Projects, people, payroll and materials in one operational workspace.</p>
      </div>
      <div className="login-stats">
        <span>
          <b>24/7</b> visibility</span>
        <span>
          <b>RBAC</b> protected</span>
        <span>
          <b>Live</b> operations</span>
      </div>
    </div>
    <form className="login-card" onSubmit={submit}>
      <div className="mobile-brand">
        <HardHat /> HR BUILDERS</div>
      <p className="eyebrow">SECURE ACCESS</p>
      <h2>Welcome back</h2>
      <p className="muted">Sign in to your management console.</p>{sessionExpired && <div className="info-callout" role="status">Your session expired for security. Sign in again to continue where you left off.</div>}{error && <div className="error">{error}</div>}<label>Email<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" />
      </label>
      <label>Password<input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
      </label>
      <button className="primary wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowUpRight size={18} />
      </button>
      <small>API: {API}</small>
    </form>
  </div>;
}
