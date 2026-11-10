const express = require("express");

const controller =
    require("../controllers/contractorController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createContractorSchema,
    updateContractorSchema
} = require("../validators/contractorValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(createContractorSchema),
    controller.createContractor
);


// GET ALL
router.get(
    "/",
    controller.getAllContractors
);


// GET ONE
router.get(
    "/:id",
    controller.getContractorById
);


// UPDATE
router.put(
    "/:id",
    validate(updateContractorSchema),
    controller.updateContractor
);


// DELETE
router.delete(
    "/:id",
    controller.deleteContractor
);


module.exports = router;