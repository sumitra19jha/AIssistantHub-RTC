const https = require('https');
const socketIO = require('socket.io');
const fs = require('fs');

const PORT = require('./src/config/config').PORT;
const app = require("./src/app");

const sslOptions = {
    key: fs.readFileSync('/Users/sumitra/Desktop/ChatGPT/New_Project/real-time-backend/src/ssl/key.pem'),
    cert: fs.readFileSync('/Users/sumitra/Desktop/ChatGPT/New_Project/real-time-backend/src/ssl/cert.pem'),
};


const server = https.createServer(sslOptions, app);

exports.io = socketIO(server, {
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


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

require("./src/socket/connection");