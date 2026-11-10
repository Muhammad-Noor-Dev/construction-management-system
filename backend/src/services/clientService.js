const clientRepository =
    require("../repositories/clientRepository");


const normalizeEmail = (email) => {
    if (!email) {
        return null;
    }

    return email.trim().toLowerCase();
};


const createClient = async (data) => {

    const {
        name,
        email,
        phone,
        address
    } = data;


    const normalizedEmail =
        normalizeEmail(email);


    if (normalizedEmail) {

        const existingClient =
            await clientRepository.findClientByEmail(
                normalizedEmail
            );


        if (existingClient) {
            throw new Error(
                "A client with this email already exists"
            );
        }
    }


    return await clientRepository.createClient({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || null,
        address: address || null
    });
};


const getAllClients = async () => {

    return await clientRepository.findAllClients();
};


const getClientById = async (id) => {

    const client =
        await clientRepository.findClientById(id);


    if (!client) {
        throw new Error("Client not found");
    }


    return client;
};


const updateClient = async (id, data) => {

    const existingClient =
        await clientRepository.findClientById(id);


    if (!existingClient) {
        throw new Error("Client not found");
    }


    const {
        name,
        email,
        phone,
        address
    } = data;


    const normalizedEmail =
        normalizeEmail(email);


    if (normalizedEmail) {

        const clientWithEmail =
            await clientRepository.findClientByEmail(
                normalizedEmail
            );


        if (
            clientWithEmail &&
            clientWithEmail.id !== Number(id)
        ) {
            throw new Error(
                "Another client with this email already exists"
            );
        }
    }


    return await clientRepository.updateClient(
        id,
        {
            name: name.trim(),
            email: normalizedEmail,
            phone: phone || null,
            address: address || null
        }
    );
};


const deleteClient = async (id) => {

    const existingClient =
        await clientRepository.findClientById(id);


    if (!existingClient) {
        throw new Error("Client not found");
    }


    const projects =
        await clientRepository.findProjectsUsingClient(id);


    if (projects.length > 0) {

        throw new Error(
            `Cannot delete client because ${projects.length} project(s) are associated with this client`
        );
    }


    return await clientRepository.deleteClient(id);
};


module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient
};