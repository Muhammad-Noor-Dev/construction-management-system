const service =
    require("../services/payrollRecordService");


// CREATE
const createPayrollRecord = async (req, res) => {

    try {

        const record =
            await service.createPayrollRecord(
                req.body
            );


        return res.status(201).json({
            success: true,
            message:
                "Payroll record created successfully",
            data: record
        });

    } catch (error) {

        console.error(
            "Create payroll record error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllPayrollRecords = async (req, res) => {

    try {

        const records =
            await service.getAllPayrollRecords();


        return res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });

    } catch (error) {

        console.error(
            "Get payroll records error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve payroll records"
        });
    }
};


// GET ONE
const getPayrollRecordById = async (req, res) => {

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
                    "Invalid payroll record ID"
            });
        }


        const record =
            await service.getPayrollRecordById(id);


        return res.status(200).json({
            success: true,
            data: record
        });

    } catch (error) {

        if (
            error.message ===
            "Payroll record not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve payroll record"
        });
    }
};


// UPDATE
const updatePayrollRecord = async (req, res) => {

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
                    "Invalid payroll record ID"
            });
        }


        const record =
            await service.updatePayrollRecord(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message:
                "Payroll record updated successfully",
            data: record
        });

    } catch (error) {

        if (
            error.message ===
            "Payroll record not found"
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
const deletePayrollRecord = async (req, res) => {

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
                    "Invalid payroll record ID"
            });
        }


        const record =
            await service.deletePayrollRecord(id);


        return res.status(200).json({
            success: true,
            message:
                "Payroll record deleted successfully",
            data: record
        });

    } catch (error) {

        if (
            error.message ===
            "Payroll record not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to delete payroll record"
        });
    }
};


module.exports = {
    createPayrollRecord,
    getAllPayrollRecords,
    getPayrollRecordById,
    updatePayrollRecord,
    deletePayrollRecord
};