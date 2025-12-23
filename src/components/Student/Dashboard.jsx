import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { Calendar, BookOpen, Heart, Users, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FloatingStudentChat from './FloatingStudentChat';

export default function Dashboard() {
  const { makeRequest } = useApi();
  const { state } = useAuth();
  const user = state.user;
  
  const navigate = useNavigate();
useEffect(() => {
  if (!user) return;

  // Redirect based on role
  if (user.role === 'counselor') {
    navigate('/counselor/dashboard');
  } else if (user.role === 'student') {
    navigate('/dashboard');
  }
}, [user, navigate]);

  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedTasks: 0,
    studyHours: 0,
    moodAverage: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, tasksRes, studyRes, moodsRes] = await Promise.all([
        makeRequest('/appointments'),
        makeRequest('/tasks'),
        makeRequest('/study'),
        makeRequest('/moods')
      ]);

      // Extract arrays safely
      const appointments = appointmentsRes?.appointments || [];
      const tasks = tasksRes?.tasks || [];
      const studySessions = studyRes?.sessions || [];
      const moods = Array.isArray(moodsRes)
        ? moodsRes
        : moodsRes?.moods || moodsRes?.data || [];

      // Compute stats
      const upcomingAppointments = appointments.filter(apt => {
  const appointmentDate = apt.scheduledDate || apt.preferredDate;
  return appointmentDate && new Date(appointmentDate) > new Date();
}).length;


      const completedTasks = tasks.filter(task => task.isCompleted).length;

      const studyHours = studySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;

      const validMoods = moods.filter(m => typeof m.moodValue === 'number' && !isNaN(m.moodValue));
      const moodAverage = validMoods.length > 0
        ? validMoods.reduce((sum, m) => sum + m.moodValue, 0) / validMoods.length
        : 0;

      setStats({
        upcomingAppointments,
        completedTasks,
        studyHours: Math.round(studyHours * 10) / 10,
        moodAverage: Math.round(moodAverage * 10) / 10
      });

      // Recent activities (appointments + tasks)
      const activities = [
  ...appointments.slice(0, 2).map(apt => {
    const counselorName = apt.counselorId 
      ? `${apt.counselorId.firstName} ${apt.counselorId.lastName}` 
      : 'Unknown Counselor';
console.log('Scheduled Date:', apt);

    return {
  type: 'appointment',
  title: `Appointment with ${counselorName}`,
  time: apt.preferredDate
    ? new Date(apt.preferredDate).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : '--',
  icon: Calendar
};

  }),
  ...tasks.slice(0, 2).map(task => ({
    type: 'task',
    title: task.title || 'Unnamed Task',
    time: task.isCompleted ? 'Completed' : 'Pending',
    icon: BookOpen
  }))
].slice(0, 4);

      setRecentActivities(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-2">Here's your overview for today</p>
      </div>
 <FloatingStudentChat /> {/* Chat button appears floating */}
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Calendar} iconBg="bg-blue-100" iconColor="text-blue-600" title="Upcoming Appointments" value={stats.upcomingAppointments} />
        <StatCard icon={BookOpen} iconBg="bg-green-100" iconColor="text-green-600" title="Completed Tasks" value={stats.completedTasks} />
        <StatCard icon={Clock} iconBg="bg-purple-100" iconColor="text-purple-600" title="Study Hours" value={`${stats.studyHours}h`} />
        <StatCard icon={Heart} iconBg="bg-yellow-100" iconColor="text-yellow-600" title="Mood Average" value={`${stats.moodAverage}/5`} />
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent and Upcoming Activities</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? recentActivities.map((activity, i) => (
              <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${activity.type === 'appointment' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  <activity.icon className={`h-4 w-4 ${activity.type === 'appointment' ? 'text-blue-600' : 'text-green-600'}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions navigate={navigate} />
      </div>
    </div>
  );
}

// StatCard component
const StatCard = ({ icon: Icon, iconBg, iconColor, title, value }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// QuickActions component
const QuickActions = ({ navigate }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
    <div className="grid grid-cols-2 gap-4">
      <ActionButton icon={Calendar} label="Book Appointment" color="blue" onClick={() => navigate('/appointments')} />
      <ActionButton icon={BookOpen} label="Add Task" color="green" onClick={() => navigate('/tasks')} />
      <ActionButton icon={TrendingUp} label="Study Session" color="purple" onClick={() => navigate('/study')} />
      <ActionButton icon={Heart} label="Log Mood" color="yellow" onClick={() => navigate('/wellbeing')} />
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`p-4 bg-${color}-50 rounded-lg hover:bg-${color}-100 transition-colors`}
  >
    <Icon className={`h-6 w-6 text-${color}-600 mx-auto mb-2`} />
    <p className={`text-sm font-medium text-${color}-900`}>{label}</p>
  </button>
);
