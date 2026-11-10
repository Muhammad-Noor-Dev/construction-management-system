const { z } = require("zod");


const assignmentFields = {

    employeeId: z
        .coerce
        .number()
        .int()
        .positive(
            "Employee ID must be a positive integer"
        ),


    siteId: z
        .coerce
        .number()
        .int()
        .positive(
            "Site ID must be a positive integer"
        ),


    startDate: z
        .string()
        .date(
            "Start date must be a valid date"
        ),


    endDate: z
        .string()
        .date(
            "End date must be a valid date"
        )
        .nullable()
        .optional(),


    dailyRateOverride: z
        .coerce
        .number()
        .positive(
            "Daily rate override must be greater than 0"
        )
        .nullable()
        .optional()
};


const createAssignmentSchema =
    z.object(assignmentFields)
        .refine(
            (data) => {

                if (
                    !data.endDate ||
                    !data.startDate
                ) {
                    return true;
                }

                return data.startDate <= data.endDate;
            },
            {
                message:
                    "End date cannot be before start date",
                path: ["endDate"]
            }
        );


const updateAssignmentSchema =
    createAssignmentSchema;


module.exports = {
    createAssignmentSchema,
    updateAssignmentSchema
};