-- HR Builders CMS - CLEAN COMPLETE DATABASE SETUP
-- Generated from the project's schema.sql + 001_project_costs.sql + 002_full_completion.sql
-- Corrected: audit INSERT events are stored as CREATE to satisfy chk_audit_action.
-- Run this entire file once on the EMPTY cms_database database.

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

BEGIN;

-- ============================================================
-- HR BUILDERS CONSTRUCTION MANAGEMENT SYSTEM
-- PostgreSQL Database Schema
-- ============================================================



-- ============================================================
-- 0. CLEAN START
-- ============================================================

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

DROP TABLE IF EXISTS payslips CASCADE;
DROP TABLE IF EXISTS payroll_deductions CASCADE;
DROP TABLE IF EXISTS payroll_records CASCADE;
DROP TABLE IF EXISTS payroll_periods CASCADE;

DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS employee_site_assignments CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

DROP TABLE IF EXISTS site_material_records CASCADE;
DROP TABLE IF EXISTS material_issuance_items CASCADE;
DROP TABLE IF EXISTS material_issuance_requests CASCADE;

DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS warehouse_stock CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS inventory_categories CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;

DROP TABLE IF EXISTS contractor_ratings CASCADE;
DROP TABLE IF EXISTS contractor_payments CASCADE;
DROP TABLE IF EXISTS project_contractors CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;

DROP TABLE IF EXISTS client_payments CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;


-- ============================================================
-- 1. ROLES
-- ============================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. USERS
-- ============================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- ============================================================
-- 3. CLIENTS
-- ============================================================

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_clients_email UNIQUE (email)
);


-- ============================================================
-- 4. PROJECTS
-- ============================================================

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    client_id INTEGER NOT NULL,
    budget NUMERIC(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    completion_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    created_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_projects_client
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_projects_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_projects_budget
        CHECK (budget > 0),

    CONSTRAINT chk_projects_dates
        CHECK (start_date <= end_date),

    CONSTRAINT chk_projects_status
        CHECK (
            status IN (
                'Active',
                'On Hold',
                'Completed',
                'Delayed'
            )
        ),

    CONSTRAINT chk_projects_completion
        CHECK (
            completion_percentage >= 0
            AND completion_percentage <= 100
        )
);


-- ============================================================
-- 5. SITES
-- ============================================================

CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sites_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_site_name_per_project
        UNIQUE (project_id, name)
);


-- ============================================================
-- 6. CONTRACTORS
-- ============================================================

CREATE TABLE contractors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 7. PROJECT / SITE CONTRACTOR ASSIGNMENTS
-- ============================================================

