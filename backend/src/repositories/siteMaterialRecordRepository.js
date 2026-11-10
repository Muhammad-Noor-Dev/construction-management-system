const pool = require("../config/database");

// CREATE
const createRecord = async ({
    site_id,
    item_id,
    received_quantity,
    estimated_consumption,
    actual_consumption,
    waste_quantity
}) => {
    const result = await pool.query(
        `
        INSERT INTO site_material_records (
            site_id,
            item_id,
            received_quantity,
            estimated_consumption,
            actual_consumption,
            waste_quantity
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            site_id,
            item_id,
            received_quantity,
            estimated_consumption,
            actual_consumption,
            waste_quantity,
            updated_at
        `,
        [
            site_id,
            item_id,
            received_quantity,
            estimated_consumption,
            actual_consumption,
            waste_quantity
        ]
    );

    return result.rows[0];
};

// GET ALL
const findAllRecords = async () => {
    const result = await pool.query(
        `
        SELECT
            smr.id,
            smr.site_id,
            s.name AS site_name,
            smr.item_id,
            ii.name AS item_name,
            ii.unit AS item_unit,
            smr.received_quantity,
            smr.estimated_consumption,
            smr.actual_consumption,
            smr.waste_quantity,
            smr.updated_at
        FROM site_material_records smr
        INNER JOIN sites s
            ON smr.site_id = s.id
        INNER JOIN inventory_items ii
            ON smr.item_id = ii.id
        ORDER BY smr.id DESC
        `
    );

    return result.rows;
};

// GET ONE
const findRecordById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            smr.id,
            smr.site_id,
            s.name AS site_name,
            smr.item_id,
            ii.name AS item_name,
            ii.unit AS item_unit,
            smr.received_quantity,
            smr.estimated_consumption,
            smr.actual_consumption,
            smr.waste_quantity,
            smr.updated_at
        FROM site_material_records smr
        INNER JOIN sites s
            ON smr.site_id = s.id
        INNER JOIN inventory_items ii
            ON smr.item_id = ii.id
        WHERE smr.id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};

// GET BY SITE
const findRecordsBySiteId = async (siteId) => {
    const result = await pool.query(
        `
        SELECT
            smr.id,
            smr.site_id,
            s.name AS site_name,
            smr.item_id,
            ii.name AS item_name,
            ii.unit AS item_unit,
            smr.received_quantity,
            smr.estimated_consumption,
            smr.actual_consumption,
            smr.waste_quantity,
            smr.updated_at
        FROM site_material_records smr
        INNER JOIN sites s
            ON smr.site_id = s.id
        INNER JOIN inventory_items ii
            ON smr.item_id = ii.id
        WHERE smr.site_id = $1
        ORDER BY smr.id
        `,
        [siteId]
    );

    return result.rows;
};

// CHECK SITE
const findSiteById = async (siteId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            project_id,
            name,
            location
        FROM sites
        WHERE id = $1
        LIMIT 1
        `,
        [siteId]
    );

    return result.rows[0] || null;
};

// CHECK ITEM
const findItemById = async (itemId) => {
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

// UPDATE
const updateRecord = async (
    id,
    {
        received_quantity,
        estimated_consumption,
        actual_consumption,
        waste_quantity
    }
) => {
    const result = await pool.query(
        `
        UPDATE site_material_records
        SET
            received_quantity = $1,
            estimated_consumption = $2,
            actual_consumption = $3,
            waste_quantity = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING
            id,
            site_id,
            item_id,
            received_quantity,
            estimated_consumption,
            actual_consumption,
            waste_quantity,
            updated_at
        `,
        [
            received_quantity,
            estimated_consumption,
            actual_consumption,
            waste_quantity,
            id
        ]
    );

    return result.rows[0] || null;
};

// DELETE
const deleteRecord = async (id) => {
    const result = await pool.query(
        `
        DELETE FROM site_material_records
        WHERE id = $1
        RETURNING
            id,
            site_id,
            item_id,
            received_quantity,
            estimated_consumption,
            actual_consumption,
            waste_quantity
        `,
        [id]
    );

    return result.rows[0] || null;
};

module.exports = {
    createRecord,
    findAllRecords,
    findRecordById,
    findRecordsBySiteId,
    findSiteById,
    findItemById,
    updateRecord,
    deleteRecord
};