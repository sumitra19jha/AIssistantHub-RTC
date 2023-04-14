const { Configuration, OpenAIApi } = require("openai");
const constants = require("../constants.js");
const ChatDao = require("../dao/chat.js");
const { logLevel } = require("../constants.js");
const logger = require("../../logger.js");
const OPENAI_API_KEY = require('../config/config.js').OPENAI_API_KEY;

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.getChatGPTResponse = async (room, userId, contentId) => {
    let chatGPTResponse = "";

    try {
        const room_all_messages = await ChatDao.getChatMessages(contentId);
        const messagesData = [];

        for (const message of room_all_messages.value) {
            messagesData.push({
                role: message.type.toLowerCase() == "ai" ? "assistant" : message.type.toLowerCase(),
                content: message.message,
            });
        }

        const chatCompletion = await openai.createChatCompletion({
            model: constants.GPT_CHAT_CONSTANTS.model,
            messages: messagesData,
            stream: constants.GPT_CHAT_CONSTANTS.stream,
            presence_penalty: constants.GPT_CHAT_CONSTANTS.presence_penalty,
            temperature: constants.GPT_CHAT_CONSTANTS.temperature,
            top_p: constants.GPT_CHAT_CONSTANTS.top_p,
            frequency_penalty: constants.GPT_CHAT_CONSTANTS.frequency_penalty,
        }, {
            responseType: "stream"
        });

        chatCompletion.data.on("data", async (data) => {
            const lines = data?.toString()?.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
                const message = line.replace(/^data: /, "");
                if (message == "[DONE]") {
                    try {
                        await ChatDao.saveChatMessage(userId, contentId, "AI", chatGPTResponse);
                    } catch (error) {
                        console.error("Error saving ChatGPT response to the database:", error);
                        logger.log(logLevel.error, error, { file: "helpers/gpt.js", method: "getChatGPTResponse" });
                    }

                    global.io.to(room).emit(constants.NEW_MESSAGE, {
                        message: "",
                        streamEnd: true,
                    });
                } else {
                    let token;
                    try {
                        token = JSON.parse(message)?.choices?.[0]?.delta;

                        if (token.content) {
                            const messagePart = token.content;
                            chatGPTResponse += messagePart;
                            global.io.to(room).emit(constants.NEW_MESSAGE, {
                                message: messagePart,
                            });
                        }
                    } catch (error) {
                        logger.log(logLevel.error, error, { message: "Error getting response from ChatGPT", file: "helpers/gpt.js", method: "getChatGPTResponse" });
                        console.error("Error getting response from ChatGPT:", error);

                        global.io.to(room).emit(constants.NEW_MESSAGE, {
                            message: "I'm sorry, I couldn't process your message.",
                        });
                    }
                }
            }
        });
    } catch (error) {
        logger.log(logLevel.error, error, { message: "Error getting response from ChatGPT", file: "helpers/gpt.js", method: "getChatGPTResponse" });
        console.error("Error getting response from ChatGPT:", error);

        global.io.to(room).emit(constants.NEW_MESSAGE, {
            message: "I'm sorry, I couldn't process your message.",
        });
    }
}