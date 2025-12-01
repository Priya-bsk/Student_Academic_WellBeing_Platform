import express from 'express';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { authenticateToken, requireStudent, requireCounselor, requireStudentOrCounselor } from '../middleware/auth.js';

const router = express.Router();

// Get appointments (role-based)
router.get('/', authenticateToken, requireStudentOrCounselor, async (req, res) => {
  try {
    const { status, upcoming, limit = 20 } = req.query;
    
    let filter = {};
    
    if (req.user.role === 'student') {
      filter.studentId = req.user._id;
    } else if (req.user.role === 'counselor') {
      filter.counselorId = req.user._id;
    }

    if (status) filter.status = status;
    
    if (upcoming === 'true') {
      filter.scheduledDate = { $gte: new Date() };
    }

    const appointments = await Appointment.find(filter)
      .populate('studentId', 'firstName lastName email year major lastLogin')
      .populate('counselorId', 'firstName lastName email specializations')
      .sort({ scheduledDate: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available counselors
router.get('/counselors', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { specialization } = req.query;
    
    let filter = { role: 'counselor', isActive: true };
    if (specialization) {
      filter.specializations = specialization;
    }

    const counselors = await User.find(filter)
      .select('firstName lastName specializations availability')
      .sort({ firstName: 1 });

    res.json({ counselors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create appointment request (student)
router.post('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { counselorId, type, preferredDate, description, isUrgent, duration, location } = req.body;

    // Verify counselor exists and is active
    const counselor = await User.findOne({ _id: counselorId, role: 'counselor', isActive: true });
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor not found' });
    }

    const appointment = new Appointment({
      studentId: req.user._id,
      counselorId,
      type,
      preferredDate,
      description,
      isUrgent: isUrgent || false,
      duration: duration || 60,
      location: location || 'in-person'
    });

    await appointment.save();
    
    // Populate the appointment for response
    await appointment.populate('counselorId', 'firstName lastName email specializations');

    res.status(201).json({
      appointment,
      message: 'Appointment request submitted successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update appointment status (counselor)
router.put('/:id/status', authenticateToken, requireCounselor, async (req, res) => {
  try {
    const { status, scheduledDate, counselorNotes, meetingLink } = req.body;

    const appointment = await Appointment.findOne({ 
      _id: req.params.id, 
      counselorId: req.user._id 
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update appointment
    appointment.status = status;
    if (scheduledDate) appointment.scheduledDate = scheduledDate;
    if (counselorNotes) appointment.counselorNotes = counselorNotes;
    if (meetingLink) appointment.meetingLink = meetingLink;

    await appointment.save();
    await appointment.populate('studentId', 'firstName lastName email year major');

    res.json({
      appointment,
      message: `Appointment ${status} successfully`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel appointment
router.put('/:id/cancel', authenticateToken, requireStudentOrCounselor, async (req, res) => {
  try {
    let filter = { _id: req.params.id };
    
    if (req.user.role === 'student') {
      filter.studentId = req.user._id;
    } else if (req.user.role === 'counselor') {
      filter.counselorId = req.user._id;
    }

    const appointment = await Appointment.findOne(filter);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      appointment,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get appointment statistics (counselor)
router.get('/stats', authenticateToken, requireCounselor, async (req, res) => {
  try {
    const stats = await Appointment.aggregate([
      { $match: { counselorId: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          urgent: { $sum: { $cond: ['$isUrgent', 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0, pending: 0, approved: 0, completed: 0, cancelled: 0, urgent: 0
    };

    res.json({ stats: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;