import { Boxes, Building2, CircleDollarSign, FileBarChart2, HardHat, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Truck, UserRound, Users, WalletCards } from 'lucide-react';
import { hasPermission, roleLabel, ROLE_DESCRIPTIONS } from '../config/modules';
const roots = [
  ['Overview', [['dashboard', 'Dashboard', LayoutDashboard]]],
  ['Delivery', [['projects', 'Projects', Building2], ['clients', 'Clients', Users], ['contractors', 'Contractors', HardHat], ['workforce', 'Workforce', UserRound]]],
  ['Materials', [['inventory', 'Inventory', Boxes], ['warehouses', 'Warehouses', Truck]]],
  ['Finance', [['finance', 'Payments', CircleDollarSign], ['payroll', 'Payroll', WalletCards], ['reports', 'Reports', FileBarChart2]]],
  ['Administration', [['admin', 'Administration', Settings], ['audit', 'Audit logs', ShieldCheck]]]
];
const permissionMap = { audit: 'audit', projects: 'projects', clients: 'clients', contractors: 'contractors', workforce: 'employees', inventory: 'items', warehouses: 'warehouses', finance: 'client-payments', payroll: 'payroll-periods', reports: 'reports', admin: 'users' };
export default function Sidebar({ active, setActive, user, onLogout, collapsed, setCollapsed }) {
  return <aside className={collapsed ? 'sidebar collapsed' : 'sidebar'}>
    <div className="side-top">
      <div className="brand">
        <span className="brand-icon">
          <HardHat size={20} />
        </span>{!collapsed && <span>HR <b>BUILDERS</b>
        </span>}</div>
      <button className="icon-btn" onClick={() => setCollapsed(!collapsed)}>
        <Menu size={20} />
      </button>
    </div>{!collapsed && <div className="role-card">
      <div className="role-shield">
        <ShieldCheck size={17} />
      </div>
      <div>
        <strong>{roleLabel(user)}</strong>
        <span>{ROLE_DESCRIPTIONS[roleLabel(user)] || 'Authorized workspace'}</span>
      </div>
    </div>}<nav>{roots.map(([title, items]) => {
      const reportRoles = ['Admin', 'Management', 'Accounts', 'Project Manager'];
      const allowed = items.filter(([k]) => k === 'dashboard' || (k === 'reports' ? reportRoles.includes(user?.role) : hasPermission(user, permissionMap[k], 'read')));
      if (!allowed.length) return null;
      return <div className="nav-group" key={title}>{!collapsed && <div className="nav-title">{title}</div>}{allowed.map(([k, label, I]) => <button key={k} className={active === k ? 'nav-item active' : 'nav-item'} onClick={() => setActive(k)} title={label}>
        <I size={18} />{!collapsed && <span>{label}</span>}</button>)}</div>
    })}</nav>
    <div className="side-user">{!collapsed && <>
      <div className="avatar">{(user?.fullName || 'U').slice(0, 1)}</div>
      <div className="user-meta">
        <b>{user?.fullName || 'User'}</b>
        <span>{user?.email || ''}</span>
      </div>
    </>}<button className="icon-btn" onClick={onLogout} title="Sign out">
        <LogOut size={18} />
      </button>
    </div>
  </aside>
}
