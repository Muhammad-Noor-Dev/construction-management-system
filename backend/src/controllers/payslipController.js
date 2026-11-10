const service =
    require("../services/payslipService");


// CREATE
const createPayslip = async (req, res) => {

    try {

        const {
            payrollRecordId
        } = req.body;


        const payslip =
            await service.createPayslip(
                payrollRecordId
            );


        return res.status(201).json({
            success: true,
            message:
                "Payslip generated successfully",
            data: payslip
        });

    } catch (error) {

        console.error(
            "Create payslip error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllPayslips = async (req, res) => {

    try {

        const payslips =
            await service.getAllPayslips();


        return res.status(200).json({
            success: true,
            count: payslips.length,
            data: payslips
        });

    } catch (error) {

        console.error(
            "Get payslips error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve payslips"
        });
    }
};


// GET ONE
const getPayslipById = async (req, res) => {

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
                    "Invalid payslip ID"
            });
        }


        const payslip =
            await service.getPayslipById(id);


        return res.status(200).json({
            success: true,
            data: payslip
        });

    } catch (error) {

        if (
            error.message ===
            "Payslip not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve payslip"
        });
    }
};


// DELETE
const deletePayslip = async (req, res) => {

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
                    "Invalid payslip ID"
            });
        }


        const payslip =
            await service.deletePayslip(id);


        return res.status(200).json({
            success: true,
            message:
                "Payslip deleted successfully",
            data: payslip
        });

    } catch (error) {

        if (
            error.message ===
            "Payslip not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to delete payslip"
        });
    }
};


module.exports = {
    createPayslip,
    getAllPayslips,
    getPayslipById,
    deletePayslip
};