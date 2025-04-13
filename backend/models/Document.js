// models/Document.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const documentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  thumbnail: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  educationLevel: { 
    type: String, 
    enum: ['primary', 'secondary', 'highschool', 'university'] 
  },
  subject: { type: String },
  documentType: { 
    type: String, 
    enum: ['textbook', 'exercise', 'reference', 'other'] 
  },
  tags: [{ type: String }],
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  downloads: { type: Number, default: 0 }
});

export default mongoose.model('Document', documentSchema);