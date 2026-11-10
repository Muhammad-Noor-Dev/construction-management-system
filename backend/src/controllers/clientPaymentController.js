const service =
    require("../services/clientPaymentService");


// CREATE
const createClientPayment = async (
    req,
    res
) => {

    try {

        const data = {
            ...req.body,
            recordedBy: req.user.userId
        };


        const payment =
            await service.createClientPayment(data);


        return res.status(201).json({
            success: true,
            message:
                "Client payment recorded successfully",
            data: payment
        });

    } catch (error) {

        console.error(
            "Create client payment error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllClientPayments = async (
    req,
    res
) => {

    try {

        const payments =
            await service.getAllClientPayments();


        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });

    } catch (error) {

        console.error(
            "Get client payments error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve client payments"
        });
    }
};


// GET ONE
const getClientPaymentById = async (
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
                    "Invalid client payment ID"
            });
        }


        const payment =
            await service.getClientPaymentById(id);


        return res.status(200).json({
            success: true,
            data: payment
        });

    } catch (error) {

        if (
            error.message ===
            "Client payment not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve client payment"
        });
    }
};


// UPDATE
const updateClientPayment = async (
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
                    "Invalid client payment ID"
            });
        }


        const payment =
            await service.updateClientPayment(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message:
                "Client payment updated successfully",
            data: payment
        });

    } catch (error) {

        if (
            error.message ===
            "Client payment not found"
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
const deleteClientPayment = async (
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
                    "Invalid client payment ID"
            });
        }


        const payment =
            await service.deleteClientPayment(id);


        return res.status(200).json({
            success: true,
            message:
                "Client payment deleted successfully",
            data: payment
        });

    } catch (error) {

        if (
            error.message ===
            "Client payment not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to delete client payment"
        });
    }
};


module.exports = {
    createClientPayment,
    getAllClientPayments,
    getClientPaymentById,
    updateClientPayment,
    deleteClientPayment
};