// routes/examRoutes.js
const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/list', authenticateToken, examController.getAllExams);
router.post(
  '/create',
  authenticateToken,
  checkRole(['admin', 'teacher']),
  examController.createExam
);
router.get(
  '/:id',
  authenticateToken,
  checkRole(['student']),
  examController.getExamById
);
router.post(
  '/submit/:id',
  authenticateToken,
  checkRole(['student']),
  examController.submitExam
);

module.exports = router;