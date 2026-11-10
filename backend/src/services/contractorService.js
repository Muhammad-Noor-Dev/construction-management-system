const repository =
    require("../repositories/contractorRepository");


// Create
const createContractor = async (data) => {

    return repository.createContractor(data);
};


// Get all
const getAllContractors = async () => {

    return repository.findAllContractors();
};


// Get one
const getContractorById = async (id) => {

    const contractor =
        await repository.findContractorById(id);

    if (!contractor) {

        throw new Error(
            "Contractor not found"
        );
    }

    return contractor;
};


// Update
const updateContractor = async (id, data) => {

    const existing =
        await repository.findContractorById(id);

    if (!existing) {

        throw new Error(
            "Contractor not found"
        );
    }

    return repository.updateContractor(
        id,
        data
    );
};


// Delete
const deleteContractor = async (id) => {

    const existing =
        await repository.findContractorById(id);

    if (!existing) {

        throw new Error(
            "Contractor not found"
        );
    }

    return repository.deleteContractor(id);
};


module.exports = {
    createContractor,
    getAllContractors,
    getContractorById,
    updateContractor,
    deleteContractor
};