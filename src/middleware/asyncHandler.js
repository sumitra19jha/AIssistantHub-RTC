const boom = require("@hapi/boom");
const logger = require("../../logger");
const logLevel = require("../constants").logLevel;

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        logger.log(logLevel.error, err, {
            middleware: "asyncHandler"
        });
        if (err && err.isBoom) {
            return next(err);
        }

        if (err && err.message) {
            return next(boom.badRequest(err.message));
        }

        return next(boom.badRequest(err));
    });
};

module.exports = asyncHandler;