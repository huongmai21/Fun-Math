const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const authenticateToken = require("../middleware/authMiddleware");


router.get('/profile', authMiddleware, usersController.getProfile);
router.put('/profile', authMiddleware, usersController.updateProfile);
router.post('/follow/:id', authMiddleware, usersController.followUser);
router.post('/unfollow/:id', authMiddleware, usersController.unfollowUser);
router.get('/followers', authMiddleware, usersController.getFollowers);
router.get('/following', authMiddleware, usersController.getFollowing);
router.get('/suggestions', authMiddleware, usersController.getUserSuggestions);
router.get("/users/activity/:year", authenticateToken, usersController.getUserActivity);

module.exports = router;