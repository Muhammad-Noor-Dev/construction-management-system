const express = require("express");

const controller =
    require("../controllers/auditLogController");

const authenticate =
    require("../middleware/authMiddleware");

const validate =
    require("../middleware/validate");

const {
    createAuditLogSchema
} =
    require("../validators/auditLogValidator");

const router = express.Router();

router.use(authenticate);

// CREATE
router.post(
    "/",
    validate(createAuditLogSchema),
    controller.createLog
);

// GET ALL
router.get(
    "/",
    controller.getAllLogs
);

// GET BY USER
router.get(
    "/user/:userId",
    controller.getLogsByUser
);

// GET BY TABLE
router.get(
    "/table/:tableName",
    controller.getLogsByTable
);

// GET ONE
router.get(
    "/:id",
    controller.getLogById
);

module.exports = router;