const pool = require("../config/database");


// Create project-contractor assignment
const createProjectContractor = async ({
    projectId,
    siteId,
    contractorId,
    startDate,
    endDate,
    payableAmount = 0,
    notes
}) => {

    const result = await pool.query(
        `
        INSERT INTO project_contractors (
            project_id,
            site_id,
            contractor_id,
            start_date,
            end_date,
            payable_amount,
            notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
            id,
            project_id,
            site_id,
            contractor_id,
            start_date,
            end_date,
            payable_amount,
            notes,
            created_at
        `,
        [
            projectId,
            siteId,
            contractorId,
            startDate,
            endDate ?? null,
            payableAmount ?? 0,
            notes ?? null
        ]
    );

    return result.rows[0];
};


// Get all assignments
const findAllProjectContractors = async () => {

    const result = await pool.query(
        `
        SELECT
            pc.id,

            pc.project_id,
            p.name AS project_name,

            pc.site_id,
            s.name AS site_name,
            s.location AS site_location,

            pc.contractor_id,
            c.name AS contractor_name,
            c.specialization AS contractor_specialization,

            pc.start_date,
            pc.end_date,
            pc.payable_amount,
            pc.notes,
            pc.created_at

        FROM project_contractors pc

        INNER JOIN projects p
            ON pc.project_id = p.id

        INNER JOIN sites s
            ON pc.site_id = s.id

        INNER JOIN contractors c
            ON pc.contractor_id = c.id

        ORDER BY pc.id DESC
        `
    );

    return result.rows;
};


// Get assignment by ID
const findProjectContractorById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            pc.id,

            pc.project_id,
            p.name AS project_name,

            pc.site_id,
            s.name AS site_name,
            s.location AS site_location,

            pc.contractor_id,
            c.name AS contractor_name,
            c.specialization AS contractor_specialization,

            pc.start_date,
            pc.end_date,
            pc.payable_amount,
            pc.notes,
            pc.created_at

        FROM project_contractors pc

        INNER JOIN projects p
            ON pc.project_id = p.id

        INNER JOIN sites s
            ON pc.site_id = s.id

        INNER JOIN contractors c
            ON pc.contractor_id = c.id

        WHERE pc.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// Check project exists
const projectExists = async (projectId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM projects
        WHERE id = $1
        LIMIT 1
        `,
        [projectId]
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


// Check contractor exists
const contractorExists = async (contractorId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM contractors
        WHERE id = $1
        LIMIT 1
        `,
        [contractorId]
    );

    return result.rows.length > 0;
};


// Check site belongs to project
const siteBelongsToProject = async (
    siteId,
    projectId
) => {

    const result = await pool.query(
        `
        SELECT id
        FROM sites
        WHERE id = $1
          AND project_id = $2
        LIMIT 1
        `,
        [
            siteId,
            projectId
        ]
    );

    return result.rows.length > 0;
};


// Check duplicate assignment
const findDuplicateAssignment = async ({
    siteId,
    contractorId,
    startDate,
    excludeId = null
}) => {

    let query = `
        SELECT id
        FROM project_contractors
        WHERE site_id = $1
          AND contractor_id = $2
          AND start_date = $3
    `;

    const values = [
        siteId,
        contractorId,
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
const updateProjectContractor = async (
    id,
    {
        projectId,
        siteId,
        contractorId,
        startDate,
        endDate,
        payableAmount = 0,
        notes
    }
) => {

    const result = await pool.query(
        `
        UPDATE project_contractors

        SET
            project_id = $1,
            site_id = $2,
            contractor_id = $3,
            start_date = $4,
            end_date = $5,
            payable_amount = $6,
            notes = $7

        WHERE id = $8

        RETURNING
            id,
            project_id,
            site_id,
            contractor_id,
            start_date,
            end_date,
            payable_amount,
            notes,
            created_at
        `,
        [
            projectId,
            siteId,
            contractorId,
            startDate,
            endDate ?? null,
            payableAmount ?? 0,
            notes ?? null,
            id
        ]
    );

    return result.rows[0] || null;
};


// Delete assignment
const deleteProjectContractor = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM project_contractors
        WHERE id = $1

        RETURNING
            id,
            project_id,
            site_id,
            contractor_id,
            start_date,
            end_date,
            payable_amount,
            notes,
            created_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


// Get all contractor assignments for a specific project
const findProjectContractorsByProjectId = async (projectId) => {
    const result = await pool.query(
        `
        SELECT
            pc.id,
            pc.project_id,
            p.name AS project_name,
            pc.site_id,
            s.name AS site_name,
            s.location AS site_location,
            pc.contractor_id,
            c.name AS contractor_name,
            c.specialization AS contractor_specialization,
            pc.start_date,
            pc.end_date,
            pc.payable_amount,
            pc.notes,
            pc.created_at
        FROM project_contractors pc
        INNER JOIN projects p ON pc.project_id = p.id
        INNER JOIN sites s ON pc.site_id = s.id
        INNER JOIN contractors c ON pc.contractor_id = c.id
        WHERE pc.project_id = $1
        ORDER BY pc.id DESC
        `,
        [projectId]
    );

    return result.rows;
};


// Get the contractor team assigned to a specific site
const findProjectContractorsBySiteId = async (siteId) => {
    const result = await pool.query(
        `
        SELECT
            pc.id,
            pc.project_id,
            p.name AS project_name,
            pc.site_id,
            s.name AS site_name,
            s.location AS site_location,
            pc.contractor_id,
            c.name AS contractor_name,
            c.specialization AS contractor_specialization,
            c.phone AS contractor_phone,
            c.email AS contractor_email,
            pc.start_date,
            pc.end_date,
            pc.payable_amount,
            pc.notes,
            pc.created_at
        FROM project_contractors pc
        INNER JOIN projects p ON pc.project_id = p.id
        INNER JOIN sites s ON pc.site_id = s.id
        INNER JOIN contractors c ON pc.contractor_id = c.id
        WHERE pc.site_id = $1
        ORDER BY pc.id DESC
        `,
        [siteId]
    );

    return result.rows;
};


// Get all assignments for a specific contractor
const findProjectContractorsByContractorId = async (contractorId) => {
    const result = await pool.query(
        `
        SELECT
            pc.id,
            pc.project_id,
            p.name AS project_name,
            pc.site_id,
            s.name AS site_name,
            s.location AS site_location,
            pc.contractor_id,
            c.name AS contractor_name,
            c.specialization AS contractor_specialization,
            pc.start_date,
            pc.end_date,
            pc.payable_amount,
            pc.notes,
            pc.created_at
        FROM project_contractors pc
        INNER JOIN projects p ON pc.project_id = p.id
        INNER JOIN sites s ON pc.site_id = s.id
        INNER JOIN contractors c ON pc.contractor_id = c.id
        WHERE pc.contractor_id = $1
        ORDER BY pc.start_date DESC, pc.id DESC
        `,
        [contractorId]
    );

    return result.rows;
};


module.exports = {
    createProjectContractor,
    findAllProjectContractors,
    findProjectContractorById,
    projectExists,
    siteExists,
    contractorExists,
    siteBelongsToProject,
    findDuplicateAssignment,
    updateProjectContractor,
    deleteProjectContractor,
    findProjectContractorsByProjectId,
    findProjectContractorsBySiteId,
    findProjectContractorsByContractorId
};