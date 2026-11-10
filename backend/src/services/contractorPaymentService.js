const repository=require("../repositories/contractorPaymentRepository");
const pool=require("../config/database");
async function outstanding(contractorId,excludeId=null){
 const r=await pool.query(`SELECT COALESCE((SELECT SUM(payable_amount) FROM project_contractors WHERE contractor_id=$1),0) payable,COALESCE((SELECT SUM(amount) FROM contractor_payments WHERE contractor_id=$1 ${excludeId?'AND id<>$2':''}),0) paid`,excludeId?[contractorId,excludeId]:[contractorId]);
 return Number((Number(r.rows[0].payable)-Number(r.rows[0].paid)).toFixed(2));
}
const validate=async(data)=>{
 if(!(await repository.contractorExists(data.contractorId))) throw new Error("Contractor not found");
 if(data.projectId!=null){if(!(await repository.projectExists(data.projectId))) throw new Error("Project not found");
  const linked=await pool.query(`SELECT 1 FROM project_contractors WHERE contractor_id=$1 AND project_id=$2 LIMIT 1`,[data.contractorId,data.projectId]);
  if(!linked.rows.length) throw new Error("Contractor is not assigned to this project");
 }
 if(!Number.isFinite(Number(data.amount))||Number(data.amount)<=0) throw new Error("Amount must be greater than 0");
};
async function projectOutstanding(contractorId,projectId,excludeId=null){
 const params=[contractorId,projectId];
 const paidSql=excludeId ? 'AND id<>$3' : '';
 if(excludeId) params.push(excludeId);
 const r=await pool.query(`SELECT COALESCE((SELECT SUM(payable_amount) FROM project_contractors WHERE contractor_id=$1 AND project_id=$2),0) payable,COALESCE((SELECT SUM(amount) FROM contractor_payments WHERE contractor_id=$1 AND project_id=$2 ${paidSql}),0) paid`,params);
 return Number((Number(r.rows[0].payable)-Number(r.rows[0].paid)).toFixed(2));
}
const cents=v=>Math.round((Number(v||0)+Number.EPSILON)*100)/100;
const createContractorPayment=async(data)=>{await validate(data);const o=data.projectId!=null?await projectOutstanding(data.contractorId,data.projectId):await outstanding(data.contractorId);if(cents(data.amount)>cents(o))throw new Error(`Payment exceeds contractor outstanding balance of ${cents(o).toFixed(2)}`);data.amount=cents(data.amount);return repository.createContractorPayment(data)};
const getAllContractorPayments=()=>repository.findAllContractorPayments();
const getContractorPaymentById=async(id)=>{const x=await repository.findContractorPaymentById(id);if(!x)throw new Error("Contractor payment not found");return x};
const updateContractorPayment=async(id,data)=>{const x=await repository.findContractorPaymentById(id);if(!x)throw new Error("Contractor payment not found");await validate(data);const o=await outstanding(data.contractorId,id);if(Number(data.amount)>o)throw new Error(`Payment exceeds contractor outstanding balance of ${o.toFixed(2)}`);return repository.updateContractorPayment(id,data)};
const deleteContractorPayment=async(id)=>{const x=await repository.findContractorPaymentById(id);if(!x)throw new Error("Contractor payment not found");return repository.deleteContractorPayment(id)};
module.exports={createContractorPayment,getAllContractorPayments,getContractorPaymentById,updateContractorPayment,deleteContractorPayment};
