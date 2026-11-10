const service =
    require("../services/contractorRatingService");


// CREATE
const createContractorRating = async (
    req,
    res
) => {

    try {

        const data = {
            ...req.body,
            createdBy: req.user.userId
        };


        const rating =
            await service.createContractorRating(
                data
            );


        return res.status(201).json({
            success: true,
            message:
                "Contractor rating created successfully",
            data: rating
        });

    } catch (error) {

        console.error(
            "Create contractor rating error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllContractorRatings = async (
    req,
    res
) => {

    try {

        const ratings =
            await service.getAllContractorRatings();


        return res.status(200).json({
            success: true,
            count: ratings.length,
            data: ratings
        });

    } catch (error) {

        console.error(
            "Get contractor ratings error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve contractor ratings"
        });
    }
};


// GET ONE
const getContractorRatingById = async (
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
                    "Invalid contractor rating ID"
            });
        }


        const rating =
            await service.getContractorRatingById(
                id
            );


        return res.status(200).json({
            success: true,
            data: rating
        });

    } catch (error) {

        if (
            error.message ===
            "Contractor rating not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve contractor rating"
        });
    }
};


// UPDATE
const updateContractorRating = async (
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
                    "Invalid contractor rating ID"
            });
        }


        const rating =
            await service.updateContractorRating(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message:
                "Contractor rating updated successfully",
            data: rating
        });

    } catch (error) {

        if (
            error.message ===
            "Contractor rating not found"
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
const deleteContractorRating = async (
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
                    "Invalid contractor rating ID"
            });
        }


        const rating =
            await service.deleteContractorRating(
                id
            );


        return res.status(200).json({
            success: true,
            message:
                "Contractor rating deleted successfully",
            data: rating
        });

    } catch (error) {

        if (
            error.message ===
            "Contractor rating not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to delete contractor rating"
        });
    }
};


module.exports = {
    createContractorRating,
    getAllContractorRatings,
    getContractorRatingById,
    updateContractorRating,
    deleteContractorRating
};