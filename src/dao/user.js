const connPool= require("./index").connPool;
const logger = require("../../logger");
const logLevel= require("../constants").logLevel;

const UserDao = {
    getUserByUserId(userId) {
        return new Promise(function (resolve, reject) {
            const successMessage = "Successfully got user data from the database.";
            const failureMessage = "Error while getting user data from the database.";

            try {

                const sqlQuery = `SELECT * FROM users WHERE users.id = ?`;

                connPool.query(sqlQuery, [userId], (err, result) => {
                    if (err) {
                        logger.log(logLevel.error, err, {
                            dao: "UserDao",
                            method: "getUserByUserId"
                        });
                        reject({
                            success: false,
                            value: null,
                            error: err,
                            message: failureMessage,
                        });
                    } else {
                        resolve({
                            success: true,
                            value: result,
                            error: null,
                            message: successMessage,
                        });
                    }
                });
            } catch (e) {
                logger.log(logLevel.error, e, {
                    dao: "UserDao",
                    method: "getUserByUserId"
                });
                reject({
                    success: false,
                    error: e,
                    value: null,
                    message: failureMessage,
                });
            }
        });
    },
};

module.exports = UserDao;