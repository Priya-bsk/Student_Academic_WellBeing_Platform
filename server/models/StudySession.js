import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1 // minutes
  },
  plannedDuration: {
    type: Number,
    default: 25 // Pomodoro default
  },
  type: {
    type: String,
    enum: ['pomodoro', 'custom', 'planned'],
    default: 'custom'
  },
  date: {
    type: Date,
    default: Date.now
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  productivity: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: {
    type: String,
    maxlength: 300,
    trim: true
  },
  relatedTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  breakDuration: {
    type: Number,
    default: 5 // minutes
  }
}, {
  timestamps: true
});

// Index for efficient querying
studySessionSchema.index({ userId: 1, date: 1 });

export default mongoose.model('StudySession', studySessionSchema);