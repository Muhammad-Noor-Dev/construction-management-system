const { z } = require("zod");


const warehouseSchema = z.object({

    name: z
        .string()
        .trim()
        .min(1, "Warehouse name is required"),

    location: z
        .string()
        .trim()
        .min(1, "Warehouse location is required")
});


module.exports = {
    warehouseSchema
};