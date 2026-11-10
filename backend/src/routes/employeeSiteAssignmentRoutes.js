const express = require("express");


const assignmentController =
    require("../controllers/employeeSiteAssignmentController");


const validate =
    require("../middleware/validate");


const authenticate =
    require("../middleware/authMiddleware");


const {
    createAssignmentSchema,
    updateAssignmentSchema
} = require("../validators/employeeSiteAssignmentValidator");


const router = express.Router();


// Authentication required
router.use(authenticate);


// Create assignment
router.post(
    "/",
    validate(createAssignmentSchema),
    assignmentController.createAssignment
);


// Get all assignments
router.get(
    "/",
    assignmentController.getAllAssignments
);


// Get assignment by ID
router.get(
    "/:id",
    assignmentController.getAssignmentById
);


// Update assignment
router.put(
    "/:id",
    validate(updateAssignmentSchema),
    assignmentController.updateAssignment
);


// Delete assignment
router.delete(
    "/:id",
    assignmentController.deleteAssignment
);


module.exports = router;