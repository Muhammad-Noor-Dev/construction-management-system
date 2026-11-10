const pool = require("../config/database");

const contextMiddleware = (req, res, next) => {
    const run = pool.requestContext;
    run.run({ userId: req.user ? req.user.userId : null }, next);
};
module.exports = contextMiddleware;
