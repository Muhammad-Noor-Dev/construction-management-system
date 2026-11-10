const auditLogRepository = require("../repositories/auditLogRepository");

const logAudit = async ({
    userId = null,
    action,
    tableName,
    recordId = null,
    oldValues = null,
    newValues = null
}) => {
    try {
        await auditLogRepository.createLog({
            user_id: userId,
            action,
            table_name: tableName,
            record_id: recordId,
            old_values: oldValues,
            new_values: newValues
        });
    } catch (error) {
        // Audit failure should not break the main business operation
        console.error("Audit logging failed:", error.message);
    }
};

module.exports = logAudit;