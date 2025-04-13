// models/Course.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  thumbnail: { type: String },
  educationLevel: { 
    type: String, 
    enum: ['primary', 'secondary', 'highschool', 'university'] 
  },
  subject: { type: String },
  price: { type: Number, default: 0 },
  duration: { type: String }, // e.g., "8 weeks"
  enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  modules: [{
    title: String,
    description: String,
    lessons: [{
      title: String,
      content: String,
      videoUrl: String,
      attachments: [String],
      quiz: { type: Schema.Types.ObjectId, ref: 'Exam' }
    }]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  rating: { type: Number, default: 0 },
  reviews: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }]
});

export default mongoose.model('Course', courseSchema);