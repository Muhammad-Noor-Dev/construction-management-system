const express = require("express");

const controller =
    require("../controllers/clientPaymentController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createClientPaymentSchema,
    updateClientPaymentSchema
} = require("../validators/clientPaymentValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(createClientPaymentSchema),
    controller.createClientPayment
);


// GET ALL
router.get(
    "/",
    controller.getAllClientPayments
);


// GET ONE
router.get(
    "/:id",
    controller.getClientPaymentById
);


// UPDATE
router.put(
    "/:id",
    validate(updateClientPaymentSchema),
    controller.updateClientPayment
);


// DELETE
router.delete(
    "/:id",
    controller.deleteClientPayment
);


module.exports = router;