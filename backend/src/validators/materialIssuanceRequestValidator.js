const { z } = require("zod");


const createMaterialIssuanceRequestSchema = z.object({

    site_id: z
        .number()
        .int()
        .positive(
            "Site ID must be a positive integer"
        ),

    warehouse_id: z
        .number()
        .int()
        .positive(
            "Warehouse ID must be a positive integer"
        )
});


const rejectMaterialIssuanceRequestSchema = z.object({

    rejection_reason: z
        .string()
        .trim()
        .min(
            1,
            "Rejection reason is required"
        )
});


module.exports = {
    createMaterialIssuanceRequestSchema,
    rejectMaterialIssuanceRequestSchema
};