const ChatDao = require("../dao/chat");
const logger = require("./../../logger");
const { NEW_MESSAGE, rooms, logLevel } = require("../constants");
const { userMessageIntentClassification, getChatGPTResponseForGeneralConversation, getChatGPTResponseForActionWithoutRequirements } = require("../helpers/gpt");
const api = require("../helpers/api-requests");

const chatMessageHandler = (socket) => async (data) => {
    const { contentId, message } = data;
    const userId = socket.user.id;
    const room = rooms.contentRoom(contentId);

    // Categorize user message
    const categoryData = (await userMessageIntentClassification(message)).trim();
    console.log(categoryData);

    // Save user message to the database
    try {
        await ChatDao.saveChatMessage(userId, contentId, 'USER', message, false, categoryData);
    } catch (error) {
        logger.log(logLevel.error, error, { message: "Error saving user message to the database", file: "chatMessageHandler.js", function: "chatMessageHandler" });
        console.error("Error saving user message to the database:", error);
    }

    // Take action based on category
    if (categoryData == null) { }
    else if (categoryData == 'Action with requirements') {
        console.log("Inside");
        try {
            const resVal = await api.get('/content/update', {
                params: {
                    content_id: contentId,
                    user_id: userId,
                    message: message,
                }
            })
            console.log(resVal.data)
        } catch (error) {
            console.log(error);
        }

        global.io.to(room).emit(NEW_MESSAGE, {
            message: "You have joined the edit room",
            streamEnd: true,
        });
    }
    else if (categoryData == 'Action without requirements') {
        await getChatGPTResponseForActionWithoutRequirements(message, room, userId, contentId, categoryData);
    }
    else {
        await getChatGPTResponseForGeneralConversation(room, userId, contentId, categoryData);
    }
}

module.exports = chatMessageHandler;
