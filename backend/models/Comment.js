const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referenceType: { 
    type: String, 
    required: true, 
    enum: ['post', 'article', 'document'] // Chỉ cho phép 3 giá trị: post, article, document
  },
  referenceId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    refPath: 'referenceType' // Sử dụng dynamic reference dựa trên referenceType
  },
  parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' }, // Hỗ trợ trả lời bình luận
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isAcceptedAnswer: { type: Boolean, default: false }
});

// Cập nhật updatedAt trước khi lưu
commentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Cập nhật updatedAt trước khi update
commentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Validate: Đảm bảo referenceType và referenceId hợp lệ
commentSchema.pre('save', function(next) {
  const validTypes = ['post', 'article', 'document'];
  if (!validTypes.includes(this.referenceType)) {
    return next(new Error('Invalid referenceType'));
  }
  if (!this.referenceId) {
    return next(new Error('referenceId is required'));
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema);