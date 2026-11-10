const projectService = require("../services/projectService");


const createProject = async (req, res) => {

    try {

        const project =
            await projectService.createProject(
                req.body,
                req.user.userId
            );


        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        });

    } catch (error) {

        console.error(
            "Create project error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getAllProjects = async (req, res) => {

    try {

        const projects =
            await projectService.getAllProjects();


        return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });

    } catch (error) {

        console.error(
            "Get projects error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message: "Failed to retrieve projects"
        });
    }
};


const getProjectById = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }


        const project =
            await projectService.getProjectById(id);


        return res.status(200).json({
            success: true,
            data: project
        });

    } catch (error) {

        console.error(
            "Get project error:",
            error.message
        );


        if (
            error.message ===
            "Project not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message: "Failed to retrieve project"
        });
    }
};


const updateProject = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }


        const project =
            await projectService.updateProject(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project
        });

    } catch (error) {

        console.error(
            "Update project error:",
            error.message
        );


        if (
            error.message ===
            "Project not found"
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


module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject
};