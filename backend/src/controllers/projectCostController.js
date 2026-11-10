const service = require("../services/projectCostService");

const createProjectCost = async (req, res) => {
    try {
        const data = await service.createProjectCost(req.params.projectId, req.body, req.user.userId);
        return res.status(201).json({ success: true, message: "Project cost recorded successfully", data });
    } catch (error) {
        return res.status(error.message === "Project not found" ? 404 : 400).json({ success: false, message: error.message });
    }
};

const getProjectCosts = async (req, res) => {
    try {
        const data = await service.getProjectCosts(req.params.projectId);
        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(error.message === "Project not found" ? 404 : 400).json({ success: false, message: error.message });
    }
};

const getProjectCostSummary = async (req, res) => {
    try {
        const data = await service.getProjectCostSummary(req.params.projectId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(error.message === "Project not found" ? 404 : 400).json({ success: false, message: error.message });
    }
};

const updateProjectCost = async (req, res) => {
    try {
        const data = await service.updateProjectCost(req.params.projectId, req.params.costId, req.body);
        return res.status(200).json({ success: true, message: "Project cost updated successfully", data });
    } catch (error) {
        const status = error.message === "Project cost not found" || error.message === "Project not found" ? 404 : 400;
        return res.status(status).json({ success: false, message: error.message });
    }
};

const deleteProjectCost = async (req, res) => {
    try {
        const data = await service.deleteProjectCost(req.params.projectId, req.params.costId);
        return res.status(200).json({ success: true, message: "Project cost deleted successfully", data });
    } catch (error) {
        const status = error.message === "Project cost not found" || error.message === "Project not found" ? 404 : 400;
        return res.status(status).json({ success: false, message: error.message });
    }
};

module.exports = {
    createProjectCost,
    getProjectCosts,
    getProjectCostSummary,
    updateProjectCost,
    deleteProjectCost
};
