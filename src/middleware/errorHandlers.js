const HttpStatus = require("http-status-codes");

const errorHandler = (err, req, res, next) => {
    if (err && err.isBoom) {
        return res.status(err.output.statusCode).json(err.output.payload);
    }
    return res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR,
        error: "Internal Server Error",
        message: (err && err.message) || "Internal Server Error.",
    });
};

module.exports = errorHandler;