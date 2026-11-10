const pool = require("../config/database");

// CREATE
const createSetting = async ({
    setting_key,
    setting_value,
    description,
    updated_by
}) => {
    const result = await pool.query(
        `
        INSERT INTO system_settings (
            setting_key,
            setting_value,
            description,
            updated_by
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            setting_key,
            setting_value,
            description,
            updated_by,
            updated_at
        `,
        [
            setting_key,
            setting_value,
            description ?? null,
            updated_by ?? null
        ]
    );

    return result.rows[0];
};

// GET ALL
const findAllSettings = async () => {
    const result = await pool.query(
        `
        SELECT
            ss.id,
            ss.setting_key,
            ss.setting_value,
            ss.description,
            ss.updated_by,
            u.full_name AS updated_by_name,
            ss.updated_at
        FROM system_settings ss
        LEFT JOIN users u
            ON ss.updated_by = u.id
        ORDER BY ss.setting_key ASC
        `
    );

    return result.rows;
};

// GET BY KEY
const findSettingByKey = async (settingKey) => {
    const result = await pool.query(
        `
        SELECT
            ss.id,
            ss.setting_key,
            ss.setting_value,
            ss.description,
            ss.updated_by,
            u.full_name AS updated_by_name,
            ss.updated_at
        FROM system_settings ss
        LEFT JOIN users u
            ON ss.updated_by = u.id
        WHERE ss.setting_key = $1
        LIMIT 1
        `,
        [settingKey]
    );

    return result.rows[0] || null;
};

// GET BY ID
const findSettingById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            ss.id,
            ss.setting_key,
            ss.setting_value,
            ss.description,
            ss.updated_by,
            u.full_name AS updated_by_name,
            ss.updated_at
        FROM system_settings ss
        LEFT JOIN users u
            ON ss.updated_by = u.id
        WHERE ss.id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};

// UPDATE BY KEY
const updateSetting = async (
    settingKey,
    {
        setting_value,
        description,
        updated_by
    }
) => {
    const result = await pool.query(
        `
        UPDATE system_settings
        SET
            setting_value = $1,
            description = $2,
            updated_by = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE setting_key = $4
        RETURNING
            id,
            setting_key,
            setting_value,
            description,
            updated_by,
            updated_at
        `,
        [
            setting_value,
            description ?? null,
            updated_by ?? null,
            settingKey
        ]
    );

    return result.rows[0] || null;
};

// DELETE BY KEY
const deleteSetting = async (settingKey) => {
    const result = await pool.query(
        `
        DELETE FROM system_settings
        WHERE setting_key = $1
        RETURNING
            id,
            setting_key,
            setting_value,
            description,
            updated_by,
            updated_at
        `,
        [settingKey]
    );

    return result.rows[0] || null;
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
    createSetting,
    findAllSettings,
    findSettingByKey,
    findSettingById,
    updateSetting,
    deleteSetting,
    findUserById
};