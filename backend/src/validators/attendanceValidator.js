const { z } = require("zod");


const attendanceFields = {

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


    attendanceDate: z
        .string()
        .date(
            "Attendance date must be a valid date"
        ),


    status: z
        .enum(
            [
                "Present",
                "Absent"
            ],
            {
                message:
                    "Status must be either Present or Absent"
            }
        ),


    recordedBy: z
        .coerce
        .number()
        .int()
        .positive(
            "Recorded by must be a positive integer"
        )
        .nullable()
        .optional()
};


const createAttendanceSchema =
    z.object(attendanceFields);


const updateAttendanceSchema =
    createAttendanceSchema;


module.exports = {
    createAttendanceSchema,
    updateAttendanceSchema
};