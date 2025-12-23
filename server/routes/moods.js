import express from 'express';
import Mood from '../models/Mood.js';
import { authenticateToken, requireStudent } from '../middleware/auth.js';

const router = express.Router();

// Get mood history
router.get('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const moods = await Mood.find({
      userId: req.user._id,
      date: { $gte: daysAgo }
    }).sort({ date: -1 });

    res.json({ moods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's mood
router.get('/today', authenticateToken, requireStudent, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMood = await Mood.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    res.json({ mood: todayMood });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Log mood
router.post('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { mood, note, stressLevel, sleepHours, activities } = req.body;
    
    const moodValues = {
      'very-sad': 1,
      'sad': 2,
      'neutral': 3,
      'happy': 4,
      'very-happy': 5
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update or create today's mood entry
    const moodEntry = await Mood.findOneAndUpdate(
      {
        userId: req.user._id,
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      },
      {
        userId: req.user._id,
        mood,
        moodValue: moodValues[mood],
        note,
        stressLevel,
        sleepHours,
        activities,
        date: new Date()
      },
      { upsert: true, new: true }
    );

    // Generate motivational message
    const motivationalMessages = {
      'very-sad': "It's okay to have tough days. Remember, you're not alone and tomorrow is a new opportunity.",
      'sad': "Challenging times help us grow stronger. Take care of yourself today.",
      'neutral': "Every day is a fresh start. What's one small thing that could make today better?",
      'happy': "Great to see you're doing well! Keep up the positive momentum.",
      'very-happy': "Your positive energy is wonderful! Share that joy with others around you."
    };

    res.status(201).json({
      mood: moodEntry,
      message: 'Mood logged successfully',
      motivationalMessage: motivationalMessages[mood]
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get mood statistics
router.get('/stats', authenticateToken, requireStudent, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Mood.aggregate([
      { $match: { userId: req.user._id, date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          averageMood: { $avg: '$moodValue' },
          totalEntries: { $sum: 1 },
          averageStress: { $avg: '$stressLevel' },
          averageSleep: { $avg: '$sleepHours' },
          moodDistribution: {
            $push: '$mood'
          }
        }
      }
    ]);

    const result = stats[0] || {
      averageMood: 0,
      totalEntries: 0,
      averageStress: 0,
      averageSleep: 0,
      moodDistribution: []
    };

    // Calculate mood distribution
    const distribution = {};
    result.moodDistribution.forEach(mood => {
      distribution[mood] = (distribution[mood] || 0) + 1;
    });

    result.moodDistribution = distribution;

    res.json({ stats: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;