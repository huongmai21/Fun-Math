// models/Bookmark.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookmarkSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Đảm bảo không bookmark trùng lặp
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);