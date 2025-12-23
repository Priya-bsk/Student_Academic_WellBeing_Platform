import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Calendar, 
  Heart, 
  LayoutDashboard, 
  CheckSquare, 
  FolderOpen, 
  User, 
  LogOut, 
  Menu, 
  X,
  Users,
  AlertCircle,
  FileText,
  ClipboardList,
  NotebookText
} from 'lucide-react';

const Navbar = () => {
  const { state, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  const studentNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Well Being', href: '/wellbeing', icon: Heart },
    { name: 'Journal', href: '/journal', icon: FileText },
    { name: 'Study', href: '/study', icon: BookOpen },
    { name: 'Assignments', href: '/assignments', icon: NotebookText },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Resources', href: '/resources', icon: FolderOpen },
    
    
  ];

  const counselorNavItems = [
    { name: 'Dashboard', href: '/counselor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/counselor/appointments', icon: Calendar },
    { name: 'Students', href: '/counselor/students', icon: Users },
    { name: 'Resources', href: '/counselor/resources', icon: FolderOpen },
  ];

  const navItems = state.user.role === 'student' ? studentNavItems : counselorNavItems;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#a5b4fc] to-[#e9d5ff] rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">ThriveEd</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-grow justify-center">

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#a5b4fc] bg-[#a5b4fc]/10'
                      : 'text-gray-600 hover:text-[#a5b4fc] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Crisis help button and user menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate('/help')}
              className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Need Help?</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {state.user.firstName} {state.user.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{state.user.role}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="p-2 text-gray-600 hover:text-[#a5b4fc] transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => navigate('/help')}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <AlertCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'text-[#a5b4fc] bg-[#a5b4fc]/10'
                      : 'text-gray-600 hover:text-[#a5b4fc] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="px-3 mb-3">
                <p className="text-base font-medium text-gray-900">
                  {state.user.firstName} {state.user.lastName}
                </p>
                <p className="text-sm text-gray-500 capitalize">{state.user.role}</p>
              </div>
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-[#a5b4fc] hover:bg-gray-50 rounded-md"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-md w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;