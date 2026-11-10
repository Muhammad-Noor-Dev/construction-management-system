const service =
    require("../services/userService");


const createUser = async (req, res) => {

    try {

        const user =
            await service.createUser(req.body);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getAllUsers = async (req, res) => {

    try {

        const users =
            await service.getAllUsers();

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve users"
        });
    }
};


const getUserById = async (req, res) => {

    try {

        const id =
            Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }


        const user =
            await service.getUserById(id);

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


const updateUser = async (req, res) => {

    try {

        const id =
            Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }


        if (Number(req.user.userId) === id && req.body.roleId !== undefined) {
            const existing = await service.getUserById(id);
            if (Number(req.body.roleId) !== Number(existing.role_id)) {
                return res.status(400).json({
                    success: false,
                    message: "You cannot change your own role."
                });
            }
        }

        const user =
            await service.updateUser(
                id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const changePassword = async (req, res) => {

    try {

        const id =
            Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }


        await service.changePassword(
            id,
            req.body.password
        );


        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const deactivateUser = async (req, res) => {

    try {

        const id =
            Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }


        if (
            Number(req.user.userId) === id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot deactivate your own account"
            });
        }


        const user =
            await service.deactivateUser(id);

        return res.status(200).json({
            success: true,
            message: "User deactivated successfully",
            data: user
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    changePassword,
    deactivateUser
};