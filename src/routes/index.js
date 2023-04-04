const express = require('express');
const router = express.Router();
const createRoom = require('../controllers/roomController').createRoom;

router.post('/create-room', createRoom);

module.exports = router;