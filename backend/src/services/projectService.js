const projectRepository = require("../repositories/projectRepository");


const allowedStatuses = [
    "Active",
    "On Hold",
    "Completed",
    "Delayed"
];


const validateProjectRules = ({
    startDate,
    endDate,
    budget,
    completionPercentage,
    status
}) => {

    if (Number(budget) <= 0) {
        throw new Error(
            "Budget must be greater than 0"
        );
    }


    if (endDate && startDate > endDate) {
        throw new Error(
            "Start date cannot be after end date"
        );
    }


    if (
        !allowedStatuses.includes(status)
    ) {
        throw new Error(
            "Invalid project status"
        );
    }


    if (
        Number(completionPercentage) < 0 ||
        Number(completionPercentage) > 100
    ) {
        throw new Error(
            "Completion percentage must be between 0 and 100"
        );
    }


    if (
        status === "Completed" &&
        Number(completionPercentage) !== 100
    ) {
        throw new Error(
            "A completed project must have 100% completion"
        );
    }
};


const createProject = async (data, userId) => {

    const {
        name,
        clientId,
        budget,
        startDate,
        endDate,
        status,
        completionPercentage
    } = data;


    const existingProject =
        await projectRepository.findProjectByName(name);


    if (existingProject) {
        throw new Error(
            "A project with this name already exists"
        );
    }


    const clientExists =
        await projectRepository.clientExists(clientId);


    if (!clientExists) {
        throw new Error(
            "Client not found"
        );
    }


    validateProjectRules({
        startDate,
        endDate,
        budget,
        completionPercentage,
        status
    });


    return await projectRepository.createProject({
        name,
        clientId,
        budget,
        startDate,
        endDate,
        status,
        completionPercentage,
        createdBy: userId
    });
};


const getAllProjects = async () => {
    return await projectRepository.findAllProjects();
};


const getProjectById = async (id) => {

    const project =
        await projectRepository.findProjectById(id);


    if (!project) {
        throw new Error(
            "Project not found"
        );
    }


    return project;
};


const updateProject = async (id, data) => {

    const existingProject =
        await projectRepository.findProjectById(id);


    if (!existingProject) {
        throw new Error(
            "Project not found"
        );
    }


    const {
        name,
        clientId,
        budget,
        startDate,
        endDate,
        status,
        completionPercentage
    } = data;


    const projectWithSameName =
        await projectRepository.findProjectByName(name);


    if (
        projectWithSameName &&
        projectWithSameName.id !== Number(id)
    ) {
        throw new Error(
            "A project with this name already exists"
        );
    }


    const clientExists =
        await projectRepository.clientExists(clientId);


    if (!clientExists) {
        throw new Error(
            "Client not found"
        );
    }


    validateProjectRules({
        startDate,
        endDate,
        budget,
        completionPercentage,
        status
    });


    return await projectRepository.updateProject(
        id,
        data
    );
};


module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject
};