const repository =
    require("../repositories/contractorRatingRepository");


// CREATE
const createContractorRating = async (data) => {

    const {
        contractorId,
        projectId,
        rating
    } = data;


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


    // Check project
    const projectExists =
        await repository.projectExists(
            projectId
        );

    if (!projectExists) {

        throw new Error(
            "Project not found"
        );
    }


    // Contractor must have been assigned to project
    const assigned =
        await repository.contractorAssignedToProject(
            contractorId,
            projectId
        );

    if (!assigned) {

        throw new Error(
            "Contractor is not assigned to this project"
        );
    }


    // Rating validation
    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {

        throw new Error(
            "Rating must be an integer between 1 and 5"
        );
    }


    // Duplicate rating
    const existing =
        await repository.findExistingRating(
            contractorId,
            projectId
        );

    if (existing) {

        throw new Error(
            "This contractor has already been rated for this project"
        );
    }


    return repository.createContractorRating(
        data
    );
};


// GET ALL
const getAllContractorRatings = async () => {

    return repository.findAllContractorRatings();
};


// GET ONE
const getContractorRatingById = async (id) => {

    const rating =
        await repository.findContractorRatingById(
            id
        );


    if (!rating) {

        throw new Error(
            "Contractor rating not found"
        );
    }


    return rating;
};


// UPDATE
const updateContractorRating = async (
    id,
    data
) => {

    const existing =
        await repository.findContractorRatingById(
            id
        );


    if (!existing) {

        throw new Error(
            "Contractor rating not found"
        );
    }


    const {
        contractorId,
        projectId,
        rating
    } = data;


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


    // Check project
    const projectExists =
        await repository.projectExists(
            projectId
        );

    if (!projectExists) {

        throw new Error(
            "Project not found"
        );
    }


    // Check assignment
    const assigned =
        await repository.contractorAssignedToProject(
            contractorId,
            projectId
        );

    if (!assigned) {

        throw new Error(
            "Contractor is not assigned to this project"
        );
    }


    // Rating validation
    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {

        throw new Error(
            "Rating must be an integer between 1 and 5"
        );
    }


    // Duplicate check
    const duplicate =
        await repository.findExistingRating(
            contractorId,
            projectId,
            id
        );


    if (duplicate) {

        throw new Error(
            "This contractor has already been rated for this project"
        );
    }


    return repository.updateContractorRating(
        id,
        data
    );
};


// DELETE
const deleteContractorRating = async (id) => {

    const existing =
        await repository.findContractorRatingById(
            id
        );


    if (!existing) {

        throw new Error(
            "Contractor rating not found"
        );
    }


    return repository.deleteContractorRating(
        id
    );
};


module.exports = {
    createContractorRating,
    getAllContractorRatings,
    getContractorRatingById,
    updateContractorRating,
    deleteContractorRating
};