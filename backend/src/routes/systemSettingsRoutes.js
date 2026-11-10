const express = require("express");

const controller =
    require("../controllers/systemSettingsController");

const authenticate =
    require("../middleware/authMiddleware");

const validate =
    require("../middleware/validate");

const {
    createSettingSchema,
    updateSettingSchema
} =
    require("../validators/systemSettingsValidator");

const router = express.Router();

router.use(authenticate);

// CREATE
router.post(
    "/",
    validate(createSettingSchema),
    controller.createSetting
);

// GET ALL
router.get(
    "/",
    controller.getAllSettings
);

// GET BY KEY
router.get(
    "/key/:settingKey",
    controller.getSettingByKey
);

// GET BY ID
router.get(
    "/:id",
    controller.getSettingById
);

// UPDATE
router.put(
    "/key/:settingKey",
    validate(updateSettingSchema),
    controller.updateSetting
);

// DELETE
router.delete(
    "/key/:settingKey",
    controller.deleteSetting
);

module.exports = router;