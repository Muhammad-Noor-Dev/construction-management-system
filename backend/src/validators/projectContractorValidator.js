const {z}=require("zod");
const f={projectId:z.coerce.number().int().positive(),siteId:z.coerce.number().int().positive(),contractorId:z.coerce.number().int().positive(),startDate:z.string().date(),endDate:z.string().date().nullable().optional(),payableAmount:z.coerce.number().min(0).optional(),notes:z.string().trim().max(1000).nullable().optional()};
module.exports={createProjectContractorSchema:z.object(f),updateProjectContractorSchema:z.object(f)};
