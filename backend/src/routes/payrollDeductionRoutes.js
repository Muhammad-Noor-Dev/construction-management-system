const express = require("express");

const controller =
    require("../controllers/payrollDeductionController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createPayrollDeductionSchema,
    updatePayrollDeductionSchema
} = require("../validators/payrollDeductionValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(createPayrollDeductionSchema),
    controller.createPayrollDeduction
);


// GET ALL
router.get(
    "/",
    controller.getAllPayrollDeductions
);


// GET ONE
router.get(
    "/:id",
    controller.getPayrollDeductionById
);


// UPDATE
router.put(
    "/:id",
    validate(updatePayrollDeductionSchema),
    controller.updatePayrollDeduction
);


// DELETE
router.delete(
    "/:id",
    controller.deletePayrollDeduction
);


module.exports = router;