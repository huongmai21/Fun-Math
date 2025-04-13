// models/Message.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema({
  content: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: Schema.Types.ObjectId, ref: 'StudyRoom', required: true },
  attachments: [{ type: String }], // URLs to files
  sentAt: { type: Date, default: Date.now },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.model('Message', messageSchema);