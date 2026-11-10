const MATRIX = [
  { p:/^\/projects(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager','Supervisor'], write:['Admin','Project Manager'] },
  { p:/^\/clients(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager'], write:['Admin','Accounts','Project Manager'] },
  { p:/^\/contractors(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager'], write:['Admin','Project Manager'] },
  { p:/^\/project-contractors(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager'], write:['Admin','Project Manager'] },
  { p:/^\/contractor-ratings(?:\/|$)/, read:['Admin','Management','Project Manager'], write:['Admin','Project Manager'] },
  { p:/^\/client-payments(?:\/|$)/, read:['Admin','Management','Accounts'], write:['Admin','Accounts'] },
  { p:/^\/contractor-payments(?:\/|$)/, read:['Admin','Management','Accounts'], write:['Admin','Accounts'] },
  { p:/^\/employees(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager'], write:['Admin'] },
  { p:/^\/employee-site-assignments(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager','Supervisor'], write:['Admin','Project Manager'] },
  { p:/^\/attendance(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager','Supervisor'], write:['Admin','Supervisor'] },
  { p:/^\/payroll-periods(?:\/|$)/, read:['Admin','Management','Accounts'], write:['Admin','Accounts'] },
  { p:/^\/payroll-records(?:\/|$)/, read:['Admin','Management','Accounts'], write:['Admin','Accounts'] },
  { p:/^\/payroll-deductions(?:\/|$)/, read:['Admin','Management','Accounts'], write:['Admin','Accounts'] },
  { p:/^\/payslips(?:\/|$)/, read:['Admin','Management','Accounts'], write:['Admin','Accounts'] },
  { p:/^\/warehouses(?:\/|$)/, read:['Admin','Management','Supervisor','Store Manager','Warehouse Worker'], write:['Admin','Store Manager'] },
  { p:/^\/inventory-categories(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager','Supervisor','Store Manager','Warehouse Worker'], write:['Admin','Store Manager'] },
  { p:/^\/inventory-items(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager','Supervisor','Store Manager','Warehouse Worker'], write:['Admin','Store Manager'] },
  { p:/^\/warehouse-stock(?:\/|$)/, read:['Admin','Management','Project Manager','Supervisor','Store Manager','Warehouse Worker'], write:['Admin','Store Manager'] },
  { p:/^\/inventory-transactions(?:\/|$)/, read:['Admin','Management','Project Manager','Store Manager','Warehouse Worker'], write:['Admin','Store Manager'] },
  { p:/^\/material-issuance-requests(?:\/|$)/, read:['Admin','Management','Project Manager','Supervisor','Store Manager'], write:['Admin','Supervisor','Store Manager'] },
  { p:/^\/material-issuance-items(?:\/|$)/, read:['Admin','Management','Project Manager','Supervisor','Store Manager'], write:['Admin','Supervisor'] },
  { p:/^\/site-material-records(?:\/|$)/, read:['Admin','Management','Project Manager','Store Manager'], write:['Admin','Project Manager','Store Manager'] },
  { p:/^\/system-settings(?:\/|$)/, read:['Admin'], write:['Admin'] },
  { p:/^\/audit-logs(?:\/|$)/, read:['Admin'], write:['Admin'] },
  { p:/^\/sites(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager','Supervisor'], write:['Admin','Project Manager'] },
  { p:/^\/project-costs(?:\/|$)/, read:['Admin','Management','Accounts','Project Manager'], write:['Admin','Project Manager'] },
  { p:/^\/users(?:\/|$)/, read:['Admin'], write:['Admin'] }
];

module.exports=(req,res,next)=>{
  const match=MATRIX.find(x=>x.p.test(req.path));
  if(!match) return next();
  const read=req.method==='GET';
  const allowed=(read?match.read:match.write);
  if(allowed.includes(req.user.role)) return next();
  return res.status(403).json({success:false,message:'Access denied'});
};
