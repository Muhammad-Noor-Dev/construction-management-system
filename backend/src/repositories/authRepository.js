const pool =
    require("../config/database");


const findUserByEmail = async (email) => {

    const result = await pool.query(
        `
        SELECT
            u.id,
            u.full_name,
            u.email,
            u.password_hash,
            u.role_id,
            u.is_active,
            r.name AS role_name
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.id
        WHERE LOWER(u.email) = LOWER($1)
        LIMIT 1
        `,
        [email]
    );

    return result.rows[0] || null;
};


const findUserById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            u.id,
            u.full_name,
            u.email,
            u.role_id,
            u.is_active,
            r.name AS role_name
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


module.exports = {
    findUserByEmail,
    findUserById
};