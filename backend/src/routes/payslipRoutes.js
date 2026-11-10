const express = require("express");

const controller =
    require("../controllers/payslipController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createPayslipSchema
} = require("../validators/payslipValidator");


const router = express.Router();


router.use(authenticate);


// CREATE / GENERATE
router.post(
    "/",
    validate(createPayslipSchema),
    controller.createPayslip
);


// GET ALL
router.get(
    "/",
    controller.getAllPayslips
);


// GET ONE
router.get(
    "/:id",
    controller.getPayslipById
);


// DELETE
router.delete(
    "/:id",
    controller.deletePayslip
);


module.exports = router;