const { z } = require("zod");


const warehouseStockSchema = z.object({

    warehouse_id: z
        .number()
        .int()
        .positive(
            "Warehouse ID must be a positive integer"
        ),

    item_id: z
        .number()
        .int()
        .positive(
            "Item ID must be a positive integer"
        ),

    quantity: z
        .number()
        .int()
        .min(
            0,
            "Quantity cannot be negative"
        )
});


module.exports = {
    warehouseStockSchema
};