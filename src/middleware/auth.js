const boom = require("@hapi/boom");
const UserDao = require("../dao/user");
const SessionDao = require("../dao/session");
const logger = require("../../logger");
const logLevel = require("../constants").logLevel;

const auth = async (socket, next) => {
    console.log("auth middleware");

    try {
        const req = socket.request;
        const bearerHeader = req.headers["authorization"];

        if (!bearerHeader) {
            console.log("-1 Not logged in. Please login.");

            return next(new Error("Not logged in. Please login."));
        }

        const bearer = bearerHeader.split(" ");

        if (!bearer[1]) {
            console.log("0 Not logged in. Please login.");
            return next(new Error("Not logged in. Please login."));
        }

        socket.token = bearer[1];

        const sessionDaoObj = new SessionDao();
        const sessionResult = await sessionDaoObj.getSessionBySessionId(
            socket.token
        );

        if (sessionResult.value.length === 0) {
            console.log(
                "{sessionResult.value.length === 0} Not logged in. Please login."
            );
            return next(new Error("Not logged in. Please login."));
        }

        const sessionExists = sessionResult.value[0];

        if (sessionExists.status.toLowerCase() !== "active") {
            console.log(
                "{sessionExists.status.toLowerCase() !== 'active'} Not logged in. Please login."
            );
            return next(new Error("Not logged in. Please login."));
        }

        if (new Date() > sessionExists.valid_till) {
            console.log(
                "{new Date() > sessionExists.valid_till} Not logged in. Please login."
            );
            return next(new Error("Not logged in. Please login."));
        }

        const userResult = await UserDao.getUserByUserId(sessionExists.user_id);

        if (userResult.value.length === 0) {
            console.log(
                "{userResult.value.length === 0} Not logged in. Please login."
            );
            return next(new Error("Not logged in. Please login."));
        }

        const userExists = userResult.value[0];
        socket.user = userExists;

        return next();
    } catch (err) {
        logger.log(logLevel.error, err, {
            method: "auth"
        });
        throw new Error("Internal Server Error");
    }
};

exports.adminAuth = async (req, res, next) => {
    try {
        const bearerHeader = req.headers["authorization"];

        if (!bearerHeader) {
            return next(boom.unauthorized("Token missing"));
        }

        const bearer = bearerHeader.split(" ");

        if (!bearer[1]) {
            return next(boom.unauthorized("Token is empty"));
        }

        const token = bearer[1];

        if (token !== process.env.BACKEND_API_KEY) {
            return next(boom.unauthorized("Token is invalid"));
        }

        next();
    } catch (err) {
        logger.log(logLevel.error, err, {
            method: "adminAuth"
        });
        return next(boom.internal("Internal Server Error"));
    }
};


exports.customAuth = (socket, next) => auth(socket, next);