const express = require("express");

const controller =
    require("../controllers/payrollRecordController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createPayrollRecordSchema,
    updatePayrollRecordSchema
} = require("../validators/payrollRecordValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(createPayrollRecordSchema),
    controller.createPayrollRecord
);


// GET ALL
router.get(
    "/",
    controller.getAllPayrollRecords
);


// GET ONE
router.get(
    "/:id",
    controller.getPayrollRecordById
);


// UPDATE
router.put(
    "/:id",
    validate(updatePayrollRecordSchema),
    controller.updatePayrollRecord
);


// DELETE
router.delete(
    "/:id",
    controller.deletePayrollRecord
);


module.exports = router;