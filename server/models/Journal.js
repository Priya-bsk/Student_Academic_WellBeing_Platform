import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  sentiment: {
    score: {
      type: Number,
      default: 0
    },
    label: {
      type: String,
      enum: ['very-negative', 'negative', 'neutral', 'positive', 'very-positive'],
      default: 'neutral'
    },
    confidence: {
      type: Number,
      default: 0
    }
  },
  emotions: [{
    type: String,
   enum: [
    'joy',
    'sadness',
    'anger',
    'fear',
    'trust',
    'anticipation',
    'surprise',
    'disgust',
    'calm',
    'stress' // added
  ],
  }],
  tags: [{
    type: String,
    trim: true
  }],
  mood: {
    type: String,
    enum: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy']
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ userId: 1, isPinned: -1, createdAt: -1 });

export default mongoose.model('Journal', journalSchema);
