const { z } = require("zod");


const projectFields = {

    name: z
        .string()
        .trim()
        .min(2, "Project name must be at least 2 characters")
        .max(200, "Project name must not exceed 200 characters"),


    clientId: z
        .coerce
        .number()
        .int()
        .positive("Client ID must be a positive integer"),


    budget: z
        .coerce
        .number()
        .positive("Budget must be greater than 0"),


    startDate: z
        .string()
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Start date must be in YYYY-MM-DD format"
        ),


    endDate: z
        .string()
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "End date must be in YYYY-MM-DD format"
        ),


    status: z.enum(
        [
            "Active",
            "On Hold",
            "Completed",
            "Delayed"
        ],
        {
            error: "Invalid project status"
        }
    ),


    completionPercentage: z
        .coerce
        .number()
        .min(0)
        .max(100)
};


const createProjectSchema =
    z.object(projectFields);


const updateProjectSchema =
    z.object(projectFields);


module.exports = {
    createProjectSchema,
    updateProjectSchema
};