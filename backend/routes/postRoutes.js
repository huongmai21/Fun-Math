// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + require('path').extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get('/', authMiddleware, postController.getPosts);
router.post('/', authMiddleware, upload.array('attachments'), postController.createPost);
router.delete('/:id', authMiddleware, postController.deletePost);
router.post('/like/:id', authMiddleware, postController.likePost);
router.post('/share/:id', authMiddleware, postController.sharePost);
router.post('/comment/:id', authMiddleware, postController.addComment);

module.exports = router;