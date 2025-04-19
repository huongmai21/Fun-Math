// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware"); // Giả sử có middleware xác thực
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

// Các route yêu cầu xác thực
router.use(authMiddleware);

router.get("/", postController.getPosts);
router.post("/", upload.array("attachments"), postController.createPost);
router.post("/:id/like", postController.likePost);
router.post("/:id/share", postController.sharePost);
router.get("/bookmarks", postController.getBookmarks);
router.post("/bookmarks", postController.bookmarkPost);
router.get("/notifications", postController.getNotifications);
router.get("/users/suggestions", postController.getUserSuggestions);

module.exports = router;