const io = require("../../server").io;

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('joinRoom', ({
        roomId,
        userId
    }) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.on('leaveRoom', ({
        roomId,
        userId
    }) => {
        socket.leave(roomId);
        console.log(`User ${userId} left room ${roomId}`);
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

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});