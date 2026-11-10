const express = require("express");

const projectController =
    require("../controllers/projectController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createProjectSchema,
    updateProjectSchema
} = require("../validators/projectValidator");


const router = express.Router();


// Every project endpoint requires authentication
router.use(authenticate);


// Create project
router.post(
    "/",
    validate(createProjectSchema),
    projectController.createProject
);


// Get all projects
router.get(
    "/",
    projectController.getAllProjects
);


// Get project by ID
router.get(
    "/:id",
    projectController.getProjectById
);


// Update project
router.put(
    "/:id",
    validate(updateProjectSchema),
    projectController.updateProject
);


module.exports = router;