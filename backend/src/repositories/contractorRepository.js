const pool = require("../config/database");


// Create contractor
const createContractor = async ({
    name,
    specialization,
    phone,
    email,
    address
}) => {

    const result = await pool.query(
        `
        INSERT INTO contractors (
            name,
            specialization,
            phone,
            email,
            address
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            name,
            specialization,
            phone,
            email,
            address,
            created_at,
            updated_at
        `,
        [
            name,
            specialization ?? null,
            phone ?? null,
            email ?? null,
            address ?? null
        ]
    );

    return result.rows[0];
};


// Get all contractors
const findAllContractors = async () => {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            specialization,
            phone,
            email,
            address,
            created_at,
            updated_at
        FROM contractors
        ORDER BY id DESC
        `
    );

    return result.rows;
};


// Get contractor by ID
const findContractorById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            specialization,
            phone,
            email,
            address,
            created_at,
            updated_at
        FROM contractors
        WHERE id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// Update contractor
const updateContractor = async (
    id,
    {
        name,
        specialization,
        phone,
        email,
        address
    }
) => {

    const result = await pool.query(
        `
        UPDATE contractors

        SET
            name = $1,
            specialization = $2,
            phone = $3,
            email = $4,
            address = $5,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $6

        RETURNING
            id,
            name,
            specialization,
            phone,
            email,
            address,
            created_at,
            updated_at
        `,
        [
            name,
            specialization ?? null,
            phone ?? null,
            email ?? null,
            address ?? null,
            id
        ]
    );

    return result.rows[0] || null;
};


// Delete contractor
const deleteContractor = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM contractors
        WHERE id = $1
        RETURNING
            id,
            name,
            specialization,
            phone,
            email,
            address
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createContractor,
    findAllContractors,
    findContractorById,
    updateContractor,
    deleteContractor
};