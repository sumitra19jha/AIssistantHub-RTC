const express = require('express');
const router = express.Router();

const asyncHandler = require("../middleware/asyncHandler");
const auth = require("./../middleware/auth");
const roomController = require('../controllers/roomController');

router.post(
    '/create-room', 
    auth.adminAuth, 
    asyncHandler(roomController.createRoom)
);

module.exports = router;