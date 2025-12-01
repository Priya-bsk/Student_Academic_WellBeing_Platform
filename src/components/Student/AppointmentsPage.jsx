import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { Calendar, Clock, User, Plus, X } from 'lucide-react';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { makeRequest } = useApi();

  const [appointments, setAppointments] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    counselorId: '',
    date: '',
    time: '',
    reason: '',
    type: 'academic'
  });

  useEffect(() => {
    fetchAppointments();
    fetchCounselors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await makeRequest('/appointments', { method: 'GET' });
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const data = await makeRequest('/appointments/counselors', { method: 'GET' });
      setCounselors(data.counselors || []);
    } catch (error) {
      console.error('Error fetching counselors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.counselorId || !formData.date || !formData.time) {
        alert('Please fill all required fields.');
        return;
      }

      const appointmentData = {
        counselorId: formData.counselorId,
        type: formData.type,
        preferredDate: new Date(`${formData.date}T${formData.time}`),
        description: formData.reason,
        duration: 60,
        location: 'in-person',
        isUrgent: false,
        status: 'pending'
      };

      if (selectedAppointment) {
        await makeRequest(`/appointments/${selectedAppointment._id}/status`, {
          method: 'PUT',
          body: appointmentData
        });
      } else {
        await makeRequest('/appointments', {
          method: 'POST',
          body: appointmentData
        });
      }

      await fetchAppointments();
      setShowBookingForm(false);
      setSelectedAppointment(null);
      setFormData({
        counselorId: '',
        date: '',
        time: '',
        reason: '',
        type: 'academic'
      });
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await makeRequest(`/appointments/${appointmentId}/cancel`, { method: 'PUT' });
      await fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      counselorId: appointment.counselorId?._id || appointment.counselorId || '',
      date: appointment.preferredDate ? appointment.preferredDate.split('T')[0] : '',
      time: appointment.preferredDate
        ? new Date(appointment.preferredDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : '',
      reason: appointment.description || '',
      type: appointment.type || 'academic'
    });
    setShowBookingForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-teal-100 text-teal-800';
      case 'rejected':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.preferredDate) > new Date() && ['pending', 'approved'].includes(apt.status)
  );

  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.preferredDate) <= new Date() || ['completed', 'cancelled', 'rejected'].includes(apt.status)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Manage your counseling appointments</p>
        </div>
        <button
          onClick={() => setShowBookingForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Book Appointment
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length > 0 ? (
          <div className="grid gap-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {appointment.counselorId
                          ? `${appointment.counselorId.firstName} ${appointment.counselorId.lastName}`
                          : 'Unknown Counselor'}
                      </span>
                      <span
                        className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(appointment.preferredDate).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 ml-4 mr-2" />
                      <span>
                        {appointment.preferredDate
                          ? new Date(appointment.preferredDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '--:--'}
                      </span>
                    </div>
                    <p className="text-gray-700">{appointment.description || ''}</p>
                    <p className="text-sm text-gray-500 mt-1">Type: {appointment.type || ''}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No upcoming appointments</p>
            <button
              onClick={() => setShowBookingForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Book your first appointment
            </button>
          </div>
        )}
      </div>

      {/* Past Appointments */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Appointments</h2>
        {pastAppointments.length > 0 ? (
          <div className="grid gap-4">
            {pastAppointments.map((appointment) => (
              <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6 opacity-75">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {appointment.counselorId
                          ? `${appointment.counselorId.firstName} ${appointment.counselorId.lastName}`
                          : 'Unknown Counselor'}
                      </span>
                      <span
                        className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{appointment.preferredDate ? new Date(appointment.preferredDate).toLocaleDateString() : '--'}</span>
                      <Clock className="h-4 w-4 ml-4 mr-2" />
                      <span>
                        {appointment.preferredDate
                          ? new Date(appointment.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </span>
                    </div>
                    <p className="text-gray-700">{appointment.description || ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No past appointments</p>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedAppointment ? 'Edit Appointment' : 'Book New Appointment'}
              </h3>
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setSelectedAppointment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Counselor</label>
                <select
                  value={formData.counselorId}
                  onChange={(e) => setFormData({ ...formData, counselorId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a counselor</option>
                  {counselors.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.firstName} {c.lastName} - {c.specializations?.join(', ') || 'No specialization'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="academic">Academic</option>
                  <option value="personal">Personal</option>
                  <option value="career">Career</option>
                  <option value="crisis">Crisis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Brief description of what you'd like to discuss..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedAppointment ? 'Update' : 'Book'} Appointment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedAppointment(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
