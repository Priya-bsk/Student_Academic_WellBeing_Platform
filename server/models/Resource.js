import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['document', 'link', 'note', 'video', 'audio'],
    required: true
  },
  content: {
    type: String, // For notes or link URLs
    trim: true
  },
  filePath: {
    type: String // For uploaded files
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  folder: {
    type: String,
    default: 'General',
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient searching
resourceSchema.index({ userId: 1, subject: 1 });
resourceSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Resource', resourceSchema);