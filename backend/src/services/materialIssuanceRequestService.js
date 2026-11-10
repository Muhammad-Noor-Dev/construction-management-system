const repository =
    require("../repositories/materialIssuanceRequestRepository");


// CREATE
const createRequest = async (
    data,
    requestedBy
) => {

    // Check site
    const siteExists =
        await repository.siteExists(
            data.site_id
        );

    if (!siteExists) {

        throw new Error(
            "Site not found"
        );
    }


    // Check warehouse
    const warehouseExists =
        await repository.warehouseExists(
            data.warehouse_id
        );

    if (!warehouseExists) {

        throw new Error(
            "Warehouse not found"
        );
    }


    return repository.createRequest({

        site_id: data.site_id,

        warehouse_id:
            data.warehouse_id,

        requested_by:
            requestedBy
    });
};


// GET ALL
const getAllRequests = async () => {

    return repository.findAllRequests();
};


// GET ONE
const getRequestById = async (id) => {

    const request =
        await repository.findRequestById(id);

    if (!request) {

        throw new Error(
            "Material issuance request not found"
        );
    }

    return request;
};


// APPROVE
const approveRequest = async (
    id,
    approvedBy
) => {

    const request =
        await repository.findRequestRaw(id);


    if (!request) {

        throw new Error(
            "Material issuance request not found"
        );
    }


    if (request.status !== "Pending") {

        throw new Error(
            `Request is already ${request.status}`
        );
    }


    const approved =
        await repository.approveRequest(
            id,
            approvedBy
        );


    if (!approved) {

        throw new Error(
            "Unable to approve request"
        );
    }


    return approved;
};


// REJECT
const rejectRequest = async (
    id,
    approvedBy,
    rejectionReason
) => {

    const request =
        await repository.findRequestRaw(id);


    if (!request) {

        throw new Error(
            "Material issuance request not found"
        );
    }


    if (request.status !== "Pending") {

        throw new Error(
            `Request is already ${request.status}`
        );
    }


    const rejected =
        await repository.rejectRequest(
            id,
            approvedBy,
            rejectionReason
        );


    if (!rejected) {

        throw new Error(
            "Unable to reject request"
        );
    }


    return rejected;
};


module.exports = {
    createRequest,
    getAllRequests,
    getRequestById,
    approveRequest,
    rejectRequest
};