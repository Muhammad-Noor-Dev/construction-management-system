const { z } = require("zod");


const createPayslipSchema = z.object({

    payrollRecordId: z
        .coerce
        .number()
        .int()
        .positive()

});


module.exports = {
    createPayslipSchema
};