const connPool = require("./index").connPool;
const logger = require("../../logger");
const logLevel = require("../constants").logLevel;

const ChatDao = {
    saveChatMessage(userId, contentId, type, message) {
        return new Promise(function (resolve, reject) {
            const successMessage = "Successfully saved chat message to the database.";
            const failureMessage = "Error while saving chat message to the database.";

            try {
                const sqlQuery = `
                    INSERT INTO chat (user_id, content_id, type, message)
                    VALUES (?, ?, ?, ?)
                `;

                connPool.query(sqlQuery, [userId, contentId, type, message], (err, result) => {
                    if (err) {
                        logger.log(logLevel.error, err, {
                            dao: "ChatDao",
                            method: "saveChatMessage"
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
                    dao: "ChatDao",
                    method: "saveChatMessage"
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
    getChatMessages(contentId) {
        return new Promise(function (resolve, reject) {
            const successMessage = "Successfully get chat messages from the database.";
            const failureMessage = "Error while getting chat messages from the database.";

            try {
                const sqlQuery = `
                    SELECT * FROM chat WHERE content_id = ?
                `;

                connPool.query(sqlQuery, [contentId], (err, result) => {
                    if (err) {
                        logger.log(logLevel.error, err, {
                            dao: "ChatDao",
                            method: "getChatMessages"
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
                    dao: "ChatDao",
                    method: "getChatMessages"
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

module.exports = ChatDao;