const { z } = require("zod");


const payrollPeriodFields = {

    year: z
        .coerce
        .number()
        .int()
        .min(2000),


    month: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(12),


    status: z
        .enum([
            "Draft",
            "Prepared",
            "Under Review",
            "Approved",
            "Paid"
        ])
        .optional(),


    preparedBy: z
        .coerce
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),


    approvedBy: z
        .coerce
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),


    rejectionReason: z
        .string()
        .nullable()
        .optional(),


    approvedAt: z
        .string()
        .datetime()
        .nullable()
        .optional()
};


const createPayrollPeriodSchema =
    z.object(payrollPeriodFields);


const updatePayrollPeriodSchema =
    z.object({
        ...payrollPeriodFields,
        status: z
            .enum([
                "Draft",
                "Prepared",
                "Under Review",
                "Approved",
                "Paid"
            ])
    });


module.exports = {
    createPayrollPeriodSchema,
    updatePayrollPeriodSchema
};