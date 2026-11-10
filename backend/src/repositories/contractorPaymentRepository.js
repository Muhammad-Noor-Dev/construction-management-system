const pool = require("../config/database");


// CREATE PAYMENT
const createContractorPayment = async ({
    contractorId,
    projectId,
    amount,
    paymentDate,
    paymentMethod,
    reference,
    notes,
    recordedBy
}) => {

    const result = await pool.query(
        `
        INSERT INTO contractor_payments (
            contractor_id,
            project_id,
            amount,
            payment_date,
            payment_method,
            reference,
            notes,
            recorded_by
        )
        VALUES (
            $1,
            $2,
            $3,
            COALESCE($4, CURRENT_DATE),
            $5,
            $6,
            $7,
            $8
        )
        RETURNING
            id,
            contractor_id,
            project_id,
            amount,
            payment_date,
            payment_method,
            reference,
            notes,
            recorded_by,
            created_at
        `,
        [
            contractorId,
            projectId ?? null,
            amount,
            paymentDate ?? null,
            paymentMethod ?? null,
            reference ?? null,
            notes ?? null,
            recordedBy ?? null
        ]
    );

    return result.rows[0];
};


// GET ALL PAYMENTS
const findAllContractorPayments = async () => {

    const result = await pool.query(
        `
        SELECT
            cp.id,

            cp.contractor_id,
            c.name AS contractor_name,

            cp.project_id,
            p.name AS project_name,

            cp.amount,
            cp.payment_date,
            cp.payment_method,
            cp.reference,
            cp.notes,

            cp.recorded_by,
            u.full_name AS recorded_by_name,

            cp.created_at

        FROM contractor_payments cp

        INNER JOIN contractors c
            ON cp.contractor_id = c.id

        LEFT JOIN projects p
            ON cp.project_id = p.id

        LEFT JOIN users u
            ON cp.recorded_by = u.id

        ORDER BY cp.id DESC
        `
    );

    return result.rows;
};


// GET PAYMENT BY ID
const findContractorPaymentById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            cp.id,

            cp.contractor_id,
            c.name AS contractor_name,

            cp.project_id,
            p.name AS project_name,

            cp.amount,
            cp.payment_date,
            cp.payment_method,
            cp.reference,
            cp.notes,

            cp.recorded_by,
            u.full_name AS recorded_by_name,

            cp.created_at

        FROM contractor_payments cp

        INNER JOIN contractors c
            ON cp.contractor_id = c.id

        LEFT JOIN projects p
            ON cp.project_id = p.id

        LEFT JOIN users u
            ON cp.recorded_by = u.id

        WHERE cp.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// CHECK CONTRACTOR EXISTS
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


// CHECK PROJECT EXISTS
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


// UPDATE PAYMENT
const updateContractorPayment = async (
    id,
    {
        contractorId,
        projectId,
        amount,
        paymentDate,
        paymentMethod,
        reference,
        notes
    }
) => {

    const result = await pool.query(
        `
        UPDATE contractor_payments

        SET
            contractor_id = $1,
            project_id = $2,
            amount = $3,
            payment_date = COALESCE($4, CURRENT_DATE),
            payment_method = $5,
            reference = $6,
            notes = $7

        WHERE id = $8

        RETURNING
            id,
            contractor_id,
            project_id,
            amount,
            payment_date,
            payment_method,
            reference,
            notes,
            recorded_by,
            created_at
        `,
        [
            contractorId,
            projectId ?? null,
            amount,
            paymentDate ?? null,
            paymentMethod ?? null,
            reference ?? null,
            notes ?? null,
            id
        ]
    );

    return result.rows[0] || null;
};


// DELETE PAYMENT
const deleteContractorPayment = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM contractor_payments
        WHERE id = $1

        RETURNING
            id,
            contractor_id,
            project_id,
            amount,
            payment_date,
            payment_method,
            reference,
            notes,
            recorded_by,
            created_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createContractorPayment,
    findAllContractorPayments,
    findContractorPaymentById,
    contractorExists,
    projectExists,
    updateContractorPayment,
    deleteContractorPayment
};