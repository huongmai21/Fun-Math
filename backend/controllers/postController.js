const Post = require("../models/Post");
const UserActivity = require("../models/UserActivity");

// Tạo bài viết mới
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id; // Giả sử middleware auth đã thêm user vào req

    const post = new Post({
      title,
      content,
      author: userId,
    });
    await post.save();

    // Ghi lại hoạt động
    const activity = new UserActivity({
      userId,
      type: "post",
      description: "Đã đăng 1 bài viết",
    });
    await activity.save();

    return res.status(201).json(post);
  } catch (err) {
    return res.status(500).json({ message: "Không thể tạo bài viết", error: err.message });
  }
};

// Các hàm khác (getPosts, deletePost, v.v.) có thể được thêm ở đây