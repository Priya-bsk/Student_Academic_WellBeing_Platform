import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useEffect } from 'react';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, state } = useAuth();
  const navigate = useNavigate();


    //This useEffect is not actually redirecting to counsellor. For now the temp fix has been done in dashboard page of student
 useEffect(() => {
  if (!state.isLoading && state.user && state.user.role) {
    console.log('User role from context:', state.user.role);
    
    if (state.user.role === 'counselor') {
      navigate('/counselor/dashboard');
    } else {
      navigate('/dashboard');
      console.log(state.user.log);
    }
  }
}, [state.user, state.isLoading, navigate]);

 
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    await login(email, password); // assume login returns user info
    
    
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Login failed');
  }
};


  const handleDemoLogin = async (role) => {
  setError('');
  const demoCredentials = {
    student: { email: 'samplestudent@example.com', password: '123123' },
    counselor: { email: 'samplecounsellor@example.com', password: '123123' }
  };

  try {
    const { email, password } = demoCredentials[role];
    await login(email, password);
    // Let useEffect handle redirection
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Demo login failed');
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a5b4fc]/20 via-white to-[#e9d5ff]/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#a5b4fc] to-[#e9d5ff] rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to ThriveEd</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your academic success and well-being platform
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={state.isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#a5b4fc] hover:bg-[#a5b4fc]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a5b4fc] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {state.isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              {/* <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Try Demo Accounts</span>
              </div> */}
            </div>

            {/* <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDemoLogin('student')}
                disabled={state.isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-[#a7f3d0] rounded-lg shadow-sm text-sm font-medium text-[#065f46] bg-[#a7f3d0]/20 hover:bg-[#a7f3d0]/30 transition-colors disabled:opacity-50"
              >
                Demo Student
              </button>
              <button
                onClick={() => handleDemoLogin('counselor')}
                disabled={state.isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-[#e9d5ff] rounded-lg shadow-sm text-sm font-medium text-[#7c3aed] bg-[#e9d5ff]/20 hover:bg-[#e9d5ff]/30 transition-colors disabled:opacity-50"
              >
                Demo Counselor
              </button>
            </div> */}
          </div>

          <div className="mt-6 text-center">
            <br></br>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-medium text-[#a5b4fc] hover:text-[#a5b4fc]/80 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;