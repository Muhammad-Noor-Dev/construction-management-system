const { z } = require("zod");


const registerSchema = z.object({

    fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must not exceed 100 characters"),


    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .transform((value) => value.toLowerCase()),


    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must not exceed 100 characters"),


    roleId: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(7)
});


const loginSchema = z.object({

    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .transform((value) => value.toLowerCase()),


    password: z
        .string()
        .min(1, "Password is required")
});


module.exports = {
    registerSchema,
    loginSchema
};