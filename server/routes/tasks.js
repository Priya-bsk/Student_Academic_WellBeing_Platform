import express from 'express';
import Task from '../models/Task.js';
import { authenticateToken, requireStudent } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for current user
router.get('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { status, subject, priority, sortBy = 'dueDate', limit = 50 } = req.query;
    
    const filter = { userId: req.user._id };
    
    if (status === 'completed') filter.isCompleted = true;
    if (status === 'pending') filter.isCompleted = false;
    if (subject) filter.subject = subject;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .sort({ [sortBy]: 1 })
      .limit(parseInt(limit));

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming tasks (next 7 days)
router.get('/upcoming', authenticateToken, requireStudent, async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const tasks = await Task.find({
      userId: req.user._id,
      isCompleted: false,
      dueDate: { $lte: sevenDaysFromNow }
    }).sort({ dueDate: 1 }).limit(10);

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new task
router.post('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      userId: req.user._id
    });

    await task.save();
    res.status(201).json({ task, message: 'Task created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Handle completion
    if (req.body.isCompleted && !task.isCompleted) {
      req.body.completedAt = new Date();
    } else if (!req.body.isCompleted && task.isCompleted) {
      req.body.completedAt = null;
    }

    Object.assign(task, req.body);
    await task.save();

    res.json({ task, message: 'Task updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get task statistics
router.get('/stats', authenticateToken, requireStudent, async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          pending: { $sum: { $cond: ['$isCompleted', 0, 1] } },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $lt: ['$dueDate', new Date()] }, { $eq: ['$isCompleted', false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, completed: 0, pending: 0, overdue: 0 };
    result.completionRate = result.total > 0 ? (result.completed / result.total * 100).toFixed(1) : 0;

    res.json({ stats: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;