// routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/:grade', authenticateToken, resourceController.getResourcesByGrade);
router.get('/detail/:id', authenticateToken, resourceController.getResourceById);
router.post(
  '/create',
  authenticateToken,
  checkRole(['admin', 'teacher']),
  resourceController.createResource
);

module.exports = router;