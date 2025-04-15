// models/Exam.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  educationLevel: { 
    type: String, 
    enum: ['primary', 'secondary', 'highschool', 'university'] 
  },
  subject: { type: String },
  examType: { 
    type: String, 
    enum: ['test', 'competition', 'practice', 'midterm', 'final'] 
  },
  duration: { type: Number }, // in minutes
  totalPoints: { type: Number },
  questions: [{ type: Schema.Types.ObjectId, ref: 'ExamQuestion' }],
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 }
});

module.exports =  mongoose.model('Exam', examSchema);