const pool = require("../config/database");

const createProjectCost = async ({ projectId, siteId, category, description, amount, costDate, createdBy }) => {
    const result = await pool.query(
        `
        INSERT INTO project_costs (
            project_id, site_id, category, description, amount, cost_date, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, project_id, site_id, category, description, amount,
                  cost_date, created_by, created_at, updated_at
        `,
        [projectId, siteId ?? null, category, description, amount, costDate, createdBy ?? null]
    );
    return result.rows[0];
};

const findAllProjectCosts = async (projectId) => {
    const result = await pool.query(
        `
        SELECT
            pc.id, pc.project_id, p.name AS project_name,
            pc.site_id, s.name AS site_name,
            pc.category, pc.description, pc.amount, pc.cost_date,
            pc.created_by, u.full_name AS created_by_name,
            pc.created_at, pc.updated_at
        FROM project_costs pc
        INNER JOIN projects p ON pc.project_id = p.id
        LEFT JOIN sites s ON pc.site_id = s.id
        LEFT JOIN users u ON pc.created_by = u.id
        WHERE pc.project_id = $1
        ORDER BY pc.cost_date DESC, pc.id DESC
        `,
        [projectId]
    );
    return result.rows;
};

const findProjectCostById = async (id) => {
    const result = await pool.query(
        `
        SELECT id, project_id, site_id, category, description, amount,
               cost_date, created_by, created_at, updated_at
        FROM project_costs
        WHERE id = $1
        LIMIT 1
        `,
        [id]
    );
    return result.rows[0] || null;
};

const updateProjectCost = async (id, { siteId, category, description, amount, costDate }) => {
    const result = await pool.query(
        `
        UPDATE project_costs
        SET site_id = $1,
            category = $2,
            description = $3,
            amount = $4,
            cost_date = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING id, project_id, site_id, category, description, amount,
                  cost_date, created_by, created_at, updated_at
        `,
        [siteId ?? null, category, description, amount, costDate, id]
    );
    return result.rows[0] || null;
};

const deleteProjectCost = async (id) => {
    const result = await pool.query(
        `DELETE FROM project_costs WHERE id = $1 RETURNING id, project_id, amount`,
        [id]
    );
    return result.rows[0] || null;
};

const getProjectCostSummary = async (projectId) => {
    const result = await pool.query(
        `
        SELECT
            p.id AS project_id,
            p.name AS project_name,
            p.budget AS planned_cost,
            COALESCE((SELECT SUM(pc.amount) FROM project_costs pc WHERE pc.project_id = p.id), 0)
              + COALESCE((SELECT SUM(cp.amount) FROM contractor_payments cp WHERE cp.project_id = p.id), 0)
              AS actual_cost
        FROM projects p
        WHERE p.id = $1
        `,
        [projectId]
    );

    const row = result.rows[0];
    if (!row) return null;

    const planned = Number(row.planned_cost);
    const actual = Number(row.actual_cost);
    const variance = planned - actual;
    const variancePercentage = planned === 0 ? 0 : (variance / planned) * 100;

    return {
        project_id: row.project_id,
        project_name: row.project_name,
        planned_cost: planned,
        actual_cost: actual,
        variance: Number(variance.toFixed(2)),
        variance_percentage: Number(variancePercentage.toFixed(2))
    };
};

module.exports = {
    createProjectCost,
    findAllProjectCosts,
    findProjectCostById,
    updateProjectCost,
    deleteProjectCost,
    getProjectCostSummary
};
