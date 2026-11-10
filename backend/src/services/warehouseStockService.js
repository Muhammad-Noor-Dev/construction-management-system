const repository =
    require("../repositories/warehouseStockRepository");


// CREATE
const createStock = async (data) => {

    const warehouseExists =
        await repository.warehouseExists(
            data.warehouse_id
        );

    if (!warehouseExists) {

        throw new Error(
            "Warehouse not found"
        );
    }


    const itemExists =
        await repository.itemExists(
            data.item_id
        );

    if (!itemExists) {

        throw new Error(
            "Inventory item not found"
        );
    }


    const stockExists =
        await repository.stockExists(
            data.warehouse_id,
            data.item_id
        );

    if (stockExists) {

        throw new Error(
            "Stock record already exists for this warehouse and item"
        );
    }


    return repository.createStock(data);
};


// GET ALL
const getAllStock = async () => {

    return repository.findAllStock();
};


// GET ONE
const getStockById = async (id) => {

    const stock =
        await repository.findStockById(id);

    if (!stock) {

        throw new Error(
            "Warehouse stock record not found"
        );
    }

    return stock;
};


// UPDATE
const updateStock = async (
    id,
    data
) => {

    const existing =
        await repository.findStockById(id);

    if (!existing) {

        throw new Error(
            "Warehouse stock record not found"
        );
    }


    const warehouseExists =
        await repository.warehouseExists(
            data.warehouse_id
        );

    if (!warehouseExists) {

        throw new Error(
            "Warehouse not found"
        );
    }


    const itemExists =
        await repository.itemExists(
            data.item_id
        );

    if (!itemExists) {

        throw new Error(
            "Inventory item not found"
        );
    }


    const stockExists =
        await repository.stockExists(
            data.warehouse_id,
            data.item_id,
            id
        );

    if (stockExists) {

        throw new Error(
            "Stock record already exists for this warehouse and item"
        );
    }


    return repository.updateStock(
        id,
        data
    );
};


// DELETE
const deleteStock = async (id) => {

    const existing =
        await repository.findStockById(id);

    if (!existing) {

        throw new Error(
            "Warehouse stock record not found"
        );
    }


    return repository.deleteStock(id);
};


module.exports = {
    createStock,
    getAllStock,
    getStockById,
    updateStock,
    deleteStock
};