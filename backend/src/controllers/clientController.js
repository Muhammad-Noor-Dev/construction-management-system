const clientService =
    require("../services/clientService");


const createClient = async (req, res) => {

    try {

        const client =
            await clientService.createClient(
                req.body
            );


        return res.status(201).json({
            success: true,
            message: "Client created successfully",
            data: client
        });

    } catch (error) {

        console.error(
            "Create client error:",
            error.message
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getAllClients = async (req, res) => {

    try {

        const clients =
            await clientService.getAllClients();


        return res.status(200).json({
            success: true,
            count: clients.length,
            data: clients
        });

    } catch (error) {

        console.error(
            "Get clients error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message: "Failed to retrieve clients"
        });
    }
};


const getClientById = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid client ID"
            });
        }


        const client =
            await clientService.getClientById(id);


        return res.status(200).json({
            success: true,
            data: client
        });

    } catch (error) {

        console.error(
            "Get client error:",
            error.message
        );


        if (
            error.message ===
            "Client not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(500).json({
            success: false,
            message: "Failed to retrieve client"
        });
    }
};


const updateClient = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid client ID"
            });
        }


        const client =
            await clientService.updateClient(
                id,
                req.body
            );


        return res.status(200).json({
            success: true,
            message: "Client updated successfully",
            data: client
        });

    } catch (error) {

        console.error(
            "Update client error:",
            error.message
        );


        if (
            error.message ===
            "Client not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const deleteClient = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid client ID"
            });
        }


        const client =
            await clientService.deleteClient(id);


        return res.status(200).json({
            success: true,
            message: "Client deleted successfully",
            data: client
        });

    } catch (error) {

        console.error(
            "Delete client error:",
            error.message
        );


        if (
            error.message ===
            "Client not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }


        return res.status(409).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient
};