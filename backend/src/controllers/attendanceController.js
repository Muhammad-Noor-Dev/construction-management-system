const attendanceService =
    require("../services/attendanceService");


// CREATE
const createAttendance = async (req, res) => {

    try {

        const attendance =
            await attendanceService.createAttendance(
                req.body
            );


        return res.status(201).json({
            success: true,
            message:
                "Attendance recorded successfully",
            data: attendance
        });

    } catch (error) {

        console.error(
            "Create attendance error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllAttendance = async (req, res) => {

    try {

        const attendance =
            await attendanceService.getAllAttendance();


        return res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });

    } catch (error) {

        console.error(
            "Get attendance error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve attendance records"
        });
    }
};


// GET ONE
const getAttendanceById = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid attendance ID"
            });
        }


        const attendance =
            await attendanceService.getAttendanceById(
                id
            );


        return res.status(200).json({
            success: true,
            data: attendance
        });

    } catch (error) {

        console.error(
            "Get attendance error:",
            error.message
        );


        if (
            error.message ===
            "Attendance record not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve attendance record"
        });
    }
};


// UPDATE
const updateAttendance = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid attendance ID"
            });
        }


        const attendance =
            await attendanceService.updateAttendance(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message:
                "Attendance updated successfully",
            data: attendance
        });

    } catch (error) {

        console.error(
            "Update attendance error:",
            error.message
        );


        if (
            error.message ===
            "Attendance record not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// DELETE
const deleteAttendance = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid attendance ID"
            });
        }


        const attendance =
            await attendanceService.deleteAttendance(
                id
            );


        return res.status(200).json({
            success: true,
            message:
                "Attendance deleted successfully",
            data: attendance
        });

    } catch (error) {

        console.error(
            "Delete attendance error:",
            error.message
        );


        if (
            error.message ===
            "Attendance record not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to delete attendance record"
        });
    }
};


module.exports = {
    createAttendance,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance
};