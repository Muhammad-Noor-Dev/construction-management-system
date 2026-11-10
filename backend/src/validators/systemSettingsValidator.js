const { z } = require("zod");

const createSettingSchema = z.object({
    setting_key: z
        .string()
        .min(1)
        .max(255),

    setting_value: z
        .string()
        .min(1),

    description: z
        .string()
        .nullable()
        .optional(),

    updated_by: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional()
});

const updateSettingSchema = z.object({
    setting_value: z
        .string()
        .min(1),

    description: z
        .string()
        .nullable()
        .optional(),

    updated_by: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional()
});

module.exports = {
    createSettingSchema,
    updateSettingSchema
};