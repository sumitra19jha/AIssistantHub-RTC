const { customAuth } = require("./middleware/auth");

const ioSetup = (io) => {
    // Use authentication middleware for Socket.IO
    io.use(customAuth);

    // Handle socket connection events
    io.on('connection', require("./socketHandlers/connectionHandler"));
}

module.exports = ioSetup;
