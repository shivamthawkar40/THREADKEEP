const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 12000,
  },
  sources: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: {
    type: [messageSchema],
    default: [],
  },
}, { timestamps: true });

conversationSchema.index({ project: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('ProjectConversation', conversationSchema);
