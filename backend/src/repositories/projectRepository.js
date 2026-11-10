const pool = require("../config/database");


const createProject = async ({
    name,
    clientId,
    budget,
    startDate,
    endDate,
    status,
    completionPercentage,
    createdBy
}) => {
    const result = await pool.query(
        `
        INSERT INTO projects (
            name,
            client_id,
            budget,
            start_date,
            end_date,
            status,
            completion_percentage,
            created_by
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
        )
        RETURNING
            id,
            name,
            client_id,
            budget,
            start_date,
            end_date,
            status,
            completion_percentage,
            created_by,
            created_at,
            updated_at
        `,
        [
            name,
            clientId,
            budget,
            startDate,
            endDate,
            status,
            completionPercentage,
            createdBy
        ]
    );

    return result.rows[0];
};


const findAllProjects = async () => {
    const result = await pool.query(
        `
        SELECT
            p.id,
            p.name,
            p.client_id,
            c.name AS client_name,
            p.budget,
            p.start_date,
            p.end_date,
            p.status,
            p.completion_percentage,
            p.created_by,
            u.full_name AS created_by_name,
            p.created_at,
            p.updated_at
        FROM projects p
        INNER JOIN clients c
            ON p.client_id = c.id
        LEFT JOIN users u
            ON p.created_by = u.id
        ORDER BY p.id DESC
        `
    );

    return result.rows;
};


const findProjectById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            p.id,
            p.name,
            p.client_id,
            c.name AS client_name,
            p.budget,
            p.start_date,
            p.end_date,
            p.status,
            p.completion_percentage,
            p.created_by,
            u.full_name AS created_by_name,
            p.created_at,
            p.updated_at
        FROM projects p
        INNER JOIN clients c
            ON p.client_id = c.id
        LEFT JOIN users u
            ON p.created_by = u.id
        WHERE p.id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


const findProjectByName = async (name) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            client_id,
            budget,
            start_date,
            end_date,
            status,
            completion_percentage,
            created_by,
            created_at,
            updated_at
        FROM projects
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1
        `,
        [name]
    );

    return result.rows[0] || null;
};


const clientExists = async (clientId) => {
    const result = await pool.query(
        `
        SELECT id
        FROM clients
        WHERE id = $1
        LIMIT 1
        `,
        [clientId]
    );

    return result.rows.length > 0;
};


const updateProject = async (
    id,
    {
        name,
        clientId,
        budget,
        startDate,
        endDate,
        status,
        completionPercentage
    }
) => {

    const result = await pool.query(
        `
        UPDATE projects
        SET
            name = $1,
            client_id = $2,
            budget = $3,
            start_date = $4,
            end_date = $5,
            status = $6,
            completion_percentage = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING id
        `,
        [
            name,
            clientId,
            budget,
            startDate,
            endDate,
            status,
            completionPercentage,
            id
        ]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return await findProjectById(id);
};


module.exports = {
    createProject,
    findAllProjects,
    findProjectById,
    findProjectByName,
    clientExists,
    updateProject
};