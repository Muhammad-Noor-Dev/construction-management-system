const bcrypt = require("bcrypt");

const repository =
    require("../repositories/userRepository");


const createUser = async (data) => {

    const {
        fullName,
        email,
        password,
        roleId,
        isActive
    } = data;


    const existing =
        await repository.findUserByEmail(email);

    if (existing) {
        throw new Error(
            "Email is already registered"
        );
    }


    const roleExists =
        await repository.roleExists(roleId);

    if (!roleExists) {
        throw new Error(
            "Selected role does not exist"
        );
    }


    const passwordHash =
        await bcrypt.hash(password, 12);


    const user =
        await repository.createUser({
            fullName,
            email,
            passwordHash,
            roleId,
            isActive
        });


    return user;
};


const getAllUsers = async () => {

    return repository.getAllUsers();
};


const getUserById = async (id) => {

    const user =
        await repository.findUserById(id);

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    return user;
};


const updateUser = async (
    id,
    data
) => {

    const existing =
        await repository.findUserById(id);

    if (!existing) {
        throw new Error(
            "User not found"
        );
    }


    const {
        fullName,
        email,
        roleId,
        isActive
    } = data;


    const emailExists =
        await repository.findUserByEmail(
            email,
            Number(id)
        );

    if (emailExists) {
        throw new Error(
            "Email is already registered"
        );
    }


    const roleExists =
        await repository.roleExists(roleId);

    if (!roleExists) {
        throw new Error(
            "Selected role does not exist"
        );
    }


    return repository.updateUser(
        id,
        {
            fullName,
            email,
            roleId,
            isActive
        }
    );
};


const changePassword = async (
    id,
    password
) => {

    const existing =
        await repository.findUserById(id);

    if (!existing) {
        throw new Error(
            "User not found"
        );
    }


    const passwordHash =
        await bcrypt.hash(password, 12);


    return repository.updatePassword(
        id,
        passwordHash
    );
};


const deactivateUser = async (id) => {

    const existing =
        await repository.findUserById(id);

    if (!existing) {
        throw new Error(
            "User not found"
        );
    }


    return repository.deactivateUser(id);
};


module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    changePassword,
    deactivateUser
};