import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  User,
  Phone,
  Video,
  MapPin
} from 'lucide-react';

const CounselorDashboard = () => {
  const { state } = useAuth();
  const { makeRequest, loading } = useApi();
  
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await makeRequest('/appointments');
      setAppointments(response.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await makeRequest('/appointments/stats');
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAppointmentAction = async (appointmentId, status, scheduledDate) => {
    try {
      await makeRequest(`/appointments/${appointmentId}/status`, {
        method: 'PUT',
        body: { 
          status, 
          scheduledDate,
          counselorNotes: status === 'approved' ? 'Appointment confirmed' : 'Unable to accommodate at this time'
        }
      });
      fetchAppointments();
      fetchStats();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const getLocationIcon = (location) => {
    switch (location) {
      case 'virtual':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-green-600" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    const aptDate = new Date(apt.scheduledDate || apt.preferredDate).toDateString();
    return aptDate === today && apt.status === 'approved';
  });

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'approved' && 
    new Date(apt.scheduledDate || apt.preferredDate) > new Date()
  ).slice(0, 5);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#e9d5ff] to-[#a5b4fc] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {state.user?.firstName}! 👋
        </h1>
        <p className="text-white/90">{currentDate}</p>
        <p className="text-white/80 mt-1">
          You have {pendingAppointments.length} pending requests and {todayAppointments.length} appointments today
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-[#e9d5ff]/10 rounded-lg">
                <Calendar className="h-6 w-6 text-[#7c3aed]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 text-[#7c3aed] mr-2" />
              Today's Appointments
            </h2>
          </div>
          <div className="p-6">
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#e9d5ff] rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-[#7c3aed]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.studentId.firstName} {appointment.studentId.lastName}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="capitalize">{appointment.type}</span>
                          <span>•</span>
                          <span>{appointment.duration} min</span>
                          <span>•</span>
                          {getLocationIcon(appointment.location)}
                          <span className="capitalize">{appointment.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(appointment.scheduledDate || appointment.preferredDate).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                      {appointment.isUrgent && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              Pending Requests
            </h2>
          </div>
          <div className="p-6">
            {pendingAppointments.length > 0 ? (
              <div className="space-y-4">
                {pendingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.studentId.firstName} {appointment.studentId.lastName}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <span className="capitalize">{appointment.type} counseling</span>
                          {appointment.isUrgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Requested: {formatDate(appointment.preferredDate)}
                        </p>
                        {appointment.description && (
                          <p className="text-sm text-gray-600 mt-2">"{appointment.description}"</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAppointmentAction(appointment._id, 'approved', appointment.preferredDate)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAppointmentAction(appointment._id, 'rejected')}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
                
                {pendingAppointments.length > 3 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-500">
                      +{pendingAppointments.length - 3} more pending requests
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending requests</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 text-[#a5b4fc] mr-2" />
            Upcoming Appointments
          </h2>
        </div>
        <div className="p-6">
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#a5b4fc] rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.studentId.firstName} {appointment.studentId.lastName}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="capitalize">{appointment.type}</span>
                        <span>•</span>
                        <span>{appointment.duration} min</span>
                        <span>•</span>
                        {getLocationIcon(appointment.location)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(appointment.scheduledDate || appointment.preferredDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounselorDashboard;