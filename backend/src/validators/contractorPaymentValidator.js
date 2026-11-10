const { z } = require("zod");


const contractorPaymentFields = {

    contractorId: z
        .coerce
        .number()
        .int()
        .positive(),

    projectId: z
        .coerce
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

    amount: z
        .coerce
        .number()
        .positive(),

    paymentDate: z
        .string()
        .trim()
        .optional(),

    paymentMethod: z
        .string()
        .trim()
        .optional(),

    reference: z
        .string()
        .trim()
        .optional(),

    notes: z
        .string()
        .trim()
        .optional()
};


const createContractorPaymentSchema =
    z.object(contractorPaymentFields);


const updateContractorPaymentSchema =
    z.object(contractorPaymentFields);


module.exports = {
    createContractorPaymentSchema,
    updateContractorPaymentSchema
};