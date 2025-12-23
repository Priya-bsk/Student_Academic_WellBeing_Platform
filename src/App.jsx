import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './components/Auth/LoginPage';
import HomePage from './components/Auth/HomePage'; // Your new homepage component
import RegisterPage from './components/Auth/RegisterPage';
import Dashboard from './components/Student/Dashboard';
import TasksPage from './components/Student/TasksPage';
import WellbeingPage from './components/Student/WellbeingPage';
import JournalPage from './components/Student/JournalPage';
import StudyPage from './components/Student/StudyPage';
import AppointmentsPage from './components/Student/AppointmentsPage';
import ResourcesPage from './components/Student/ResourcesPage';
import Assignments from './components/Student/Assignments';
import ProfilePage from './components/Student/ProfilePage';
import CounselorDashboard from './components/Counselor/CounselorDashboard';
import CounselorAppointments from './components/Counselor/CounselorAppointments';
import StudentsOverview from './components/Counselor/StudentsOverview';
import CounselorResources from './components/Counselor/CounselorResources';
import CrisisSupport from './components/Help/CrisisSupport';

const ProtectedRoute = ({ children, roles }) => {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(state.user?.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }) => {
  const { state } = useAuth();

  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            
            {/* UPDATED: Show homepage instead of redirecting to login */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <HomePage />
                </PublicRoute>
              } 
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Crisis support - accessible to all authenticated users */}
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <CrisisSupport />
                </ProtectedRoute>
              }
            />

            {/* Protected routes with layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Student routes */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="wellbeing" element={<WellbeingPage />} />
              <Route path="journal" element={<JournalPage />} />
              <Route path="study" element={<StudyPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="profile" element={<ProfilePage />} />
              
              {/* Counselor routes */}
              <Route 
                path="counselor/dashboard" 
                element={
                  <ProtectedRoute roles={['counselor']}>
                    <CounselorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="counselor/appointments" 
                element={
                  <ProtectedRoute roles={['counselor']}>
                    <CounselorAppointments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="counselor/students" 
                element={
                  <ProtectedRoute roles={['counselor']}>
                    <StudentsOverview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="counselor/resources" 
                element={
                  <ProtectedRoute roles={['counselor']}>
                    <CounselorResources />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;