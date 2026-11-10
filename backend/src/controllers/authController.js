const authService =
    require("../services/authService");


// CREATE USER
const register = async (req, res) => {

    try {

        const user =
            await authService.register(
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "User created successfully",

            data: user

        });

    } catch (error) {

        console.error(
            "Register error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

        });
    }
};


// LOGIN
const login = async (req, res) => {

    try {

        const result =
            await authService.login(
                req.body
            );


        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            data: result

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(401).json({

            success: false,

            message:
                error.message

        });
    }
};


// CURRENT USER
const getCurrentUser = async (req, res) => {

    try {

        const user =
            await authService.getCurrentUser(
                req.user.userId
            );


        return res.status(200).json({

            success: true,

            data: user

        });

    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );


        return res.status(404).json({

            success: false,

            message:
                error.message

        });
    }
};


module.exports = {
    register,
    login,
    getCurrentUser
};