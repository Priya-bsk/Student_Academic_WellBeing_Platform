import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['academic', 'personal', 'crisis', 'career'],
    required: true
  },
  preferredDate: {
    type: Date,
    required: true
  },
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number,
    default: 60, // minutes
    enum: [30, 60, 90]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  counselorNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    enum: ['in-person', 'virtual', 'phone'],
    default: 'in-person'
  },
  meetingLink: {
    type: String
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  followUpRequired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
appointmentSchema.index({ studentId: 1, status: 1 });
appointmentSchema.index({ counselorId: 1, status: 1 });
appointmentSchema.index({ scheduledDate: 1 });

export default mongoose.model('Appointment', appointmentSchema);