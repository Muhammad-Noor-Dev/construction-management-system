const express = require("express");

const controller =
    require("../controllers/warehouseController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    warehouseSchema
} = require("../validators/warehouseValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(warehouseSchema),
    controller.createWarehouse
);


// GET ALL
router.get(
    "/",
    controller.getAllWarehouses
);


// GET ONE
router.get(
    "/:id",
    controller.getWarehouseById
);


// UPDATE
router.put(
    "/:id",
    validate(warehouseSchema),
    controller.updateWarehouse
);


// DELETE
router.delete(
    "/:id",
    controller.deleteWarehouse
);


module.exports = router;