const { z } = require("zod");


const transactionTypes = [
    "Stock In",
    "Stock Out",
    "Issuance",
    "Dispatch",
    "Damage",
    "Waste",
    "Transfer Out",
    "Transfer In"
];


const inventoryTransactionSchema = z.object({

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

    transaction_type: z
        .enum(transactionTypes),

    quantity: z
        .number()
        .int()
        .positive(
            "Transaction quantity must be greater than 0"
        ),

    site_id: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

    material_issuance_request_id: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

    reference: z
        .string()
        .trim()
        .optional()
        .nullable(),

    notes: z
        .string()
        .trim()
        .optional()
        .nullable(),

    recorded_by: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional()
});


module.exports = {
    inventoryTransactionSchema
};