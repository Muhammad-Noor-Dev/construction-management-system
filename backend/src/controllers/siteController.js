const siteService =
    require("../services/siteService");


const createSite = async (req, res) => {

    try {

        const site =
            await siteService.createSite(
                req.body
            );


        return res.status(201).json({
            success: true,
            message: "Site created successfully",
            data: site
        });

    } catch (error) {

        console.error(
            "Create site error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getAllSites = async (req, res) => {

    try {

        const sites =
            await siteService.getAllSites();


        return res.status(200).json({
            success: true,
            count: sites.length,
            data: sites
        });

    } catch (error) {

        console.error(
            "Get sites error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message: "Failed to retrieve sites"
        });
    }
};


const getSiteById = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid site ID"
            });
        }


        const site =
            await siteService.getSiteById(id);


        return res.status(200).json({
            success: true,
            data: site
        });

    } catch (error) {

        console.error(
            "Get site error:",
            error.message
        );


        if (
            error.message ===
            "Site not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message: "Failed to retrieve site"
        });
    }
};


const updateSite = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid site ID"
            });
        }


        const site =
            await siteService.updateSite(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message: "Site updated successfully",
            data: site
        });

    } catch (error) {

        console.error(
            "Update site error:",
            error.message
        );


        if (
            error.message ===
            "Site not found"
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


const deleteSite = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid site ID"
            });
        }


        const site =
            await siteService.deleteSite(id);


        return res.status(200).json({
            success: true,
            message: "Site deleted successfully",
            data: site
        });

    } catch (error) {

        console.error(
            "Delete site error:",
            error.message
        );


        if (
            error.message ===
            "Site not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message: "Failed to delete site"
        });
    }
};


module.exports = {
    createSite,
    getAllSites,
    getSiteById,
    updateSite,
    deleteSite
};