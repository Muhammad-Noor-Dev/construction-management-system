const pool = require("../config/database");

const n = (v) => Number(v || 0);
const cents = (v) => Math.round((Number(v || 0) + Number.EPSILON) * 100) / 100;

async function clientStatement(clientId) {
  const r = await pool.query(`
    SELECT c.id,c.name,c.email,c.phone,
      COALESCE((SELECT SUM(amount) FROM client_invoices i WHERE i.client_id=c.id AND i.status <> 'Cancelled'),0) total_invoiced,
      COALESCE((SELECT SUM(amount) FROM client_payments p WHERE p.client_id=c.id),0) total_received
    FROM clients c WHERE c.id=$1`, [clientId]);
  if (!r.rows[0]) throw new Error("Client not found");
  const x=r.rows[0]; x.outstanding=cents(n(x.total_invoiced)-n(x.total_received));
  x.invoices=(await pool.query(`SELECT i.*, COALESCE((SELECT SUM(p.amount) FROM client_payments p WHERE p.client_id=i.client_id AND p.invoice_reference=i.invoice_number),0) paid FROM client_invoices i WHERE i.client_id=$1 ORDER BY i.id DESC`,[clientId])).rows;
  return x;
}

async function contractorStatement(contractorId) {
  const r=await pool.query(`
    SELECT c.id,c.name,c.specialization,c.phone,c.email,
      COALESCE((SELECT SUM(payable_amount) FROM project_contractors pc WHERE pc.contractor_id=c.id),0) total_payable,
      COALESCE((SELECT SUM(amount) FROM contractor_payments p WHERE p.contractor_id=c.id),0) total_paid
    FROM contractors c WHERE c.id=$1`,[contractorId]);
  if(!r.rows[0]) throw new Error("Contractor not found");
  const x=r.rows[0]; x.outstanding=cents(n(x.total_payable)-n(x.total_paid));
  x.assignments=(await pool.query(`SELECT pc.*,p.name project_name,s.name site_name FROM project_contractors pc JOIN projects p ON p.id=pc.project_id JOIN sites s ON s.id=pc.site_id WHERE pc.contractor_id=$1 ORDER BY pc.id DESC`,[contractorId])).rows;
  return x;
}

async function createInvoice(data,userId){
  const r=await pool.query(`INSERT INTO client_invoices(client_id,project_id,invoice_number,description,amount,issue_date,due_date,created_by) VALUES($1,$2,$3,$4,$5,COALESCE($6,CURRENT_DATE),$7,$8) RETURNING *`,[data.clientId,data.projectId||null,data.invoiceNumber,data.description||null,data.amount,data.issueDate||null,data.dueDate||null,userId]);
  return r.rows[0];
}

async function recordClientPayment(data,userId){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const inv=await client.query(`SELECT i.*, COALESCE((SELECT SUM(amount) FROM client_payments WHERE client_id=i.client_id AND invoice_reference=i.invoice_number),0) paid FROM client_invoices i WHERE i.invoice_number=$1 FOR UPDATE`,[data.invoiceReference]);
    if(!inv.rows[0]) throw new Error("Invoice not found");
    const i=inv.rows[0]; const outstanding=cents(n(i.amount)-n(i.paid)); const paymentAmount=cents(data.amount);
    if(paymentAmount<=0) throw new Error('Payment amount must be greater than zero');
    if(paymentAmount>outstanding) throw new Error(`Payment exceeds invoice outstanding balance of ${outstanding.toFixed(2)}`);
    const p=await client.query(`INSERT INTO client_payments(client_id,project_id,invoice_reference,amount,payment_date,payment_method,notes,recorded_by) VALUES($1,$2,$3,$4,COALESCE($5,CURRENT_DATE),$6,$7,$8) RETURNING *`,[i.client_id,i.project_id,i.invoice_number,paymentAmount,data.paymentDate||null,data.paymentMethod||null,data.notes||null,userId]);
    const newPaid=cents(n(i.paid)+paymentAmount); const status=newPaid>=cents(i.amount)?'Paid':'Partially Paid';
    await client.query(`UPDATE client_invoices SET status=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2`,[status,i.id]);
    await client.query('COMMIT'); return p.rows[0];
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}

