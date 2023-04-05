const io = require("../../server").io;
const hookFunction = require("./helpers/customHooks").hookFunction;

global.rootNamespace = io.of("/");

//Socket.IO connection handler
io.on('connection', (socket) => {
    const ns = io.of("/");
});

// Root Namespace events
global.rootNamespace.on("connection", (socket) => {
    console.log('User connected');

    socket.on('userJoined', ({
        userId
    }) => {
        console.log(`User ${userId} joined the room`);
    });

    socket.on('sendMessage', ({
        roomId,
        userId,
        message
    }) => {
        io.to(roomId).emit('messageReceived', {
            userId,
            message
        });
    });

    socket.on('userJoined', ({
        userId
    }) => {
        // Get the room name from the socket
        const roomName = Object.keys(socket.rooms).filter(item => item !== socket.id)[0];

        // Add the user to the room
        socket.join(roomName);
        console.log(`User ${userId} joined room ${roomName}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
})

global.rootNamespace.adapter.customHook = hookFunction(global.rootNamespace);