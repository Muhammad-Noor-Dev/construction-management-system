const pool = require("../config/database");


// Create payslip
const createPayslip = async (payrollRecordId) => {

    const result = await pool.query(
        `
        INSERT INTO payslips (
            payroll_record_id
        )
        VALUES ($1)
        RETURNING
            id,
            payroll_record_id,
            generated_at
        `,
        [payrollRecordId]
    );

    return result.rows[0];
};


// Get all payslips
const findAllPayslips = async () => {

    const result = await pool.query(
        `
        SELECT
            p.id,
            p.payroll_record_id,

            pr.employee_id,
            e.full_name AS employee_name,

            pr.payroll_period_id,
            pp.year,
            pp.month,
            pp.status AS payroll_status,

            pr.working_days,
            pr.present_days,
            pr.absent_days,
            pr.gross_salary,
            pr.total_deductions,
            pr.net_pay,

            p.generated_at

        FROM payslips p

        INNER JOIN payroll_records pr
            ON p.payroll_record_id = pr.id

        INNER JOIN employees e
            ON pr.employee_id = e.id

        INNER JOIN payroll_periods pp
            ON pr.payroll_period_id = pp.id

        ORDER BY
            pp.year DESC,
            pp.month DESC,
            p.id DESC
        `
    );

    return result.rows;
};


// Get payslip by ID
const findPayslipById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            p.id,
            p.payroll_record_id,

            pr.employee_id,
            e.full_name AS employee_name,

            pr.payroll_period_id,
            pp.year,
            pp.month,
            pp.status AS payroll_status,

            pr.working_days,
            pr.present_days,
            pr.absent_days,
            pr.gross_salary,
            pr.total_deductions,
            pr.net_pay,

            p.generated_at

        FROM payslips p

        INNER JOIN payroll_records pr
            ON p.payroll_record_id = pr.id

        INNER JOIN employees e
            ON pr.employee_id = e.id

        INNER JOIN payroll_periods pp
            ON pr.payroll_period_id = pp.id

        WHERE p.id = $1

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


// Check if payslip already exists
const findPayslipByPayrollRecordId = async (
    payrollRecordId
) => {

    const result = await pool.query(
        `
        SELECT
            id,
            payroll_record_id,
            generated_at
        FROM payslips
        WHERE payroll_record_id = $1
        LIMIT 1
        `,
        [payrollRecordId]
    );

    return result.rows[0] || null;
};


// Delete payslip
const deletePayslip = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM payslips
        WHERE id = $1
        RETURNING
            id,
            payroll_record_id,
            generated_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createPayslip,
    findAllPayslips,
    findPayslipById,
    payrollRecordExists,
    findPayslipByPayrollRecordId,
    deletePayslip
};