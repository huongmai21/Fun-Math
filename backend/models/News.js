// models/News.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const newsSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  thumbnail: { type: String },
  tags: [{ type: String }],
  category: { type: String },
  publishedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 }
});

export default mongoose.model('News', newsSchema);