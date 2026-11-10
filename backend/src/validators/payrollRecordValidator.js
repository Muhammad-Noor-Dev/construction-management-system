const { z } = require("zod");


const payrollRecordFields = {

    payrollPeriodId: z
        .coerce
        .number()
        .int()
        .positive(),


    employeeId: z
        .coerce
        .number()
        .int()
        .positive(),


    workingDays: z
        .coerce
        .number()
        .int()
        .min(0),


    presentDays: z
        .coerce
        .number()
        .int()
        .min(0),


    absentDays: z
        .coerce
        .number()
        .int()
        .min(0),


    grossSalary: z
        .coerce
        .number()
        .min(0),


    totalDeductions: z
        .coerce
        .number()
        .min(0)
        .optional(),


    netPay: z
        .coerce
        .number()
        .min(0)
};


const createPayrollRecordSchema =
    z.object(payrollRecordFields);


const updatePayrollRecordSchema =
    z.object(payrollRecordFields);


module.exports = {
    createPayrollRecordSchema,
    updatePayrollRecordSchema
};