// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });
// const jwt = require('jsonwebtoken');

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Không có token, quyền truy cập bị từ chối" });
//   }

//   try {
//     const decoded = jwt.verify(
//       token.replace("Bearer ", ""),
//       process.env.JWT_SECRET
//     );
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(403).json({ message: "Token không hợp lệ" });
//   }
// };

// module.exports = authenticateToken;

// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/mysql/User');

// Bảo vệ routes với JWT
exports.authenticateToken = async (req, res, next) => {
  let token;

  // Kiểm tra header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Kiểm tra xem token có tồn tại không
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Không có quyền truy cập' 
    });
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm người dùng bằng id từ token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Người dùng không tồn tại' 
      });
    }

    // Thêm thông tin người dùng vào request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token không hợp lệ' 
    });
  }
};

// Kiểm tra vai trò
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò ${req.user.role} không được phép truy cập`
      });
    }
    next();
  };
};