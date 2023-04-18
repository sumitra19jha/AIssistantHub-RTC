const { Configuration, OpenAIApi } = require("openai");
const constants = require("../constants.js");
const ChatDao = require("../dao/chat.js");
const ContentDao = require("../dao/content.js");
const { logLevel } = require("../constants.js");
const logger = require("../../logger.js");
const OPENAI_API_KEY = require('../config/config.js').OPENAI_API_KEY;

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.getChatGPTResponse = async (room, userId, contentId, msgCategory) => {
    let chatGPTResponse = "";
    let isFirstCall = false;
    let chatSaveResult = null;

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
                        chatSaveResult = await ChatDao.saveChatMessage(userId, contentId, "AI", chatGPTResponse);
                        if (chatGPTResponse.startsWith('update//') || chatGPTResponse.startsWith('Update//')) {
                            await updateContentEvent(contentId, userId, chatSaveResult.value.insertId);
                        }
                    } catch (error) {
                        console.error("Error saving ChatGPT response to the database:", error);
                        logger.log(logLevel.error, error, { file: "helpers/gpt.js", method: "getChatGPTResponse" });
                    }

                    if (chatGPTResponse.length < 15) {
                        global.io.to(room).emit(constants.NEW_MESSAGE, {
                            message: removePrefix(chatGPTResponse),
                            streamEnd: true,
                            action: msgCategory,
                        });
                    } else {
                        global.io.to(room).emit(constants.NEW_MESSAGE, {
                            message: "",
                            streamEnd: true,
                            action: msgCategory,
                        });
                    }
                } else {
                    let token;
                    try {
                        token = JSON.parse(message)?.choices?.[0]?.delta;

                        if (token.content) {
                            let messagePart = token.content;
                            chatGPTResponse += messagePart;


                            if (chatGPTResponse.length >= 15) {

                                if (!isFirstCall) {
                                    messagePart = removePrefix(chatGPTResponse);
                                    isFirstCall = true;
                                }

                                global.io.to(room).emit(constants.NEW_MESSAGE, {
                                    message: messagePart,
                                });
                            }
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


exports.getFirstChatGPTResponseForGeneralConversation = async (room, userId, contentId, msgCategory, message) => {
    let chatGPTResponse = "";

    try {
        const messagesData = [{
            "role": "system",
            "content": constants.SYSTEM_PROMPT_FOR_GREETINGS
        },
        {
            "role": "user",
            "content": message
        }];

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
                        const chatSaveResult = await ChatDao.saveChatMessage(userId, contentId, "AI", chatGPTResponse, false, msgCategory);
                    } catch (error) {
                        console.error("Error saving ChatGPT response to the database:", error);
                        logger.log(logLevel.error, error, { file: "helpers/gpt.js", method: "getFirtChatGPTResponseForGeneralConversation" });
                    }

                    global.io.to(room).emit(constants.NEW_MESSAGE, {
                        message: "",
                        streamEnd: true,
                        action: msgCategory,
                    });
                } else {
                    try {
                        let token = JSON.parse(message)?.choices?.[0]?.delta;

                        if (token.content) {
                            let messagePart = token.content;
                            chatGPTResponse += messagePart;


                            try {
                                global.io.to(room).emit(constants.NEW_MESSAGE, {
                                    message: messagePart,
                                });
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    } catch (error) {
                        logger.log(logLevel.error, error, { message: "Error getting response from ChatGPT", file: "helpers/gpt.js", method: "getFirtChatGPTResponseForGeneralConversation" });
                        console.error("Error getting response from ChatGPT:", error);

                        global.io.to(room).emit(constants.NEW_MESSAGE, {
                            message: "I'm sorry, I couldn't process your message.",
                        });
                    }
                }
            }
        });
    } catch (error) {
        logger.log(logLevel.error, error, { message: "Error getting response from ChatGPT", file: "helpers/gpt.js", method: "getFirtChatGPTResponseForGeneralConversation" });
        console.error("Error getting response from ChatGPT:", error);

        global.io.to(room).emit(constants.NEW_MESSAGE, {
            message: "I'm sorry, I couldn't process your message.",
        });
    }
}


