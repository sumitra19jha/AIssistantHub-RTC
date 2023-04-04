const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS with default settings
app.use(cors());

// Body parser to parse url encoded data and json data
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

const roomsRouter = require('./routes/index');
app.use("/room", roomsRouter);


const errorHandler = require("./middleware/errorHandlers");
app.use(errorHandler);

module.exports = app;