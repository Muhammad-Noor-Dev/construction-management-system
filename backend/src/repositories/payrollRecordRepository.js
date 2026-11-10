const pool = require("../config/database");


// Create payroll record
const createPayrollRecord = async ({
    payrollPeriodId,
    employeeId,
    workingDays,
    presentDays,
    absentDays,
    grossSalary,
    totalDeductions,
    netPay
}) => {

    const result = await pool.query(
        `
        INSERT INTO payroll_records (
            payroll_period_id,
            employee_id,
            working_days,
            present_days,
            absent_days,
            gross_salary,
            total_deductions,
            net_pay
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
            id,
            payroll_period_id,
            employee_id,
            working_days,
            present_days,
            absent_days,
            gross_salary,
            total_deductions,
            net_pay,
            created_at
        `,
        [
            payrollPeriodId,
            employeeId,
            workingDays ?? 0,
            presentDays ?? 0,
            absentDays ?? 0,
            grossSalary,
            totalDeductions ?? 0,
            netPay
        ]
    );

    return result.rows[0];
};


// Get all payroll records
const findAllPayrollRecords = async () => {

    const result = await pool.query(
        `
        SELECT
            pr.id,

            pr.payroll_period_id,
            pp.year,
            pp.month,
            pp.status AS payroll_status,

            pr.employee_id,
            e.full_name AS employee_name,

            pr.working_days,
            pr.present_days,
            pr.absent_days,
            pr.gross_salary,
            pr.total_deductions,
            pr.net_pay,

            pr.created_at

        FROM payroll_records pr

        INNER JOIN payroll_periods pp
            ON pr.payroll_period_id = pp.id

        INNER JOIN employees e
            ON pr.employee_id = e.id

        ORDER BY
            pp.year DESC,
            pp.month DESC,
            pr.id DESC
        `
    );

    return result.rows;
};


// Get payroll record by ID
const findPayrollRecordById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            pr.id,

            pr.payroll_period_id,
            pp.year,
            pp.month,
            pp.status AS payroll_status,

            pr.employee_id,
            e.full_name AS employee_name,

            pr.working_days,
            pr.present_days,
            pr.absent_days,
            pr.gross_salary,
            pr.total_deductions,
            pr.net_pay,

            pr.created_at

        FROM payroll_records pr

        INNER JOIN payroll_periods pp
            ON pr.payroll_period_id = pp.id

        INNER JOIN employees e
            ON pr.employee_id = e.id

        WHERE pr.id = $1

        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


// Check payroll period exists
const payrollPeriodExists = async (payrollPeriodId) => {

    const result = await pool.query(
        `
        SELECT id
        FROM payroll_periods
        WHERE id = $1
        LIMIT 1
        `,
        [payrollPeriodId]
    );

    return result.rows.length > 0;
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


// Check duplicate employee in payroll period
const findDuplicatePayrollRecord = async ({
    payrollPeriodId,
    employeeId,
    excludeId = null
}) => {

    let query = `
        SELECT
            id,
            payroll_period_id,
            employee_id
        FROM payroll_records
        WHERE payroll_period_id = $1
          AND employee_id = $2
    `;

    const values = [
        payrollPeriodId,
        employeeId
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


// Update payroll record
const updatePayrollRecord = async (
    id,
    {
        payrollPeriodId,
        employeeId,
        workingDays,
        presentDays,
        absentDays,
        grossSalary,
        totalDeductions,
        netPay
    }
) => {

    const result = await pool.query(
        `
        UPDATE payroll_records

        SET
            payroll_period_id = $1,
            employee_id = $2,
            working_days = $3,
            present_days = $4,
            absent_days = $5,
            gross_salary = $6,
            total_deductions = $7,
            net_pay = $8

        WHERE id = $9

        RETURNING
            id,
            payroll_period_id,
            employee_id,
            working_days,
            present_days,
            absent_days,
            gross_salary,
            total_deductions,
            net_pay,
            created_at
        `,
        [
            payrollPeriodId,
            employeeId,
            workingDays,
            presentDays,
            absentDays,
            grossSalary,
            totalDeductions,
            netPay,
            id
        ]
    );

    return result.rows[0] || null;
};


// Delete payroll record
const deletePayrollRecord = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM payroll_records
        WHERE id = $1
        RETURNING
            id,
            payroll_period_id,
            employee_id
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createPayrollRecord,
    findAllPayrollRecords,
    findPayrollRecordById,
    payrollPeriodExists,
    employeeExists,
    findDuplicatePayrollRecord,
    updatePayrollRecord,
    deletePayrollRecord
};