async function approveIssuance(requestId,userId,workerName){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const req=(await client.query(`SELECT * FROM material_issuance_requests WHERE id=$1 FOR UPDATE`,[requestId])).rows[0];
    if(!req) throw new Error("Material issuance request not found");
    if(req.status!=="Pending") throw new Error(`Request is already ${req.status}`);
    const items=(await client.query(`SELECT mii.*,ii.name,ii.unit,ii.unit_cost FROM material_issuance_items mii JOIN inventory_items ii ON ii.id=mii.item_id WHERE mii.request_id=$1`,[requestId])).rows;
    if(!items.length) throw new Error("Issuance request has no items");
    for(const item of items){
      const stock=(await client.query(`SELECT * FROM warehouse_stock WHERE warehouse_id=$1 AND item_id=$2 FOR UPDATE`,[req.warehouse_id,item.item_id])).rows[0];
      if(!stock || n(stock.quantity)<n(item.quantity)) throw new Error(`Insufficient stock for ${item.name}. Available: ${stock?stock.quantity:0}`);
      await client.query(`UPDATE warehouse_stock SET quantity=quantity-$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2`,[item.quantity,stock.id]);
      await client.query(`INSERT INTO inventory_transactions(warehouse_id,item_id,transaction_type,quantity,site_id,material_issuance_request_id,reference,notes,recorded_by) VALUES($1,$2,'Dispatch',$3,$4,$5,$6,$7,$8)`,[req.warehouse_id,item.item_id,item.quantity,req.site_id,requestId,`ISS-${requestId}`,`Approved issuance ${requestId}${workerName ? ` - Worker: ${workerName}` : ''}`,userId]);
      await client.query(`INSERT INTO site_material_records(site_id,item_id,received_quantity,estimated_consumption,actual_consumption,waste_quantity) VALUES($1,$2,$3,0,$3,0) ON CONFLICT(site_id,item_id) DO UPDATE SET received_quantity=site_material_records.received_quantity+EXCLUDED.received_quantity,actual_consumption=site_material_records.actual_consumption+EXCLUDED.actual_consumption,updated_at=CURRENT_TIMESTAMP`,[req.site_id,item.item_id,item.quantity]);
    }
    const r=(await client.query(`UPDATE material_issuance_requests SET status='Approved',approved_by=$1,reviewed_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,[userId,requestId])).rows[0];
    await client.query('COMMIT'); return r;
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}

async function rejectIssuance(requestId,userId,reason){
  if(!reason||!String(reason).trim()) throw new Error("Rejection reason is required");
  const r=await pool.query(`UPDATE material_issuance_requests SET status='Rejected',approved_by=$1,rejection_reason=$2,reviewed_at=CURRENT_TIMESTAMP WHERE id=$3 AND status='Pending' RETURNING *`,[userId,reason,requestId]);
  if(!r.rows[0]) throw new Error("Pending material issuance request not found"); return r.rows[0];
}

async function receiveMaterial(data,userId){
  const client=await pool.connect();
  try{await client.query('BEGIN');
    const stock=(await client.query(`SELECT * FROM warehouse_stock WHERE warehouse_id=$1 AND item_id=$2 FOR UPDATE`,[data.warehouseId,data.itemId])).rows[0];
    if(stock) await client.query(`UPDATE warehouse_stock SET quantity=quantity+$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2`,[data.quantity,stock.id]);
    else await client.query(`INSERT INTO warehouse_stock(warehouse_id,item_id,quantity) VALUES($1,$2,$3)`,[data.warehouseId,data.itemId,data.quantity]);
    const r=(await client.query(`INSERT INTO inventory_transactions(warehouse_id,item_id,transaction_type,quantity,reference,notes,recorded_by) VALUES($1,$2,'Stock In',$3,$4,$5,$6) RETURNING *`,[data.warehouseId,data.itemId,data.quantity,data.reference||null,data.notes||'Goods receipt',userId])).rows[0];
    await client.query('COMMIT');return r;
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}

async function damageMaterial(data,userId){ return doStockOut(data,userId,'Damage'); }
async function wasteMaterial(data,userId){ return doStockOut(data,userId,'Waste'); }
async function doStockOut(data,userId,type){
  const client=await pool.connect();
  try{await client.query('BEGIN'); const s=(await client.query(`SELECT * FROM warehouse_stock WHERE warehouse_id=$1 AND item_id=$2 FOR UPDATE`,[data.warehouseId,data.itemId])).rows[0];
    if(!s||n(s.quantity)<n(data.quantity)) throw new Error(`Insufficient stock. Available: ${s?s.quantity:0}`);
    await client.query(`UPDATE warehouse_stock SET quantity=quantity-$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2`,[data.quantity,s.id]);
    const r=(await client.query(`INSERT INTO inventory_transactions(warehouse_id,item_id,transaction_type,quantity,site_id,reference,notes,recorded_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[data.warehouseId,data.itemId,type,data.quantity,data.siteId||null,data.reference||null,data.notes||null,userId])).rows[0];
    await client.query('COMMIT');return r;
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}

async function lowStock(){
  return (await pool.query(`SELECT i.id,i.name,i.unit,i.threshold,COALESCE(SUM(ws.quantity),0)::INTEGER quantity FROM inventory_items i LEFT JOIN warehouse_stock ws ON ws.item_id=i.id GROUP BY i.id HAVING COALESCE(SUM(ws.quantity),0)<=i.threshold ORDER BY quantity ASC,i.name`)).rows;
}

async function projectReport(){
  return (await pool.query(`
    SELECT p.id,p.name,p.status,p.completion_percentage,p.budget,
      COUNT(DISTINCT s.id)::INTEGER sites,
      COUNT(DISTINCT pc.id)::INTEGER contractors,
      ROUND((COALESCE((SELECT SUM(cp.amount) FROM contractor_payments cp WHERE cp.project_id=p.id),0)
        + COALESCE((SELECT SUM(t.quantity*i.unit_cost) FROM inventory_transactions t JOIN inventory_items i ON i.id=t.item_id JOIN sites sx ON sx.id=t.site_id WHERE sx.project_id=p.id AND t.transaction_type IN ('Issuance','Dispatch','Stock Out','Damage','Waste')),0)
        )::NUMERIC,2) actual_cost
    FROM projects p LEFT JOIN sites s ON s.project_id=p.id LEFT JOIN project_contractors pc ON pc.project_id=p.id GROUP BY p.id ORDER BY p.id DESC`)).rows.map(x=>{x.budget=n(x.budget);x.actual_cost=n(x.actual_cost);x.variance=Number((x.budget-x.actual_cost).toFixed(2));x.variance_percentage=x.budget?Number(((x.variance/x.budget)*100).toFixed(2)):0;return x;});
}

async function financialReport(){
  const revenue=n((await pool.query(`SELECT COALESCE(SUM(amount),0) x FROM client_payments`)).rows[0].x);
  const contractor=n((await pool.query(`SELECT COALESCE(SUM(amount),0) x FROM contractor_payments`)).rows[0].x);
  const outstanding=n((await pool.query(`SELECT COALESCE(SUM(amount),0) x FROM client_invoices WHERE status <> 'Cancelled'`)).rows[0].x)-revenue;
  const monthly=(await pool.query(`SELECT TO_CHAR(month_start,'YYYY-MM') AS month, COALESCE(revenue,0)::NUMERIC(14,2) AS revenue, COALESCE(contractor_payments,0)::NUMERIC(14,2) AS contractor_payments FROM (SELECT date_trunc('month',d)::date AS month_start, SUM(rev) AS revenue, SUM(cp) AS contractor_payments FROM (SELECT payment_date AS d, amount AS rev, 0::NUMERIC AS cp FROM client_payments UNION ALL SELECT payment_date AS d, 0::NUMERIC AS rev, amount AS cp FROM contractor_payments) AS movements WHERE d IS NOT NULL GROUP BY date_trunc('month',d)::date) AS monthly ORDER BY month_start`)).rows;
  return {revenue,contractor_payments:contractor,outstanding_dues:Number(outstanding.toFixed(2)),monthly_trends:monthly};
}

async function materialReport(){
  const stock=(await pool.query(`SELECT i.id,i.name,i.unit,i.threshold,COALESCE(SUM(ws.quantity),0)::INTEGER stock FROM inventory_items i LEFT JOIN warehouse_stock ws ON ws.item_id=i.id GROUP BY i.id ORDER BY i.name`)).rows;
  const consumption=(await pool.query(`SELECT s.id site_id,s.name site_name,i.id item_id,i.name item_name,smr.received_quantity,smr.estimated_consumption,smr.actual_consumption,smr.waste_quantity,(smr.received_quantity-smr.actual_consumption-smr.waste_quantity) unexplained_difference FROM site_material_records smr JOIN sites s ON s.id=smr.site_id JOIN inventory_items i ON i.id=smr.item_id ORDER BY s.name,i.name`)).rows;
  const movements=(await pool.query(`SELECT t.*,w.name warehouse_name,i.name item_name,s.name site_name,u.full_name recorded_by_name FROM inventory_transactions t JOIN warehouses w ON w.id=t.warehouse_id JOIN inventory_items i ON i.id=t.item_id LEFT JOIN sites s ON s.id=t.site_id LEFT JOIN users u ON u.id=t.recorded_by ORDER BY t.id DESC`)).rows;
  return {stock,consumption,movements,low_stock:await lowStock()};
}

async function generatePayroll(year,month,userId){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const period=(await client.query(`INSERT INTO payroll_periods(year,month,status,prepared_by) VALUES($1,$2,'Draft',$3) ON CONFLICT(year,month) DO UPDATE SET prepared_by=EXCLUDED.prepared_by,updated_at=CURRENT_TIMESTAMP RETURNING *`,[year,month,userId])).rows[0];
    if(['Approved','Paid'].includes(period.status)) throw new Error('An approved or paid payroll period cannot be regenerated');
    const days=new Date(year,month,0).getDate();
    const employees=(await client.query(`SELECT * FROM employees WHERE is_active=true ORDER BY id`)).rows;
    const missing=[]; const calculated=[];
    for(const e of employees){
      const a=(await client.query(`SELECT COUNT(*) FILTER(WHERE status='Present')::INTEGER present, COUNT(*) FILTER(WHERE status='Absent')::INTEGER absent FROM attendance WHERE employee_id=$1 AND attendance_date BETWEEN $2 AND $3`,[e.id,`${year}-${String(month).padStart(2,'0')}-01`,`${year}-${String(month).padStart(2,'0')}-${String(days).padStart(2,'0')}`])).rows[0];
      const present=n(a.present), absent=n(a.absent), recorded=present+absent;
      if(recorded<days) missing.push(e.full_name);
      let gross=e.payment_type==='Daily Rate' ? n(e.daily_rate)*present : n(e.monthly_gross)-((n(e.monthly_gross)/days)*absent);
      // If every calendar day is recorded and all are absent, monthly salary correctly becomes zero.
      gross=Math.max(0,Number(gross.toFixed(2)));
      calculated.push({employeeId:e.id,present,absent,gross});
    }
    if(missing.length){
      // Do not leave stale generated payroll lines visible while attendance is incomplete.
      await client.query(`DELETE FROM payroll_records WHERE payroll_period_id=$1`,[period.id]);
      await client.query(`UPDATE payroll_periods SET status='Draft',rejection_reason=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2`,[`Missing attendance for: ${missing.join(', ')}`,period.id]);
      await client.query('COMMIT');
      return {locked:true,missing_attendance:missing,period_id:period.id};
    }
    for(const row of calculated){
      await client.query(`INSERT INTO payroll_records(payroll_period_id,employee_id,working_days,present_days,absent_days,gross_salary,total_deductions,net_pay) VALUES($1,$2,$3,$4,$5,$6,0,$6) ON CONFLICT(payroll_period_id,employee_id) DO UPDATE SET working_days=EXCLUDED.working_days,present_days=EXCLUDED.present_days,absent_days=EXCLUDED.absent_days,gross_salary=EXCLUDED.gross_salary,total_deductions=0,net_pay=EXCLUDED.net_pay`,[period.id,row.employeeId,days,row.present,row.absent,row.gross]);
    }
    await client.query(`UPDATE payroll_periods SET status='Prepared',rejection_reason=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=$1`,[period.id]);
    await client.query('COMMIT');
    return {locked:false,period_id:period.id};
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}

async function approvePayroll(periodId,userId){
 const r=await pool.query(`SELECT * FROM payroll_periods WHERE id=$1`,[periodId]); if(!r.rows[0])throw new Error("Payroll period not found");
 if(r.rows[0].status!=="Prepared"&&r.rows[0].status!=="Under Review")throw new Error(`Payroll must be Prepared or Under Review before approval`);
 const x=await pool.query(`UPDATE payroll_periods SET status='Approved',approved_by=$1,approved_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,[userId,periodId]);
 return x.rows[0];
}
async function payPayroll(periodId){
 const client=await pool.connect(); try{await client.query('BEGIN');
  const p=(await client.query(`SELECT * FROM payroll_periods WHERE id=$1 FOR UPDATE`,[periodId])).rows[0]; if(!p)throw new Error("Payroll period not found"); if(p.status!=="Approved")throw new Error("Only approved payroll can be marked Paid");
  const records=(await client.query(`SELECT id FROM payroll_records WHERE payroll_period_id=$1`,[periodId])).rows;
  if(!records.length)throw new Error("Payroll has no employee records");
  for(const r of records) await client.query(`INSERT INTO payslips(payroll_record_id) VALUES($1) ON CONFLICT(payroll_record_id) DO NOTHING`,[r.id]);
  const out=(await client.query(`UPDATE payroll_periods SET status='Paid',updated_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING *`,[periodId])).rows[0];
  await client.query('COMMIT'); return out;
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
}
async function payrollReport(){return (await pool.query(`SELECT pp.id period_id,pp.year,pp.month,pp.status,pr.id payroll_record_id,e.id employee_id,e.full_name,pr.working_days,pr.present_days,pr.absent_days,pr.gross_salary,pr.total_deductions,pr.net_pay FROM payroll_periods pp LEFT JOIN payroll_records pr ON pr.payroll_period_id=pp.id LEFT JOIN employees e ON e.id=pr.employee_id ORDER BY pp.year DESC,pp.month DESC,e.full_name`)).rows;}

async function dashboard(){
 const active=n((await pool.query(`SELECT COUNT(*) x FROM projects WHERE status='Active'`)).rows[0].x);
 const pending=n((await pool.query(`SELECT COUNT(*) x FROM material_issuance_requests WHERE status='Pending'`)).rows[0].x);
 const low=await lowStock();
 const recent=(await pool.query(`SELECT id,action,table_name,record_id,created_at FROM audit_logs ORDER BY id DESC LIMIT 10`)).rows;
 return {active_projects:active,pending_approvals:pending,low_stock_alerts:low,recent_activity:recent};
}

async function siteConsumption(siteId){
 return (await pool.query(`SELECT smr.*,i.name item_name,i.unit,(smr.received_quantity-smr.actual_consumption-smr.waste_quantity) unexplained_difference FROM site_material_records smr JOIN inventory_items i ON i.id=smr.item_id WHERE smr.site_id=$1 ORDER BY i.name`,[siteId])).rows;
}

module.exports={clientStatement,contractorStatement,createInvoice,recordClientPayment,approveIssuance,rejectIssuance,receiveMaterial,damageMaterial,wasteMaterial,lowStock,projectReport,financialReport,materialReport,generatePayroll,approvePayroll,payPayroll,payrollReport,dashboard,siteConsumption};
