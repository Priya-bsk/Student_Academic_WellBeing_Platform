import express from 'express';
import StudySession from '../models/StudySession.js';
import { authenticateToken, requireStudent } from '../middleware/auth.js';

const router = express.Router();

// Get study sessions
router.get('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { days = 7, subject, type } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    let filter = {
      userId: req.user._id,
      date: { $gte: daysAgo }
    };

    if (subject) filter.subject = subject;
    if (type) filter.type = type;

    const sessions = await StudySession.find(filter)
      .populate('relatedTaskId', 'title')
      .sort({ startTime: -1 });

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create study session
router.post('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const session = new StudySession({
      ...req.body,
      userId: req.user._id
    });

    await session.save();
    res.status(201).json({ session, message: 'Study session logged successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update study session
router.put('/:id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const session = await StudySession.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    Object.assign(session, req.body);
    await session.save();

    res.json({ session, message: 'Study session updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get study statistics
router.get('/stats', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { date: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { date: { $gte: monthAgo } };
    }

    const stats = await StudySession.aggregate([
      { $match: { userId: req.user._id, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalHours: { $sum: { $divide: ['$duration', 60] } },
          averageSession: { $avg: { $divide: ['$duration', 60] } },
          subjectBreakdown: {
            $push: {
              subject: '$subject',
              duration: { $divide: ['$duration', 60] }
            }
          },
          averageProductivity: { $avg: '$productivity' },
          completedSessions: { $sum: { $cond: ['$isCompleted', 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      totalSessions: 0,
      totalHours: 0,
      averageSession: 0,
      subjectBreakdown: [],
      averageProductivity: 0,
      completedSessions: 0
    };

    // Process subject breakdown
    const subjectTotals = {};
    result.subjectBreakdown.forEach(item => {
      if (subjectTotals[item.subject]) {
        subjectTotals[item.subject] += item.duration;
      } else {
        subjectTotals[item.subject] = item.duration;
      }
    });

    result.subjectBreakdown = Object.entries(subjectTotals).map(([subject, hours]) => ({
      subject,
      hours: Math.round(hours * 100) / 100
    }));

    res.json({ stats: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete study session
router.delete('/:id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    res.json({ message: 'Study session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;