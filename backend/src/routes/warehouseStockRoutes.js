const express = require("express");

const controller =
    require("../controllers/warehouseStockController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    warehouseStockSchema
} = require("../validators/warehouseStockValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(warehouseStockSchema),
    controller.createStock
);


// GET ALL
router.get(
    "/",
    controller.getAllStock
);


// GET ONE
router.get(
    "/:id",
    controller.getStockById
);


// UPDATE
router.put(
    "/:id",
    validate(warehouseStockSchema),
    controller.updateStock
);


// DELETE
router.delete(
    "/:id",
    controller.deleteStock
);


module.exports = router;