const connPool= require("./index").connPool;
const logger = require("../../logger");
const logLevel = require("../constants").logLevel;

class SessionDao {
    getSessionBySessionId(sessionId) {
        return new Promise(function (resolve, reject) {
            const successMessage = "Successfully got session data from the database.";
            const failureMessage =
                "Error while getting session data from the database.";

            try {

                const sqlQuery = "Select * from session where session_id = ?";

                connPool.query(sqlQuery, [sessionId], (err, result) => {
                    if (err) {
                        logger.log(logLevel.error, err, {
                            dao: "SessionDao",
                            method: "getSessionBySessionId"
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
                    dao: "SessionDao",
                    method: "getSessionBySessionId"
                });
                reject({
                    success: false,
                    error: e,
                    value: null,
                    message: failureMessage,
                });
            }
        });
    }
}

module.exports = SessionDao;