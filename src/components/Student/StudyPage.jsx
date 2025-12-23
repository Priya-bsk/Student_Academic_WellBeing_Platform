import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  BookOpen, 
  Play, 
  Pause, 
  Square, 
  Clock,
  Calendar,
  BarChart3,
  Plus,
  Timer,
  Coffee,
  Target
} from 'lucide-react';

const MusicPlayer = React.memo(() => {
  console.log('MusicPlayer rendered'); // for debugging

  return (
    <div className="music-player">
     <h2 style={{ marginBottom: '16px' }}> <b>Spotify Study Playlist</b> </h2>
<iframe
        style={{ borderRadius: '12px', marginBottom: '16px'  }}
        src="https://open.spotify.com/embed/playlist/0ofsIXBCxkqYtt30YoJm1c?utm_source=generator"
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Playlist 2"
      ></iframe>
     
      <iframe
        style={{ borderRadius: '12px', marginBottom: '16px'  }}
        src="https://open.spotify.com/embed/playlist/605WnshSvUcVRN3qt85z0b?utm_source=generator"
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Playlist 2"
      ></iframe>
      <iframe
        style={{ borderRadius: '12px', marginBottom: '16px'  }}
        src="https://open.spotify.com/embed/playlist/37i9dQZF1EIfMdgv54LYV9?utm_source=generator"
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Playlist 2"
      ></iframe>
      
    </div>
    
  );
});
const StudyPage = () => {
  const { makeRequest, loading } = useApi();
  
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSession, setNewSession] = useState({
    subject: '',
    plannedDuration: 25,
    type: 'pomodoro',
    notes: '',

  });

  const [showProductivityModal, setShowProductivityModal] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState(null); // Holds subject, duration, type, notes, etc.
  const [userProductivity, setUserProductivity] = useState(3); // default medium

const averageDuration = sessions.length
  ? (sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length).toFixed(1)
  : 0;

  const [timerInterval, setTimerInterval] = useState(null);
  
  // Ref to track if session has already been saved
  const sessionSaved = useRef(false);

  useEffect(() => {
    fetchSessions();
    fetchStats();
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await makeRequest('/study');
      setSessions(response.sessions);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await makeRequest('/study/stats?period=week');
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching study stats:', error);
    }
  };

  const startTimer = (subject, duration, type) => {
    sessionSaved.current = false; // Reset saved flag on new timer
    
    const timeInSeconds = duration * 60;
    setActiveTimer({
      isRunning: true,
      timeLeft: timeInSeconds,
      totalTime: timeInSeconds,
      type: 'work',
      subject,
      isBreak: false
    });

    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev || prev.timeLeft <= 1) {
          clearInterval(interval);
          
          if (prev && !prev.isBreak && type === 'pomodoro') {
            // Start break timer
            sessionSaved.current = false; // reset for break session
            const breakTime = 5 * 60; // 5 minutes
            return {
              isRunning: true,
              timeLeft: breakTime,
              totalTime: breakTime,
              type: 'break',
              subject: prev.subject,
              isBreak: true
            };
          }
          
          // Session completed
          if (prev && !sessionSaved.current) {
            sessionSaved.current = true;
            handleSessionComplete(prev.subject, duration, type);
          }
          return null;
        }
        
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1
        };
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setActiveTimer(prev => prev ? { ...prev, isRunning: false } : null);
  };

  const resumeTimer = () => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev || prev.timeLeft <= 1) {
          clearInterval(interval);
          if (prev && !sessionSaved.current) {
            sessionSaved.current = true;
            handleSessionComplete(prev.subject, prev.totalTime / 60, 'custom');
          }
          return null;
        }
        
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1
        };
      });
    }, 1000);

    setTimerInterval(interval);
    setActiveTimer(prev => prev ? { ...prev, isRunning: true } : null);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    if (activeTimer) {
      const actualDuration = (activeTimer.totalTime - activeTimer.timeLeft) / 60;
      if (actualDuration > 1 && !sessionSaved.current) { // Only save if studied >1min and not saved yet
        sessionSaved.current = true;
        handleSessionComplete(activeTimer.subject, actualDuration, 'custom', false);
      }
    }
    
    setActiveTimer(null);
  };

  // const handleSessionComplete = async (subject, duration, type, isCompleted = true) => {
  //   try {
  //     await makeRequest('/study', {
  //       method: 'POST',
  //       body: {
  //         subject,
  //         duration: Math.round(duration),
  //         plannedDuration: newSession.plannedDuration,
  //         type,
  //         startTime: new Date(Date.now() - duration * 60 * 1000).toISOString(),
  //         endTime: new Date().toISOString(),
  //         isCompleted,
  //           //plannedDuration: newSession.plannedDuration,
  //         notes: newSession.notes
  //       }
  //     });
       
  //     fetchSessions();
  //     fetchStats();
      
  //     if (isCompleted) {
  //       if ('Notification' in window && Notification.permission === 'granted') {
  //         new Notification('Study Session Complete!', {
  //           body: `Great job! You studied ${subject} for ${Math.round(duration)} minutes.`,
  //           icon: '/favicon.ico'
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error saving study session:', error);
  //   }
  // };
