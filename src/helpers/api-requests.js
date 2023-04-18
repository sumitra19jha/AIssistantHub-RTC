const axios = require('axios');
const BACKEND_API_URL = require('./../config/config').BACKEND_API_URL;
const { AUTH_TOKEN } = require('./../config/config');

const api = axios.create({
    baseURL: BACKEND_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    config => {
        if (AUTH_TOKEN) {
            config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

module.exports = api;
