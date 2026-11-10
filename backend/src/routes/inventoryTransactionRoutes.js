const express = require("express");

const controller =
    require("../controllers/inventoryTransactionController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    inventoryTransactionSchema
} = require("../validators/inventoryTransactionValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(inventoryTransactionSchema),
    controller.createTransaction
);


// GET ALL
router.get(
    "/",
    controller.getAllTransactions
);


// GET ONE
router.get(
    "/:id",
    controller.getTransactionById
);


module.exports = router;