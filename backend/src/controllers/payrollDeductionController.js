const service =
    require("../services/payrollDeductionService");


// CREATE
const createPayrollDeduction = async (req, res) => {

    try {

        const deduction =
            await service.createPayrollDeduction(
                req.body
            );


        return res.status(201).json({
            success: true,
            message:
                "Payroll deduction created successfully",
            data: deduction
        });

    } catch (error) {

        console.error(
            "Create payroll deduction error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllPayrollDeductions = async (req, res) => {

    try {

        const deductions =
            await service.getAllPayrollDeductions();


        return res.status(200).json({
            success: true,
            count: deductions.length,
            data: deductions
        });

    } catch (error) {

        console.error(
            "Get payroll deductions error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve payroll deductions"
        });
    }
};


// GET ONE
const getPayrollDeductionById = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid payroll deduction ID"
            });
        }


        const deduction =
            await service.getPayrollDeductionById(id);


        return res.status(200).json({
            success: true,
            data: deduction
        });

    } catch (error) {

        if (
            error.message ===
            "Payroll deduction not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve payroll deduction"
        });
    }
};


// UPDATE
const updatePayrollDeduction = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid payroll deduction ID"
            });
        }


        const deduction =
            await service.updatePayrollDeduction(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message:
                "Payroll deduction updated successfully",
            data: deduction
        });

    } catch (error) {

        if (
            error.message ===
            "Payroll deduction not found"
        ) {

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


// DELETE
const deletePayrollDeduction = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid payroll deduction ID"
            });
        }


        const deduction =
            await service.deletePayrollDeduction(id);


        return res.status(200).json({
            success: true,
            message:
                "Payroll deduction deleted successfully",
            data: deduction
        });

    } catch (error) {

        if (
            error.message ===
            "Payroll deduction not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to delete payroll deduction"
        });
    }
};


module.exports = {
    createPayrollDeduction,
    getAllPayrollDeductions,
    getPayrollDeductionById,
    updatePayrollDeduction,
    deletePayrollDeduction
};