const pool =
    require("../config/database");


const getAllUsers = async () => {

    const result = await pool.query(
        `
        SELECT
            u.id,
            u.full_name,
            u.email,
            u.role_id,
            r.name AS role_name,
            u.is_active,
            u.created_at,
            u.updated_at
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.id
        ORDER BY u.id DESC
        `
    );

    return result.rows;
};


const findUserById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            u.id,
            u.full_name,
            u.email,
            u.role_id,
            r.name AS role_name,
            u.is_active,
            u.created_at,
            u.updated_at
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.id
        WHERE u.id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


const findUserByEmail = async (
    email,
    excludeId = null
) => {

    let query = `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
    `;

    const values = [email];

    if (excludeId !== null) {
        query += ` AND id <> $2`;
        values.push(excludeId);
    }

    query += ` LIMIT 1`;

    const result =
        await pool.query(query, values);

    return result.rows[0] || null;
};


const roleExists = async (roleId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM roles
        WHERE id = $1
        LIMIT 1
        `,
        [roleId]
    );

    return result.rows.length > 0;
};


const createUser = async ({
    fullName,
    email,
    passwordHash,
    roleId,
    isActive
}) => {

    const result = await pool.query(
        `
        INSERT INTO users (
            full_name,
            email,
            password_hash,
            role_id,
            is_active
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            full_name,
            email,
            role_id,
            is_active,
            created_at,
            updated_at
        `,
        [
            fullName,
            email,
            passwordHash,
            roleId,
            isActive ?? true
        ]
    );

    return result.rows[0];
};


const updateUser = async (
    id,
    {
        fullName,
        email,
        roleId,
        isActive
    }
) => {

    const result = await pool.query(
        `
        UPDATE users
        SET
            full_name = $1,
            email = $2,
            role_id = $3,
            is_active = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING
            id,
            full_name,
            email,
            role_id,
            is_active,
            created_at,
            updated_at
        `,
        [
            fullName,
            email,
            roleId,
            isActive,
            id
        ]
    );

    return result.rows[0] || null;
};


const updatePassword = async (
    id,
    passwordHash
) => {

    const result = await pool.query(
        `
        UPDATE users
        SET
            password_hash = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id
        `,
        [
            passwordHash,
            id
        ]
    );

    return result.rows[0] || null;
};


const deactivateUser = async (id) => {

    const result = await pool.query(
        `
        UPDATE users
        SET
            is_active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
            id,
            full_name,
            email,
            role_id,
            is_active
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    getAllUsers,
    findUserById,
    findUserByEmail,
    roleExists,
    createUser,
    updateUser,
    updatePassword,
    deactivateUser
};