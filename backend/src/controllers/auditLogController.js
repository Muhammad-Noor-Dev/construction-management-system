const service =
    require("../services/auditLogService");

// CREATE
const createLog = async (req, res) => {

    try {

        const log =
            await service.createLog(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Audit log created successfully",
            data: log
        });

    } catch (error) {

        console.error(
            "Create audit log error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL
const getAllLogs = async (req, res) => {

    try {

        const logs =
            await service.getAllLogs();

        return res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });

    } catch (error) {

        console.error(
            "Get audit logs error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve audit logs"
        });
    }
};

// GET ONE
const getLogById = async (req, res) => {

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
                    "Invalid audit log ID"
            });
        }

        const log =
            await service.getLogById(id);

        return res.status(200).json({
            success: true,
            data: log
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// GET BY USER
const getLogsByUser = async (req, res) => {

    try {

        const userId =
            Number(req.params.userId);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user ID"
            });
        }

        const logs =
            await service.getLogsByUser(
                userId
            );

        return res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// GET BY TABLE
const getLogsByTable = async (req, res) => {

    try {

        const tableName =
            req.params.tableName;

        if (!tableName) {

            return res.status(400).json({
                success: false,
                message:
                    "Table name is required"
            });
        }

        const logs =
            await service.getLogsByTable(
                tableName
            );

        return res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve audit logs"
        });
    }
};

module.exports = {
    createLog,
    getAllLogs,
    getLogById,
    getLogsByUser,
    getLogsByTable
};