const repository =
    require("../repositories/inventoryCategoryRepository");


// CREATE
const createCategory = async (data) => {

    const nameExists =
        await repository.categoryNameExists(
            data.name
        );

    if (nameExists) {

        throw new Error(
            "Inventory category name already exists"
        );
    }


    return repository.createCategory(data);
};


// GET ALL
const getAllCategories = async () => {

    return repository.findAllCategories();
};


// GET ONE
const getCategoryById = async (id) => {

    const category =
        await repository.findCategoryById(id);

    if (!category) {

        throw new Error(
            "Inventory category not found"
        );
    }

    return category;
};


// UPDATE
const updateCategory = async (
    id,
    data
) => {

    const existing =
        await repository.findCategoryById(id);

    if (!existing) {

        throw new Error(
            "Inventory category not found"
        );
    }


    const nameExists =
        await repository.categoryNameExists(
            data.name,
            id
        );

    if (nameExists) {

        throw new Error(
            "Inventory category name already exists"
        );
    }


    return repository.updateCategory(
        id,
        data
    );
};


// DELETE
const deleteCategory = async (id) => {

    const existing =
        await repository.findCategoryById(id);

    if (!existing) {

        throw new Error(
            "Inventory category not found"
        );
    }


    return repository.deleteCategory(id);
};


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};