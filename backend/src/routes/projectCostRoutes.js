const express = require("express");
const controller = require("../controllers/projectCostController");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");
const { createProjectCostSchema, updateProjectCostSchema } = require("../validators/projectCostValidator");

const router = express.Router();
router.use(authenticate);

// Management and project roles can view project cost information.
router.get("/:projectId", controller.getProjectCosts);
router.get("/:projectId/summary", controller.getProjectCostSummary);

// Only Admin and Project Manager can enter/change project costs.
router.post(
    "/:projectId",
    authorizeRoles("Admin", "Project Manager"),
    validate(createProjectCostSchema),
    controller.createProjectCost
);
router.put(
    "/:projectId/:costId",
    authorizeRoles("Admin", "Project Manager"),
    validate(updateProjectCostSchema),
    controller.updateProjectCost
);
router.delete(
    "/:projectId/:costId",
    authorizeRoles("Admin", "Project Manager"),
    controller.deleteProjectCost
);

module.exports = router;
