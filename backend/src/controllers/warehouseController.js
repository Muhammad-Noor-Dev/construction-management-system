const service =
    require("../services/warehouseService");


// CREATE
const createWarehouse = async (
    req,
    res
) => {

    try {

        const warehouse =
            await service.createWarehouse(
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "Warehouse created successfully",

            data: warehouse
        });

    } catch (error) {

        console.error(
            "Create warehouse error:",
            error.message
        );


        return res.status(400).json({

            success: false,

            message: error.message
        });
    }
};


// GET ALL
const getAllWarehouses = async (
    req,
    res
) => {

    try {

        const warehouses =
            await service.getAllWarehouses();


        return res.status(200).json({

            success: true,

            count: warehouses.length,

            data: warehouses
        });

    } catch (error) {

        console.error(
            "Get warehouses error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve warehouses"
        });
    }
};


// GET ONE
const getWarehouseById = async (
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
                    "Invalid warehouse ID"
            });
        }


        const warehouse =
            await service.getWarehouseById(id);


        return res.status(200).json({

            success: true,

            data: warehouse
        });

    } catch (error) {

        if (
            error.message ===
            "Warehouse not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve warehouse"
        });
    }
};


// UPDATE
const updateWarehouse = async (
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
                    "Invalid warehouse ID"
            });
        }


        const warehouse =
            await service.updateWarehouse(
                id,
                req.body
            );


        return res.status(200).json({

            success: true,

            message:
                "Warehouse updated successfully",

            data: warehouse
        });

    } catch (error) {

        if (
            error.message ===
            "Warehouse not found"
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
const deleteWarehouse = async (
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
                    "Invalid warehouse ID"
            });
        }


        const warehouse =
            await service.deleteWarehouse(id);


        return res.status(200).json({

            success: true,

            message:
                "Warehouse deleted successfully",

            data: warehouse
        });

    } catch (error) {

        if (
            error.message ===
            "Warehouse not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete warehouse"
        });
    }
};


module.exports = {
    createWarehouse,
    getAllWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
};