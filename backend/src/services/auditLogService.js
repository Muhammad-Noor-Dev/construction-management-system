const repository =
    require("../repositories/auditLogRepository");

// CREATE
const createLog = async (data) => {

    // user_id is optional because the database allows NULL
    if (data.user_id !== undefined && data.user_id !== null) {

        const user =
            await repository.findUserById(
                data.user_id
            );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }
    }

    return repository.createLog({
        user_id:
            data.user_id ?? null,

        action:
            data.action,

        table_name:
            data.table_name,

        record_id:
            data.record_id ?? null,

        old_values:
            data.old_values ?? null,

        new_values:
            data.new_values ?? null
    });
};

// GET ALL
const getAllLogs = async () => {
    return repository.findAllLogs();
};

// GET ONE
const getLogById = async (id) => {

    const log =
        await repository.findLogById(id);

    if (!log) {
        throw new Error(
            "Audit log not found"
        );
    }

    return log;
};

// GET BY USER
const getLogsByUser = async (userId) => {

    const user =
        await repository.findUserById(
            userId
        );

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    return repository.findLogsByUserId(
        userId
    );
};

// GET BY TABLE
const getLogsByTable = async (
    tableName
) => {

    return repository.findLogsByTable(
        tableName
    );
};

module.exports = {
    createLog,
    getAllLogs,
    getLogById,
    getLogsByUser,
    getLogsByTable
};