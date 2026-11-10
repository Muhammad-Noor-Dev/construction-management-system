const repository =
    require("../repositories/siteMaterialRecordRepository");

// CREATE
const createRecord = async (data) => {

    const site =
        await repository.findSiteById(
            data.site_id
        );

    if (!site) {
        throw new Error("Site not found");
    }

    const item =
        await repository.findItemById(
            data.item_id
        );

    if (!item) {
        throw new Error("Inventory item not found");
    }

    return repository.createRecord(data);
};

// GET ALL
const getAllRecords = async () => {
    return repository.findAllRecords();
};

// GET ONE
const getRecordById = async (id) => {

    const record =
        await repository.findRecordById(id);

    if (!record) {
        throw new Error(
            "Site material record not found"
        );
    }

    return record;
};

// GET BY SITE
const getRecordsBySite = async (siteId) => {

    const site =
        await repository.findSiteById(siteId);

    if (!site) {
        throw new Error("Site not found");
    }

    return repository.findRecordsBySiteId(siteId);
};

// UPDATE
const updateRecord = async (id, data) => {

    const existing =
        await repository.findRecordById(id);

    if (!existing) {
        throw new Error(
            "Site material record not found"
        );
    }

    return repository.updateRecord(id, data);
};

// DELETE
const deleteRecord = async (id) => {

    const existing =
        await repository.findRecordById(id);

    if (!existing) {
        throw new Error(
            "Site material record not found"
        );
    }

    return repository.deleteRecord(id);
};

module.exports = {
    createRecord,
    getAllRecords,
    getRecordById,
    getRecordsBySite,
    updateRecord,
    deleteRecord
};