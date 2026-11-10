const express = require("express");

const authController = require("../controllers/authController");

const validate = require("../middleware/validate");
const authenticate = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const {
    registerSchema,
    loginSchema
} = require("../validators/authValidator");

const router = express.Router();


// LOGIN
// Public
router.post(
    "/login",
    validate(loginSchema),
    authController.login
);


// CREATE USER
// Admin only
router.post(
    "/register",
    authenticate,
    requireAdmin,
    validate(registerSchema),
    authController.register
);


// CURRENT USER
router.get(
    "/me",
    authenticate,
    authController.getCurrentUser
);


module.exports = router;