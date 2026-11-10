const service =
    require("../services/siteMaterialRecordService");

// CREATE
const createRecord = async (req, res) => {

    try {

        const record =
            await service.createRecord(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Site material record created successfully",
            data: record
        });

    } catch (error) {

        console.error(
            "Create site material record error:",
            error.message
        );

        if (error.code === "23505") {

            return res.status(409).json({
                success: false,
                message:
                    "A material record already exists for this site and item"
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL
const getAllRecords = async (req, res) => {

    try {

        const records =
            await service.getAllRecords();

        return res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });

    } catch (error) {

        console.error(
            "Get site material records error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve site material records"
        });
    }
};

// GET ONE
const getRecordById = async (req, res) => {

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
                    "Invalid site material record ID"
            });
        }

        const record =
            await service.getRecordById(id);

        return res.status(200).json({
            success: true,
            data: record
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// GET BY SITE
const getRecordsBySite = async (req, res) => {

    try {

        const siteId =
            Number(req.params.siteId);

        if (
            !Number.isInteger(siteId) ||
            siteId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid site ID"
            });
        }

        const records =
            await service.getRecordsBySite(
                siteId
            );

        return res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });

    } catch (error) {

        if (error.message === "Site not found") {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve site material records"
        });
    }
};

// UPDATE
const updateRecord = async (req, res) => {

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
                    "Invalid site material record ID"
            });
        }

        const record =
            await service.updateRecord(
                id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Site material record updated successfully",
            data: record
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE
const deleteRecord = async (req, res) => {

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
                    "Invalid site material record ID"
            });
        }

        const record =
            await service.deleteRecord(id);

        return res.status(200).json({
            success: true,
            message:
                "Site material record deleted successfully",
            data: record
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createRecord,
    getAllRecords,
    getRecordById,
    getRecordsBySite,
    updateRecord,
    deleteRecord
};