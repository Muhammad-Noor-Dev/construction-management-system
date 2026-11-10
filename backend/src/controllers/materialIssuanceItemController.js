const service =
    require("../services/materialIssuanceItemService");


// CREATE
const createItem = async (
    req,
    res
) => {

    try {

        const item =
            await service.createItem(
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "Material issuance item added successfully",

            data: item
        });

    } catch (error) {

        console.error(
            "Create issuance item error:",
            error.message
        );


        // PostgreSQL UNIQUE violation
        if (error.code === "23505") {

            return res.status(409).json({

                success: false,

                message:
                    "This inventory item is already added to this request"
            });
        }


        return res.status(400).json({

            success: false,

            message: error.message
        });
    }
};


// GET ALL
const getAllItems = async (
    req,
    res
) => {

    try {

        const items =
            await service.getAllItems();


        return res.status(200).json({

            success: true,

            count: items.length,

            data: items
        });

    } catch (error) {

        console.error(
            "Get issuance items error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve material issuance items"
        });
    }
};


// GET BY REQUEST
const getItemsByRequest = async (
    req,
    res
) => {

    try {

        const requestId =
            Number(req.params.requestId);


        if (
            !Number.isInteger(requestId) ||
            requestId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid request ID"
            });
        }


        const items =
            await service.getItemsByRequest(
                requestId
            );


        return res.status(200).json({

            success: true,

            count: items.length,

            data: items
        });

    } catch (error) {

        if (
            error.message ===
            "Material issuance request not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve request items"
        });
    }
};


// GET ONE
const getItemById = async (
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
                    "Invalid material issuance item ID"
            });
        }


        const item =
            await service.getItemById(id);


        return res.status(200).json({

            success: true,

            data: item
        });

    } catch (error) {

        return res.status(404).json({

            success: false,

            message: error.message
        });
    }
};


// DELETE
const deleteItem = async (
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
                    "Invalid material issuance item ID"
            });
        }


        const item =
            await service.deleteItem(id);


        return res.status(200).json({

            success: true,

            message:
                "Material issuance item removed successfully",

            data: item
        });

    } catch (error) {

        if (
            error.message ===
            "Material issuance item not found"
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


module.exports = {
    createItem,
    getAllItems,
    getItemsByRequest,
    getItemById,
    deleteItem
};