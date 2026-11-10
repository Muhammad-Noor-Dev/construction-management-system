const repository =
    require("../repositories/materialIssuanceItemRepository");


// CREATE
const createItem = async (data) => {

    // Check request
    const request =
        await repository.findRequest(
            data.request_id
        );


    if (!request) {

        throw new Error(
            "Material issuance request not found"
        );
    }


    // Only Pending requests can be modified
    if (request.status !== "Pending") {

        throw new Error(
            `Cannot add items to a ${request.status.toLowerCase()} request`
        );
    }


    // Check inventory item
    const inventoryItem =
        await repository.findInventoryItem(
            data.item_id
        );


    if (!inventoryItem) {

        throw new Error(
            "Inventory item not found"
        );
    }


    return repository.createItem({

        request_id:
            data.request_id,

        item_id:
            data.item_id,

        quantity:
            data.quantity
    });
};


// GET ALL
const getAllItems = async () => {

    return repository.findAllItems();
};


// GET BY REQUEST
const getItemsByRequest = async (
    requestId
) => {

    const request =
        await repository.findRequest(
            requestId
        );


    if (!request) {

        throw new Error(
            "Material issuance request not found"
        );
    }


    return repository.findItemsByRequestId(
        requestId
    );
};


// GET ONE
const getItemById = async (
    id
) => {

    const item =
        await repository.findItemById(id);


    if (!item) {

        throw new Error(
            "Material issuance item not found"
        );
    }


    return item;
};


// DELETE
const deleteItem = async (
    id
) => {

    const existingItem =
        await repository.findItemById(id);


    if (!existingItem) {

        throw new Error(
            "Material issuance item not found"
        );
    }


    const request =
        await repository.findRequest(
            existingItem.request_id
        );


    if (!request) {

        throw new Error(
            "Material issuance request not found"
        );
    }


    // Only Pending requests can be modified
    if (request.status !== "Pending") {

        throw new Error(
            `Cannot remove items from a ${request.status.toLowerCase()} request`
        );
    }


    return repository.deleteItem(id);
};


module.exports = {
    createItem,
    getAllItems,
    getItemsByRequest,
    getItemById,
    deleteItem
};