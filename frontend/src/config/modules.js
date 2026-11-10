import { Activity, ArrowUpRight, Boxes, Building2, CalendarDays, CircleDollarSign, ClipboardCheck, FileText, HardHat, LayoutDashboard, Package, Settings, ShieldCheck, Truck, UserRound, Users, WalletCards } from 'lucide-react';

export const modules = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'projects', label: 'Projects', icon: Building2, base: '/projects', fields: [['name', 'Project Name', 'text'], ['clientId', 'Client ID', 'number'], ['budget', 'Budget', 'number'], ['startDate', 'Start Date', 'date'], ['endDate', 'End Date', 'date'], ['status', 'Status', 'select', ['Active', 'On Hold', 'Completed', 'Delayed']], ['completionPercentage', 'Completion %', 'number']] },
  { key: 'clients', label: 'Clients', icon: Users, base: '/clients', fields: [['name', 'Client Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'text'], ['address', 'Address', 'textarea']] },
  { key: 'employees', label: 'Employees', icon: UserRound, base: '/employees', fields: [['fullName', 'Full Name', 'text'], ['cnic', 'CNIC', 'text'], ['phone', 'Phone', 'text'], ['email', 'Email', 'email'], ['address', 'Address', 'textarea'], ['jobTitle', 'Job Title', 'text'], ['paymentType', 'Payment Type', 'select', ['Monthly Salaried', 'Daily Rate']], ['monthlyGross', 'Monthly Gross', 'number'], ['dailyRate', 'Daily Rate', 'number'], ['hireDate', 'Hire Date', 'date']] },
  { key: 'contractors', label: 'Contractors', icon: HardHat, base: '/contractors', fields: [['name', 'Name', 'text'], ['specialization', 'Specialization', 'text'], ['phone', 'Phone', 'text'], ['email', 'Email', 'email'], ['address', 'Address', 'textarea']] },
  { key: 'sites', label: 'Sites', icon: Truck, base: '/sites', fields: [['projectId', 'Project ID', 'number'], ['name', 'Site Name', 'text'], ['location', 'Location', 'textarea']] },
  { key: 'attendance', label: 'Attendance', icon: CalendarDays, base: '/attendance', fields: [['employeeId', 'Employee ID', 'number'], ['siteId', 'Site ID', 'number'], ['attendanceDate', 'Date', 'date'], ['status', 'Status', 'select', ['Present', 'Absent']], ['recordedBy', 'Recorded By', 'number']] },
  { key: 'assignments', label: 'Site Assignments', icon: ClipboardCheck, base: '/employee-site-assignments', fields: [['employeeId', 'Employee ID', 'number'], ['siteId', 'Site ID', 'number'], ['startDate', 'Start Date', 'date'], ['endDate', 'End Date', 'date'], ['dailyRateOverride', 'Daily Rate Override', 'number']] },
  { key: 'warehouses', label: 'Warehouses', icon: Boxes, base: '/warehouses', fields: [['name', 'Warehouse Name', 'text'], ['location', 'Location', 'text']] },
  { key: 'categories', label: 'Inventory Categories', icon: Package, base: '/inventory-categories', fields: [['name', 'Category Name', 'text']] },
  { key: 'items', label: 'Inventory Items', icon: Package, base: '/inventory-items', fields: [['name', 'Item Name', 'text'], ['unit', 'Unit', 'text'], ['category_id', 'Category ID', 'number'], ['threshold', 'Low Stock Threshold', 'number'], ['unit_cost', 'Unit Cost', 'number']] },
  { key: 'stock', label: 'Warehouse Stock', icon: Boxes, base: '/warehouse-stock', fields: [['warehouse_id', 'Warehouse ID', 'number'], ['item_id', 'Item ID', 'number'], ['quantity', 'Quantity', 'number']] },
  { key: 'transactions', label: 'Inventory Transactions', icon: Activity, base: '/inventory-transactions', fields: [['warehouse_id', 'Warehouse ID', 'number'], ['item_id', 'Item ID', 'number'], ['transaction_type', 'Transaction Type', 'select', ['Stock In', 'Stock Out', 'Issuance', 'Dispatch', 'Damage', 'Waste', 'Transfer Out', 'Transfer In']], ['quantity', 'Quantity', 'number'], ['site_id', 'Site ID', 'number'], ['material_issuance_request_id', 'Issuance Request ID', 'number'], ['reference', 'Reference', 'text'], ['notes', 'Notes', 'textarea'], ['recorded_by', 'Recorded By', 'number']] },
  { key: 'issuances', label: 'Material Requests', icon: ArrowUpRight, base: '/material-issuance-requests', fields: [['site_id', 'Site ID', 'number'], ['warehouse_id', 'Warehouse ID', 'number']] },
  { key: 'issuance-items', label: 'Request Items', icon: ClipboardCheck, base: '/material-issuance-items', fields: [['request_id', 'Request ID', 'number'], ['item_id', 'Item ID', 'number'], ['quantity', 'Quantity', 'number']] },
  { key: 'site-materials', label: 'Site Materials', icon: Package, base: '/site-material-records', fields: [['site_id', 'Site ID', 'number'], ['item_id', 'Item ID', 'number'], ['received_quantity', 'Received Quantity', 'number'], ['estimated_consumption', 'Estimated Consumption', 'number'], ['actual_consumption', 'Actual Consumption', 'number'], ['waste_quantity', 'Waste Quantity', 'number']] },
  { key: 'project-contractors', label: 'Project Contractors', icon: HardHat, base: '/project-contractors', fields: [['projectId', 'Project ID', 'number'], ['siteId', 'Site ID', 'number'], ['contractorId', 'Contractor ID', 'number'], ['startDate', 'Start Date', 'date'], ['endDate', 'End Date', 'date'], ['payableAmount', 'Payable Amount', 'number'], ['notes', 'Notes', 'textarea']] },
  { key: 'project-costs', label: 'Project Costs', icon: CircleDollarSign, base: '/project-costs', projectScoped: true, fields: [['siteId', 'Site ID', 'number'], ['category', 'Category', 'text'], ['description', 'Description', 'text'], ['amount', 'Amount', 'number'], ['costDate', 'Cost Date', 'date']] },
  { key: 'client-payments', label: 'Client Payments', icon: WalletCards, base: '/client-payments', fields: [['clientId', 'Client ID', 'number'], ['projectId', 'Project ID', 'number'], ['invoiceReference', 'Invoice Reference', 'text'], ['amount', 'Amount', 'number'], ['paymentDate', 'Payment Date', 'date'], ['paymentMethod', 'Payment Method', 'text'], ['notes', 'Notes', 'textarea']] },
  { key: 'contractor-payments', label: 'Contractor Payments', icon: WalletCards, base: '/contractor-payments', fields: [['contractorId', 'Contractor ID', 'number'], ['projectId', 'Project ID', 'number'], ['amount', 'Amount', 'number'], ['paymentDate', 'Payment Date', 'date'], ['paymentMethod', 'Payment Method', 'text'], ['reference', 'Reference', 'text'], ['notes', 'Notes', 'textarea']] },
  { key: 'ratings', label: 'Contractor Ratings', icon: ShieldCheck, base: '/contractor-ratings', fields: [['contractorId', 'Contractor ID', 'number'], ['projectId', 'Project ID', 'number'], ['rating', 'Rating (1–5)', 'number'], ['comment', 'Comment', 'textarea']] },
  { key: 'payroll-periods', label: 'Payroll Periods', icon: CalendarDays, base: '/payroll-periods', fields: [['year', 'Year', 'number'], ['month', 'Month', 'number'], ['status', 'Status', 'select', ['Draft', 'Prepared', 'Under Review', 'Approved', 'Paid']], ['preparedBy', 'Prepared By', 'number'], ['approvedBy', 'Approved By', 'number'], ['rejectionReason', 'Rejection Reason', 'textarea']] },
  { key: 'payroll-records', label: 'Payroll Records', icon: WalletCards, base: '/payroll-records', fields: [['payrollPeriodId', 'Payroll Period ID', 'number'], ['employeeId', 'Employee ID', 'number'], ['workingDays', 'Working Days', 'number'], ['presentDays', 'Present Days', 'number'], ['absentDays', 'Absent Days', 'number'], ['grossSalary', 'Gross Salary', 'number'], ['totalDeductions', 'Total Deductions', 'number'], ['netPay', 'Net Pay', 'number']] },
  { key: 'payroll-deductions', label: 'Payroll Deductions', icon: CircleDollarSign, base: '/payroll-deductions', fields: [['payrollRecordId', 'Payroll Record ID', 'number'], ['description', 'Description', 'text'], ['amount', 'Amount', 'number']] },
  { key: 'payslips', label: 'Payslips', icon: FileText, base: '/payslips', noEdit: true, fields: [['payrollRecordId', 'Payroll Record ID', 'number']] },
  { key: 'users', label: 'Users', icon: ShieldCheck, base: '/users', fields: [['fullName', 'Full Name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password'], ['roleId', 'Role ID', 'number'], ['isActive', 'Active', 'checkbox']] },
  { key: 'settings', label: 'System Settings', icon: Settings, base: '/system-settings', fields: [['setting_key', 'Setting Key', 'text'], ['setting_value', 'Value', 'textarea'], ['description', 'Description', 'textarea']] },
  { key: 'audit', label: 'Audit Logs', icon: FileText, base: '/audit-logs', readOnly: true, fields: [] }
];

// Mirrors backend/src/middleware/rbacMatrix.js. The backend remains the
// security boundary; these rules keep the UI from advertising forbidden actions.
export const ROLE_PERMISSIONS = {
  Admin: { read: '*', write: '*' },
  Management: { read: ['projects','clients','contractors','project-contractors','ratings','client-payments','contractor-payments','employees','assignments','attendance','payroll-periods','payroll-records','payroll-deductions','payslips','warehouses','categories','items','stock','transactions','issuances','issuance-items','site-materials','sites','project-costs'], write: [] },
  Accounts: { read: ['clients','projects','contractors','client-payments','contractor-payments','employees','assignments','attendance','payroll-periods','payroll-records','payroll-deductions','payslips','categories','items','sites','project-costs'], write: ['clients','client-payments','contractor-payments','payroll-periods','payroll-records','payroll-deductions','payslips'] },
  'Project Manager': { read: ['projects','clients','contractors','project-contractors','ratings','employees','assignments','attendance','warehouses','categories','items','stock','transactions','issuances','issuance-items','site-materials','sites','project-costs'], write: ['projects','clients','contractors','project-contractors','ratings','assignments','sites','project-costs','site-materials'] },
  Supervisor: { read: ['projects','sites','attendance','assignments','issuances','issuance-items','warehouses','items','categories','stock'], write: ['attendance','issuances','issuance-items'] },
  'Store Manager': { read: ['warehouses','categories','items','stock','transactions','issuances','issuance-items','site-materials'], write: ['warehouses','categories','items','stock','transactions','issuances','site-materials'] },
  'Warehouse Worker': { read: ['warehouses','categories','items','stock','transactions','issuances','issuance-items'], write: [] }
};

// These endpoints are intentionally limited to operations actually registered
// in the current backend routes. Missing operations are not presented as buttons.
export const MODULE_ACTIONS = {
  projects: { create: true, edit: true }, clients: { create: true, edit: true, delete: true },
  employees: { create: true, edit: true, deactivate: true }, contractors: { create: true, edit: true, delete: true },
  sites: { create: true, edit: true, delete: true }, attendance: { create: true, edit: true, delete: true },
  assignments: { create: true, edit: true, delete: true }, warehouses: { create: true, edit: true, delete: true },
  categories: { create: true, edit: true, delete: true }, items: { create: true, edit: true, delete: true },
  stock: { create: true, edit: true, delete: true }, transactions: { create: true },
  issuances: { create: true }, 'issuance-items': { create: true, delete: true },
  'site-materials': { create: true, edit: true, delete: true }, 'project-contractors': { create: true, edit: true, delete: true },
  'project-costs': { create: true, edit: true, delete: true }, 'client-payments': { create: true, edit: true, delete: true },
  'contractor-payments': { create: true, edit: true, delete: true }, ratings: { create: true, edit: true, delete: true },
  'payroll-periods': { create: true, edit: true, delete: true }, 'payroll-records': { create: true, edit: true, delete: true },
  'payroll-deductions': { create: true, edit: true, delete: true }, payslips: { create: true, delete: true },
  users: { create: true, edit: true, deactivate: true }, settings: { create: true, edit: true, delete: true }, audit: {}
};

export const RELATION_FIELDS = {
  clientId: { endpoint: '/clients', label: r => r.name || r.client_name || `Client #${r.id}` },
  projectId: { endpoint: '/projects', label: r => r.name || `Project #${r.id}` },
  project_id: { endpoint: '/projects', label: r => r.name || `Project #${r.id}` },
  siteId: { endpoint: '/sites', label: r => `${r.name || `Site #${r.id}`}${r.project_name ? ` — ${r.project_name}` : ''}` },
  site_id: { endpoint: '/sites', label: r => `${r.name || `Site #${r.id}`}${r.project_name ? ` — ${r.project_name}` : ''}` },
  employeeId: { endpoint: '/employees', label: r => r.full_name || r.fullName || `Employee #${r.id}` },
  employee_id: { endpoint: '/employees', label: r => r.full_name || r.fullName || `Employee #${r.id}` },
  contractorId: { endpoint: '/contractors', label: r => r.name || `Contractor #${r.id}` },
  contractor_id: { endpoint: '/contractors', label: r => r.name || `Contractor #${r.id}` },
  warehouse_id: { endpoint: '/warehouses', label: r => r.name || `Warehouse #${r.id}` },
  item_id: { endpoint: '/inventory-items', label: r => r.name || `Item #${r.id}` },
  category_id: { endpoint: '/inventory-categories', label: r => r.name || `Category #${r.id}` },
  request_id: { endpoint: '/material-issuance-requests', label: r => `Request #${r.id}${r.status ? ` — ${r.status}` : ''}` },
  material_issuance_request_id: { endpoint: '/material-issuance-requests', label: r => `Request #${r.id}${r.status ? ` — ${r.status}` : ''}` },
  payrollPeriodId: { endpoint: '/payroll-periods', label: r => `${r.year || ''}-${String(r.month || '').padStart(2,'0')} (#${r.id})` },
  payrollRecordId: { endpoint: '/payroll-records', label: r => `Payroll record #${r.id}` },
  payroll_record_id: { endpoint: '/payroll-records', label: r => `Payroll record #${r.id}` }
};

export const ROLE_DESCRIPTIONS = {
  Admin: 'Full system administration', Management: 'Business and operational oversight', Accounts: 'Finance and payroll', 'Project Manager': 'Projects and site delivery', Supervisor: 'Site supervision and workforce', 'Store Manager': 'Inventory and warehouse control', 'Warehouse Worker': 'Warehouse operations'
};

export function hasPermission(user, key, action = 'read') {
  const rules = ROLE_PERMISSIONS[user?.role];
  if (!rules) return false;
  const value = rules[action];
  return value === '*' || Array.isArray(value) && value.includes(key);
}
export function visibleModules(user) { return modules.filter(m => m.key === 'dashboard' || hasPermission(user, m.key, 'read')); }
export function roleLabel(user) { return user?.role || 'User'; }
