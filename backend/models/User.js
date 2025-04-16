const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'teacher', 'student'], 
    default: 'student' 
  },
  avatar: { type: String },
  bio: { type: String }, // trang mạng xã hội
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách người theo dõi
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách người mình theo dõi
  isActive: { type: Boolean, default: true }, // Trạng thái hoạt động
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);