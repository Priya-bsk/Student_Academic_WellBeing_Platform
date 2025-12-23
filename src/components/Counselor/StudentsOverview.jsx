import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  Users, Search, Calendar, BookOpen, Heart, TrendingUp,
  User, GraduationCap, Mail
} from 'lucide-react';

const StudentsOverview = () => {
  const { makeRequest, loading } = useApi();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    fetchStudentsData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, filterYear]);

  // Fetch appointments for this counselor
  const fetchStudentsData = async () => {
    try {
      const response = await makeRequest('/appointments');
      const { appointments } = response;

      // Group by student
      const studentMap = {};

      appointments.forEach((appt) => {
        const s = appt.studentId;
        if (!s) return; // Skip if student not populated

        if (!studentMap[s._id]) {
          studentMap[s._id] = {
            _id: s._id,
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
            year: s.year,
            major: s.major,
            lastLogin: s.lastLogin,
            appointmentCount: 0,
            lastAppointment: null,
          };
        }

        // Increment and track latest appointment
        studentMap[s._id].appointmentCount += 1;
        const apptDate = appt.scheduledDate || appt.preferredDate;
        if (!studentMap[s._id].lastAppointment || new Date(apptDate) > new Date(studentMap[s._id].lastAppointment)) {
          studentMap[s._id].lastAppointment = apptDate;
        }
      });

      setStudents(Object.values(studentMap));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.major?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterYear !== 'all') {
      filtered = filtered.filter(s => s.year === filterYear);
    }

    setFilteredStudents(filtered);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  const formatDateTime = (date) => date ? new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-';

  const getEngagementLevel = (count, lastLogin) => {
    const daysSinceLogin = lastLogin ? Math.floor((Date.now() - new Date(lastLogin)) / (1000 * 60 * 60 * 24)) : 999;
    if (count >= 5 && daysSinceLogin <= 7) return { level: 'High', color: 'text-green-600 bg-green-50 border-green-200' };
    if (count >= 3 && daysSinceLogin <= 14) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { level: 'Low', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students Overview</h1>
        <p className="text-gray-600">Monitor student engagement and appointment history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-8 w-8 text-[#a5b4fc]" />} title="Total Students" value={students.length} />
        <StatCard 
          icon={<Calendar className="h-8 w-8 text-green-500" />} 
          title="Active This Week" 
          value={students.filter(s => s.lastLogin && (Date.now() - new Date(s.lastLogin)) / (1000*60*60*24) <= 7).length} 
        />
        <StatCard 
          icon={<TrendingUp className="h-8 w-8 text-[#e9d5ff]" />} 
          title="High Engagement" 
          value={students.filter(s => getEngagementLevel(s.appointmentCount, s.lastLogin).level === 'High').length} 
        />
        <StatCard 
          icon={<Heart className="h-8 w-8 text-pink-500" />} 
          title="Need Attention" 
          value={students.filter(s => getEngagementLevel(s.appointmentCount, s.lastLogin).level === 'Low').length} 
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a5b4fc]"
            />
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a5b4fc]"
          >
            <option value="all">All Years</option>
            <option value="freshman">Freshman</option>
            <option value="sophomore">Sophomore</option>
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
            <option value="graduate">Graduate</option>
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((s) => {
            const engagement = getEngagementLevel(s.appointmentCount, s.lastLogin);
            return (
              <div key={s._id} className="p-6 flex justify-between items-center border-b hover:bg-gray-50 transition">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#a5b4fc] rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{s.firstName} {s.lastName}</h3>
                    <p className="text-sm text-gray-600">{s.email}</p>
                    <p className="text-sm text-gray-500">{s.year} • {s.major}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${engagement.color}`}>
                    {engagement.level} Engagement
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{s.appointmentCount} appointments</p>
                   <p className="text-sm text-gray-600">Last login: {formatDate(s.lastLogin)}</p> 
                </div>
                <button
                  onClick={() => handleViewStudent(s)}
                  className="ml-4 px-3 py-1 text-sm text-[#a5b4fc] border border-[#a5b4fc] rounded-lg hover:bg-[#a5b4fc] hover:text-white transition"
                >
                  View Details
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">No students found</div>
        )}
      </div>

      {/* Student Modal */}
      {showStudentModal && selectedStudent && (
        <StudentModal student={selectedStudent} onClose={() => setShowStudentModal(false)} />
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
    {icon}
    <div className="ml-3">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const StudentModal = ({ student, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Student Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>
      <p className="text-gray-800 font-medium">{student.firstName} {student.lastName}</p>
      <p className="text-gray-600">{student.email}</p>
      <p className="text-gray-600 capitalize">{student.year} • {student.major}</p>
      <p className="mt-3 text-sm text-gray-500">Appointments: {student.appointmentCount}</p>
      <p className="text-sm text-gray-500">Last Appointment: {student.lastAppointment ? new Date(student.lastAppointment).toLocaleDateString() : 'N/A'}</p>
    </div>
  </div>
);

export default StudentsOverview;
