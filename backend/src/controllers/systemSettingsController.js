const service =
    require("../services/systemSettingsService");

// CREATE
const createSetting = async (req, res) => {

    try {

        const setting =
            await service.createSetting(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "System setting created successfully",
            data: setting
        });

    } catch (error) {

        console.error(
            "Create system setting error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL
const getAllSettings = async (req, res) => {

    try {

        const settings =
            await service.getAllSettings();

        return res.status(200).json({
            success: true,
            count: settings.length,
            data: settings
        });

    } catch (error) {

        console.error(
            "Get system settings error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve system settings"
        });
    }
};

// GET BY KEY
const getSettingByKey = async (req, res) => {

    try {

        const setting =
            await service.getSettingByKey(
                req.params.settingKey
            );

        return res.status(200).json({
            success: true,
            data: setting
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// GET BY ID
const getSettingById = async (req, res) => {

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
                    "Invalid setting ID"
            });
        }

        const setting =
            await service.getSettingById(id);

        return res.status(200).json({
            success: true,
            data: setting
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE
const updateSetting = async (req, res) => {

    try {

        const setting =
            await service.updateSetting(
                req.params.settingKey,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "System setting updated successfully",
            data: setting
        });

    } catch (error) {

        console.error(
            "Update system setting error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE
const deleteSetting = async (req, res) => {

    try {

        const setting =
            await service.deleteSetting(
                req.params.settingKey
            );

        return res.status(200).json({
            success: true,
            message:
                "System setting deleted successfully",
            data: setting
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createSetting,
    getAllSettings,
    getSettingByKey,
    getSettingById,
    updateSetting,
    deleteSetting
};