exports.getChatGPTResponseForGeneralConversation = async (room, userId, contentId, msgCategory) => {
    let chatGPTResponse = "";

    try {
        const room_all_messages = await ChatDao.getChatMessages(contentId);
        const messagesData = [{
            "role": "system",
            "content": constants.SYSTEM_PROMPT_FOR_GREETINGS
        }];

        for (const message of room_all_messages.value) {
            if (message.type.toLowerCase() != "system") {
                const userPrompt = {
                    role: message.type.toLowerCase() == "ai" ? "assistant" : message.type.toLowerCase(),
                    content: message.message,
                };
                messagesData.push(userPrompt);
            }
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
                        action: msgCategory,
                    });
                } else {
                    try {
                        let token = JSON.parse(message)?.choices?.[0]?.delta;

                        if (token.content) {
                            let messagePart = token.content;
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


exports.getChatGPTResponseForActionWithoutRequirements = async (message, room, userId, contentId, msgCategory) => {
    let chatGPTResponse = "";

    try {
        const contentData = await ContentDao.getUserContent(userId, contentId);
        const messagesData = [{
            "role": "system",
            "content": constants.SYSTEM_PROMPT_FOR_ACTION_WITHOUT_REQUIREMENTS,
        }];

        const previous_chats = await ChatDao.getFilteredChatsForActionWithoutRequirements(contentId);
        for (const message of previous_chats.value) {
            if (message.type.toLowerCase() != "system") {
                const prompt = {
                    role: message.type.toLowerCase() == "ai" ? "assistant" : message.type.toLowerCase(),
                    content: message.message,
                };
                messagesData.push(prompt);
            }
        }

        const userPrompt = {
            "role": "user",
            "content": `User wants to update the ${contentData.value.type} for ${contentData.value.platform} and user has provided the message \"${message}\" for below content\n\"\"\"\n${contentData.value.model_response}\n\"\"\"\n\nAsk user about requirements as it is not clear in message.`
        }
        messagesData.push(userPrompt)

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
                        const chatSaveResult = await ChatDao.saveChatMessage(
                            userId,
                            contentId,
                            "AI",
                            chatGPTResponse,
                        );
                    } catch (error) {
                        console.error("Error saving ChatGPT response to the database:", error);
                        logger.log(logLevel.error, error, { file: "helpers/gpt.js", method: "getChatGPTResponse" });
                    }

                    global.io.to(room).emit(constants.NEW_MESSAGE, {
                        message: "",
                        streamEnd: true,
                        action: msgCategory,
                    });
                } else {
                    let token;
                    try {
                        token = JSON.parse(message)?.choices?.[0]?.delta;

                        if (token.content) {
                            let messagePart = token.content;
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

const removePrefix = (message) => {
    const prefixes = ['requirement//', 'update//', 'message//', 'Message//', 'Requirement//', 'Update//'];
    let cleanedMessage = message;

    for (const prefix of prefixes) {
        if (message.startsWith(prefix)) {
            cleanedMessage = message.replace(prefix, '').trim();
            break;
        }
    }

    return cleanedMessage;
}

const updateContentEvent = async (contentId, userId, chatId) => {
    console.log("UPDATE CONTENT EVENT CALLED");
    if (!contentId || !userId || !chatId) {
        return;
    }

    const room = constants.rooms.editRoom(contentId);

    try {
        const content = await ContentDao.getUserContent(userId, contentId);
        const userChatMessageId = chatId - 1;
        const chatMsg = await ChatDao.getChatMessagesFromId(userChatMessageId);

        const systemVal1 = {
            "role": "system",
            "content": content.value.system_message,
        }

        const userVal1 = {
            "role": "user",
            "content": content.value.user_message,
        }

        const systemVal2 = {
            "role": "system",
            "content": "You are an AI language model, and your task is to generate a JSON object to modify content based on user feedback. The JSON object should contain the following parameters:\n\n1. action: Enum(\"update\", \"remove\", \"add\")\n2. position (Object)\n3. content (Text, if applicable)\n\n\nInstructions for creating the JSON Object:\n\n1. The \"action\" parameter can be \"add\", \"remove\", or \"update\". The \"position\" object will depend on the chosen action type.\n\n2. For \"add\" actions, the \"position\" object should contain the \"index\" where the new content will be added.\n\n3. For \"update\" actions, the \"position\" object should contain the \"index\" where the new content will be added, as well as \"start_index_for_removal\" and \"end_index_for_removal\" to specify the range of words to be replaced.\n\n4. For \"remove\" actions, the \"position\" object should contain \"start_index_for_removal\" and \"end_index_for_removal\" to specify the range of words to be removed.\n\n5. Position is measured based on word count.\n\n6. The \"content\" parameter will be empty for \"remove\" actions. It will be included only for \"update\" and \"add\" actions.\n\n7. The \"content\" parameter will be a text based on the user's request.\n\n8. The user's request pertains to their own content, so the JSON object should only contain new texts to be updated in the user's content.\n\n9. If multiple changes at multiple positions are needed, provide an array of actions.\n\n10. Your response should only contain JSON Object and nothing else\n\nMake sure to strictly follow these instructions when generating the JSON object."
        }

        const userVal2 = {
            "role": "user",
            "content": `User Request: "${chatMsg.value[0].message}"\n\nCurrent Content: "${content.value.model_response}"`
        }

        const message = [systemVal1, userVal1, systemVal2, userVal2]
        const chatCompletion = await openai.createChatCompletion({
            model: constants.GPT_CHAT_CONSTANTS.model,
            messages: message,
            stream: false,
            presence_penalty: constants.GPT_CHAT_CONSTANTS.presence_penalty,
            temperature: constants.GPT_CHAT_CONSTANTS.temperature,
            top_p: constants.GPT_CHAT_CONSTANTS.top_p,
            frequency_penalty: constants.GPT_CHAT_CONSTANTS.frequency_penalty,
        });

        // Parse the ChatGPT response as JSON
        if (chatCompletion.data.choices && chatCompletion.data.choices.length > 0) {
            const actionsJson = extractAndParseJsonObject(chatCompletion.data.choices[0].message.content);
            console.log(actionsJson);

            if (actionsJson) {
                // Emit the CONTENT_UPDATED event with the JSON object
                global.io.to(room).emit('CONTENT_UPDATED', {
                    contentId: contentId,
                    updatedContent: actionsJson
                });
            } else {
                console.log("No valid JSON object found in the ChatGPT response");
            }
        } else {
            console.log("No choices found in the ChatGPT response");
        }

    } catch (error) {
        console.log(error)
        logger.log(logLevel.error, error, { message: "Error getting response from ChatGPT", file: "helpers/gpt.js", method: "updateContentEvent" });
    }
}

const extractAndParseJsonObject = (message) => {
    let startPosition = message.indexOf('{');
    let endPosition = -1;
    let braceCount = 0;

    for (let i = startPosition; i < message.length; i++) {
        if (message[i] === '{') {
            braceCount++;
        } else if (message[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                endPosition = i;
                break;
            }
        }
    }

    if (startPosition !== -1 && endPosition !== -1) {
        const jsonString = message.substring(startPosition, endPosition + 1);
        return JSON.parse(jsonString);
    }

    return null;
}


exports.userMessageIntentClassification = async (message) => {
    try {
        const prompt = `Decide in which category user message is: 

        1. Action with requirements
        2. Action without requirements
        3. General Conversation
        
        Examples:
        User: Hi
        Assistant: General Conversation
        
        User: Add hashtags
        Assistant: Action with requirements
        
        User: Add more sentences
        Assistant: Action without requirements

        User: I want to modify my content
        Assistant: Action without requirements

        User: Add more sentences regarding ancient history as well
        Assistant: Action with requirements

        User: Increase overall length of the content
        Assistant: Action with requirements
        
        User: ${message}
        Assistant:`;

        const chatCompletion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.5,
        });

        if (chatCompletion.data.choices && chatCompletion.data.choices.length > 0) {
            return chatCompletion.data.choices[0].text;
        }

        return null;
    } catch (error) {
        logger.log(logLevel.error, error, { message: "Error getting response from ChatGPT", file: "helpers/gpt.js", method: "userMessageCateforyClassification" });
        return null;
    }
}

exports.userMessageCateforyClassification = async (message) => {
    try {
        const prompt = `Decide whether a user message is asking for: 

        1. Adding content
        2. Modifying content
        3. Deleting content
        4. Rearranging content
        5. Finding and replacing
        6. Proofreading and suggestions
        7. General information and questions
        8. Greetings
        
        Examples:
        User: Hi
        Assistant: Greetings
        
        User: Add hashtags
        Assistant: Adding content
        
        User: The word march is not good
        Assistant: Finding and replacing
        
        User: I don't like "From revolutionizing the electric car industry with Tesla to pursuing space exploration with SpaceX, Musk's impact on the world is undeniable"
        Assistant:`;

        const chatCompletion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.5,
        });

        if (chatCompletion.data.choices && chatCompletion.data.choices.length > 0) {
            const category = formatString(chatCompletion.data.choices[0].text);
            return category;
        }

        return null;
    } catch (error) {
        logger.log(logLevel.error, error, { message: "Error getting response from ChatGPT", file: "helpers/gpt.js", method: "userMessageCateforyClassification" });
    }
}

exports.lengthPredictionForContent = async (content, message) => {
    try {
        const prompt = `You are an AI language model that predicts the appropriate length and type of content to add based on a user's message. Carefully consider the user's message and the content before making a suggestion. The input will be a description containing the content and the user's message. The output should be a text representation of a JSON-like string with two parameters: 'Type' (an enum of Points, Sentences, Paragraphs, or Words) and 'Length'.

        ---
        {
            "content": "${content}",
            "message": "${message}"
        }
        ---
        `
        const chatCompletion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.5,
        });

        if (chatCompletion.data.choices && chatCompletion.data.choices.length > 0) {
            const jsonParsedObj = extractAndParseJsonObject(chatCompletion.data.choices[0].text);
            return jsonParsedObj;
        }

        return null;
    } catch (error) {
        logger.log(logLevel.error, error, { message: "Error getting response from ChatGPT", file: "helpers/gpt.js", method: "lengthPrediction" });
    }
}


