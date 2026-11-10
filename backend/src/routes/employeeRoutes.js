const express = require("express");

const employeeController = require("../controllers/employeeController");

const validate = require("../middleware/validate");
const authenticate = require("../middleware/authMiddleware");

const {
    createEmployeeSchema,
    updateEmployeeSchema
} = require("../validators/employeeValidator");

const router = express.Router();


// All employee routes require authentication
router.use(authenticate);


// Create employee
router.post(
    "/",
    validate(createEmployeeSchema),
    employeeController.createEmployee
);


// Get all employees
router.get(
    "/",
    employeeController.getAllEmployees
);


// Get employee by ID
router.get(
    "/:id",
    employeeController.getEmployeeById
);


// Update employee
router.put(
    "/:id",
    validate(updateEmployeeSchema),
    employeeController.updateEmployee
);


// Deactivate employee
router.patch(
    "/:id/deactivate",
    employeeController.deactivateEmployee
);


module.exports = router;