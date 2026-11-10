const express = require("express");

const controller =
    require("../controllers/payrollPeriodController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createPayrollPeriodSchema,
    updatePayrollPeriodSchema
} = require("../validators/payrollPeriodValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(createPayrollPeriodSchema),
    controller.createPayrollPeriod
);


// GET ALL
router.get(
    "/",
    controller.getAllPayrollPeriods
);


// GET ONE
router.get(
    "/:id",
    controller.getPayrollPeriodById
);


// UPDATE
router.put(
    "/:id",
    validate(updatePayrollPeriodSchema),
    controller.updatePayrollPeriod
);


// DELETE
router.delete(
    "/:id",
    controller.deletePayrollPeriod
);


module.exports = router;