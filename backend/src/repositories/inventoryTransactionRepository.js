const pool = require("../config/database");


// CREATE TRANSACTION
const createTransaction = async ({
    warehouse_id,
    item_id,
    transaction_type,
    quantity,
    site_id,
    material_issuance_request_id,
    reference,
    notes,
    recorded_by
}, client = pool) => {

    const result = await client.query(
        `
        INSERT INTO inventory_transactions (
            warehouse_id,
            item_id,
            transaction_type,
            quantity,
            site_id,
            material_issuance_request_id,
            reference,
            notes,
            recorded_by
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9
        )

        RETURNING
            id,
            warehouse_id,
            item_id,
            transaction_type,
            quantity,
            site_id,
            material_issuance_request_id,
            reference,
            notes,
            transaction_date,
            recorded_by
        `,
        [
            warehouse_id,
            item_id,
            transaction_type,
            quantity,
            site_id ?? null,
            material_issuance_request_id ?? null,
            reference ?? null,
            notes ?? null,
            recorded_by ?? null
        ]
    );

    return result.rows[0];
};


// GET ALL
const findAllTransactions = async () => {

    const result = await pool.query(
        `
        SELECT
            t.id,

            t.warehouse_id,
            w.name AS warehouse_name,

            t.item_id,
            i.name AS item_name,
            i.unit,

            t.transaction_type,
            t.quantity,

            t.site_id,
            s.name AS site_name,

            t.material_issuance_request_id,
            t.reference,
            t.notes,
            t.transaction_date,

            t.recorded_by,
            u.full_name AS recorded_by_name

        FROM inventory_transactions t

        INNER JOIN warehouses w
            ON t.warehouse_id = w.id

        INNER JOIN inventory_items i
            ON t.item_id = i.id

        LEFT JOIN sites s
            ON t.site_id = s.id

        LEFT JOIN users u
            ON t.recorded_by = u.id

        ORDER BY t.id DESC
        `
    );

    return result.rows;
};


// GET ONE
const findTransactionById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            t.id,

            t.warehouse_id,
            w.name AS warehouse_name,

            t.item_id,
            i.name AS item_name,
            i.unit,

            t.transaction_type,
            t.quantity,

            t.site_id,
            s.name AS site_name,

            t.material_issuance_request_id,
            t.reference,
            t.notes,
            t.transaction_date,

            t.recorded_by,
            u.full_name AS recorded_by_name

        FROM inventory_transactions t

        INNER JOIN warehouses w
            ON t.warehouse_id = w.id

        INNER JOIN inventory_items i
            ON t.item_id = i.id

        LEFT JOIN sites s
            ON t.site_id = s.id

        LEFT JOIN users u
            ON t.recorded_by = u.id

        WHERE t.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// CHECK WAREHOUSE
const warehouseExists = async (
    warehouseId,
    client = pool
) => {

    const result = await client.query(
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
const itemExists = async (
    itemId,
    client = pool
) => {

    const result = await client.query(
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


// CHECK SITE
const siteExists = async (
    siteId,
    client = pool
) => {

    if (siteId == null) {
        return true;
    }

    const result = await client.query(
        `
        SELECT id
        FROM sites
        WHERE id = $1
        LIMIT 1
        `,
        [siteId]
    );

    return result.rows.length > 0;
};


// GET STOCK WITH LOCK
const getStockForUpdate = async (
    warehouseId,
    itemId,
    client
) => {

    const result = await client.query(
        `
        SELECT
            id,
            warehouse_id,
            item_id,
            quantity
        FROM warehouse_stock

        WHERE warehouse_id = $1
        AND item_id = $2

        FOR UPDATE
        `,
        [
            warehouseId,
            itemId
        ]
    );

    return result.rows[0] || null;
};


// CREATE STOCK RECORD
const createStockRecord = async (
    warehouseId,
    itemId,
    quantity,
    client
) => {

    const result = await client.query(
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
            warehouseId,
            itemId,
            quantity
        ]
    );

    return result.rows[0];
};


// UPDATE STOCK
const updateStockQuantity = async (
    stockId,
    quantity,
    client
) => {

    const result = await client.query(
        `
        UPDATE warehouse_stock

        SET
            quantity = $1,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING
            id,
            warehouse_id,
            item_id,
            quantity,
            updated_at
        `,
        [
            quantity,
            stockId
        ]
    );

    return result.rows[0];
};


module.exports = {
    createTransaction,
    findAllTransactions,
    findTransactionById,
    warehouseExists,
    itemExists,
    siteExists,
    getStockForUpdate,
    createStockRecord,
    updateStockQuantity
};