import express from 'express';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import Resource from '../models/Resource.js';
import { authenticateToken, requireStudent } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|mp4|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get resources
router.get('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { subject, folder, type, search, limit = 50 } = req.query;
    
    let filter = { userId: req.user._id };
    
    if (subject) filter.subject = subject;
    if (folder) filter.folder = folder;
    if (type) filter.type = type;
    
    if (search) {
      filter.$text = { $search: search };
    }

    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ resources });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create resource (text/link)
router.post('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const resource = new Resource({
      ...req.body,
      userId: req.user._id
    });

    await resource.save();
    res.status(201).json({ resource, message: 'Resource created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload file resource
router.post('/upload', authenticateToken, requireStudent, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resource = new Resource({
      title: req.body.title || req.file.originalname,
      type: 'document',
      subject: req.body.subject,
      folder: req.body.folder || 'General',
      description: req.body.description,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      userId: req.user._id
    });

    await resource.save();
    res.status(201).json({ resource, message: 'File uploaded successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update resource
router.put('/:id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const resource = await Resource.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    Object.assign(resource, req.body);
    await resource.save();

    res.json({ resource, message: 'Resource updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete resource
router.delete('/:id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Delete file if it exists
    if (resource.filePath) {
      const fs = await import('fs');
      fs.unlink(resource.filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get folders
router.get('/folders', authenticateToken, requireStudent, async (req, res) => {
  try {
    const folders = await Resource.distinct('folder', { userId: req.user._id });
    res.json({ folders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get subjects
router.get('/subjects', authenticateToken, requireStudent, async (req, res) => {
  try {
    const subjects = await Resource.distinct('subject', { userId: req.user._id });
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;