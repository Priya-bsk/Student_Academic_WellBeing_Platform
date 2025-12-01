import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    enum: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'],
    required: true
  },
  moodValue: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true
  },
  note: {
    type: String,
    maxlength: 200,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  activities: [{
    type: String,
    enum: ['exercise', 'socializing', 'studying', 'work', 'relaxation', 'hobbies']
  }]
}, {
  timestamps: true
});

// Ensure one mood entry per user per day
moodSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('Mood', moodSchema);