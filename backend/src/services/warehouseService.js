const repository =
    require("../repositories/warehouseRepository");


// CREATE
const createWarehouse = async (data) => {

    const {
        name,
        location
    } = data;


    const nameExists =
        await repository.warehouseNameExists(name);

    if (nameExists) {

        throw new Error(
            "Warehouse name already exists"
        );
    }


    return repository.createWarehouse(data);
};


// GET ALL
const getAllWarehouses = async () => {

    return repository.findAllWarehouses();
};


// GET ONE
const getWarehouseById = async (id) => {

    const warehouse =
        await repository.findWarehouseById(id);

    if (!warehouse) {

        throw new Error(
            "Warehouse not found"
        );
    }

    return warehouse;
};


// UPDATE
const updateWarehouse = async (
    id,
    data
) => {

    const existing =
        await repository.findWarehouseById(id);

    if (!existing) {

        throw new Error(
            "Warehouse not found"
        );
    }


    const nameExists =
        await repository.warehouseNameExists(
            data.name,
            id
        );

    if (nameExists) {

        throw new Error(
            "Warehouse name already exists"
        );
    }


    return repository.updateWarehouse(
        id,
        data
    );
};


// DELETE
const deleteWarehouse = async (id) => {

    const existing =
        await repository.findWarehouseById(id);

    if (!existing) {

        throw new Error(
            "Warehouse not found"
        );
    }


    return repository.deleteWarehouse(id);
};


module.exports = {
    createWarehouse,
    getAllWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
};