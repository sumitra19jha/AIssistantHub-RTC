const { Server } = require('ws');
const { getChatbotReply } = require('../controllers/chatController');
const validator = require('validator');
const WsRateLimiter = require('ws-rate-limit');

// Configure rate limiter
const rateLimiter = new WsRateLimiter({
    threshold: 5, // Allow 5 messages per minute
    ttl: 60, // Time to live (in seconds)
});

function setUpChatRoutes(server) {
    const wss = new Server({ server });

    wss.on('connection', (ws) => {
        console.log('Client connected');
        ws.on('message', async (message) => {

            // Check rate limit
            if (!rateLimiter.check(ws._socket.remoteAddress)) {
                ws.send('You are sending messages too quickly. Please slow down.');
                return;
            }

            console.log(`Received message: ${message}`);
            // Validate and sanitize the input
            if (validator.isEmpty(message)) {
                ws.send('Empty input is not allowed.');
                return;
            }

            const sanitizedMessage = validator.escape(message);
            const chatbotReply = await getChatbotReply(sanitizedMessage);
            ws.send(chatbotReply);
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
}

module.exports = {
    setUpChatRoutes,
};