const handleSessionComplete = (subject, duration, type, isCompleted = true) => {
  // Store the session data temporarily to ask productivity later
  setPendingSessionData({
    subject,
    duration: Math.round(duration),
    type,
    isCompleted,
    plannedDuration: newSession.plannedDuration,
    notes: newSession.notes
  });
  setUserProductivity(3); // reset default productivity
  setShowProductivityModal(true);
};
const saveSessionWithProductivity = async () => {
  if (!pendingSessionData) return;
  try {
    await makeRequest('/study', {
      method: 'POST',
      body: {
        ...pendingSessionData,
        productivity: userProductivity,
        startTime: new Date(Date.now() - pendingSessionData.duration * 60 * 1000).toISOString(),
        endTime: new Date().toISOString()
      }
    });

    fetchSessions();
    fetchStats();
    
    if (pendingSessionData.isCompleted) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Study Session Complete!', {
          body: `Great job! You studied ${pendingSessionData.subject} for ${pendingSessionData.duration} minutes.`,
          icon: '/favicon.ico'
        });
      }
    }
  } catch (error) {
    console.error('Error saving study session:', error);
  } finally {
    setPendingSessionData(null);
    setShowProductivityModal(false);
  }
};

  const handleStartSession = (e) => {
    e.preventDefault();
    if (!newSession.subject) return;
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    startTimer(newSession.subject, newSession.plannedDuration, newSession.type);
    setShowNewSession(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
          <p className="text-gray-600">Track your study sessions and stay focused</p>
        </div>
        <button
          onClick={() => {
    setNewSession({
      subject: '',
      plannedDuration: 25,
      type: 'pomodoro',
      notes: '',
      productivity: 3,
    });
    setShowNewSession(true);
  }}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-[#a7f3d0] text-[#065f46] rounded-lg hover:bg-[#a7f3d0]/80 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Start Session
        </button>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <div className="bg-gradient-to-r from-[#a7f3d0] to-[#a5b4fc] rounded-lg p-6 text-white">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              {activeTimer.isBreak ? (
                <Coffee className="h-8 w-8 mr-2" />
              ) : (
                <BookOpen className="h-8 w-8 mr-2" />
              )}
              <h2 className="text-xl font-semibold">
                {activeTimer.isBreak ? 'Break Time' : `Studying ${activeTimer.subject}`}
              </h2>
            </div>
            
            <div className="text-6xl font-bold mb-4">
              {formatTime(activeTimer.timeLeft)}
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-2 mb-6">
              <div
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${((activeTimer.totalTime - activeTimer.timeLeft) / activeTimer.totalTime) * 100}%`
                }}
              ></div>
            </div>
            
            <div className="flex justify-center space-x-4">
              {activeTimer.isRunning ? (
                <button
                  onClick={pauseTimer}
                  className="flex items-center px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  className="flex items-center px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </button>
              )}
              <button
                onClick={stopTimer}
                className="flex items-center px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </button>
              
            </div>
            
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-[#a7f3d0]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalHours.toFixed(1)}h
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-[#a5b4fc]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Timer className="h-8 w-8 text-[#e9d5ff]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageDuration}m
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 text-[#a7f3d0] mr-2" />
              Recent Sessions
            </h2>
          </div>
          <div className="p-6">
            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.slice(0, 8).map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        session.isCompleted ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{session.subject}</p>
                        <p className="text-sm text-gray-600">
                          {Math.round(session.duration)} min • {session.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(session.date)}
                      </p>
                      {session.productivity && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span>Productivity: {session.productivity}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No study sessions yet</p>
                <button
                  onClick={() => setShowNewSession(true)}
                  className="mt-2 text-[#a5b4fc] hover:text-[#a5b4fc]/80 font-medium"
                >
                  Start your first session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 text-[#a5b4fc] mr-2" />
              Subject Breakdown
            </h2>
          </div>
          <div className="p-6">
            {stats && stats.subjectBreakdown.length > 0 ? (
              <div className="space-y-4">
                {stats.subjectBreakdown.map((subject, index) => {
                  const percentage = (subject.hours / stats.totalHours) * 100;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {subject.subject}
                          </span>
                          <span className="text-sm text-gray-500">
                            {subject.hours.toFixed(1)}h ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#a7f3d0] h-2 rounded-full transition-all duration-300"
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
                <p className="text-gray-500">No subject data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
<MusicPlayer />
      {/* New Session Modal */}
      {showNewSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Start Study Session</h2>
                <button
                  onClick={() => setShowNewSession(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleStartSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSession.subject}
                    onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                    placeholder="What are you studying?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewSession({ ...newSession, type: 'pomodoro', plannedDuration: 25 })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        newSession.type === 'pomodoro'
                          ? 'border-[#a5b4fc] bg-[#a5b4fc]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Timer className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Pomodoro</div>
                      <div className="text-xs text-gray-500">25 min + 5 min break</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSession({ ...newSession, type: 'custom' })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        newSession.type === 'custom'
                          ? 'border-[#a5b4fc] bg-[#a5b4fc]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Clock className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Custom</div>
                      <div className="text-xs text-gray-500">Set your own time</div>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newSession.plannedDuration}
                    onChange={(e) => setNewSession({ ...newSession, plannedDuration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={newSession.notes}
                    onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                    rows={2}
                    placeholder="Study goals or notes"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewSession(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#a7f3d0] text-[#065f46] rounded-lg hover:bg-[#a7f3d0]/80 transition-colors"
                  >
                    Start Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showProductivityModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-sm w-full p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Productivity</h2>
      
      <select
        value={userProductivity}
        onChange={(e) => setUserProductivity(Number(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent mb-6"
      >
       <option value={1}>1 - Very Low</option>
  <option value={2}>2 - Low</option>
  <option value={3}>3 - Medium</option>
  <option value={4}>4 - High</option>
  <option value={5}>5 - Very High</option>
      </select>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setShowProductivityModal(false);
            setPendingSessionData(null);
          }}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={saveSessionWithProductivity}
          className="px-4 py-2 bg-[#a7f3d0] text-[#065f46] rounded-lg hover:bg-[#a7f3d0]/80 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default StudyPage;