// routes/questionsRoutes.js
const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', questionsController.getQuestions);
router.post('/', authenticateToken, questionsController.createQuestion);

module.exports = router;