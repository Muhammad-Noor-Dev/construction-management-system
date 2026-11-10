const pool = require("../config/database");


// Create deduction
const createPayrollDeduction = async ({
    payrollRecordId,
    description,
    amount
}) => {

    const result = await pool.query(
        `
        INSERT INTO payroll_deductions (
            payroll_record_id,
            description,
            amount
        )
        VALUES ($1, $2, $3)
        RETURNING
            id,
            payroll_record_id,
            description,
            amount,
            created_at
        `,
        [
            payrollRecordId,
            description,
            amount
        ]
    );

    return result.rows[0];
};


// Get all deductions
const findAllPayrollDeductions = async () => {

    const result = await pool.query(
        `
        SELECT
            pd.id,
            pd.payroll_record_id,

            pr.employee_id,
            e.full_name AS employee_name,

            pr.payroll_period_id,
            pp.year,
            pp.month,

            pd.description,
            pd.amount,
            pd.created_at

        FROM payroll_deductions pd

        INNER JOIN payroll_records pr
            ON pd.payroll_record_id = pr.id

        INNER JOIN employees e
            ON pr.employee_id = e.id

        INNER JOIN payroll_periods pp
            ON pr.payroll_period_id = pp.id

        ORDER BY
            pp.year DESC,
            pp.month DESC,
            pd.id DESC
        `
    );

    return result.rows;
};


// Get deduction by ID
const findPayrollDeductionById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            pd.id,
            pd.payroll_record_id,

            pr.employee_id,
            e.full_name AS employee_name,

            pr.payroll_period_id,
            pp.year,
            pp.month,

            pd.description,
            pd.amount,
            pd.created_at

        FROM payroll_deductions pd

        INNER JOIN payroll_records pr
            ON pd.payroll_record_id = pr.id

        INNER JOIN employees e
            ON pr.employee_id = e.id

        INNER JOIN payroll_periods pp
            ON pr.payroll_period_id = pp.id

        WHERE pd.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// Check payroll record exists
const payrollRecordExists = async (payrollRecordId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM payroll_records
        WHERE id = $1
        LIMIT 1
        `,
        [payrollRecordId]
    );

    return result.rows.length > 0;
};


// Update deduction
const updatePayrollDeduction = async (
    id,
    {
        payrollRecordId,
        description,
        amount
    }
) => {

    const result = await pool.query(
        `
        UPDATE payroll_deductions

        SET
            payroll_record_id = $1,
            description = $2,
            amount = $3

        WHERE id = $4

        RETURNING
            id,
            payroll_record_id,
            description,
            amount,
            created_at
        `,
        [
            payrollRecordId,
            description,
            amount,
            id
        ]
    );

    return result.rows[0] || null;
};


// Delete deduction
const deletePayrollDeduction = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM payroll_deductions
        WHERE id = $1
        RETURNING
            id,
            payroll_record_id,
            description,
            amount
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createPayrollDeduction,
    findAllPayrollDeductions,
    findPayrollDeductionById,
    payrollRecordExists,
    updatePayrollDeduction,
    deletePayrollDeduction
};