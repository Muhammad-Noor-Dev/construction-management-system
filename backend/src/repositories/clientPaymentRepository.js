const pool = require("../config/database");


// Create payment
const createClientPayment = async ({
    clientId,
    projectId,
    invoiceReference,
    amount,
    paymentDate,
    paymentMethod,
    notes,
    recordedBy
}) => {

    const result = await pool.query(
        `
        INSERT INTO client_payments (
            client_id,
            project_id,
            invoice_reference,
            amount,
            payment_date,
            payment_method,
            notes,
            recorded_by
        )
        VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6, $7, $8)
        RETURNING
            id,
            client_id,
            project_id,
            invoice_reference,
            amount,
            payment_date,
            payment_method,
            notes,
            recorded_by,
            created_at
        `,
        [
            clientId,
            projectId ?? null,
            invoiceReference ?? null,
            amount,
            paymentDate ?? null,
            paymentMethod ?? null,
            notes ?? null,
            recordedBy ?? null
        ]
    );

    return result.rows[0];
};


// Get all payments
const findAllClientPayments = async () => {

    const result = await pool.query(
        `
        SELECT
            cp.id,

            cp.client_id,
            c.name AS client_name,

            cp.project_id,
            p.name AS project_name,

            cp.invoice_reference,
            cp.amount,
            cp.payment_date,
            cp.payment_method,
            cp.notes,

            cp.recorded_by,
            u.full_name AS recorded_by_name,

            cp.created_at

        FROM client_payments cp

        INNER JOIN clients c
            ON cp.client_id = c.id

        LEFT JOIN projects p
            ON cp.project_id = p.id

        LEFT JOIN users u
            ON cp.recorded_by = u.id

        ORDER BY cp.id DESC
        `
    );

    return result.rows;
};


// Get payment by ID
const findClientPaymentById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            cp.id,

            cp.client_id,
            c.name AS client_name,

            cp.project_id,
            p.name AS project_name,

            cp.invoice_reference,
            cp.amount,
            cp.payment_date,
            cp.payment_method,
            cp.notes,

            cp.recorded_by,
            u.full_name AS recorded_by_name,

            cp.created_at

        FROM client_payments cp

        INNER JOIN clients c
            ON cp.client_id = c.id

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


// Check client exists
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


// Check project belongs to client
const projectBelongsToClient = async (
    projectId,
    clientId
) => {

    const result = await pool.query(
        `
        SELECT id
        FROM projects
        WHERE id = $1
          AND client_id = $2
        LIMIT 1
        `,
        [
            projectId,
            clientId
        ]
    );

    return result.rows.length > 0;
};


// Update payment
const updateClientPayment = async (
    id,
    {
        clientId,
        projectId,
        invoiceReference,
        amount,
        paymentDate,
        paymentMethod,
        notes
    }
) => {

    const result = await pool.query(
        `
        UPDATE client_payments

        SET
            client_id = $1,
            project_id = $2,
            invoice_reference = $3,
            amount = $4,
            payment_date = COALESCE($5, CURRENT_DATE),
            payment_method = $6,
            notes = $7

        WHERE id = $8

        RETURNING
            id,
            client_id,
            project_id,
            invoice_reference,
            amount,
            payment_date,
            payment_method,
            notes,
            recorded_by,
            created_at
        `,
        [
            clientId,
            projectId ?? null,
            invoiceReference ?? null,
            amount,
            paymentDate ?? null,
            paymentMethod ?? null,
            notes ?? null,
            id
        ]
    );

    return result.rows[0] || null;
};


// Delete payment
const deleteClientPayment = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM client_payments
        WHERE id = $1

        RETURNING
            id,
            client_id,
            project_id,
            invoice_reference,
            amount,
            payment_date,
            payment_method,
            notes,
            recorded_by,
            created_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createClientPayment,
    findAllClientPayments,
    findClientPaymentById,
    clientExists,
    projectExists,
    projectBelongsToClient,
    updateClientPayment,
    deleteClientPayment
};