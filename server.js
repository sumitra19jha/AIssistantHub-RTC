try {
    const http = require('http');
    const socketIo = require('socket.io');
    const app = require("./src/app");
    const ioSetup = require("./src/socket");
    const { PORT } = require('./src/config/config');

    const server = http.createServer(app);

    // Create a Socket.IO instance and configure CORS
    global.io = socketIo(server, {
        cors: {
            origin: "http://localhost:3000"
        },
        handlePreflightRequest: (req, res) => {
            const headers = {
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Origin": req.headers.origin,
                "Access-Control-Allow-Credentials": true,
            };
            res.writeHead(200, headers);
            res.end();
        },
    });

    ioSetup(io);

    // Start the server
    server.listen(PORT, () => {
        console.log("NODE_APP_INSTANCE", process.env.NODE_APP_INSTANCE);
        console.log(`Listening on port ${PORT}`);
    });
} catch (error) {
    logger.log(logLevel.error, error, { message: "Error in server", file: "server.js" });
    console.log(error)
}