CREATE TABLE project_contractors (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    site_id INTEGER NOT NULL,
    contractor_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_project_contractors_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_project_contractors_site
        FOREIGN KEY (site_id)
        REFERENCES sites(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_project_contractors_contractor
        FOREIGN KEY (contractor_id)
        REFERENCES contractors(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_project_contractor_dates
        CHECK (
            end_date IS NULL
            OR start_date <= end_date
        ),

    CONSTRAINT uq_project_site_contractor
        UNIQUE (site_id, contractor_id, start_date)
);


-- ============================================================
-- 8. CONTRACTOR PAYMENTS
-- ============================================================

CREATE TABLE contractor_payments (
    id SERIAL PRIMARY KEY,
    contractor_id INTEGER NOT NULL,
    project_id INTEGER,
    amount NUMERIC(15, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    reference VARCHAR(100),
    notes TEXT,
    recorded_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_contractor_payments_contractor
        FOREIGN KEY (contractor_id)
        REFERENCES contractors(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_contractor_payments_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_contractor_payments_user
        FOREIGN KEY (recorded_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_contractor_payment_amount
        CHECK (amount > 0)
);


-- ============================================================
-- 9. CONTRACTOR RATINGS
-- ============================================================

CREATE TABLE contractor_ratings (
    id SERIAL PRIMARY KEY,
    contractor_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_contractor_ratings_contractor
        FOREIGN KEY (contractor_id)
        REFERENCES contractors(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_contractor_ratings_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_contractor_ratings_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_contractor_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT uq_contractor_project_rating
        UNIQUE (contractor_id, project_id)
);


-- ============================================================
-- 10. CLIENT PAYMENTS
-- ============================================================

CREATE TABLE client_payments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    project_id INTEGER,
    invoice_reference VARCHAR(100),
    amount NUMERIC(15, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    notes TEXT,
    recorded_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_client_payments_client
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_client_payments_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_client_payments_user
        FOREIGN KEY (recorded_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_client_payment_amount
        CHECK (amount > 0)
);


-- ============================================================
-- 11. EMPLOYEES
-- ============================================================

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    cnic VARCHAR(15) NOT NULL UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    job_title VARCHAR(100) NOT NULL,
    payment_type VARCHAR(20) NOT NULL,
    monthly_gross NUMERIC(15, 2),
    daily_rate NUMERIC(15, 2),
    hire_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_employee_payment_type
        CHECK (
            payment_type IN (
                'Monthly Salaried',
                'Daily Rate'
            )
        ),

    CONSTRAINT chk_employee_salary_fields
        CHECK (
            (
                payment_type = 'Monthly Salaried'
                AND monthly_gross IS NOT NULL
                AND monthly_gross > 0
                AND daily_rate IS NULL
            )
            OR
            (
                payment_type = 'Daily Rate'
                AND daily_rate IS NOT NULL
                AND daily_rate > 0
                AND monthly_gross IS NULL
            )
        )
);


-- ============================================================
-- 12. EMPLOYEE SITE ASSIGNMENTS
-- ============================================================

CREATE TABLE employee_site_assignments (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    site_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    daily_rate_override NUMERIC(15, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_assignments_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_assignments_site
        FOREIGN KEY (site_id)
        REFERENCES sites(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_employee_assignment_dates
        CHECK (
            end_date IS NULL
            OR start_date <= end_date
        ),

    CONSTRAINT chk_daily_rate_override
        CHECK (
            daily_rate_override IS NULL
            OR daily_rate_override > 0
        ),

    CONSTRAINT uq_employee_site_assignment
        UNIQUE (employee_id, site_id, start_date)
);


-- ============================================================
-- 13. ATTENDANCE
-- ============================================================

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    site_id INTEGER NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    recorded_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_attendance_site
        FOREIGN KEY (site_id)
        REFERENCES sites(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_attendance_user
        FOREIGN KEY (recorded_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_attendance_status
        CHECK (
            status IN (
                'Present',
                'Absent'
            )
        ),

    CONSTRAINT uq_employee_attendance_date
        UNIQUE (employee_id, attendance_date)
);


-- ============================================================
-- 14. WAREHOUSES
-- ============================================================

CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 15. INVENTORY CATEGORIES
-- ============================================================

CREATE TABLE inventory_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 16. INVENTORY ITEMS
-- ============================================================

CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category_id INTEGER NOT NULL,
    threshold INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_items_category
        FOREIGN KEY (category_id)
        REFERENCES inventory_categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_inventory_threshold
        CHECK (threshold >= 0),

    CONSTRAINT uq_inventory_item_name
        UNIQUE (name)
);


-- ============================================================
-- 17. WAREHOUSE STOCK
-- ============================================================

CREATE TABLE warehouse_stock (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_warehouse_stock_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_warehouse_stock_item
        FOREIGN KEY (item_id)
        REFERENCES inventory_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_warehouse_stock_quantity
        CHECK (quantity >= 0),

    CONSTRAINT uq_warehouse_item
        UNIQUE (warehouse_id, item_id)
);


-- ============================================================
-- 18. MATERIAL ISSUANCE REQUESTS
-- ============================================================

CREATE TABLE material_issuance_requests (
    id SERIAL PRIMARY KEY,
    site_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    requested_by INTEGER NOT NULL,
    approved_by INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    rejection_reason TEXT,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,

    CONSTRAINT fk_issuance_requests_site
        FOREIGN KEY (site_id)
        REFERENCES sites(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_issuance_requests_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_issuance_requests_requester
        FOREIGN KEY (requested_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_issuance_requests_approver
        FOREIGN KEY (approved_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_issuance_request_status
        CHECK (
            status IN (
                'Pending',
                'Approved',
                'Rejected'
            )
        )
);


-- ============================================================
-- 19. MATERIAL ISSUANCE ITEMS
-- ============================================================

CREATE TABLE material_issuance_items (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,

    CONSTRAINT fk_issuance_items_request
        FOREIGN KEY (request_id)
        REFERENCES material_issuance_requests(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_issuance_items_item
        FOREIGN KEY (item_id)
        REFERENCES inventory_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_issuance_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT uq_issuance_request_item
        UNIQUE (request_id, item_id)
);


-- ============================================================
-- 20. INVENTORY TRANSACTIONS
-- ============================================================

CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    quantity INTEGER NOT NULL,
    site_id INTEGER,
    material_issuance_request_id INTEGER,
    reference VARCHAR(100),
    notes TEXT,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recorded_by INTEGER,

    CONSTRAINT fk_inventory_transactions_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_transactions_item
        FOREIGN KEY (item_id)
        REFERENCES inventory_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_transactions_site
        FOREIGN KEY (site_id)
        REFERENCES sites(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_inventory_transactions_request
        FOREIGN KEY (material_issuance_request_id)
        REFERENCES material_issuance_requests(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_inventory_transactions_user
        FOREIGN KEY (recorded_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_inventory_transaction_type
        CHECK (
            transaction_type IN (
                'Stock In',
                'Stock Out',
                'Issuance',
                'Dispatch',
                'Damage',
                'Waste',
                'Transfer Out',
                'Transfer In'
            )
        ),

    CONSTRAINT chk_inventory_transaction_quantity
        CHECK (quantity > 0)
);


-- ============================================================
-- 21. SITE MATERIAL RECORDS
-- ============================================================

CREATE TABLE site_material_records (
    id SERIAL PRIMARY KEY,
    site_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    received_quantity INTEGER NOT NULL DEFAULT 0,
    estimated_consumption INTEGER NOT NULL DEFAULT 0,
    actual_consumption INTEGER NOT NULL DEFAULT 0,
    waste_quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_site_material_records_site
        FOREIGN KEY (site_id)
        REFERENCES sites(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_site_material_records_item
        FOREIGN KEY (item_id)
        REFERENCES inventory_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_site_material_received
        CHECK (received_quantity >= 0),

    CONSTRAINT chk_site_material_estimated
        CHECK (estimated_consumption >= 0),

    CONSTRAINT chk_site_material_actual
        CHECK (actual_consumption >= 0),

    CONSTRAINT chk_site_material_waste
        CHECK (waste_quantity >= 0),

    CONSTRAINT uq_site_material_item
        UNIQUE (site_id, item_id)
);


-- ============================================================
-- 22. PAYROLL PERIODS
-- ============================================================

CREATE TABLE payroll_periods (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft',
    prepared_by INTEGER,
    approved_by INTEGER,
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,

    CONSTRAINT fk_payroll_period_prepared_by
        FOREIGN KEY (prepared_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_payroll_period_approved_by
        FOREIGN KEY (approved_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_payroll_year
        CHECK (year >= 2000),

    CONSTRAINT chk_payroll_month
        CHECK (month BETWEEN 1 AND 12),

    CONSTRAINT chk_payroll_status
        CHECK (
            status IN (
                'Draft',
                'Prepared',
                'Under Review',
                'Approved',
                'Paid'
            )
        ),

    CONSTRAINT uq_payroll_period
        UNIQUE (year, month)
);


-- ============================================================
-- 23. PAYROLL RECORDS
-- ============================================================

CREATE TABLE payroll_records (
    id SERIAL PRIMARY KEY,
    payroll_period_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    working_days INTEGER NOT NULL DEFAULT 0,
    present_days INTEGER NOT NULL DEFAULT 0,
    absent_days INTEGER NOT NULL DEFAULT 0,
    gross_salary NUMERIC(15, 2) NOT NULL,
    total_deductions NUMERIC(15, 2) NOT NULL DEFAULT 0,
    net_pay NUMERIC(15, 2) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payroll_records_period
        FOREIGN KEY (payroll_period_id)
        REFERENCES payroll_periods(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_payroll_records_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_payroll_working_days
        CHECK (working_days >= 0),

    CONSTRAINT chk_payroll_present_days
        CHECK (present_days >= 0),

    CONSTRAINT chk_payroll_absent_days
        CHECK (absent_days >= 0),

    CONSTRAINT chk_payroll_gross
        CHECK (gross_salary >= 0),

    CONSTRAINT chk_payroll_deductions
        CHECK (total_deductions >= 0),

    CONSTRAINT chk_payroll_net
        CHECK (net_pay >= 0),

    CONSTRAINT uq_payroll_employee
        UNIQUE (payroll_period_id, employee_id)
);


-- ============================================================
-- 24. PAYROLL DEDUCTIONS
-- ============================================================

CREATE TABLE payroll_deductions (
    id SERIAL PRIMARY KEY,
    payroll_record_id INTEGER NOT NULL,
    description VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payroll_deductions_record
        FOREIGN KEY (payroll_record_id)
        REFERENCES payroll_records(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_payroll_deduction_amount
        CHECK (amount > 0)
);


-- ============================================================
-- 25. PAYSLIPS
-- ============================================================

CREATE TABLE payslips (
    id SERIAL PRIMARY KEY,
    payroll_record_id INTEGER NOT NULL UNIQUE,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payslips_payroll_record
        FOREIGN KEY (payroll_record_id)
        REFERENCES payroll_records(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- ============================================================
-- 26. SYSTEM SETTINGS
-- ============================================================

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by INTEGER,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_system_settings_user
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


-- ============================================================
-- 27. AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(20) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_audit_action
        CHECK (
            action IN (
                'CREATE',
                'UPDATE',
                'DELETE'
            )
        )
);


-- ============================================================
-- 28. INDEXES
-- ============================================================

CREATE INDEX idx_users_role_id
    ON users(role_id);

CREATE INDEX idx_projects_client_id
    ON projects(client_id);

CREATE INDEX idx_projects_status
    ON projects(status);

CREATE INDEX idx_sites_project_id
    ON sites(project_id);

CREATE INDEX idx_project_contractors_project_id
    ON project_contractors(project_id);

CREATE INDEX idx_project_contractors_site_id
    ON project_contractors(site_id);

CREATE INDEX idx_project_contractors_contractor_id
    ON project_contractors(contractor_id);

CREATE INDEX idx_contractor_payments_contractor_id
    ON contractor_payments(contractor_id);

CREATE INDEX idx_contractor_payments_project_id
    ON contractor_payments(project_id);

CREATE INDEX idx_client_payments_client_id
    ON client_payments(client_id);

CREATE INDEX idx_client_payments_project_id
    ON client_payments(project_id);

CREATE INDEX idx_employee_site_assignments_employee_id
    ON employee_site_assignments(employee_id);

CREATE INDEX idx_employee_site_assignments_site_id
    ON employee_site_assignments(site_id);

CREATE INDEX idx_attendance_employee_id
    ON attendance(employee_id);

CREATE INDEX idx_attendance_site_id
    ON attendance(site_id);

CREATE INDEX idx_attendance_date
    ON attendance(attendance_date);

CREATE INDEX idx_warehouse_stock_item_id
    ON warehouse_stock(item_id);

CREATE INDEX idx_inventory_transactions_item_id
    ON inventory_transactions(item_id);

CREATE INDEX idx_inventory_transactions_warehouse_id
    ON inventory_transactions(warehouse_id);

CREATE INDEX idx_inventory_transactions_site_id
    ON inventory_transactions(site_id);

CREATE INDEX idx_inventory_transactions_date
    ON inventory_transactions(transaction_date);

CREATE INDEX idx_issuance_requests_status
    ON material_issuance_requests(status);

CREATE INDEX idx_issuance_requests_site_id
    ON material_issuance_requests(site_id);

CREATE INDEX idx_payroll_records_employee_id
    ON payroll_records(employee_id);

CREATE INDEX idx_payroll_records_period_id
    ON payroll_records(payroll_period_id);

CREATE INDEX idx_audit_logs_user_id
    ON audit_logs(user_id);

CREATE INDEX idx_audit_logs_table_name
    ON audit_logs(table_name);

CREATE INDEX idx_audit_logs_created_at
    ON audit_logs(created_at);


-- ============================================================
-- 29. INITIAL ROLES
-- ============================================================

INSERT INTO roles (name) VALUES
    ('Admin'),
    ('Management'),
    ('Accounts'),
    ('Project Manager'),
    ('Supervisor'),
    ('Store Manager'),
    ('Warehouse Worker');


-- ============================================================
-- 30. DEFAULT SYSTEM SETTINGS
-- ============================================================

INSERT INTO system_settings
    (setting_key, setting_value, description)
VALUES
    (
        'inventory_low_stock_enabled',
        'true',
        'Enable low-stock alerts when quantity reaches or falls below item threshold.'
    );


-- ============================================================
-- FINISH
-- ============================================================

-- Run this once against the existing CMS PostgreSQL database.
CREATE TABLE IF NOT EXISTS project_costs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    site_id INTEGER,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    cost_date DATE NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_project_costs_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_project_costs_site
        FOREIGN KEY (site_id) REFERENCES sites(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_project_costs_user
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_project_cost_amount CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_project_costs_project_id ON project_costs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_site_id ON project_costs(site_id);

-- HR Builders CMS - Full backend completion migration
-- Run once against the existing CMS PostgreSQL database.


CREATE TABLE IF NOT EXISTS project_costs (
    id SERIAL PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    site_id INTEGER REFERENCES sites(id) ON DELETE SET NULL, category VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL, amount NUMERIC(15,2) NOT NULL CHECK(amount>0),
    cost_date DATE NOT NULL, created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_project_costs_project_id ON project_costs(project_id);

ALTER TABLE inventory_items
    ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(15,2) NOT NULL DEFAULT 0;

ALTER TABLE project_contractors
    ADD COLUMN IF NOT EXISTS payable_amount NUMERIC(15,2) NOT NULL DEFAULT 0;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_project_contractor_payable_amount'
    ) THEN
        ALTER TABLE project_contractors
            ADD CONSTRAINT chk_project_contractor_payable_amount CHECK (payable_amount >= 0);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS client_invoices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    project_id INTEGER REFERENCES projects(id) ON UPDATE CASCADE ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','Partially Paid','Paid','Cancelled')),
    created_by INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_invoices_client ON client_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_project ON client_invoices(project_id);

CREATE OR REPLACE FUNCTION cms_audit_row() RETURNS trigger AS $$
DECLARE actor INTEGER; rid INTEGER; old_json JSONB; new_json JSONB;
BEGIN
    BEGIN actor := NULLIF(current_setting('app.user_id', true), '')::INTEGER; EXCEPTION WHEN OTHERS THEN actor := NULL; END;
    IF TG_OP = 'DELETE' THEN rid := (to_jsonb(OLD)->>'id')::INTEGER; old_json := to_jsonb(OLD); new_json := NULL;
    ELSIF TG_OP = 'INSERT' THEN rid := (to_jsonb(NEW)->>'id')::INTEGER; old_json := NULL; new_json := to_jsonb(NEW);
    ELSE rid := (to_jsonb(NEW)->>'id')::INTEGER; old_json := to_jsonb(OLD); new_json := to_jsonb(NEW); END IF;
    INSERT INTO audit_logs(user_id, action, table_name, record_id, old_values, new_values)
    VALUES (actor, CASE WHEN TG_OP = 'INSERT' THEN 'CREATE' ELSE TG_OP END, TG_TABLE_NAME, rid, old_json, new_json);
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','projects','project_costs','sites','contractors','project_contractors','contractor_payments',
    'contractor_ratings','client_payments','employees','employee_site_assignments','attendance',
    'warehouses','inventory_categories','inventory_items','warehouse_stock','material_issuance_requests',
    'material_issuance_items','inventory_transactions','site_material_records','payroll_periods',
    'payroll_records','payroll_deductions','payslips','system_settings','users','client_invoices'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_cms_audit ON %I', t);
    EXECUTE format('CREATE TRIGGER trg_cms_audit AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION cms_audit_row()', t);
  END LOOP;
END $$;

INSERT INTO system_settings(setting_key, setting_value, description)
VALUES
 ('inventory_low_stock_enabled','true','Enable automatic low-stock alerts'),
 ('payroll_working_days_default','26','Default working days used when generating monthly payroll'),
 ('company_currency','PKR','System currency')
ON CONFLICT (setting_key) DO NOTHING;

COMMIT;
