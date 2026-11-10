const {z}=require("zod");
const inventoryItemSchema=z.object({
 name:z.string().trim().min(2).max(100),
 unit:z.string().trim().min(1).max(50),
 category_id:z.coerce.number().int().positive(),
 threshold:z.coerce.number().int().min(0),
 unit_cost:z.coerce.number().min(0).optional()
});
module.exports={inventoryItemSchema};
