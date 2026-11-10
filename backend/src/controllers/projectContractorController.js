const service =
    require("../services/projectContractorService");


// CREATE
const createProjectContractor = async (
    req,
    res
) => {

    try {

        const assignment =
            await service.createProjectContractor(
                req.body
            );


        return res.status(201).json({
            success: true,
            message:
                "Contractor assigned to project site successfully",
            data: assignment
        });

    } catch (error) {

        console.error(
            "Create project contractor error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllProjectContractors = async (
    req,
    res
) => {

    try {

        const assignments =
            await service.getAllProjectContractors();


        return res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });

    } catch (error) {

        console.error(
            "Get project contractors error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve project contractor assignments"
        });
    }
};


// GET ONE
const getProjectContractorById = async (
    req,
    res
) => {

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
                    "Invalid project contractor assignment ID"
            });
        }


        const assignment =
            await service.getProjectContractorById(
                id
            );


        return res.status(200).json({
            success: true,
            data: assignment
        });

    } catch (error) {

        if (
            error.message ===
            "Project contractor assignment not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve project contractor assignment"
        });
    }
};


// UPDATE
const updateProjectContractor = async (
    req,
    res
) => {

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
                    "Invalid project contractor assignment ID"
            });
        }


        const assignment =
            await service.updateProjectContractor(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message:
                "Project contractor assignment updated successfully",
            data: assignment
        });

    } catch (error) {

        if (
            error.message ===
            "Project contractor assignment not found"
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
const deleteProjectContractor = async (
    req,
    res
) => {

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
                    "Invalid project contractor assignment ID"
            });
        }


        const assignment =
            await service.deleteProjectContractor(
                id
            );


        return res.status(200).json({
            success: true,
            message:
                "Project contractor assignment deleted successfully",
            data: assignment
        });

    } catch (error) {

        if (
            error.message ===
            "Project contractor assignment not found"
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to delete project contractor assignment"
        });
    }
};


const getProjectContractorsByProjectId = async (req, res) => {
    try {
        const projectId = Number(req.params.projectId);
        const assignments = await service.getProjectContractorsByProjectId(projectId);
        return res.status(200).json({ success: true, count: assignments.length, data: assignments });
    } catch (error) {
        const status = error.message === "Project not found" ? 404 : 400;
        return res.status(status).json({ success: false, message: error.message });
    }
};


const getProjectContractorsBySiteId = async (req, res) => {
    try {
        const siteId = Number(req.params.siteId);
        const assignments = await service.getProjectContractorsBySiteId(siteId);
        return res.status(200).json({ success: true, count: assignments.length, data: assignments });
    } catch (error) {
        const status = error.message === "Site not found" ? 404 : 400;
        return res.status(status).json({ success: false, message: error.message });
    }
};


const getProjectContractorsByContractorId = async (req, res) => {
    try {
        const contractorId = Number(req.params.contractorId);
        const assignments = await service.getProjectContractorsByContractorId(contractorId);
        return res.status(200).json({ success: true, count: assignments.length, data: assignments });
    } catch (error) {
        const status = error.message === "Contractor not found" ? 404 : 400;
        return res.status(status).json({ success: false, message: error.message });
    }
};


module.exports = {
    createProjectContractor,
    getAllProjectContractors,
    getProjectContractorById,
    updateProjectContractor,
    deleteProjectContractor,
    getProjectContractorsByProjectId,
    getProjectContractorsBySiteId,
    getProjectContractorsByContractorId
};