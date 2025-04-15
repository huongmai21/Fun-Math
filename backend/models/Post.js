// models/Post.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { 
    type: String, 
    enum: ['question', 'discussion', 'resource', 'announcement'] 
  },
  tags: [{ type: String }],
  attachments: [{ type: String }], // URLs to files
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  isSolved: { type: Boolean, default: false } // For questions
});

module.exports =  mongoose.model('Post', postSchema);