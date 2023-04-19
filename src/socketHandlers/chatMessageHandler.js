const ChatDao = require("../dao/chat");
const logger = require("./../../logger");
const api = require("../helpers/api-requests");
const { NEW_MESSAGE, rooms, logLevel } = require("../constants");
const {
    userMessageIntentClassification,
    getChatGPTResponseForGeneralConversation,
    getChatGPTResponseForActionWithoutRequirements
} = require("../helpers/gpt");


function streamMessage(room, message, streamEnd = false) {
    const messageChunks = [];
    const chunkSize = 50; // You can adjust the chunk size to your preference

    for (let i = 0; i < message.length; i += chunkSize) {
        messageChunks.push(message.slice(i, i + chunkSize));
    }

    messageChunks.forEach((chunk, index) => {
        global.io.to(room).emit(NEW_MESSAGE, {
            message: chunk,
            streamEnd: streamEnd && index === messageChunks.length - 1,
        });
    });
}

// Save user message to the database
async function saveUserMessage(userId, contentId, message, categoryData) {
    try {
        await ChatDao.saveChatMessage(userId, contentId, 'USER', message, false, categoryData);
    } catch (error) {
        logger.log(logLevel.error, error, {
            message: "Error saving user message to the database",
            file: "chatMessageHandler.js",
            function: "saveUserMessage"
        });
        console.error("Error saving user message to the database:", error);
    }
}

// Handle action with requirements
async function handleActionWithRequirements(contentId, userId, userName, message, room) {
    try {
        const resVal = await api.get('/content/update', {
            params: {
                content_id: contentId,
                user_id: userId,
                message: message,
                user_name: userName,
            }
        });
        console.log(resVal.data);
    } catch (error) {
        console.log(error);
        logger.log(logLevel.error, error, {
            message: "Error in socket to flask api call",
            file: "chatMessageHandler.js",
            function: "handleActionWithRequirements"
        });
    }

    const responseMessage = "We are working on updating the content";
    streamMessage(room, responseMessage, true);
}

const chatMessageHandler = (socket) => async (data) => {
    const { contentId, message } = data;
    const userId = socket.user.id;
    const userName = socket.user.name;
    const room = rooms.contentRoom(contentId);

    // Categorize user message
    const categoryData = (await userMessageIntentClassification(message)).trim();
    console.log(categoryData);

    // Save user message to the database
    await saveUserMessage(userId, contentId, message, categoryData);

    // Take action based on category
    if (categoryData == null) {
        // Do nothing
    } else if (categoryData === 'Action with requirements') {
        await handleActionWithRequirements(contentId, userId, userName, message, room);
    } else if (categoryData === 'Action without requirements') {
        await getChatGPTResponseForActionWithoutRequirements(message, room, userId, contentId, categoryData);
    } else {
        await getChatGPTResponseForGeneralConversation(room, userId, contentId, categoryData);
    }
}

module.exports = chatMessageHandler;