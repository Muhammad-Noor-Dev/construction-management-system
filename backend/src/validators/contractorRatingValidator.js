const { z } = require("zod");


const contractorRatingFields = {

    contractorId: z
        .coerce
        .number()
        .int()
        .positive(),

    projectId: z
        .coerce
        .number()
        .int()
        .positive(),

    rating: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(5),

    comment: z
        .string()
        .trim()
        .optional()
};


const createContractorRatingSchema =
    z.object(contractorRatingFields);


const updateContractorRatingSchema =
    z.object(contractorRatingFields);


module.exports = {
    createContractorRatingSchema,
    updateContractorRatingSchema
};