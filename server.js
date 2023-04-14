try {
    const http = require('http');
    const socketIo = require('socket.io');
    const PORT = require('./src/config/config').PORT;
    const app = require("./src/app");
    const constants = require("./src/constants");
    const ChatDao = require("./src/dao/chat");
    const auth = require("./src/middleware/auth").customAuth;
    const { getChatGPTResponse } = require("./src/helpers/gpt.js");
    const server = http.createServer(app);

    global.io = socketIo(server, {
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
        socket.on(constants.CHAT_MESSAGE, async (data) => {
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
            await getChatGPTResponse(room, userId, contentId);
        });

        socket.on(constants.JOIN_CONTENT_ROOM, async (data) => {
            const { contentId } = data;

            const room = constants.rooms.contentRoom(contentId);
            const userId = socket.user.id;
            socket.join(room, () => { console.log(`User joined room ${room}`); });

            try {
                const last_chat = await ChatDao.getLastChatMessage(contentId);
                if (last_chat.value.type === constants.TYPE_USER_FOR_CHAT_CONSTANT) {
                    await getChatGPTResponse(room, userId, contentId);
                }
            } catch (error) {
                console.error("Error saving user message to the database:", error);
            }
        });

        socket.on(constants.DISCONNECT, () => {
            console.log('User disconnected');
        });
    });


    server.listen(PORT, () => {
        console.log("NODE_APP_INSTANCE", process.env.NODE_APP_INSTANCE);
        console.log(`Listening on port ${PORT}`);
    });
} catch (error) {
    console.log(error)
}

