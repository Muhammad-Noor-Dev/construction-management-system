const { z } = require("zod");


const siteFields = {

    projectId: z
        .coerce
        .number()
        .int()
        .positive(
            "Project ID must be a positive integer"
        ),


    name: z
        .string()
        .trim()
        .min(
            2,
            "Site name must be at least 2 characters"
        )
        .max(
            200,
            "Site name must not exceed 200 characters"
        ),


    location: z
        .string()
        .trim()
        .min(
            2,
            "Location must be at least 2 characters"
        )
        .max(
            1000,
            "Location must not exceed 1000 characters"
        )
};


const createSiteSchema =
    z.object(siteFields);


const updateSiteSchema =
    z.object(siteFields);


module.exports = {
    createSiteSchema,
    updateSiteSchema
};