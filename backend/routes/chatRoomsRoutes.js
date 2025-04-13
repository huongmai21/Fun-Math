// routes/chatRoomsRoutes.js
const express = require('express');
const router = express.Router();
const chatRoomsController = require('../controllers/chatRoomsController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, chatRoomsController.createChatRoom);
router.get('/', chatRoomsController.getChatRooms);

module.exports = router;