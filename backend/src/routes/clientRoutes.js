const express = require("express");

const clientController =
    require("../controllers/clientController");

const validate =
    require("../middleware/validate");

const authenticate =
    require("../middleware/authMiddleware");

const {
    createClientSchema,
    updateClientSchema
} = require("../validators/clientValidator");


const router = express.Router();


// Every client endpoint requires authentication
router.use(authenticate);


// Create client
router.post(
    "/",
    validate(createClientSchema),
    clientController.createClient
);


// Get all clients
router.get(
    "/",
    clientController.getAllClients
);


// Get client by ID
router.get(
    "/:id",
    clientController.getClientById
);


// Update client
router.put(
    "/:id",
    validate(updateClientSchema),
    clientController.updateClient
);


// Delete client
router.delete(
    "/:id",
    clientController.deleteClient
);


module.exports = router;