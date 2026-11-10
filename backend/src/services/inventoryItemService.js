const repository =
    require("../repositories/inventoryItemRepository");


// CREATE
const createItem = async (data) => {

    const nameExists =
        await repository.itemNameExists(
            data.name
        );

    if (nameExists) {

        throw new Error(
            "Inventory item name already exists"
        );
    }


    const categoryExists =
        await repository.categoryExists(
            data.category_id
        );

    if (!categoryExists) {

        throw new Error(
            "Inventory category not found"
        );
    }


    return repository.createItem(data);
};


// GET ALL
const getAllItems = async () => {

    return repository.findAllItems();
};


// GET ONE
const getItemById = async (id) => {

    const item =
        await repository.findItemById(id);

    if (!item) {

        throw new Error(
            "Inventory item not found"
        );
    }

    return item;
};


// UPDATE
const updateItem = async (
    id,
    data
) => {

    const existing =
        await repository.findItemById(id);

    if (!existing) {

        throw new Error(
            "Inventory item not found"
        );
    }


    const nameExists =
        await repository.itemNameExists(
            data.name,
            id
        );

    if (nameExists) {

        throw new Error(
            "Inventory item name already exists"
        );
    }


    const categoryExists =
        await repository.categoryExists(
            data.category_id
        );

    if (!categoryExists) {

        throw new Error(
            "Inventory category not found"
        );
    }


    return repository.updateItem(
        id,
        data
    );
};


// DELETE
const deleteItem = async (id) => {

    const existing =
        await repository.findItemById(id);

    if (!existing) {

        throw new Error(
            "Inventory item not found"
        );
    }


    return repository.deleteItem(id);
};


module.exports = {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
};