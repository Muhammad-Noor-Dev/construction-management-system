const express = require("express");


const attendanceController =
    require("../controllers/attendanceController");


const validate =
    require("../middleware/validate");


const authenticate =
    require("../middleware/authMiddleware");


const {
    createAttendanceSchema,
    updateAttendanceSchema
} = require("../validators/attendanceValidator");


const router = express.Router();


// Authentication required
router.use(authenticate);


// Create attendance
router.post(
    "/",
    validate(createAttendanceSchema),
    attendanceController.createAttendance
);


// Get all attendance
router.get(
    "/",
    attendanceController.getAllAttendance
);


// Get attendance by ID
router.get(
    "/:id",
    attendanceController.getAttendanceById
);


// Update attendance
router.put(
    "/:id",
    validate(updateAttendanceSchema),
    attendanceController.updateAttendance
);


// Delete attendance
router.delete(
    "/:id",
    attendanceController.deleteAttendance
);


module.exports = router;