const pool = require("../config/database");


// Create assignment
const createAssignment = async ({
    employeeId,
    siteId,
    startDate,
    endDate,
    dailyRateOverride
}) => {

    const result = await pool.query(
        `
        INSERT INTO employee_site_assignments (
            employee_id,
            site_id,
            start_date,
            end_date,
            daily_rate_override
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            employee_id,
            site_id,
            start_date,
            end_date,
            daily_rate_override,
            created_at
        `,
        [
            employeeId,
            siteId,
            startDate,
            endDate ?? null,
            dailyRateOverride ?? null
        ]
    );

    return result.rows[0];
};


// Get all assignments
const findAllAssignments = async () => {

    const result = await pool.query(
        `
        SELECT
            esa.id,
            esa.employee_id,
            e.full_name AS employee_name,
            esa.site_id,
            s.name AS site_name,
            s.location AS site_location,
            esa.start_date,
            esa.end_date,
            esa.daily_rate_override,
            esa.created_at
        FROM employee_site_assignments esa

        INNER JOIN employees e
            ON esa.employee_id = e.id

        INNER JOIN sites s
            ON esa.site_id = s.id

        ORDER BY esa.id DESC
        `
    );

    return result.rows;
};


// Get assignment by ID
const findAssignmentById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            esa.id,
            esa.employee_id,
            e.full_name AS employee_name,
            esa.site_id,
            s.name AS site_name,
            s.location AS site_location,
            esa.start_date,
            esa.end_date,
            esa.daily_rate_override,
            esa.created_at
        FROM employee_site_assignments esa

        INNER JOIN employees e
            ON esa.employee_id = e.id

        INNER JOIN sites s
            ON esa.site_id = s.id

        WHERE esa.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// Check employee exists
const employeeExists = async (employeeId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM employees
        WHERE id = $1
          AND is_active = true
        LIMIT 1
        `,
        [employeeId]
    );

    return result.rows.length > 0;
};

// Check site exists
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


// Check duplicate assignment
const findDuplicateAssignment = async ({
    employeeId,
    siteId,
    startDate,
    excludeId = null
}) => {

    let query = `
        SELECT
            id,
            employee_id,
            site_id,
            start_date
        FROM employee_site_assignments
        WHERE employee_id = $1
          AND site_id = $2
          AND start_date = $3
    `;

    const values = [
        employeeId,
        siteId,
        startDate
    ];


    if (excludeId !== null) {

        query += `
            AND id <> $4
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


// Update assignment
const updateAssignment = async (
    id,
    {
        employeeId,
        siteId,
        startDate,
        endDate,
        dailyRateOverride
    }
) => {

    const result = await pool.query(
        `
        UPDATE employee_site_assignments
        SET
            employee_id = $1,
            site_id = $2,
            start_date = $3,
            end_date = $4,
            daily_rate_override = $5
        WHERE id = $6
        RETURNING id
        `,
        [
            employeeId,
            siteId,
            startDate,
            endDate ?? null,
            dailyRateOverride ?? null,
            id
        ]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return await findAssignmentById(id);
};


// Delete assignment
const deleteAssignment = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM employee_site_assignments

        WHERE id = $1

        RETURNING
            id,
            employee_id,
            site_id,
            start_date,
            end_date,
            daily_rate_override,
            created_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createAssignment,
    findAllAssignments,
    findAssignmentById,
    employeeExists,
    siteExists,
    findDuplicateAssignment,
    updateAssignment,
    deleteAssignment
};