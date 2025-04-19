// controllers/postController.js
const Post = require("../models/Post");
const Bookmark = require("../models/Bookmark");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Lấy danh sách bài đăng hoặc bài tập
exports.getPosts = async (req, res) => {
  try {
    const { category, category_ne, isSolved } = req.query;
    const query = {};
    if (category) query.category = category;
    if (category_ne) query.category = { $ne: category_ne };
    if (isSolved) query.isSolved = isSolved === "true";

    const posts = await Post.find(query)
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .limit(20); // Phân trang đơn giản
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng bài mới
exports.createPost = async (req, res) => {
  try {
    const { content, category } = req.body;
    const attachments = req.files ? req.files.map((file) => file.path) : [];

    const post = new Post({
      content,
      category,
      author: req.user._id, // Giả sử user đã được xác thực
      attachments,
    });

    await post.save();
    await post.populate("author", "username avatar");
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thích bài đăng
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Bài đăng không tồn tại" });

    if (!post.likes.includes(req.user._id)) {
      post.likes.push(req.user._id);
      await post.save();
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Chia sẻ bài đăng
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Bài đăng không tồn tại" });

    post.shares = (post.shares || 0) + 1;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy bài đã lưu
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: "post",
        populate: { path: "author", select: "username avatar" },
      });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lưu bài đăng
exports.bookmarkPost = async (req, res) => {
  try {
    const { postId } = req.body;
    const bookmark = new Bookmark({
      user: req.user._id,
      post: postId,
    });
    await bookmark.save();
    await bookmark.populate({
      path: "post",
      populate: { path: "author", select: "username avatar" },
    });
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông báo
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gợi ý "Who to follow"
exports.getUserSuggestions = async (req, res) => {
  try {
    // Giả lập gợi ý: lấy người dùng chưa follow
    const followedUsers = await Follow.find({ follower: req.user._id }).select("following");
    const followedIds = followedUsers.map((f) => f.following);
    const suggestions = await User.find({
      _id: { $ne: req.user._id, $nin: followedIds },
    })
      .select("username avatar bio")
      .limit(5);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};