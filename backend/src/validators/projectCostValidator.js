const { z } = require("zod");

const createProjectCostSchema = z.object({
    siteId: z.coerce.number().int().positive().optional(),
    category: z.string().trim().min(2).max(100),
    description: z.string().trim().min(2).max(255),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    costDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Cost date must be in YYYY-MM-DD format")
});

const updateProjectCostSchema = createProjectCostSchema;

module.exports = {
    createProjectCostSchema,
    updateProjectCostSchema
};
