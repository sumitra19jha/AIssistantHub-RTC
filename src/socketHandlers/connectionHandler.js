const { CHAT_MESSAGE, JOIN_CONTENT_ROOM, JOIN_EDIT_ROOM, DISCONNECT } = require("../constants");

const connectionHandler = (socket) => {
    // Handle incoming chat messages
    socket.on(CHAT_MESSAGE, require("./chatMessageHandler.js")(socket));

    // Handle users joining content rooms
    socket.on(JOIN_CONTENT_ROOM, require("./joinContentRoomHandler.js")(socket));

    // Handle users joining edit rooms
    socket.on(JOIN_EDIT_ROOM, require("./joinEditRoomHandler.js")(socket));

    // Handle user disconnections
    socket.on(DISCONNECT, () => {
        console.log('User disconnected');
    });
}

module.exports = connectionHandler;
