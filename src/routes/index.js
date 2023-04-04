const express = require('express');
const chatRoutes = require('./chatRoutes');
const {
    createRoom
} = require('../controllers/roomController');

const router = express.Router();

router.use(chatRoutes);
router.post('/create-room', createRoom);

module.exports = router;