import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { 
  Heart, 
  TrendingUp, 
  Calendar,
  Moon,
  Activity,
  Smile,
  BarChart3,
  Plus
} from 'lucide-react';

const WellbeingPage = () => {
  const { makeRequest, loading } = useApi();
  const location = useLocation();
  
  const [moods, setMoods] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [stats, setStats] = useState(null);
  const [showMoodForm, setShowMoodForm] = useState(false);
  
  const [moodForm, setMoodForm] = useState({
    mood: '',
    note: '',
    stressLevel: 5,
    sleepHours: 8,
    activities: []
  });

  const moodEmojis = {
    'very-sad': { emoji: '😞', label: 'Very Sad', color: 'text-red-600' },
    'sad': { emoji: '😕', label: 'Sad', color: 'text-orange-600' },
    'neutral': { emoji: '😐', label: 'Neutral', color: 'text-yellow-600' },
    'happy': { emoji: '😊', label: 'Happy', color: 'text-green-600' },
    'very-happy': { emoji: '😄', label: 'Very Happy', color: 'text-blue-600' }
  };

  const activityOptions = [
    'exercise', 'socializing', 'studying', 'work', 'relaxation', 'hobbies'
  ];

  useEffect(() => {
    fetchMoodData();
    fetchTodayMood();
    fetchMoodStats();
    
    // Check if redirected from dashboard with quick mood
    const quickMood = location.state?.quickMood;
    if (quickMood) {
      setMoodForm({ ...moodForm, mood: quickMood });
      setShowMoodForm(true);
    }
  }, []);

  const fetchMoodData = async () => {
    try {
      const response = await makeRequest('/moods?days=30');
      setMoods(response.moods);
    } catch (error) {
      console.error('Error fetching mood data:', error);
    }
  };

  const fetchTodayMood = async () => {
    try {
      const response = await makeRequest('/moods/today');
      setTodayMood(response.mood);
    } catch (error) {
      console.error('Error fetching today mood:', error);
    }
  };

  const fetchMoodStats = async () => {
    try {
      const response = await makeRequest('/moods/stats');
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching mood stats:', error);
    }
  };

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await makeRequest('/moods', {
        method: 'POST',
        body: moodForm
      });
      
      setShowMoodForm(false);
      setMoodForm({
        mood: '',
        note: '',
        stressLevel: 5,
        sleepHours: 8,
        activities: []
      });
      
      fetchMoodData();
      fetchTodayMood();
      fetchMoodStats();
      
      // Show motivational message
      if (response.motivationalMessage) {
        alert(response.motivationalMessage);
      }
    } catch (error) {
      console.error('Error logging mood:', error);
    }
  };

  const handleActivityToggle = (activity) => {
    const updatedActivities = moodForm.activities.includes(activity)
      ? moodForm.activities.filter(a => a !== activity)
      : [...moodForm.activities, activity];
    
    setMoodForm({ ...moodForm, activities: updatedActivities });
  };

  const getMoodColor = (moodValue) => {
    if (moodValue <= 2) return 'bg-red-100 text-red-800';
    if (moodValue === 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Well-being Tracker</h1>
          <p className="text-gray-600">Monitor your mental health and daily wellness</p>
        </div>
        <button
          onClick={() => setShowMoodForm(true)}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-[#e9d5ff] text-[#7c3aed] rounded-lg hover:bg-[#e9d5ff]/80 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Log Mood
        </button>
      </div>

      {/* Today's Mood */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Heart className="h-5 w-5 text-[#e9d5ff] mr-2" />
          Today's Check-in
        </h2>
        
        {todayMood ? (
          <div className="flex items-center space-x-4">
            <div className="text-4xl">
              {moodEmojis[todayMood.mood]?.emoji}
            </div>
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-900 capitalize">
                {moodEmojis[todayMood.mood]?.label}
              </p>
              {todayMood.note && (
                <p className="text-gray-600 mt-1">"{todayMood.note}"</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {todayMood.stressLevel && (
                  <span>Stress: {todayMood.stressLevel}/10</span>
                )}
                {todayMood.sleepHours && (
                  <span>Sleep: {todayMood.sleepHours}h</span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setMoodForm({
                  mood: todayMood.mood,
                  note: todayMood.note || '',
                  stressLevel: todayMood.stressLevel || 5,
                  sleepHours: todayMood.sleepHours || 8,
                  activities: todayMood.activities || []
                });
                setShowMoodForm(true);
              }}
              className="px-3 py-1 text-sm text-[#a5b4fc] border border-[#a5b4fc] rounded-lg hover:bg-[#a5b4fc] hover:text-white transition-colors"
            >
              Update
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🤔</div>
            <p className="text-gray-600 mb-4">How are you feeling today?</p>
            <div className="flex justify-center space-x-2 mb-4">
              {Object.entries(moodEmojis).map(([mood, data]) => (
                <button
                  key={mood}
                  onClick={() => {
                    setMoodForm({ ...moodForm, mood });
                    setShowMoodForm(true);
                  }}
                  className="text-3xl p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title={data.label}
                >
                  {data.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Smile className="h-8 w-8 text-[#a5b4fc]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Mood</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageMood.toFixed(0)}/5
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Stress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageStress.toFixed(1)}/10
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Moon className="h-8 w-8 text-indigo-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Sleep</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageSleep.toFixed(1)}h
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-[#a5b4fc] mr-2" />
              Recent Mood History
            </h2>
          </div>
          <div className="p-6">
            {moods.length > 0 ? (
              <div className="space-y-3">
                {moods.slice(0, 10).map((mood) => (
                  <div key={mood._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {moodEmojis[mood.mood]?.emoji}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {moodEmojis[mood.mood]?.label}
                        </p>
                        {mood.note && (
                          <p className="text-sm text-gray-600">"{mood.note}"</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(mood.date)}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {mood.stressLevel && <span>Stress: {mood.stressLevel}</span>}
                        {mood.sleepHours && <span>Sleep: {mood.sleepHours}h</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No mood entries yet</p>
                <button
                  onClick={() => setShowMoodForm(true)}
                  className="mt-2 text-[#a5b4fc] hover:text-[#a5b4fc]/80 font-medium"
                >
                  Log your first mood
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 text-[#a5b4fc] mr-2" />
              Mood Distribution
            </h2>
          </div>
          <div className="p-6">
            {stats && Object.keys(stats.moodDistribution).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.moodDistribution).map(([mood, count]) => {
                  const percentage = (count / stats.totalEntries) * 100;
                  const moodData = moodEmojis[mood];
                  
                  return (
                    <div key={mood} className="flex items-center space-x-3">
                      <span className="text-xl">{moodData?.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {moodData?.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#a5b4fc] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Not enough data for distribution</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mood Form Modal */}
      {showMoodForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Log Your Mood</h2>
                <button
                  onClick={() => setShowMoodForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleMoodSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How are you feeling? *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(moodEmojis).map(([mood, data]) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setMoodForm({ ...moodForm, mood })}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          moodForm.mood === mood
                            ? 'border-[#a5b4fc] bg-[#a5b4fc]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl">{data.emoji}</div>
                        <div className="text-xs mt-1">{data.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (optional)
                  </label>
                  <textarea
                    value={moodForm.note}
                    onChange={(e) => setMoodForm({ ...moodForm, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                    rows={3}
                    maxLength={200}
                    placeholder="What's on your mind?"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stress Level (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={moodForm.stressLevel}
                      onChange={(e) => setMoodForm({ ...moodForm, stressLevel: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600 mt-1">
                      {moodForm.stressLevel}/10
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sleep Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={moodForm.sleepHours}
                      onChange={(e) => setMoodForm({ ...moodForm, sleepHours: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activities Today
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {activityOptions.map((activity) => (
                      <label key={activity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={moodForm.activities.includes(activity)}
                          onChange={() => handleActivityToggle(activity)}
                          className="h-4 w-4 text-[#a5b4fc] focus:ring-[#a5b4fc] border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {activity}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMoodForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!moodForm.mood}
                    className="px-4 py-2 bg-[#e9d5ff] text-[#7c3aed] rounded-lg hover:bg-[#e9d5ff]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Log Mood
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

export default WellbeingPage;