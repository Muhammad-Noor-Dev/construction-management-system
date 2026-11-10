const assignmentService =
    require("../services/employeeSiteAssignmentService");


// CREATE
const createAssignment = async (req, res) => {

    try {

        const assignment =
            await assignmentService.createAssignment(
                req.body
            );


        return res.status(201).json({
            success: true,
            message:
                "Employee assigned to site successfully",
            data: assignment
        });

    } catch (error) {

        console.error(
            "Create assignment error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllAssignments = async (req, res) => {

    try {

        const assignments =
            await assignmentService.getAllAssignments();


        return res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });

    } catch (error) {

        console.error(
            "Get assignments error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve employee site assignments"
        });
    }
};


// GET ONE
const getAssignmentById = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid assignment ID"
            });
        }


        const assignment =
            await assignmentService.getAssignmentById(
                id
            );


        return res.status(200).json({
            success: true,
            data: assignment
        });

    } catch (error) {

        console.error(
            "Get assignment error:",
            error.message
        );


        if (
            error.message ===
            "Assignment not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve assignment"
        });
    }
};


// UPDATE
const updateAssignment = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid assignment ID"
            });
        }


        const assignment =
            await assignmentService.updateAssignment(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message:
                "Employee site assignment updated successfully",
            data: assignment
        });

    } catch (error) {

        console.error(
            "Update assignment error:",
            error.message
        );


        if (
            error.message ===
            "Assignment not found"
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
const deleteAssignment = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid assignment ID"
            });
        }


        const assignment =
            await assignmentService.deleteAssignment(
                id
            );


        return res.status(200).json({
            success: true,
            message:
                "Employee site assignment deleted successfully",
            data: assignment
        });

    } catch (error) {

        console.error(
            "Delete assignment error:",
            error.message
        );


        if (
            error.message ===
            "Assignment not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to delete assignment"
        });
    }
};


module.exports = {
    createAssignment,
    getAllAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment
};