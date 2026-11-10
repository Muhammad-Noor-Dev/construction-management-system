const pool = require("../config/database");


// CREATE
const createItem = async ({
    name,
    unit,
    category_id,
    threshold,
    unit_cost = 0
}) => {

    const result = await pool.query(
        `
        INSERT INTO inventory_items (
            name,
            unit,
            category_id,
            threshold,
            unit_cost
        )
        VALUES ($1, $2, $3, $4, $5)

        RETURNING
            id,
            name,
            unit,
            category_id,
            threshold,
            unit_cost,
            created_at,
            updated_at
        `,
        [
            name,
            unit,
            category_id,
            threshold,
            unit_cost
        ]
    );

    return result.rows[0];
};


// GET ALL
const findAllItems = async () => {

    const result = await pool.query(
        `
        SELECT
            i.id,
            i.name,
            i.unit,
            i.category_id,
            c.name AS category_name,
            i.threshold,
            i.unit_cost,
            i.created_at,
            i.updated_at

        FROM inventory_items i

        INNER JOIN inventory_categories c
            ON i.category_id = c.id

        ORDER BY i.id DESC
        `
    );

    return result.rows;
};


// GET ONE
const findItemById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            i.id,
            i.name,
            i.unit,
            i.category_id,
            c.name AS category_name,
            i.threshold,
            i.unit_cost,
            i.created_at,
            i.updated_at

        FROM inventory_items i

        INNER JOIN inventory_categories c
            ON i.category_id = c.id

        WHERE i.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// CHECK ITEM NAME
const itemNameExists = async (
    name,
    excludeId = null
) => {

    const result = await pool.query(
        `
        SELECT id
        FROM inventory_items

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


// CHECK CATEGORY
const categoryExists = async (categoryId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM inventory_categories

        WHERE id = $1

        LIMIT 1
        `,
        [categoryId]
    );

    return result.rows.length > 0;
};


// UPDATE
const updateItem = async (
    id,
    {
        name,
        unit,
        category_id,
        threshold,
        unit_cost = 0
    }
) => {

    const result = await pool.query(
        `
        UPDATE inventory_items

        SET
            name = $1,
            unit = $2,
            category_id = $3,
            threshold = $4,
            unit_cost = $5,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $6

        RETURNING
            id,
            name,
            unit,
            category_id,
            threshold,
            unit_cost,
            created_at,
            updated_at
        `,
        [
            name,
            unit,
            category_id,
            threshold,
            unit_cost,
            id
        ]
    );

    return result.rows[0] || null;
};


// DELETE
const deleteItem = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM inventory_items

        WHERE id = $1

        RETURNING
            id,
            name,
            unit,
            category_id,
            threshold,
            unit_cost,
            created_at,
            updated_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createItem,
    findAllItems,
    findItemById,
    itemNameExists,
    categoryExists,
    updateItem,
    deleteItem
};