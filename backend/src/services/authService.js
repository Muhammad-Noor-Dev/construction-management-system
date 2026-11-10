const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authRepository =
    require("../repositories/authRepository");


// CREATE USER
const register = async ({
    fullName,
    email,
    password,
    roleId
}) => {

    const existingUser =
        await authRepository.findUserByEmail(email);


    if (existingUser) {
        throw new Error(
            "Email is already registered"
        );
    }


    const passwordHash =
        await bcrypt.hash(password, 12);


    const user =
        await authRepository.createUser({
            fullName,
            email,
            passwordHash,
            roleId
        });


    return user;
};


// LOGIN
const login = async ({
    email,
    password
}) => {

    const user =
        await authRepository.findUserByEmail(email);


    if (!user) {
        throw new Error(
            "Invalid email or password"
        );
    }


    if (!user.is_active) {
        throw new Error(
            "User account is inactive"
        );
    }


    const passwordMatches =
        await bcrypt.compare(
            password,
            user.password_hash
        );


    if (!passwordMatches) {
        throw new Error(
            "Invalid email or password"
        );
    }


    const token =
        jwt.sign(
            {
                userId: user.id,
                email: user.email,
                roleId: user.role_id,
                role: user.role_name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


    return {
        token,

        user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            roleId: user.role_id,
            role: user.role_name,
            isActive: user.is_active
        }
    };
};


// CURRENT USER
const getCurrentUser = async (userId) => {

    const user =
        await authRepository.findUserById(userId);


    if (!user) {
        throw new Error(
            "User not found"
        );
    }


    if (!user.is_active) {
        throw new Error(
            "User account is inactive"
        );
    }


    return {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        roleId: user.role_id,
        role: user.role_name,
        isActive: user.is_active
    };
};


module.exports = {
    register,
    login,
    getCurrentUser
};