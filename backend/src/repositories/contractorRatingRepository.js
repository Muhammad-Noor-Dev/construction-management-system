const pool = require("../config/database");


// Create rating
const createContractorRating = async ({
    contractorId,
    projectId,
    rating,
    comment,
    createdBy
}) => {

    const result = await pool.query(
        `
        INSERT INTO contractor_ratings (
            contractor_id,
            project_id,
            rating,
            comment,
            created_by
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            contractor_id,
            project_id,
            rating,
            comment,
            created_by,
            created_at
        `,
        [
            contractorId,
            projectId,
            rating,
            comment ?? null,
            createdBy ?? null
        ]
    );

    return result.rows[0];
};


// Get all ratings
const findAllContractorRatings = async () => {

    const result = await pool.query(
        `
        SELECT
            cr.id,

            cr.contractor_id,
            c.name AS contractor_name,
            c.specialization AS contractor_specialization,

            cr.project_id,
            p.name AS project_name,

            cr.rating,
            cr.comment,

            cr.created_by,
            u.full_name AS created_by_name,

            cr.created_at

        FROM contractor_ratings cr

        INNER JOIN contractors c
            ON cr.contractor_id = c.id

        INNER JOIN projects p
            ON cr.project_id = p.id

        LEFT JOIN users u
            ON cr.created_by = u.id

        ORDER BY cr.id DESC
        `
    );

    return result.rows;
};


// Get rating by ID
const findContractorRatingById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            cr.id,

            cr.contractor_id,
            c.name AS contractor_name,
            c.specialization AS contractor_specialization,

            cr.project_id,
            p.name AS project_name,

            cr.rating,
            cr.comment,

            cr.created_by,
            u.full_name AS created_by_name,

            cr.created_at

        FROM contractor_ratings cr

        INNER JOIN contractors c
            ON cr.contractor_id = c.id

        INNER JOIN projects p
            ON cr.project_id = p.id

        LEFT JOIN users u
            ON cr.created_by = u.id

        WHERE cr.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
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


// Check contractor is assigned to project
const contractorAssignedToProject = async (
    contractorId,
    projectId
) => {

    const result = await pool.query(
        `
        SELECT id
        FROM project_contractors
        WHERE contractor_id = $1
          AND project_id = $2
        LIMIT 1
        `,
        [
            contractorId,
            projectId
        ]
    );

    return result.rows.length > 0;
};


// Check duplicate rating
const findExistingRating = async (
    contractorId,
    projectId,
    excludeId = null
) => {

    let query = `
        SELECT id
        FROM contractor_ratings
        WHERE contractor_id = $1
          AND project_id = $2
    `;

    const values = [
        contractorId,
        projectId
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


// Update rating
const updateContractorRating = async (
    id,
    {
        contractorId,
        projectId,
        rating,
        comment
    }
) => {

    const result = await pool.query(
        `
        UPDATE contractor_ratings

        SET
            contractor_id = $1,
            project_id = $2,
            rating = $3,
            comment = $4

        WHERE id = $5

        RETURNING
            id,
            contractor_id,
            project_id,
            rating,
            comment,
            created_by,
            created_at
        `,
        [
            contractorId,
            projectId,
            rating,
            comment ?? null,
            id
        ]
    );

    return result.rows[0] || null;
};


// Delete rating
const deleteContractorRating = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM contractor_ratings
        WHERE id = $1

        RETURNING
            id,
            contractor_id,
            project_id,
            rating,
            comment,
            created_by,
            created_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createContractorRating,
    findAllContractorRatings,
    findContractorRatingById,
    contractorExists,
    projectExists,
    contractorAssignedToProject,
    findExistingRating,
    updateContractorRating,
    deleteContractorRating
};