const axios = require('axios');
const {
    OPENAI_API_KEY
} = require('../config/config');

const OPENAI_API_URL = 'https://api.openai.com/v1/engines/davinci-codex/completions';

async function getChatbotReply(prompt) {
    try {
        const response = await axios.post(
            OPENAI_API_URL, {
                prompt,
                max_tokens: 50
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error(`Error: ${error}`);
        return 'An error occurred. Please try again later.';
    }
}

module.exports = {
    getChatbotReply,
};