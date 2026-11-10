const projectCostRepository = require("../repositories/projectCostRepository");
const projectRepository = require("../repositories/projectRepository");
const siteRepository = require("../repositories/siteRepository");

const validateId = (value, message) => {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) throw new Error(message);
    return id;
};

const ensureProject = async (projectId) => {
    if (!await projectRepository.findProjectById(projectId)) {
        throw new Error("Project not found");
    }
};

const ensureSiteBelongsToProject = async (siteId, projectId) => {
    if (siteId === undefined || siteId === null) return;
    const site = await siteRepository.findSiteById(siteId);
    if (!site) throw new Error("Site not found");
    if (Number(site.project_id) !== Number(projectId)) {
        throw new Error("Site does not belong to the selected project");
    }
};

const validateCostData = ({ category, description, amount, costDate }) => {
    if (!category?.trim() || !description?.trim()) throw new Error("Category and description are required");
    if (Number(amount) <= 0) throw new Error("Amount must be greater than 0");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(costDate)) throw new Error("Cost date must be in YYYY-MM-DD format");
};

const createProjectCost = async (projectId, data, userId) => {
    projectId = validateId(projectId, "Invalid project ID");
    await ensureProject(projectId);
    validateCostData(data);
    const siteId = data.siteId === undefined ? undefined : validateId(data.siteId, "Invalid site ID");
    await ensureSiteBelongsToProject(siteId, projectId);
    return projectCostRepository.createProjectCost({ ...data, projectId, siteId, createdBy: userId });
};

const getProjectCosts = async (projectId) => {
    projectId = validateId(projectId, "Invalid project ID");
    await ensureProject(projectId);
    return projectCostRepository.findAllProjectCosts(projectId);
};

const getProjectCostSummary = async (projectId) => {
    projectId = validateId(projectId, "Invalid project ID");
    await ensureProject(projectId);
    return projectCostRepository.getProjectCostSummary(projectId);
};

const updateProjectCost = async (projectId, costId, data) => {
    projectId = validateId(projectId, "Invalid project ID");
    costId = validateId(costId, "Invalid cost ID");
    await ensureProject(projectId);
    const existing = await projectCostRepository.findProjectCostById(costId);
    if (!existing || Number(existing.project_id) !== projectId) throw new Error("Project cost not found");
    validateCostData(data);
    const siteId = data.siteId === undefined ? undefined : validateId(data.siteId, "Invalid site ID");
    await ensureSiteBelongsToProject(siteId, projectId);
    return projectCostRepository.updateProjectCost(costId, { ...data, siteId });
};

const deleteProjectCost = async (projectId, costId) => {
    projectId = validateId(projectId, "Invalid project ID");
    costId = validateId(costId, "Invalid cost ID");
    await ensureProject(projectId);
    const existing = await projectCostRepository.findProjectCostById(costId);
    if (!existing || Number(existing.project_id) !== projectId) throw new Error("Project cost not found");
    return projectCostRepository.deleteProjectCost(costId);
};

module.exports = {
    createProjectCost,
    getProjectCosts,
    getProjectCostSummary,
    updateProjectCost,
    deleteProjectCost
};
