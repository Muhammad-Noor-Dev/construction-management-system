const { z } = require("zod");


const createUserSchema = z.object({

    fullName: z
        .string()
        .trim()
        .min(2)
        .max(100),

    email: z
        .string()
        .trim()
        .email()
        .transform(value => value.toLowerCase()),

    password: z
        .string()
        .min(8)
        .max(100)
        .regex(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
        ),

    roleId: z
        .coerce
        .number()
        .int()
        .positive(),

    isActive: z
        .boolean()
        .optional()
});


const updateUserSchema = z.object({

    fullName: z
        .string()
        .trim()
        .min(2)
        .max(100),

    email: z
        .string()
        .trim()
        .email()
        .transform(value => value.toLowerCase()),

    roleId: z
        .coerce
        .number()
        .int()
        .positive(),

    isActive: z
        .boolean()
});


const changePasswordSchema = z.object({

    password: z
        .string()
        .min(8)
        .max(100)
        .regex(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
        )
});


module.exports = {
    createUserSchema,
    updateUserSchema,
    changePasswordSchema
};