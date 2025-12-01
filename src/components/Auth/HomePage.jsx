import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Heart, Calendar, MessageCircle, TrendingUp, Users } from 'lucide-react';

export default function Homepage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold text-gray-800">ThriveEd</span>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleLogin}
                className="px-4 py-2 text-gray-700 hover:text-purple-400 font-medium transition"
              >
                Login
              </button>
              <button 
                onClick={handleGetStarted}
                className="px-4 py-2 bg-purple-300 text-white rounded-lg hover:bg-purple-400 font-medium transition"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
            Your Complete Student Success Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empowering students to excel academically while supporting their mental health and wellbeing. 
            Connect with counselors, track assignments, and thrive in your educational journey.
          </p>
          <button 
            onClick={handleGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-purple-300 to-pink-300 text-white text-lg rounded-lg hover:from-purple-400 hover:to-pink-400 font-semibold shadow-lg transform hover:scale-105 transition"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Everything You Need to Succeed
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Assignment Tracking
            </h3>
            <p className="text-gray-600">
              Stay organized with our comprehensive assignment and deadline management system. Never miss a due date again.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Counselor Support
            </h3>
            <p className="text-gray-600">
              Book appointments with professional counselors who care about your mental health and academic success.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Progress Analytics
            </h3>
            <p className="text-gray-600">
              Track your academic performance and wellbeing metrics with insightful dashboards and sentiment analysis.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Real-Time Chat
            </h3>
            <p className="text-gray-600">
              Connect instantly with counselors through our floating chat feature. Get support when you need it most.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Resource Library
            </h3>
            <p className="text-gray-600">
              Access curated academic resources and wellbeing materials designed to support your growth.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Student Community
            </h3>
            <p className="text-gray-600">
              Join a supportive community of students and counselors dedicated to academic excellence and wellbeing.
            </p>
          </div>
        </div>
      </section>

      {/* What We Stand For Section */}
<section className="bg-gradient-to-r from-purple-200 to-pink-200 py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-3 gap-8 text-center text-gray-800">

      <div>
        <div className="text-2xl font-bold mb-2">Learn Better</div>
        <div className="text-gray-700">Streamlined academics for a smoother journey.</div>
      </div>

      <div>
        <div className="text-2xl font-bold mb-2">Feel Better</div>
        <div className="text-gray-700">A safe space built for emotional well-being.</div>
      </div>

      <div>
        <div className="text-2xl font-bold mb-2">Grow Better</div>
        <div className="text-gray-700">Tools that help you evolve academically and personally.</div>
      </div>

    </div>
  </div>
</section>


      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Ready to Transform Your Student Experience?
          </h2>
          <p className="text-xl mb-8 text-gray-700">
            Join thousands of students who are achieving their goals with ThriveEd.
          </p>
          <button 
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-purple-500 text-lg rounded-lg hover:bg-gray-50 font-semibold shadow-lg transform hover:scale-105 transition"
          >
            Create Your Account
          </button>
        </div>
      </section>

     {/* Footer */}
<footer className="bg-purple-100 text-gray-700 py-6">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div className="grid md:grid-cols-3 gap-6 items-start">

      {/* Brand */}
      <div>
        <div className="flex items-center mb-2">
          <BookOpen className="h-5 w-5 text-purple-400" />
          <span className="ml-2 text-sm font-bold text-gray-800">ThriveEd</span>
        </div>
        <p className="text-xs text-gray-600">
          Academic and wellbeing support for every student.
        </p>
      </div>

      {/* Support */}
      <div className="md:text-center">
        <h4 className="font-semibold text-gray-800 text-sm mb-2">Support</h4>
        <ul className="space-y-1 text-xs">
          <li><a className="hover:text-purple-500 transition" href="#">Help Center</a></li>
          <li><a className="hover:text-purple-500 transition" href="#">Contact</a></li>
          <li><a className="hover:text-purple-500 transition" href="#">Policies</a></li>
        </ul>
      </div>

      {/* Connect */}
      <div className="md:text-right">
        <h4 className="font-semibold text-gray-800 text-sm mb-2">Connect</h4>
        <ul className="space-y-1 text-xs">
          <li><a className="hover:text-purple-500 transition" href="#">Twitter</a></li>
          <li><a className="hover:text-purple-500 transition" href="#">LinkedIn</a></li>
          <li><a className="hover:text-purple-500 transition" href="#">Instagram</a></li>
        </ul>
      </div>

    </div>

    <div className="border-t border-purple-200 mt-4 pt-3 text-center text-xs">
      <p className="text-gray-600">&copy; 2025 ThriveEd. All rights reserved.</p>
    </div>

  </div>
</footer>




    </div>
  );
}