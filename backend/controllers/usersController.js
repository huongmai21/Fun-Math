const User = require("../models/User");
const { body, validationResult } = require("express-validator");

// Lấy thông tin người dùng hiện tại
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh sách người mình theo dõi (hỗ trợ phân trang)
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const following = await User.find({ _id: { $in: user.following } })
      .select("username avatar")
      .skip(skip)
      .limit(limit);

    const total = user.following.length;

    res.status(200).json({
      data: following,
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh sách người theo dõi (hỗ trợ phân trang)
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const followers = await User.find({ _id: { $in: user.followers } })
      .select("username avatar")
      .skip(skip)
      .limit(limit);

    const total = user.followers.length;

    res.status(200).json({
      data: followers,
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy tất cả người dùng (dành cho admin, hỗ trợ phân trang)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("username email role")
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      data: users,
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Xóa người dùng (dành cho admin)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: "Không thể tự xóa tài khoản của bạn" });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Theo dõi người dùng
exports.followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = req.params.id;

    if (userId === targetUserId) {
      return res.status(400).json({ message: "Không thể tự theo dõi chính mình" });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (user.following.includes(targetUserId)) {
      return res.status(400).json({ message: "Bạn đã theo dõi người dùng này" });
    }

    user.following.push(targetUserId);
    await user.save();

    targetUser.followers.push(userId);
    await targetUser.save();

    res.status(200).json({ message: "Theo dõi thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Bỏ theo dõi người dùng
exports.unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = req.params.id;

    if (userId === targetUserId) {
      return res.status(400).json({ message: "Không thể bỏ theo dõi chính mình" });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (!user.following.includes(targetUserId)) {
      return res.status(400).json({ message: "Bạn chưa theo dõi người dùng này" });
    }

    user.following = user.following.filter((id) => id.toString() !== targetUserId);
    await user.save();

    targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId);
    await targetUser.save();

    res.status(200).json({ message: "Bỏ theo dõi thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};


exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.params.year);

    // Giả lập dữ liệu hoạt động (thay bằng logic thực tế nếu có)
    const activities = [
      {
        date: `${year}-01-01`,
        count: 2,
        details: [
          { type: "post", description: "Đã đăng 1 bài viết" },
          { type: "course", description: "Đã tham gia 1 khóa học" },
        ],
      },
    ];

    res.status(200).json({
      activity: activities,
      total: activities.length,
    });
  } catch (err) {
    console.error("Error in getUserActivity:", err);
    res.status(500).json({
      message: "Không thể lấy dữ liệu hoạt động",
      error: err.message,
    });
  }
};

exports.updateProfile = [
  body("username").notEmpty().withMessage("Tên người dùng không được để trống"),
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("bio").optional().isString().withMessage("Tiểu sử phải là chuỗi"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const { username, email, bio } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username, email, bio },
        { new: true }
      );

      res.status(200).json(updatedUser);
    } catch (err) {
      console.error("Error in updateProfile:", err);
      res.status(500).json({ message: "Không thể cập nhật hồ sơ", error: err.message });
    }
  },
];