const express = require("express");

const controller =
    require("../controllers/materialIssuanceRequestController");

const authenticate =
    require("../middleware/authMiddleware");

const validate =
    require("../middleware/validate");

const {
    createMaterialIssuanceRequestSchema,
    rejectMaterialIssuanceRequestSchema
} =
    require("../validators/materialIssuanceRequestValidator");


const router = express.Router();


router.use(authenticate);


// CREATE REQUEST
router.post(
    "/",
    validate(
        createMaterialIssuanceRequestSchema
    ),
    controller.createRequest
);


// GET ALL
router.get(
    "/",
    controller.getAllRequests
);


// GET ONE
router.get(
    "/:id",
    controller.getRequestById
);


// APPROVE
router.patch(
    "/:id/approve",
    controller.approveRequest
);


// REJECT
router.patch(
    "/:id/reject",
    validate(
        rejectMaterialIssuanceRequestSchema
    ),
    controller.rejectRequest
);


module.exports = router;