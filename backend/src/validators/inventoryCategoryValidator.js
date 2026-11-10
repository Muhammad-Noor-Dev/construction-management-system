const { z } = require("zod");


const inventoryCategorySchema = z.object({

    name: z
        .string()
        .trim()
        .min(
            1,
            "Inventory category name is required"
        )
});


module.exports = {
    inventoryCategorySchema
};