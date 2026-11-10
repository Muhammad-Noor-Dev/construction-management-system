const express = require("express");

const controller =
    require("../controllers/contractorRatingController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createContractorRatingSchema,
    updateContractorRatingSchema
} = require("../validators/contractorRatingValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(createContractorRatingSchema),
    controller.createContractorRating
);


// GET ALL
router.get(
    "/",
    controller.getAllContractorRatings
);


// GET ONE
router.get(
    "/:id",
    controller.getContractorRatingById
);


// UPDATE
router.put(
    "/:id",
    validate(updateContractorRatingSchema),
    controller.updateContractorRating
);


// DELETE
router.delete(
    "/:id",
    controller.deleteContractorRating
);


module.exports = router;