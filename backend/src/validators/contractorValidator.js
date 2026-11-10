const { z } = require("zod");


const contractorFields = {

    name: z
        .string()
        .trim()
        .min(1),

    specialization: z
        .string()
        .trim()
        .optional(),

    phone: z
        .string()
        .trim()
        .optional(),

    email: z
        .string()
        .trim()
        .email()
        .optional(),

    address: z
        .string()
        .trim()
        .optional()
};


const createContractorSchema =
    z.object(contractorFields);


const updateContractorSchema =
    z.object(contractorFields);


module.exports = {
    createContractorSchema,
    updateContractorSchema
};