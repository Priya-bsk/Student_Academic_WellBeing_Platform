import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import moodRoutes from './routes/moods.js';
import appointmentRoutes from './routes/appointments.js';
import studyRoutes from './routes/study.js';
import resourceRoutes from './routes/resources.js';
import journalRoutes from './routes/journal.js';
import assignmentRoutes from './routes/assignments.js';
import { errorHandler } from './middleware/errorHandler.js';
import chatbotRoutes from "./routes/chatbot.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Error handling middleware
app.use(errorHandler);

// MongoDB connection + start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
