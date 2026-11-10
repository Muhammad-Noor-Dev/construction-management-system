const express = require("express");

const controller =
    require("../controllers/materialIssuanceItemController");

const authenticate =
    require("../middleware/authMiddleware");

const validate =
    require("../middleware/validate");

const {
    createMaterialIssuanceItemSchema
} =
    require("../validators/materialIssuanceItemValidator");


const router = express.Router();


router.use(authenticate);


// CREATE
router.post(
    "/",
    validate(
        createMaterialIssuanceItemSchema
    ),
    controller.createItem
);


// GET ALL
router.get(
    "/",
    controller.getAllItems
);


// GET ITEMS FOR REQUEST
router.get(
    "/request/:requestId",
    controller.getItemsByRequest
);


// GET ONE
router.get(
    "/:id",
    controller.getItemById
);


// DELETE
router.delete(
    "/:id",
    controller.deleteItem
);


module.exports = router;