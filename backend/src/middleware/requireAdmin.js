const requireAdmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }


    if (Number(req.user.roleId) !== 1) {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }


    next();
};


module.exports = requireAdmin;