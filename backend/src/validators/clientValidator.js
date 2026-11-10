const { z } = require("zod");


const clientFields = {

    name: z
        .string()
        .trim()
        .min(
            2,
            "Client name must be at least 2 characters"
        )
        .max(
            200,
            "Client name must not exceed 200 characters"
        ),


    email: z
        .string()
        .trim()
        .email(
            "Please provide a valid email address"
        )
        .max(
            150,
            "Email must not exceed 150 characters"
        )
        .nullable()
        .optional(),


    phone: z
        .string()
        .trim()
        .max(
            30,
            "Phone number must not exceed 30 characters"
        )
        .nullable()
        .optional(),


    address: z
        .string()
        .trim()
        .max(
            500,
            "Address must not exceed 500 characters"
        )
        .nullable()
        .optional()
};


const createClientSchema =
    z.object(clientFields);


const updateClientSchema =
    z.object(clientFields);


module.exports = {
    createClientSchema,
    updateClientSchema
};