exports.typePredictionForChangeInContentBasedOnMessage = async (content, message) => {
    try {
        const prompt = `You are an AI language model that predicts the appropriate length and type of content to add based on a user's message. Carefully consider the user's message and the content before making a suggestion. The input will be a description containing the content and the user's message. The output should be a text representation of a JSON-like string with two parameters: 'Type' (an enum of Points, Sentences, Paragraphs, or Words) and 'Length'.

        ---
        {
            "content": "${content}",
            "message": "${message}"
        }
        ---
        `
        const chatCompletion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.5,
        });

        if (chatCompletion.data.choices && chatCompletion.data.choices.length > 0) {
            const jsonParsedObj = extractAndParseJsonObject(chatCompletion.data.choices[0].text);
            return jsonParsedObj;
        }

        return null;
    } catch (error) {
        logger.log(logLevel.error, error, { message: "Error getting response from ChatGPT", file: "helpers/gpt.js", method: "lengthPrediction" });
    }
}

exports.userMessageForAddingContent = async (userMessage, length, typeOfLength, content) => {
    try {
        const systemVal = {
            "role": "system",
            "content": "You are an AI language model that assists users with editing text by generating content based on their requests. The user wants to add new content to their text. Help the user by generating content according to their message.\n\nThe input will be a text-like JSON format containing:\n1. message\n2. length\n\nThe output should be only the new content pointwise that will be shown to the user. Think step by step and provide the content the user requested."
        }

        const userVal = {
            "role": "user",
            "content": `{\n\"message\":\"${userMessage}\",\n\"length\": \"${length} ${typeOfLength}\",\n\"content\": \"${content}\"}`
        }

        const chatCompletion = await openai.createChatCompletion({
            model: constants.GPT_CHAT_CONSTANTS.model,
            messages: [systemVal, userVal],
            stream: false,
            presence_penalty: constants.GPT_CHAT_CONSTANTS.presence_penalty,
            temperature: constants.GPT_CHAT_CONSTANTS.temperature,
            top_p: constants.GPT_CHAT_CONSTANTS.top_p,
            frequency_penalty: constants.GPT_CHAT_CONSTANTS.frequency_penalty,
        });

        if (chatCompletion.data.choices && chatCompletion.data.choices.length > 0) {
            const userRequestedContent = extractPoints(chatCompletion.data.choices[0].message.content);
            return userRequestedContent;
        }

        return null;
    } catch (error) {
        logger.log(logLevel.error, error, { message: "Error getting response from ChatGPT", file: "helpers/gpt.js", method: "userMessageForAddingContent" });
    }
}

//Get Category from model response
const formatString = (str) => {
    str = str.replace(/[0-9.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    str = str.toUpperCase();
    str = str.trim();
    return str;
}

//Extract points from output
const extractPoints = (output) => {
    const pointsRegex = /^\d+\.\s(.+)$/gm;
    const points = [];
    let match;

    while ((match = pointsRegex.exec(output)) !== null) {
        points.push(match[1]);
    }

    return points;
}