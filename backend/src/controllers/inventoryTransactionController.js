const service =
    require("../services/inventoryTransactionService");


// CREATE
const createTransaction = async (
    req,
    res
) => {

    try {

        const data = {
            ...req.body,

            recorded_by:
                req.user.userId
        };


        const transaction =
            await service.createTransaction(
                data
            );


        return res.status(201).json({

            success: true,

            message:
                "Inventory transaction created successfully",

            data: transaction
        });

    } catch (error) {

        console.error(
            "Create inventory transaction error:",
            error.message
        );


        return res.status(400).json({

            success: false,

            message: error.message
        });
    }
};


// GET ALL
const getAllTransactions = async (
    req,
    res
) => {

    try {

        const transactions =
            await service.getAllTransactions();


        return res.status(200).json({

            success: true,

            count: transactions.length,

            data: transactions
        });

    } catch (error) {

        console.error(
            "Get inventory transactions error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve inventory transactions"
        });
    }
};


// GET ONE
const getTransactionById = async (
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
                    "Invalid inventory transaction ID"
            });
        }


        const transaction =
            await service.getTransactionById(
                id
            );


        return res.status(200).json({

            success: true,

            data: transaction
        });

    } catch (error) {

        if (
            error.message ===
            "Inventory transaction not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve inventory transaction"
        });
    }
};


module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById
};