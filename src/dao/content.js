const connPool = require("./index").connPool;
const logger = require("../../logger");
const logLevel = require("../constants").logLevel;

const ContentDao = {
    getUserContent(userId, contentId) {
        return new Promise(function (resolve, reject) {
            const successMessage = "Successfully get user content from the database.";
            const failureMessage = "Error while getting user content from the database.";

            try {
                const sqlQuery = `
                    SELECT * FROM content WHERE id = ? AND user_id = ?
                `;

                connPool.query(sqlQuery, [contentId, userId], (err, result) => {
                    if (err) {
                        logger.log(logLevel.error, err, {
                            dao: "ContentDao",
                            method: "getUserContent"
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
                            value: result[0],
                            error: null,
                            message: successMessage,
                        });
                    }
                });
            } catch (e) {
                logger.log(logLevel.error, e, {
                    dao: "ContentDao",
                    method: "getUserContent"
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

module.exports = ContentDao;