export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export function unwrap(payload) { return payload?.data ?? payload ?? []; }
export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = null;
  try { data = await res.json() } catch { }
  if (res.status === 401) {
    if (token && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cms:session-expired'));
    throw new Error('Your session has expired. Please sign in again.');
  }
  if (!res.ok) {
    const details = Array.isArray(data?.errors) ? data.errors.map(item => `${item.field ? `${item.field}: ` : ''}${item.message}`).join(' • ') : '';
    throw new Error([data?.message || data?.error || `Request failed (${res.status})`, details && data?.message !== details ? details : ''].filter(Boolean).join(': '));
  }
  return data;
}
export function nice(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
