const service =
    require("../services/payrollPeriodService");


// CREATE
const createPayrollPeriod = async (req, res) => {

    try {

        const period =
            await service.createPayrollPeriod(
                req.body
            );


        return res.status(201).json({
            success: true,
            message:
                "Payroll period created successfully",
            data: period
        });

    } catch (error) {

        console.error(
            "Create payroll period error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllPayrollPeriods = async (req, res) => {

    try {

        const periods =
            await service.getAllPayrollPeriods();


        return res.status(200).json({
            success: true,
            count: periods.length,
            data: periods
        });

    } catch (error) {

        console.error(
            "Get payroll periods error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve payroll periods"
        });
    }
};


// GET ONE
const getPayrollPeriodById = async (req, res) => {

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
                    "Invalid payroll period ID"
            });
        }


        const period =
            await service.getPayrollPeriodById(id);


        return res.status(200).json({
            success: true,
            data: period
        });

    } catch (error) {

        if (
            error.message ===
            "Payroll period not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve payroll period"
        });
    }
};


// UPDATE
const updatePayrollPeriod = async (req, res) => {

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
                    "Invalid payroll period ID"
            });
        }


        const period =
            await service.updatePayrollPeriod(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message:
                "Payroll period updated successfully",
            data: period
        });

    } catch (error) {

        if (
            error.message ===
            "Payroll period not found"
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
const deletePayrollPeriod = async (req, res) => {

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
                    "Invalid payroll period ID"
            });
        }


        const period =
            await service.deletePayrollPeriod(id);


        return res.status(200).json({
            success: true,
            message:
                "Payroll period deleted successfully",
            data: period
        });

    } catch (error) {

        if (
            error.message ===
            "Payroll period not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to delete payroll period"
        });
    }
};


module.exports = {
    createPayrollPeriod,
    getAllPayrollPeriods,
    getPayrollPeriodById,
    updatePayrollPeriod,
    deletePayrollPeriod
};