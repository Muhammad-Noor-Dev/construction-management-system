const service =
    require("../services/materialIssuanceRequestService");


// CREATE
const createRequest = async (
    req,
    res
) => {

    try {

        const request =
            await service.createRequest(
                req.body,
                req.user.userId
            );


        return res.status(201).json({

            success: true,

            message:
                "Material issuance request created successfully",

            data: request
        });

    } catch (error) {

        console.error(
            "Create issuance request error:",
            error.message
        );


        return res.status(400).json({

            success: false,

            message: error.message
        });
    }
};


// GET ALL
const getAllRequests = async (
    req,
    res
) => {

    try {

        const requests =
            await service.getAllRequests();


        return res.status(200).json({

            success: true,

            count: requests.length,

            data: requests
        });

    } catch (error) {

        console.error(
            "Get issuance requests error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve material issuance requests"
        });
    }
};


// GET ONE
const getRequestById = async (
    req,
    res
) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid material issuance request ID"
            });
        }


        const request =
            await service.getRequestById(id);


        return res.status(200).json({

            success: true,

            data: request
        });

    } catch (error) {

        if (
            error.message ===
            "Material issuance request not found"
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve material issuance request"
        });
    }
};


// APPROVE
const approveRequest = async (
    req,
    res
) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid material issuance request ID"
            });
        }


        const request =
            await service.approveRequest(
                id,
                req.user.userId
            );


        return res.status(200).json({

            success: true,

            message:
                "Material issuance request approved successfully",

            data: request
        });

    } catch (error) {

        if (
            error.message.includes(
                "not found"
            )
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(400).json({

            success: false,

            message: error.message
        });
    }
};


// REJECT
const rejectRequest = async (
    req,
    res
) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid material issuance request ID"
            });
        }


        const request =
            await service.rejectRequest(
                id,
                req.user.userId,
                req.body.rejection_reason
            );


        return res.status(200).json({

            success: true,

            message:
                "Material issuance request rejected successfully",

            data: request
        });

    } catch (error) {

        if (
            error.message.includes(
                "not found"
            )
        ) {

            return res.status(404).json({

                success: false,

                message: error.message
            });
        }


        return res.status(400).json({

            success: false,

            message: error.message
        });
    }
};


module.exports = {
    createRequest,
    getAllRequests,
    getRequestById,
    approveRequest,
    rejectRequest
};