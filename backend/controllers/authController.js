import User from '../models/User.js';
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const fs = require("fs");
const path = require("path");

// Định nghĩa schema xác thực đầu vào
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
  role: Joi.string().valid("admin", "teacher", "student").required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Hàm tạo token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
  );
};

// Đăng ký người dùng
exports.register = async (req, res) => {
  try {
    // Xác thực đầu vào
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, role } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được đăng ký'
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo người dùng mới
    const user = await User.create({
      username,
      email,
      password: hashedPassword, // Lưu mật khẩu đã mã hóa
      role,
      avatar: null,
    });

    // Tạo token
    const token = generateToken(user.id);

    res.status(201).json({
      message: "Tài khoản đăng ký thành công",
      success: true,
      token,
      user
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Username hoặc email đã tồn tại" });
    }
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server", details: error.message });
  }
};

// Đăng nhập người dùng
exports.login = async (req, res) => {
  try {
    // Xác thực đầu vào
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // Tìm người dùng
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác'
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác'
      });
    }

    // Tạo token
    const token = generateToken(user);
    res.json({
      token,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server", details: error.message });
  }
};

// Lấy thông tin người dùng hiện tại
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Loại bỏ mật khẩu khỏi phản hồi
    const { password, ...userData } = user.dataValues;
    res.json(userData);
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Cập nhật avatar
exports.updateAvatar = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let avatarUrl = user.avatar;
    if (req.file) {
      // Kiểm tra loại file (chỉ cho phép hình ảnh)
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Only image files are allowed" });
      }

      // Kiểm tra kích thước file (giới hạn 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ message: "File size exceeds 5MB" });
      }

      // Lưu file vào thư mục uploads
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);

      // Tạo URL avatar
      avatarUrl = `/uploads/avatars/${fileName}`;

      // Cập nhật avatar trong cơ sở dữ liệu
      await User.update({ avatar: avatarUrl }, { where: { id: req.user.id } });
    } else {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({ message: "Avatar updated successfully", avatar: avatarUrl });
  } catch (error) {
    console.error("Update avatar error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};