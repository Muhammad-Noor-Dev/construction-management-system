const { z } = require("zod");


const createMaterialIssuanceItemSchema = z.object({

    request_id: z
        .number()
        .int()
        .positive(
            "Request ID must be a positive integer"
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
        .positive(
            "Quantity must be greater than 0"
        )
});


module.exports = {
    createMaterialIssuanceItemSchema
};