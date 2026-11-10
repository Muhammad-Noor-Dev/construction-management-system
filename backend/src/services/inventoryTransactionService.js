const pool = require("../config/database");

const repository =
    require("../repositories/inventoryTransactionRepository");


const IN_STOCK_TYPES = [
    "Stock In",
    "Transfer In"
];

const OUT_STOCK_TYPES = [
    "Stock Out",
    "Issuance",
    "Dispatch",
    "Damage",
    "Waste",
    "Transfer Out"
];


// CREATE TRANSACTION
const createTransaction = async (data) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // --------------------------------
        // CHECK WAREHOUSE
        // --------------------------------

        const warehouseExists =
            await repository.warehouseExists(
                data.warehouse_id,
                client
            );

        if (!warehouseExists) {

            throw new Error(
                "Warehouse not found"
            );
        }


        // --------------------------------
        // CHECK ITEM
        // --------------------------------

        const itemExists =
            await repository.itemExists(
                data.item_id,
                client
            );

        if (!itemExists) {

            throw new Error(
                "Inventory item not found"
            );
        }


        // --------------------------------
        // CHECK SITE
        // --------------------------------

        const siteExists =
            await repository.siteExists(
                data.site_id,
                client
            );

        if (!siteExists) {

            throw new Error(
                "Site not found"
            );
        }


        // --------------------------------
        // LOCK EXISTING STOCK
        // --------------------------------

        let stock =
            await repository.getStockForUpdate(
                data.warehouse_id,
                data.item_id,
                client
            );


        let currentQuantity = 0;

        if (stock) {

            currentQuantity =
                stock.quantity;

        }


        // --------------------------------
        // DETERMINE STOCK DIRECTION
        // --------------------------------

        const isStockIn =
            IN_STOCK_TYPES.includes(
                data.transaction_type
            );

        const isStockOut =
            OUT_STOCK_TYPES.includes(
                data.transaction_type
            );


        let newQuantity;


        if (isStockIn) {

            newQuantity =
                currentQuantity +
                data.quantity;

        } else if (isStockOut) {

            if (
                currentQuantity <
                data.quantity
            ) {

                throw new Error(
                    `Insufficient stock. Available: ${currentQuantity}, requested: ${data.quantity}`
                );
            }


            newQuantity =
                currentQuantity -
                data.quantity;

        } else {

            throw new Error(
                "Invalid transaction type"
            );
        }


        // --------------------------------
        // CREATE STOCK IF MISSING
        // --------------------------------

        if (!stock) {

            if (isStockOut) {

                throw new Error(
                    "No stock record exists for this warehouse and item"
                );
            }


            stock =
                await repository.createStockRecord(
                    data.warehouse_id,
                    data.item_id,
                    newQuantity,
                    client
                );

        } else {

            await repository.updateStockQuantity(
                stock.id,
                newQuantity,
                client
            );
        }


        // --------------------------------
        // CREATE TRANSACTION
        // --------------------------------

        const transaction =
            await repository.createTransaction(
                data,
                client
            );


        await client.query("COMMIT");


        return transaction;

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();
    }
};


// GET ALL
const getAllTransactions = async () => {

    return repository.findAllTransactions();
};


// GET ONE
const getTransactionById = async (id) => {

    const transaction =
        await repository.findTransactionById(id);

    if (!transaction) {

        throw new Error(
            "Inventory transaction not found"
        );
    }

    return transaction;
};


module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById
};