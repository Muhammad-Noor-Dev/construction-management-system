const { z } = require("zod");


const payrollDeductionFields = {

    payrollRecordId: z
        .coerce
        .number()
        .int()
        .positive(),

    description: z
        .string()
        .trim()
        .min(1),

    amount: z
        .coerce
        .number()
        .positive()
};


const createPayrollDeductionSchema =
    z.object(payrollDeductionFields);


const updatePayrollDeductionSchema =
    z.object(payrollDeductionFields);


module.exports = {
    createPayrollDeductionSchema,
    updatePayrollDeductionSchema
};