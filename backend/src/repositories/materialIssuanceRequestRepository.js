const pool = require("../config/database");


// CREATE REQUEST
const createRequest = async ({
    site_id,
    warehouse_id,
    requested_by
}) => {

    const result = await pool.query(
        `
        INSERT INTO material_issuance_requests (
            site_id,
            warehouse_id,
            requested_by
        )
        VALUES ($1, $2, $3)

        RETURNING
            id,
            site_id,
            warehouse_id,
            requested_by,
            approved_by,
            status,
            rejection_reason,
            requested_at,
            reviewed_at
        `,
        [
            site_id,
            warehouse_id,
            requested_by
        ]
    );

    return result.rows[0];
};


// GET ALL REQUESTS
const findAllRequests = async () => {

    const result = await pool.query(
        `
        SELECT
            r.id,

            r.site_id,
            s.name AS site_name,
            s.location AS site_location,

            r.warehouse_id,
            w.name AS warehouse_name,
            w.location AS warehouse_location,

            r.requested_by,
            requester.full_name AS requester_name,

            r.approved_by,
            approver.full_name AS approver_name,

            r.status,
            r.rejection_reason,
            r.requested_at,
            r.reviewed_at

        FROM material_issuance_requests r

        INNER JOIN sites s
            ON r.site_id = s.id

        INNER JOIN warehouses w
            ON r.warehouse_id = w.id

        INNER JOIN users requester
            ON r.requested_by = requester.id

        LEFT JOIN users approver
            ON r.approved_by = approver.id

        ORDER BY r.id DESC
        `
    );

    return result.rows;
};


// GET ONE
const findRequestById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            r.id,

            r.site_id,
            s.name AS site_name,
            s.location AS site_location,

            r.warehouse_id,
            w.name AS warehouse_name,
            w.location AS warehouse_location,

            r.requested_by,
            requester.full_name AS requester_name,

            r.approved_by,
            approver.full_name AS approver_name,

            r.status,
            r.rejection_reason,
            r.requested_at,
            r.reviewed_at

        FROM material_issuance_requests r

        INNER JOIN sites s
            ON r.site_id = s.id

        INNER JOIN warehouses w
            ON r.warehouse_id = w.id

        INNER JOIN users requester
            ON r.requested_by = requester.id

        LEFT JOIN users approver
            ON r.approved_by = approver.id

        WHERE r.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// CHECK SITE
const siteExists = async (siteId) => {

    const result = await pool.query(
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


// CHECK REQUEST
const findRequestRaw = async (id) => {

    const result = await pool.query(
        `
        SELECT *
        FROM material_issuance_requests
        WHERE id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// APPROVE REQUEST
const approveRequest = async (
    id,
    approvedBy
) => {

    const result = await pool.query(
        `
        UPDATE material_issuance_requests

        SET
            status = 'Approved',
            approved_by = $1,
            rejection_reason = NULL,
            reviewed_at = CURRENT_TIMESTAMP

        WHERE id = $2
        AND status = 'Pending'

        RETURNING
            id,
            site_id,
            warehouse_id,
            requested_by,
            approved_by,
            status,
            rejection_reason,
            requested_at,
            reviewed_at
        `,
        [
            approvedBy,
            id
        ]
    );

    return result.rows[0] || null;
};


// REJECT REQUEST
const rejectRequest = async (
    id,
    approvedBy,
    rejectionReason
) => {

    const result = await pool.query(
        `
        UPDATE material_issuance_requests

        SET
            status = 'Rejected',
            approved_by = $1,
            rejection_reason = $2,
            reviewed_at = CURRENT_TIMESTAMP

        WHERE id = $3
        AND status = 'Pending'

        RETURNING
            id,
            site_id,
            warehouse_id,
            requested_by,
            approved_by,
            status,
            rejection_reason,
            requested_at,
            reviewed_at
        `,
        [
            approvedBy,
            rejectionReason,
            id
        ]
    );

    return result.rows[0] || null;
};


module.exports = {
    createRequest,
    findAllRequests,
    findRequestById,
    siteExists,
    warehouseExists,
    findRequestRaw,
    approveRequest,
    rejectRequest
};