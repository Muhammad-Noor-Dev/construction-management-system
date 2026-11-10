const {z}=require("zod");
const f={clientId:z.coerce.number().int().positive(),projectId:z.coerce.number().int().positive().nullable().optional(),invoiceReference:z.string().trim().min(1),amount:z.coerce.number().positive(),paymentDate:z.string().date().optional(),paymentMethod:z.string().trim().max(50).optional(),notes:z.string().trim().max(500).optional()};
module.exports={createClientPaymentSchema:z.object(f),updateClientPaymentSchema:z.object(f)};
