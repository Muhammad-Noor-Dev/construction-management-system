const express = require("express");

const siteController =
    require("../controllers/siteController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createSiteSchema,
    updateSiteSchema
} = require("../validators/siteValidator");


const router = express.Router();


// Every site endpoint requires authentication
router.use(authenticate);


// Create site
router.post(
    "/",
    validate(createSiteSchema),
    siteController.createSite
);


// Get all sites
router.get(
    "/",
    siteController.getAllSites
);


// Get site by ID
router.get(
    "/:id",
    siteController.getSiteById
);


// Update site
router.put(
    "/:id",
    validate(updateSiteSchema),
    siteController.updateSite
);


// Delete site
router.delete(
    "/:id",
    siteController.deleteSite
);


module.exports = router;