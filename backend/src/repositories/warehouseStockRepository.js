const pool = require("../config/database");


// CREATE
const createStock = async ({
    warehouse_id,
    item_id,
    quantity
}) => {

    const result = await pool.query(
        `
        INSERT INTO warehouse_stock (
            warehouse_id,
            item_id,
            quantity
        )
        VALUES ($1, $2, $3)

        RETURNING
            id,
            warehouse_id,
            item_id,
            quantity,
            updated_at
        `,
        [
            warehouse_id,
            item_id,
            quantity
        ]
    );

    return result.rows[0];
};


// GET ALL
const findAllStock = async () => {

    const result = await pool.query(
        `
        SELECT
            ws.id,
            ws.warehouse_id,
            w.name AS warehouse_name,
            ws.item_id,
            i.name AS item_name,
            i.unit,
            ws.quantity,
            ws.updated_at

        FROM warehouse_stock ws

        INNER JOIN warehouses w
            ON ws.warehouse_id = w.id

        INNER JOIN inventory_items i
            ON ws.item_id = i.id

        ORDER BY ws.id DESC
        `
    );

    return result.rows;
};


// GET ONE
const findStockById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            ws.id,
            ws.warehouse_id,
            w.name AS warehouse_name,
            ws.item_id,
            i.name AS item_name,
            i.unit,
            ws.quantity,
            ws.updated_at

        FROM warehouse_stock ws

        INNER JOIN warehouses w
            ON ws.warehouse_id = w.id

        INNER JOIN inventory_items i
            ON ws.item_id = i.id

        WHERE ws.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// CHECK WAREHOUSE
const warehouseExists = async (warehouseId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM warehouses
        WHERE id = $1
        LIMIT 1
        `,
        [warehouseId]
    );

    return result.rows.length > 0;
};


// CHECK ITEM
const itemExists = async (itemId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM inventory_items
        WHERE id = $1
        LIMIT 1
        `,
        [itemId]
    );

    return result.rows.length > 0;
};


// CHECK DUPLICATE WAREHOUSE + ITEM
const stockExists = async (
    warehouseId,
    itemId,
    excludeId = null
) => {

    const result = await pool.query(
        `
        SELECT id
        FROM warehouse_stock

        WHERE warehouse_id = $1
        AND item_id = $2

        AND (
            $3::integer IS NULL
            OR id <> $3
        )

        LIMIT 1
        `,
        [
            warehouseId,
            itemId,
            excludeId
        ]
    );

    return result.rows.length > 0;
};


// UPDATE
const updateStock = async (
    id,
    {
        warehouse_id,
        item_id,
        quantity
    }
) => {

    const result = await pool.query(
        `
        UPDATE warehouse_stock

        SET
            warehouse_id = $1,
            item_id = $2,
            quantity = $3,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $4

        RETURNING
            id,
            warehouse_id,
            item_id,
            quantity,
            updated_at
        `,
        [
            warehouse_id,
            item_id,
            quantity,
            id
        ]
    );

    return result.rows[0] || null;
};


// DELETE
const deleteStock = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM warehouse_stock

        WHERE id = $1

        RETURNING
            id,
            warehouse_id,
            item_id,
            quantity,
            updated_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createStock,
    findAllStock,
    findStockById,
    warehouseExists,
    itemExists,
    stockExists,
    updateStock,
    deleteStock
};