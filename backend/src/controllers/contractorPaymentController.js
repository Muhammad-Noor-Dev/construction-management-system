const service =
    require("../services/contractorPaymentService");


// CREATE
const createContractorPayment = async (
    req,
    res
) => {

    try {

        const data = {
            ...req.body,
            recordedBy: req.user.userId
        };


        const payment =
            await service.createContractorPayment(data);


        return res.status(201).json({
            success: true,
            message:
                "Contractor payment recorded successfully",
            data: payment
        });

    } catch (error) {

        console.error(
            "Create contractor payment error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllContractorPayments = async (
    req,
    res
) => {

    try {

        const payments =
            await service.getAllContractorPayments();


        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });

    } catch (error) {

        console.error(
            "Get contractor payments error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve contractor payments"
        });
    }
};


// GET ONE
const getContractorPaymentById = async (
    req,
    res
) => {

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
                    "Invalid contractor payment ID"
            });
        }


        const payment =
            await service.getContractorPaymentById(id);


        return res.status(200).json({
            success: true,
            data: payment
        });

    } catch (error) {

        if (
            error.message ===
            "Contractor payment not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve contractor payment"
        });
    }
};


// UPDATE
const updateContractorPayment = async (
    req,
    res
) => {

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
                    "Invalid contractor payment ID"
            });
        }


        const payment =
            await service.updateContractorPayment(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message:
                "Contractor payment updated successfully",
            data: payment
        });

    } catch (error) {

        if (
            error.message ===
            "Contractor payment not found"
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
const deleteContractorPayment = async (
    req,
    res
) => {

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
                    "Invalid contractor payment ID"
            });
        }


        const payment =
            await service.deleteContractorPayment(id);


        return res.status(200).json({
            success: true,
            message:
                "Contractor payment deleted successfully",
            data: payment
        });

    } catch (error) {

        if (
            error.message ===
            "Contractor payment not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to delete contractor payment"
        });
    }
};


module.exports = {
    createContractorPayment,
    getAllContractorPayments,
    getContractorPaymentById,
    updateContractorPayment,
    deleteContractorPayment
};