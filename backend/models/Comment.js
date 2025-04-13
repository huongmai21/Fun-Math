// models/Comment.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const commentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  article: { type: Schema.Types.ObjectId, ref: 'Article' },
  parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' }, // For replies
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isAcceptedAnswer: { type: Boolean, default: false } // For marking correct answers
});

export default mongoose.model('Comment', commentSchema);