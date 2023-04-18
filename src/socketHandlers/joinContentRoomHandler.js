const ChatDao = require("../dao/chat");
const logger = require("./../../logger");
const { rooms, TYPE_USER_FOR_CHAT_CONSTANT, GREETINGS, logLevel } = require("../constants");
const { getFirstChatGPTResponseForGeneralConversation } = require("../helpers/gpt");

const joinContentRoomHandler = (socket) => async (data, callback) => {
    const { contentId } = data;
    const room = rooms.contentRoom(contentId);
    const userId = socket.user.id;

    socket.join(room);

    try {
        const last_chat = await ChatDao.getLastChatMessage(contentId);

        if (last_chat.value.type === TYPE_USER_FOR_CHAT_CONSTANT) {
            await getFirstChatGPTResponseForGeneralConversation(room, userId, contentId, GREETINGS, last_chat.value.message);
        }
        
    } catch (error) {
        logger.log(logLevel.error, error, { message: "Error getting last chat message", file: "joinContentRoomHandler.js", function: "joinContentRoomHandler" });
        console.error("Error getting last chat message:", error);
    }

    callback("User successfully joined the room");
};

module.exports = joinContentRoomHandler;

