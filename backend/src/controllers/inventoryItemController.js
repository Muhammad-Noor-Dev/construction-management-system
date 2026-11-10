const service =
    require("../services/inventoryItemService");


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
                "Inventory item created successfully",

            data: item
        });

    } catch (error) {

        console.error(
            "Create inventory item error:",
            error.message
        );


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
            "Get inventory items error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve inventory items"
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
                    "Invalid inventory item ID"
            });
        }


        const item =
            await service.getItemById(id);


        return res.status(200).json({

            success: true,

            data: item
        });

    } catch (error) {

        if (
            error.message ===
            "Inventory item not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve inventory item"
        });
    }
};


// UPDATE
const updateItem = async (
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
                    "Invalid inventory item ID"
            });
        }


        const item =
            await service.updateItem(
                id,
                req.body
            );


        return res.status(200).json({

            success: true,

            message:
                "Inventory item updated successfully",

            data: item
        });

    } catch (error) {

        if (
            error.message ===
            "Inventory item not found"
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
                    "Invalid inventory item ID"
            });
        }


        const item =
            await service.deleteItem(id);


        return res.status(200).json({

            success: true,

            message:
                "Inventory item deleted successfully",

            data: item
        });

    } catch (error) {

        if (
            error.message ===
            "Inventory item not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete inventory item"
        });
    }
};


module.exports = {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
};