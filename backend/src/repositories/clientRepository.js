const pool = require("../config/database");


const createClient = async ({
    name,
    email,
    phone,
    address
}) => {
    const result = await pool.query(
        `
        INSERT INTO clients (
            name,
            email,
            phone,
            address
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            name,
            email,
            phone,
            address,
            created_at,
            updated_at
        `,
        [
            name,
            email,
            phone,
            address
        ]
    );

    return result.rows[0];
};


const findAllClients = async () => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            phone,
            address,
            created_at,
            updated_at
        FROM clients
        ORDER BY id DESC
        `
    );

    return result.rows;
};


const findClientById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            phone,
            address,
            created_at,
            updated_at
        FROM clients
        WHERE id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


const findClientByEmail = async (email) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            phone,
            address,
            created_at,
            updated_at
        FROM clients
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [email]
    );

    return result.rows[0] || null;
};


const findProjectsUsingClient = async (clientId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name
        FROM projects
        WHERE client_id = $1
        ORDER BY id
        `,
        [clientId]
    );

    return result.rows;
};


const updateClient = async (
    id,
    {
        name,
        email,
        phone,
        address
    }
) => {
    const result = await pool.query(
        `
        UPDATE clients
        SET
            name = $1,
            email = $2,
            phone = $3,
            address = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING
            id,
            name,
            email,
            phone,
            address,
            created_at,
            updated_at
        `,
        [
            name,
            email,
            phone,
            address,
            id
        ]
    );

    return result.rows[0] || null;
};


const deleteClient = async (id) => {
    const result = await pool.query(
        `
        DELETE FROM clients
        WHERE id = $1
        RETURNING
            id,
            name,
            email,
            phone,
            address,
            created_at,
            updated_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createClient,
    findAllClients,
    findClientById,
    findClientByEmail,
    findProjectsUsingClient,
    updateClient,
    deleteClient
};