const service =
    require("../services/contractorService");


// CREATE
const createContractor = async (req, res) => {

    try {

        const contractor =
            await service.createContractor(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Contractor created successfully",
            data: contractor
        });

    } catch (error) {

        console.error(
            "Create contractor error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllContractors = async (req, res) => {

    try {

        const contractors =
            await service.getAllContractors();

        return res.status(200).json({
            success: true,
            count: contractors.length,
            data: contractors
        });

    } catch (error) {

        console.error(
            "Get contractors error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve contractors"
        });
    }
};


// GET ONE
const getContractorById = async (req, res) => {

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
                    "Invalid contractor ID"
            });
        }

        const contractor =
            await service.getContractorById(id);

        return res.status(200).json({
            success: true,
            data: contractor
        });

    } catch (error) {

        if (
            error.message ===
            "Contractor not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve contractor"
        });
    }
};


// UPDATE
const updateContractor = async (req, res) => {

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
                    "Invalid contractor ID"
            });
        }

        const contractor =
            await service.updateContractor(
                id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Contractor updated successfully",
            data: contractor
        });

    } catch (error) {

        if (
            error.message ===
            "Contractor not found"
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
const deleteContractor = async (req, res) => {

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
                    "Invalid contractor ID"
            });
        }

        const contractor =
            await service.deleteContractor(id);

        return res.status(200).json({
            success: true,
            message:
                "Contractor deleted successfully",
            data: contractor
        });

    } catch (error) {

        if (
            error.message ===
            "Contractor not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete contractor"
        });
    }
};


module.exports = {
    createContractor,
    getAllContractors,
    getContractorById,
    updateContractor,
    deleteContractor
};