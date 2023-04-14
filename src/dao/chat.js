const connPool = require("./index").connPool;
const logger = require("../../logger");
const logLevel = require("../constants").logLevel;

const ChatDao = {
    saveChatMessage(userId, contentId, type, message, hidden = false) {
        return new Promise(function (resolve, reject) {
            const successMessage = "Successfully saved chat message to the database.";
            const failureMessage = "Error while saving chat message to the database.";

            try {
                const sqlQuery = `
                    INSERT INTO chat (user_id, content_id, type, message, hidden, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `;

                connPool.query(sqlQuery, [userId, contentId, type, message, hidden], (err, result) => {
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
    getLastChatMessage(contentId) {
        return new Promise(function (resolve, reject) {
            const successMessage = "Successfully get last chat message from the database.";
            const failureMessage = "Error while getting last chat message from the database.";

            try {
                const sqlQuery = `
                    SELECT * FROM chat WHERE content_id = ? AND type <> 'SYSTEM' ORDER BY created_at DESC LIMIT 1
                `;

                connPool.query(sqlQuery, [contentId], (err, result) => {
                    if (err) {
                        logger.log(logLevel.error, err, {
                            dao: "ChatDao",
                            method: "getLastChatMessage"
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
                    dao: "ChatDao",
                    method: "getLastChatMessage"
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