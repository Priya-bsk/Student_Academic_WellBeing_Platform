import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Video,
  MapPin,
  Filter,
  Search
} from 'lucide-react';

const CounselorAppointments = () => {
  const { makeRequest, loading } = useApi();
  
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: '',
    counselorNotes: '',
    meetingLink: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, filterStatus, filterType]);

  const fetchAppointments = async () => {
    try {
      const response = await makeRequest('/appointments');
      setAppointments(response.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        `${apt.studentId.firstName} ${apt.studentId.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(apt => apt.type === filterType);
    }

    setFilteredAppointments(filtered);
  };

  const handleAppointmentAction = async (appointmentId, status, scheduledDate, notes, meetingLink) => {
    try {
      await makeRequest(`/appointments/${appointmentId}/status`, {
        method: 'PUT',
        body: { 
          status, 
          scheduledDate,
          counselorNotes: notes || (status === 'approved' ? 'Appointment confirmed' : 'Unable to accommodate at this time'),
          meetingLink
        }
      });
      fetchAppointments();
      setShowScheduleModal(false);
      setSelectedAppointment(null);
      setScheduleForm({ scheduledDate: '', counselorNotes: '', meetingLink: '' });
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleScheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setScheduleForm({
      scheduledDate: appointment.preferredDate,
      counselorNotes: '',
      meetingLink: appointment.location === 'virtual' ? '' : ''
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (selectedAppointment) {
      handleAppointmentAction(
        selectedAppointment._id,
        'approved',
        scheduleForm.scheduledDate,
        scheduleForm.counselorNotes,
        scheduleForm.meetingLink
      );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getLocationIcon = (location) => {
    switch (location) {
      case 'virtual':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
        <p className="text-gray-600">Manage student appointment requests and schedule meetings</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="academic">Academic</option>
              <option value="personal">Personal</option>
              <option value="career">Career</option>
              <option value="crisis">Crisis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-[#e9d5ff] rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-[#7c3aed]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {appointment.studentId.firstName} {appointment.studentId.lastName}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="capitalize">{appointment.type} counseling</span>
                          <span>•</span>
                          <span>{appointment.duration} minutes</span>
                          <span>•</span>
                          {getLocationIcon(appointment.location)}
                          <span className="capitalize">{appointment.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-13 space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appointment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        {appointment.isUrgent && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            Urgent
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Requested:</strong> {formatDate(appointment.preferredDate)}
                        </p>
                        {appointment.scheduledDate && (
                          <p>
                            <strong>Scheduled:</strong> {formatDate(appointment.scheduledDate)}
                          </p>
                        )}
                        {appointment.studentId.year && appointment.studentId.major && (
                          <p>
                            <strong>Student:</strong> {appointment.studentId.year} • {appointment.studentId.major}
                          </p>
                        )}
                      </div>
                      
                      {appointment.description && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Description:</strong> {appointment.description}
                          </p>
                        </div>
                      )}
                      
                      {appointment.counselorNotes && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Your Notes:</strong> {appointment.counselorNotes}
                          </p>
                        </div>
                      )}
                      
                      {appointment.meetingLink && (
                        <div className="mt-2">
                          <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleScheduleAppointment(appointment)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(appointment._id, 'rejected')}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    
                    {appointment.status === 'approved' && new Date(appointment.scheduledDate || appointment.preferredDate) < new Date() && (
                      <button
                        onClick={() => handleAppointmentAction(appointment._id, 'completed')}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Schedule Appointment</h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">
                  {selectedAppointment.studentId.firstName} {selectedAppointment.studentId.lastName}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {selectedAppointment.type} counseling • {selectedAppointment.duration} minutes
                </p>
                <p className="text-sm text-gray-600">
                  Requested: {formatDate(selectedAppointment.preferredDate)}
                </p>
              </div>
              
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                  />
                </div>
                
                {selectedAppointment.location === 'virtual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={scheduleForm.meetingLink}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes for Student
                  </label>
                  <textarea
                    value={scheduleForm.counselorNotes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, counselorNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                    rows={3}
                    placeholder="Any additional information or preparation instructions..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Schedule Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselorAppointments;