const repository =
    require("../repositories/projectContractorRepository");


// Create
const createProjectContractor = async (data) => {

    const {
        projectId,
        siteId,
        contractorId,
        startDate,
        endDate
    } = data;


    // Check project
    const projectExists =
        await repository.projectExists(projectId);

    if (!projectExists) {

        throw new Error(
            "Project not found"
        );
    }


    // Check site
    const siteExists =
        await repository.siteExists(siteId);

    if (!siteExists) {

        throw new Error(
            "Site not found"
        );
    }


    // Check contractor
    const contractorExists =
        await repository.contractorExists(
            contractorId
        );

    if (!contractorExists) {

        throw new Error(
            "Contractor not found"
        );
    }


    // Make sure site belongs to project
    const siteBelongs =
        await repository.siteBelongsToProject(
            siteId,
            projectId
        );

    if (!siteBelongs) {

        throw new Error(
            "Site does not belong to the selected project"
        );
    }


    // Date validation
    if (
        endDate &&
        startDate > endDate
    ) {

        throw new Error(
            "End date cannot be before start date"
        );
    }


    if (data.payableAmount !== undefined && Number(data.payableAmount) < 0) {
        throw new Error("Payable amount cannot be negative");
    }

    if (data.payableAmount !== undefined && Number(data.payableAmount) < 0) {
        throw new Error("Payable amount cannot be negative");
    }

    // Duplicate check
    const duplicate =
        await repository.findDuplicateAssignment({
            siteId,
            contractorId,
            startDate
        });


    if (duplicate) {

        throw new Error(
            "This contractor is already assigned to this site from this start date"
        );
    }


    return repository.createProjectContractor(
        data
    );
};


// Get all
const getAllProjectContractors = async () => {

    return repository.findAllProjectContractors();
};


// Get one
const getProjectContractorById = async (id) => {

    const assignment =
        await repository.findProjectContractorById(
            id
        );


    if (!assignment) {

        throw new Error(
            "Project contractor assignment not found"
        );
    }


    return assignment;
};


// Update
const updateProjectContractor = async (
    id,
    data
) => {

    const existing =
        await repository.findProjectContractorById(
            id
        );


    if (!existing) {

        throw new Error(
            "Project contractor assignment not found"
        );
    }


    const {
        projectId,
        siteId,
        contractorId,
        startDate,
        endDate
    } = data;


    // Check project
    const projectExists =
        await repository.projectExists(projectId);

    if (!projectExists) {

        throw new Error(
            "Project not found"
        );
    }


    // Check site
    const siteExists =
        await repository.siteExists(siteId);

    if (!siteExists) {

        throw new Error(
            "Site not found"
        );
    }


    // Check contractor
    const contractorExists =
        await repository.contractorExists(
            contractorId
        );

    if (!contractorExists) {

        throw new Error(
            "Contractor not found"
        );
    }


    // Check site/project relationship
    const siteBelongs =
        await repository.siteBelongsToProject(
            siteId,
            projectId
        );

    if (!siteBelongs) {

        throw new Error(
            "Site does not belong to the selected project"
        );
    }


    // Date validation
    if (
        endDate &&
        startDate > endDate
    ) {

        throw new Error(
            "End date cannot be before start date"
        );
    }


    // Duplicate check
    const duplicate =
        await repository.findDuplicateAssignment({
            siteId,
            contractorId,
            startDate,
            excludeId: id
        });


    if (duplicate) {

        throw new Error(
            "This contractor is already assigned to this site from this start date"
        );
    }


    return repository.updateProjectContractor(
        id,
        data
    );
};


// Delete
const deleteProjectContractor = async (id) => {

    const existing =
        await repository.findProjectContractorById(
            id
        );


    if (!existing) {

        throw new Error(
            "Project contractor assignment not found"
        );
    }


    return repository.deleteProjectContractor(
        id
    );
};


const getProjectContractorsByProjectId = async (projectId) => {
    if (!Number.isInteger(Number(projectId)) || Number(projectId) <= 0) {
        throw new Error("Invalid project ID");
    }

    if (!await repository.projectExists(projectId)) {
        throw new Error("Project not found");
    }

    return repository.findProjectContractorsByProjectId(projectId);
};


const getProjectContractorsBySiteId = async (siteId) => {
    if (!Number.isInteger(Number(siteId)) || Number(siteId) <= 0) {
        throw new Error("Invalid site ID");
    }

    if (!await repository.siteExists(siteId)) {
        throw new Error("Site not found");
    }

    return repository.findProjectContractorsBySiteId(siteId);
};


const getProjectContractorsByContractorId = async (contractorId) => {
    if (!Number.isInteger(Number(contractorId)) || Number(contractorId) <= 0) {
        throw new Error("Invalid contractor ID");
    }

    if (!await repository.contractorExists(contractorId)) {
        throw new Error("Contractor not found");
    }

    return repository.findProjectContractorsByContractorId(contractorId);
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