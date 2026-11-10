const pool = require("../config/database");


// CREATE
const createCategory = async ({ name }) => {

    const result = await pool.query(
        `
        INSERT INTO inventory_categories (
            name
        )
        VALUES ($1)

        RETURNING
            id,
            name,
            created_at
        `,
        [name]
    );

    return result.rows[0];
};


// GET ALL
const findAllCategories = async () => {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            created_at

        FROM inventory_categories

        ORDER BY id DESC
        `
    );

    return result.rows;
};


// GET ONE
const findCategoryById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            created_at

        FROM inventory_categories

        WHERE id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// CHECK NAME
const categoryNameExists = async (
    name,
    excludeId = null
) => {

    const result = await pool.query(
        `
        SELECT id
        FROM inventory_categories

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
const updateCategory = async (
    id,
    { name }
) => {

    const result = await pool.query(
        `
        UPDATE inventory_categories

        SET name = $1

        WHERE id = $2

        RETURNING
            id,
            name,
            created_at
        `,
        [
            name,
            id
        ]
    );

    return result.rows[0] || null;
};


// DELETE
const deleteCategory = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM inventory_categories

        WHERE id = $1

        RETURNING
            id,
            name,
            created_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createCategory,
    findAllCategories,
    findCategoryById,
    categoryNameExists,
    updateCategory,
    deleteCategory
};