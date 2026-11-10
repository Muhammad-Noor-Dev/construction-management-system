const { z } = require("zod");

const createAuditLogSchema = z.object({
    user_id: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

    action: z.enum([
        "CREATE",
        "UPDATE",
        "DELETE"
    ]),

    table_name: z
        .string()
        .min(1),

    record_id: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

    old_values: z
        .record(z.string(), z.any())
        .nullable()
        .optional(),

    new_values: z
        .record(z.string(), z.any())
        .nullable()
        .optional()
});

module.exports = {
    createAuditLogSchema
};