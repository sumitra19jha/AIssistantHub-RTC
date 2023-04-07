const http = require('http');
const socketIo = require('socket.io');
const PORT = require('./src/config/config').PORT;
const OPENAI_API_KEY = require('./src/config/config').OPENAI_API_KEY;
const app = require("./src/app");
const constants = require("./src/constants");
const ChatDao = require("./src/dao/chat");
const auth = require("./src/middleware/auth").customAuth;
const { Configuration, OpenAIApi } = require("openai");


const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const server = http.createServer(app);

io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000"
    },
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true,
        };
        res.writeHead(200, headers);
        res.end();
    },
});

io.use(auth);

io.on('connection', (socket) => {
    socket.on('CHAT_MESSAGE', async (data) => {
        console.log("CHAT_MESSAGE EVENT CALLED");
        const {
            contentId,
            message
        } = data;

        const room = constants.rooms.contentRoom(contentId);
        const userId = socket.user.id;

        try {
            // Save user message
            await ChatDao.saveChatMessage(userId, contentId, 'USER', message);
        } catch (error) {
            console.error("Error saving user message to the database:", error);
        }

        // Get response from ChatGPT
        await getChatGPTResponse(room, message, userId, contentId);
    });

    socket.on("JOIN_CONTENT_ROOM", (data) => {
        console.log("JOIN_CONTENT_ROOM EVENT CALLED");
        const {
            contentId
        } = data;
        const room = constants.rooms.contentRoom(contentId)
        socket.join(room, () => {
            console.log(`User joined room ${room}`);
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Function to get ChatGPT response
async function getChatGPTResponse(room, prompt, userId, contentId) {
    let chatGPTResponse = "";

    try {
        const chatCompletion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: prompt
            }],
            stream: true,
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
                    }

                    io.to(room).emit("NEW_MESSAGE", {
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
                            io.to(room).emit("NEW_MESSAGE", {
                                message: messagePart,
                            });
                        }
                    } catch {
                        console.error("Error getting response from ChatGPT:", error);
                        io.to(room).emit("NEW_MESSAGE", {
                            message: "I'm sorry, I couldn't process your message.",
                        });
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error getting response from ChatGPT:", error);
        io.to(room).emit("NEW_MESSAGE", {
            message: "I'm sorry, I couldn't process your message.",
        });
    }
}


server.listen(PORT, () => {
    console.log("NODE_APP_INSTANCE", process.env.NODE_APP_INSTANCE);
    console.log(`Listening on port ${PORT}`);
});