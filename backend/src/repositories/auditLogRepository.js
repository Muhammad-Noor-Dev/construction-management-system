const pool = require("../config/database");

// CREATE AUDIT LOG
const createLog = async ({
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
}) => {
    const result = await pool.query(
        `
        INSERT INTO audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            user_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values,
            created_at
        `,
        [
            user_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values
        ]
    );

    return result.rows[0];
};

// GET ALL
const findAllLogs = async () => {
    const result = await pool.query(
        `
        SELECT
            al.id,
            al.user_id,
            u.full_name AS user_name,
            al.action,
            al.table_name,
            al.record_id,
            al.old_values,
            al.new_values,
            al.created_at
        FROM audit_logs al
        LEFT JOIN users u
            ON al.user_id = u.id
        ORDER BY al.created_at DESC, al.id DESC
        `
    );

    return result.rows;
};

// GET ONE
const findLogById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            al.id,
            al.user_id,
            u.full_name AS user_name,
            al.action,
            al.table_name,
            al.record_id,
            al.old_values,
            al.new_values,
            al.created_at
        FROM audit_logs al
        LEFT JOIN users u
            ON al.user_id = u.id
        WHERE al.id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};

// GET BY USER
const findLogsByUserId = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            al.id,
            al.user_id,
            u.full_name AS user_name,
            al.action,
            al.table_name,
            al.record_id,
            al.old_values,
            al.new_values,
            al.created_at
        FROM audit_logs al
        LEFT JOIN users u
            ON al.user_id = u.id
        WHERE al.user_id = $1
        ORDER BY al.created_at DESC, al.id DESC
        `,
        [userId]
    );

    return result.rows;
};

// GET BY TABLE
const findLogsByTable = async (tableName) => {
    const result = await pool.query(
        `
        SELECT
            al.id,
            al.user_id,
            u.full_name AS user_name,
            al.action,
            al.table_name,
            al.record_id,
            al.old_values,
            al.new_values,
            al.created_at
        FROM audit_logs al
        LEFT JOIN users u
            ON al.user_id = u.id
        WHERE al.table_name = $1
        ORDER BY al.created_at DESC, al.id DESC
        `,
        [tableName]
    );

    return result.rows;
};

// CHECK USER
const findUserById = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            full_name,
            email
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0] || null;
};

module.exports = {
    createLog,
    findAllLogs,
    findLogById,
    findLogsByUserId,
    findLogsByTable,
    findUserById
};