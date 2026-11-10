const service =
    require("../services/inventoryCategoryService");


// CREATE
const createCategory = async (
    req,
    res
) => {

    try {

        const category =
            await service.createCategory(
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "Inventory category created successfully",

            data: category
        });

    } catch (error) {

        console.error(
            "Create inventory category error:",
            error.message
        );


        return res.status(400).json({

            success: false,

            message: error.message
        });
    }
};


// GET ALL
const getAllCategories = async (
    req,
    res
) => {

    try {

        const categories =
            await service.getAllCategories();


        return res.status(200).json({

            success: true,

            count: categories.length,

            data: categories
        });

    } catch (error) {

        console.error(
            "Get inventory categories error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve inventory categories"
        });
    }
};


// GET ONE
const getCategoryById = async (
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
                    "Invalid inventory category ID"
            });
        }


        const category =
            await service.getCategoryById(id);


        return res.status(200).json({

            success: true,

            data: category
        });

    } catch (error) {

        if (
            error.message ===
            "Inventory category not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve inventory category"
        });
    }
};


// UPDATE
const updateCategory = async (
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
                    "Invalid inventory category ID"
            });
        }


        const category =
            await service.updateCategory(
                id,
                req.body
            );


        return res.status(200).json({

            success: true,

            message:
                "Inventory category updated successfully",

            data: category
        });

    } catch (error) {

        if (
            error.message ===
            "Inventory category not found"
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
const deleteCategory = async (
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
                    "Invalid inventory category ID"
            });
        }


        const category =
            await service.deleteCategory(id);


        return res.status(200).json({

            success: true,

            message:
                "Inventory category deleted successfully",

            data: category
        });

    } catch (error) {

        if (
            error.message ===
            "Inventory category not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete inventory category"
        });
    }
};


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};