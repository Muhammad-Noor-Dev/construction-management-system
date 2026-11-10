const pool = require("../config/database");


// Create payroll period
const createPayrollPeriod = async ({
    year,
    month,
    status,
    preparedBy,
    approvedBy,
    rejectionReason
}) => {

    const result = await pool.query(
        `
        INSERT INTO payroll_periods (
            year,
            month,
            status,
            prepared_by,
            approved_by,
            rejection_reason
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            year,
            month,
            status,
            prepared_by,
            approved_by,
            rejection_reason,
            created_at,
            updated_at,
            approved_at
        `,
        [
            year,
            month,
            status ?? "Draft",
            preparedBy ?? null,
            approvedBy ?? null,
            rejectionReason ?? null
        ]
    );

    return result.rows[0];
};


// Get all payroll periods
const findAllPayrollPeriods = async () => {

    const result = await pool.query(
        `
        SELECT
            pp.id,
            pp.year,
            pp.month,
            pp.status,

            pp.prepared_by,
            preparer.full_name AS prepared_by_name,

            pp.approved_by,
            approver.full_name AS approved_by_name,

            pp.rejection_reason,
            pp.created_at,
            pp.updated_at,
            pp.approved_at

        FROM payroll_periods pp

        LEFT JOIN users preparer
            ON pp.prepared_by = preparer.id

        LEFT JOIN users approver
            ON pp.approved_by = approver.id

        ORDER BY
            pp.year DESC,
            pp.month DESC,
            pp.id DESC
        `
    );

    return result.rows;
};


// Get payroll period by ID
const findPayrollPeriodById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            pp.id,
            pp.year,
            pp.month,
            pp.status,

            pp.prepared_by,
            preparer.full_name AS prepared_by_name,

            pp.approved_by,
            approver.full_name AS approved_by_name,

            pp.rejection_reason,
            pp.created_at,
            pp.updated_at,
            pp.approved_at

        FROM payroll_periods pp

        LEFT JOIN users preparer
            ON pp.prepared_by = preparer.id

        LEFT JOIN users approver
            ON pp.approved_by = approver.id

        WHERE pp.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// Check duplicate year/month
const findDuplicatePeriod = async ({
    year,
    month,
    excludeId = null
}) => {

    let query = `
        SELECT
            id,
            year,
            month
        FROM payroll_periods
        WHERE year = $1
          AND month = $2
    `;

    const values = [
        year,
        month
    ];


    if (excludeId !== null) {

        query += `
            AND id <> $3
        `;

        values.push(excludeId);
    }


    query += `
        LIMIT 1
    `;


    const result = await pool.query(
        query,
        values
    );

    return result.rows[0] || null;
};


// Check user exists
const userExists = async (userId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM users
        WHERE id = $1
          AND is_active = true
        LIMIT 1
        `,
        [userId]
    );

    return result.rows.length > 0;
};


// Update payroll period
const updatePayrollPeriod = async (
    id,
    {
        year,
        month,
        status,
        preparedBy,
        approvedBy,
        rejectionReason,
        approvedAt
    }
) => {

    const result = await pool.query(
        `
        UPDATE payroll_periods

        SET
            year = $1,
            month = $2,
            status = $3,
            prepared_by = $4,
            approved_by = $5,
            rejection_reason = $6,
            approved_at = $7,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $8

        RETURNING
            id,
            year,
            month,
            status,
            prepared_by,
            approved_by,
            rejection_reason,
            created_at,
            updated_at,
            approved_at
        `,
        [
            year,
            month,
            status,
            preparedBy ?? null,
            approvedBy ?? null,
            rejectionReason ?? null,
            approvedAt ?? null,
            id
        ]
    );

    return result.rows[0] || null;
};


// Delete payroll period
const deletePayrollPeriod = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM payroll_periods
        WHERE id = $1
        RETURNING
            id,
            year,
            month,
            status
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createPayrollPeriod,
    findAllPayrollPeriods,
    findPayrollPeriodById,
    findDuplicatePeriod,
    userExists,
    updatePayrollPeriod,
    deletePayrollPeriod
};