const express = require("express");

const controller =
    require("../controllers/inventoryItemController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    inventoryItemSchema
} = require("../validators/inventoryItemValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(inventoryItemSchema),
    controller.createItem
);


// GET ALL
router.get(
    "/",
    controller.getAllItems
);


// GET ONE
router.get(
    "/:id",
    controller.getItemById
);


// UPDATE
router.put(
    "/:id",
    validate(inventoryItemSchema),
    controller.updateItem
);


// DELETE
router.delete(
    "/:id",
    controller.deleteItem
);


module.exports = router;