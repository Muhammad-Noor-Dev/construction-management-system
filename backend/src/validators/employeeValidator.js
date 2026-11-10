const { z } = require("zod");


const employeeFields = {
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must not exceed 100 characters"),

    cnic: z
        .string()
        .trim()
        .min(5, "CNIC is required")
        .max(30, "CNIC must not exceed 30 characters"),

    phone: z
        .string()
        .trim()
        .max(30, "Phone number must not exceed 30 characters")
        .nullable()
        .optional(),

    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .max(150, "Email must not exceed 150 characters")
        .nullable()
        .optional(),

    address: z
        .string()
        .trim()
        .max(500, "Address must not exceed 500 characters")
        .nullable()
        .optional(),

    jobTitle: z
        .string()
        .trim()
        .min(2, "Job title must be at least 2 characters")
        .max(100, "Job title must not exceed 100 characters"),

    paymentType: z.enum(
        ["Monthly Salaried", "Daily Rate"],
        {
            error: "Payment type must be either Monthly Salaried or Daily Rate"
        }
    ),

    monthlyGross: z
        .coerce
        .number()
        .positive("Monthly gross must be greater than 0")
        .nullable()
        .optional(),

    dailyRate: z
        .coerce
        .number()
        .positive("Daily rate must be greater than 0")
        .nullable()
        .optional(),

    hireDate: z
        .string()
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Hire date must be in YYYY-MM-DD format"
        )
        .nullable()
        .optional()
};


const createEmployeeSchema = z.object(employeeFields);


const updateEmployeeSchema = z.object(employeeFields);


module.exports = {
    createEmployeeSchema,
    updateEmployeeSchema
};