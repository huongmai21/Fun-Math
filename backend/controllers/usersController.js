const User = require("../models/User");
const { body, validationResult } = require("express-validator");


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('followers following');
    const year = req.query.year || new Date().getFullYear();
    const activity = user.activity.filter(act => act.date.startsWith(year.toString()));
    
    // Tạo dữ liệu cho heatmap (đảm bảo có dữ liệu cho tất cả các ngày trong năm)
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const fullActivity = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const act = activity.find(a => a.date === dateStr) || { date: dateStr, count: 0, details: [] };
      fullActivity.push({
        date: act.date,
        count: act.count,
        details: act.details,
      });
    }

    res.json({ ...user.toObject(), activity: fullActivity, total: activity.reduce((sum, act) => sum + act.count, 0) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { username, email, bio, socialLink } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email, bio, socialLink },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (!userToFollow || !currentUser) return res.status(404).json({ message: 'User not found' });

    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
      await currentUser.save();
      await userToFollow.save();

      currentUser.activity.push({
        date: new Date().toISOString().split('T')[0],
        count: 1,
        details: [`Followed ${userToFollow.username}`],
      });
      await currentUser.save();
    }
    res.json({ message: 'Followed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (!userToUnfollow || !currentUser) return res.status(404).json({ message: 'User not found' });

    currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());
    await currentUser.save();
    await userToUnfollow.save();
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('followers', 'username avatar bio');
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('following', 'username avatar bio');
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserSuggestions = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('username avatar bio')
      .limit(5);
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
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