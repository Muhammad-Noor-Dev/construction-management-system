const pool = require("../config/database");


// CREATE ITEM
const createItem = async ({
    request_id,
    item_id,
    quantity
}) => {

    const result = await pool.query(
        `
        INSERT INTO material_issuance_items (
            request_id,
            item_id,
            quantity
        )
        VALUES ($1, $2, $3)

        RETURNING
            id,
            request_id,
            item_id,
            quantity
        `,
        [
            request_id,
            item_id,
            quantity
        ]
    );

    return result.rows[0];
};


// GET ALL ITEMS
const findAllItems = async () => {

    const result = await pool.query(
        `
        SELECT
            mii.id,

            mii.request_id,

            mii.item_id,
            ii.name AS item_name,
            ii.unit AS item_unit,

            mii.quantity

        FROM material_issuance_items mii

        INNER JOIN inventory_items ii
            ON mii.item_id = ii.id

        ORDER BY mii.id DESC
        `
    );

    return result.rows;
};


// GET ITEMS BY REQUEST
const findItemsByRequestId = async (
    requestId
) => {

    const result = await pool.query(
        `
        SELECT
            mii.id,

            mii.request_id,

            mii.item_id,
            ii.name AS item_name,
            ii.unit AS item_unit,

            mii.quantity

        FROM material_issuance_items mii

        INNER JOIN inventory_items ii
            ON mii.item_id = ii.id

        WHERE mii.request_id = $1

        ORDER BY mii.id
        `,
        [requestId]
    );

    return result.rows;
};


// GET ONE
const findItemById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            mii.id,

            mii.request_id,

            mii.item_id,
            ii.name AS item_name,
            ii.unit AS item_unit,

            mii.quantity

        FROM material_issuance_items mii

        INNER JOIN inventory_items ii
            ON mii.item_id = ii.id

        WHERE mii.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// CHECK REQUEST
const findRequest = async (
    requestId
) => {

    const result = await pool.query(
        `
        SELECT
            id,
            site_id,
            warehouse_id,
            requested_by,
            approved_by,
            status,
            rejection_reason,
            requested_at,
            reviewed_at

        FROM material_issuance_requests

        WHERE id = $1

        LIMIT 1
        `,
        [requestId]
    );

    return result.rows[0] || null;
};


// CHECK INVENTORY ITEM
const findInventoryItem = async (
    itemId
) => {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            unit,
            category_id,
            threshold

        FROM inventory_items

        WHERE id = $1

        LIMIT 1
        `,
        [itemId]
    );

    return result.rows[0] || null;
};


// DELETE ITEM
const deleteItem = async (
    id
) => {

    const result = await pool.query(
        `
        DELETE FROM material_issuance_items

        WHERE id = $1

        RETURNING
            id,
            request_id,
            item_id,
            quantity
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createItem,
    findAllItems,
    findItemsByRequestId,
    findItemById,
    findRequest,
    findInventoryItem,
    deleteItem
};