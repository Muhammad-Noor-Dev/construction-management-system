const {z}=require("zod");
const money=z.coerce.number().positive();
const positive=z.coerce.number().int().positive();
const invoiceSchema=z.object({clientId:positive,projectId:positive.nullable().optional(),invoiceNumber:z.string().trim().min(2).max(100),description:z.string().trim().max(255).optional(),amount:money,issueDate:z.string().date().optional(),dueDate:z.string().date().nullable().optional()});
const paymentSchema=z.object({invoiceReference:z.string().trim().min(1),amount:money,paymentDate:z.string().date().optional(),paymentMethod:z.string().trim().max(50).optional(),notes:z.string().trim().max(500).optional()});
const stockSchema=z.object({warehouseId:positive,itemId:positive,quantity:positive,siteId:positive.optional(),reference:z.string().trim().max(100).optional(),notes:z.string().trim().max(500).optional()});
const payrollSchema=z.object({year:z.coerce.number().int().min(2000),month:z.coerce.number().int().min(1).max(12)});
module.exports={invoiceSchema,paymentSchema,stockSchema,payrollSchema};
