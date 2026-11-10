const pool = require("../config/database");


// Create attendance
const createAttendance = async ({
    employeeId,
    siteId,
    attendanceDate,
    status,
    recordedBy
}) => {

    const result = await pool.query(
        `
        INSERT INTO attendance (
            employee_id,
            site_id,
            attendance_date,
            status,
            recorded_by
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            employee_id,
            site_id,
            attendance_date,
            status,
            recorded_by,
            created_at,
            updated_at
        `,
        [
            employeeId,
            siteId,
            attendanceDate,
            status,
            recordedBy ?? null
        ]
    );

    return result.rows[0];
};


// Get all attendance records
const findAllAttendance = async () => {

    const result = await pool.query(
        `
        SELECT
            a.id,
            a.employee_id,
            e.full_name AS employee_name,
            a.site_id,
            s.name AS site_name,
            s.location AS site_location,
            a.attendance_date,
            a.status,
            a.recorded_by,
            u.full_name AS recorded_by_name,
            a.created_at,
            a.updated_at

        FROM attendance a

        INNER JOIN employees e
            ON a.employee_id = e.id

        INNER JOIN sites s
            ON a.site_id = s.id

        LEFT JOIN users u
            ON a.recorded_by = u.id

        ORDER BY
            a.attendance_date DESC,
            a.id DESC
        `
    );

    return result.rows;
};


// Get attendance by ID
const findAttendanceById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            a.id,
            a.employee_id,
            e.full_name AS employee_name,
            a.site_id,
            s.name AS site_name,
            s.location AS site_location,
            a.attendance_date,
            a.status,
            a.recorded_by,
            u.full_name AS recorded_by_name,
            a.created_at,
            a.updated_at

        FROM attendance a

        INNER JOIN employees e
            ON a.employee_id = e.id

        INNER JOIN sites s
            ON a.site_id = s.id

        LEFT JOIN users u
            ON a.recorded_by = u.id

        WHERE a.id = $1

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


// Check user exists
const userExists = async (userId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId]
    );

    return result.rows.length > 0;
};


// Check duplicate attendance
const findDuplicateAttendance = async ({
    employeeId,
    attendanceDate,
    excludeId = null
}) => {

    let query = `
        SELECT
            id,
            employee_id,
            attendance_date
        FROM attendance

        WHERE employee_id = $1
          AND attendance_date = $2
    `;

    const values = [
        employeeId,
        attendanceDate
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


// Update attendance
const updateAttendance = async (
    id,
    {
        employeeId,
        siteId,
        attendanceDate,
        status,
        recordedBy
    }
) => {

    const result = await pool.query(
        `
        UPDATE attendance

        SET
            employee_id = $1,
            site_id = $2,
            attendance_date = $3,
            status = $4,
            recorded_by = $5,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $6

        RETURNING
            id,
            employee_id,
            site_id,
            attendance_date,
            status,
            recorded_by,
            created_at,
            updated_at
        `,
        [
            employeeId,
            siteId,
            attendanceDate,
            status,
            recordedBy ?? null,
            id
        ]
    );

    return result.rows[0] || null;
};


// Delete attendance
const deleteAttendance = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM attendance

        WHERE id = $1

        RETURNING
            id,
            employee_id,
            site_id,
            attendance_date,
            status,
            recorded_by,
            created_at,
            updated_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createAttendance,
    findAllAttendance,
    findAttendanceById,
    employeeExists,
    siteExists,
    userExists,
    findDuplicateAttendance,
    updateAttendance,
    deleteAttendance
};