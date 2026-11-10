const express = require("express");

const controller =
    require("../controllers/contractorPaymentController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createContractorPaymentSchema,
    updateContractorPaymentSchema
} = require("../validators/contractorPaymentValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(createContractorPaymentSchema),
    controller.createContractorPayment
);


// GET ALL
router.get(
    "/",
    controller.getAllContractorPayments
);


// GET ONE
router.get(
    "/:id",
    controller.getContractorPaymentById
);


// UPDATE
router.put(
    "/:id",
    validate(updateContractorPaymentSchema),
    controller.updateContractorPayment
);


// DELETE
router.delete(
    "/:id",
    controller.deleteContractorPayment
);


module.exports = router;