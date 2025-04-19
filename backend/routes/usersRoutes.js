const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const authenticateToken = require("../middleware/authMiddleware");


// Lấy thông tin người dùng hiện tại
router.get("/profile", authMiddleware, usersController.getProfile);

// Lấy danh sách người mình theo dõi
router.get("/friends", authMiddleware, usersController.getFriends);

// Lấy danh sách người theo dõi
router.get("/followers", authMiddleware, usersController.getFollowers);

// Lấy tất cả người dùng (admin)
router.get("/all", authMiddleware, checkRole(["admin"]), usersController.getAllUsers);

// Xóa người dùng (admin)
router.delete("/:id", authMiddleware, checkRole(["admin"]), usersController.deleteUser);

// Theo dõi người dùng
router.post("/follow/:id", authMiddleware, usersController.followUser);

// Bỏ theo dõi người dùng
router.post("/unfollow/:id", authMiddleware, usersController.unfollowUser);

router.get("/users/activity/:year", authenticateToken, usersController.getUserActivity);

module.exports = router;