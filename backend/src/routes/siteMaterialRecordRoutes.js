const express = require("express");

const controller =
    require("../controllers/siteMaterialRecordController");

const authenticate =
    require("../middleware/authMiddleware");

const validate =
    require("../middleware/validate");

const {
    createSiteMaterialRecordSchema,
    updateSiteMaterialRecordSchema
} =
    require("../validators/siteMaterialRecordValidator");

const router = express.Router();

router.use(authenticate);

// CREATE
router.post(
    "/",
    validate(createSiteMaterialRecordSchema),
    controller.createRecord
);

// GET ALL
router.get(
    "/",
    controller.getAllRecords
);

// GET BY SITE
router.get(
    "/site/:siteId",
    controller.getRecordsBySite
);

// GET ONE
router.get(
    "/:id",
    controller.getRecordById
);

// UPDATE
router.put(
    "/:id",
    validate(updateSiteMaterialRecordSchema),
    controller.updateRecord
);

// DELETE
router.delete(
    "/:id",
    controller.deleteRecord
);

module.exports = router;