const pool = require("../config/database");


// CREATE
const createWarehouse = async ({
    name,
    location
}) => {

    const result = await pool.query(
        `
        INSERT INTO warehouses (
            name,
            location
        )
        VALUES ($1, $2)

        RETURNING
            id,
            name,
            location,
            created_at,
            updated_at
        `,
        [
            name,
            location
        ]
    );

    return result.rows[0];
};


// GET ALL
const findAllWarehouses = async () => {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            location,
            created_at,
            updated_at

        FROM warehouses

        ORDER BY id DESC
        `
    );

    return result.rows;
};


// GET ONE
const findWarehouseById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            location,
            created_at,
            updated_at

        FROM warehouses

        WHERE id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// CHECK NAME
const warehouseNameExists = async (
    name,
    excludeId = null
) => {

    const result = await pool.query(
        `
        SELECT id
        FROM warehouses

        WHERE LOWER(name) = LOWER($1)

        AND (
            $2::integer IS NULL
            OR id <> $2
        )

        LIMIT 1
        `,
        [
            name,
            excludeId
        ]
    );

    return result.rows.length > 0;
};


// UPDATE
const updateWarehouse = async (
    id,
    {
        name,
        location
    }
) => {

    const result = await pool.query(
        `
        UPDATE warehouses

        SET
            name = $1,
            location = $2,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $3

        RETURNING
            id,
            name,
            location,
            created_at,
            updated_at
        `,
        [
            name,
            location,
            id
        ]
    );

    return result.rows[0] || null;
};


// DELETE
const deleteWarehouse = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM warehouses

        WHERE id = $1

        RETURNING
            id,
            name,
            location,
            created_at,
            updated_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createWarehouse,
    findAllWarehouses,
    findWarehouseById,
    warehouseNameExists,
    updateWarehouse,
    deleteWarehouse
};