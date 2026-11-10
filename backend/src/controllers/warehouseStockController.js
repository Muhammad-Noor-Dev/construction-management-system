const service =
    require("../services/warehouseStockService");


// CREATE
const createStock = async (
    req,
    res
) => {

    try {

        const stock =
            await service.createStock(
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "Warehouse stock created successfully",

            data: stock
        });

    } catch (error) {

        console.error(
            "Create warehouse stock error:",
            error.message
        );


        return res.status(400).json({

            success: false,

            message: error.message
        });
    }
};


// GET ALL
const getAllStock = async (
    req,
    res
) => {

    try {

        const stock =
            await service.getAllStock();


        return res.status(200).json({

            success: true,

            count: stock.length,

            data: stock
        });

    } catch (error) {

        console.error(
            "Get warehouse stock error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve warehouse stock"
        });
    }
};


// GET ONE
const getStockById = async (
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
                    "Invalid warehouse stock ID"
            });
        }


        const stock =
            await service.getStockById(id);


        return res.status(200).json({

            success: true,

            data: stock
        });

    } catch (error) {

        if (
            error.message ===
            "Warehouse stock record not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve warehouse stock"
        });
    }
};


// UPDATE
const updateStock = async (
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
                    "Invalid warehouse stock ID"
            });
        }


        const stock =
            await service.updateStock(
                id,
                req.body
            );


        return res.status(200).json({

            success: true,

            message:
                "Warehouse stock updated successfully",

            data: stock
        });

    } catch (error) {

        if (
            error.message ===
            "Warehouse stock record not found"
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
const deleteStock = async (
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
                    "Invalid warehouse stock ID"
            });
        }


        const stock =
            await service.deleteStock(id);


        return res.status(200).json({

            success: true,

            message:
                "Warehouse stock deleted successfully",

            data: stock
        });

    } catch (error) {

        if (
            error.message ===
            "Warehouse stock record not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete warehouse stock"
        });
    }
};


module.exports = {
    createStock,
    getAllStock,
    getStockById,
    updateStock,
    deleteStock
};