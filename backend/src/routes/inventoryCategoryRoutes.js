const express = require("express");

const controller =
    require("../controllers/inventoryCategoryController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    inventoryCategorySchema
} = require("../validators/inventoryCategoryValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(inventoryCategorySchema),
    controller.createCategory
);


// GET ALL
router.get(
    "/",
    controller.getAllCategories
);


// GET ONE
router.get(
    "/:id",
    controller.getCategoryById
);


// UPDATE
router.put(
    "/:id",
    validate(inventoryCategorySchema),
    controller.updateCategory
);


// DELETE
router.delete(
    "/:id",
    controller.deleteCategory
);


module.exports = router;