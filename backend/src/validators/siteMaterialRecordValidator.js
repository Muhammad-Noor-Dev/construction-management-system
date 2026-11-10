const { z } = require("zod");

const createSiteMaterialRecordSchema = z.object({
    site_id: z
        .number()
        .int()
        .positive(),

    item_id: z
        .number()
        .int()
        .positive(),

    received_quantity: z
        .number()
        .int()
        .min(0),

    estimated_consumption: z
        .number()
        .int()
        .min(0),

    actual_consumption: z
        .number()
        .int()
        .min(0),

    waste_quantity: z
        .number()
        .int()
        .min(0)
});

const updateSiteMaterialRecordSchema = z.object({
    received_quantity: z
        .number()
        .int()
        .min(0),

    estimated_consumption: z
        .number()
        .int()
        .min(0),

    actual_consumption: z
        .number()
        .int()
        .min(0),

    waste_quantity: z
        .number()
        .int()
        .min(0)
});

module.exports = {
    createSiteMaterialRecordSchema,
    updateSiteMaterialRecordSchema
};