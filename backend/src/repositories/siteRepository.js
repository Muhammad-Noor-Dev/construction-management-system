const pool = require("../config/database");


const createSite = async ({
    projectId,
    name,
    location
}) => {

    const result = await pool.query(
        `
        INSERT INTO sites (
            project_id,
            name,
            location
        )
        VALUES ($1, $2, $3)
        RETURNING
            id,
            project_id,
            name,
            location,
            created_at,
            updated_at
        `,
        [
            projectId,
            name,
            location
        ]
    );

    return result.rows[0];
};


const findAllSites = async () => {

    const result = await pool.query(
        `
        SELECT
            s.id,
            s.project_id,
            p.name AS project_name,
            s.name,
            s.location,
            s.created_at,
            s.updated_at
        FROM sites s
        INNER JOIN projects p
            ON s.project_id = p.id
        ORDER BY s.id DESC
        `
    );

    return result.rows;
};


const findSiteById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            s.id,
            s.project_id,
            p.name AS project_name,
            s.name,
            s.location,
            s.created_at,
            s.updated_at
        FROM sites s
        INNER JOIN projects p
            ON s.project_id = p.id
        WHERE s.id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


const findSiteByProjectAndName = async (
    projectId,
    name
) => {

    const result = await pool.query(
        `
        SELECT
            id,
            project_id,
            name,
            location,
            created_at,
            updated_at
        FROM sites
        WHERE project_id = $1
          AND LOWER(name) = LOWER($2)
        LIMIT 1
        `,
        [
            projectId,
            name
        ]
    );

    return result.rows[0] || null;
};


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


const updateSite = async (
    id,
    {
        projectId,
        name,
        location
    }
) => {

    const result = await pool.query(
        `
        UPDATE sites
        SET
            project_id = $1,
            name = $2,
            location = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id
        `,
        [
            projectId,
            name,
            location,
            id
        ]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return await findSiteById(id);
};


const deleteSite = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM sites
        WHERE id = $1
        RETURNING
            id,
            project_id,
            name,
            location,
            created_at,
            updated_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createSite,
    findAllSites,
    findSiteById,
    findSiteByProjectAndName,
    projectExists,
    updateSite,
    deleteSite
};