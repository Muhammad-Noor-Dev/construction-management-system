const pool = require("../config/database");


const createEmployee = async ({
    fullName,
    cnic,
    phone,
    email,
    address,
    jobTitle,
    paymentType,
    monthlyGross,
    dailyRate,
    hireDate
}) => {
    const result = await pool.query(
        `
        INSERT INTO employees (
            full_name,
            cnic,
            phone,
            email,
            address,
            job_title,
            payment_type,
            monthly_gross,
            daily_rate,
            hire_date
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10
        )
        RETURNING
            id,
            full_name,
            cnic,
            phone,
            email,
            address,
            job_title,
            payment_type,
            monthly_gross,
            daily_rate,
            hire_date,
            is_active,
            created_at,
            updated_at
        `,
        [
            fullName,
            cnic,
            phone,
            email,
            address,
            jobTitle,
            paymentType,
            monthlyGross,
            dailyRate,
            hireDate
        ]
    );

    return result.rows[0];
};


const findAllEmployees = async () => {
    const result = await pool.query(
        `
        SELECT
            id,
            full_name,
            cnic,
            phone,
            email,
            address,
            job_title,
            payment_type,
            monthly_gross,
            daily_rate,
            hire_date,
            is_active,
            created_at,
            updated_at
        FROM employees
        ORDER BY id DESC
        `
    );

    return result.rows;
};


const findEmployeeById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            id,
            full_name,
            cnic,
            phone,
            email,
            address,
            job_title,
            payment_type,
            monthly_gross,
            daily_rate,
            hire_date,
            is_active,
            created_at,
            updated_at
        FROM employees
        WHERE id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};


const findEmployeeByCnic = async (cnic) => {
    const result = await pool.query(
        `
        SELECT
            id,
            full_name,
            cnic,
            phone,
            email,
            address,
            job_title,
            payment_type,
            monthly_gross,
            daily_rate,
            hire_date,
            is_active,
            created_at,
            updated_at
        FROM employees
        WHERE cnic = $1
        LIMIT 1
        `,
        [cnic]
    );

    return result.rows[0] || null;
};


const updateEmployee = async (
    id,
    {
        fullName,
        cnic,
        phone,
        email,
        address,
        jobTitle,
        paymentType,
        monthlyGross,
        dailyRate,
        hireDate
    }
) => {
    const result = await pool.query(
        `
        UPDATE employees
        SET
            full_name = $1,
            cnic = $2,
            phone = $3,
            email = $4,
            address = $5,
            job_title = $6,
            payment_type = $7,
            monthly_gross = $8,
            daily_rate = $9,
            hire_date = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING
            id,
            full_name,
            cnic,
            phone,
            email,
            address,
            job_title,
            payment_type,
            monthly_gross,
            daily_rate,
            hire_date,
            is_active,
            created_at,
            updated_at
        `,
        [
            fullName,
            cnic,
            phone,
            email,
            address,
            jobTitle,
            paymentType,
            monthlyGross,
            dailyRate,
            hireDate,
            id
        ]
    );

    return result.rows[0] || null;
};


const deactivateEmployee = async (id) => {
    const result = await pool.query(
        `
        UPDATE employees
        SET
            is_active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
            id,
            full_name,
            cnic,
            phone,
            email,
            address,
            job_title,
            payment_type,
            monthly_gross,
            daily_rate,
            hire_date,
            is_active,
            created_at,
            updated_at
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    createEmployee,
    findAllEmployees,
    findEmployeeById,
    findEmployeeByCnic,
    updateEmployee,
    deactivateEmployee
};