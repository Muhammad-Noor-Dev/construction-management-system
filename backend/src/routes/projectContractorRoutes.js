const express = require("express");

const controller = require("../controllers/projectContractorController");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");

const {
    createProjectContractorSchema,
    updateProjectContractorSchema
} = require("../validators/projectContractorValidator");

const router = express.Router();

router.use(authenticate);

// Read-only assignment visibility for roles that need project/site information.
router.get("/project/:projectId", controller.getProjectContractorsByProjectId);
router.get("/site/:siteId/team", controller.getProjectContractorsBySiteId);
router.get("/contractor/:contractorId/assignments", controller.getProjectContractorsByContractorId);

// Assignment management is restricted to Admin and Project Manager.
router.post(
    "/",
    authorizeRoles("Admin", "Project Manager"),
    validate(createProjectContractorSchema),
    controller.createProjectContractor
);

router.get("/", controller.getAllProjectContractors);
router.get("/:id", controller.getProjectContractorById);

router.put(
    "/:id",
    authorizeRoles("Admin", "Project Manager"),
    validate(updateProjectContractorSchema),
    controller.updateProjectContractor
);

router.delete(
    "/:id",
    authorizeRoles("Admin", "Project Manager"),
    controller.deleteProjectContractor
);

module.exports = router;
