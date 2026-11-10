const repository=require("../repositories/clientPaymentRepository");
const completion=require("./completionService");
const pool=require("../config/database");
const createClientPayment=async(data)=>{
 if(!data.invoiceReference) throw new Error("Invoice reference is required");
 return completion.recordClientPayment(data,data.recordedBy||null);
};
const getAllClientPayments=()=>repository.findAllClientPayments();
const getClientPaymentById=async(id)=>{const x=await repository.findClientPaymentById(id);if(!x)throw new Error("Client payment not found");return x};
const updateClientPayment=async(id,data)=>{
 const old=await repository.findClientPaymentById(id);if(!old)throw new Error("Client payment not found");
 const inv=(await pool.query(`SELECT i.*,COALESCE((SELECT SUM(amount) FROM client_payments WHERE client_id=i.client_id AND invoice_reference=i.invoice_number AND id<>$2),0) paid FROM client_invoices i WHERE i.invoice_number=$1`,[data.invoiceReference,id])).rows[0];
 if(!inv)throw new Error("Invoice not found");
 if(Number(data.amount)>Number(inv.amount)-Number(inv.paid))throw new Error("Payment exceeds invoice outstanding balance");
 return repository.updateClientPayment(id,data);
};
const deleteClientPayment=(id)=>repository.deleteClientPayment(id);
module.exports={createClientPayment,getAllClientPayments,getClientPaymentById,updateClientPayment,deleteClientPayment};
