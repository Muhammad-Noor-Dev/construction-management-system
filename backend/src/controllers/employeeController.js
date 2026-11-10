const employeeService = require("../services/employeeService");
const logAudit = require("../utils/auditLogger");


const createEmployee = async (req, res) => {
    try {
        const employee = await employeeService.createEmployee(req.body);

        await logAudit({
            userId: req.user?.id ?? null,
            action: "CREATE",
            tableName: "employees",
            recordId: employee.id,
            oldValues: null,
            newValues: employee
        });

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee
        });

    } catch (error) {
        console.error("Create employee error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getAllEmployees = async (req, res) => {
    try {
        const employees = await employeeService.getAllEmployees();

        return res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });

    } catch (error) {
        console.error("Get employees error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve employees"
        });
    }
};


const getEmployeeById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        const employee =
            await employeeService.getEmployeeById(id);

        return res.status(200).json({
            success: true,
            data: employee
        });

    } catch (error) {
        console.error("Get employee error:", error.message);

        if (error.message === "Employee not found") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve employee"
        });
    }
};


const updateEmployee = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        // Get old employee data BEFORE updating
        const oldEmployee =
            await employeeService.getEmployeeById(id);

        const employee =
            await employeeService.updateEmployee(
                id,
                req.body
            );

        await logAudit({
            userId: req.user?.id ?? null,
            action: "UPDATE",
            tableName: "employees",
            recordId: employee.id,
            oldValues: oldEmployee,
            newValues: employee
        });

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: employee
        });

    } catch (error) {
        console.error(
            "Update employee error:",
            error.message
        );

        if (error.message === "Employee not found") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const deactivateEmployee = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        // Get old data BEFORE deactivation
        const oldEmployee =
            await employeeService.getEmployeeById(id);

        const employee =
            await employeeService.deactivateEmployee(id);

        await logAudit({
            userId: req.user?.id ?? null,
            action: "UPDATE",
            tableName: "employees",
            recordId: employee.id,
            oldValues: oldEmployee,
            newValues: employee
        });

        return res.status(200).json({
            success: true,
            message: "Employee deactivated successfully",
            data: employee
        });

    } catch (error) {
        console.error(
            "Deactivate employee error:",
            error.message
        );

        if (error.message === "Employee not found") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deactivateEmployee
};