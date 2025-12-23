import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import SentimentChart from './SentimentChart';
import SentimentPieChart from './SentimentPieChart';

import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Edit,
  Trash2,
  Pin,
  Lock,
  Globe,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Save,
  Heart,
  Brain,
  Sparkles
} from 'lucide-react';

const JournalPage = () => {
  const { makeRequest, loading } = useApi();

  const [journals, setJournals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [editingJournal, setEditingJournal] = useState(null);
  const [sentimentStats, setSentimentStats] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    mood: '',
    isPrivate: true
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchJournals();
    fetchSentimentStats();
  }, []);

  useEffect(() => {
    filterJournals();
  }, [journals, searchTerm]);

  const fetchJournals = async () => {
    try {
      const data = await makeRequest('/journal');
      setJournals(data);
    } catch (error) {
      console.error('Error fetching journals:', error);
    }
  };

 const fetchSentimentStats = async () => {
  try {
    const data = await makeRequest('/journal/stats/sentiment');

    // Sort by date
    if (data.sentimentTrend) {
      data.sentimentTrend.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setSentimentStats(data);
  } catch (error) {
    console.error('Error fetching sentiment stats:', error);
  }
};


  const filterJournals = () => {
    if (!searchTerm) {
      setFilteredJournals(journals);
      return;
    }

    const filtered = journals.filter(journal =>
      journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredJournals(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    try {
      if (editingJournal) {
        await makeRequest(`/journal/${editingJournal._id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        await makeRequest('/journal', {
          method: 'POST',
          body: formData
        });
      }

      setFormData({
        title: '',
        content: '',
        tags: [],
        mood: '',
        isPrivate: true
      });
      setShowNewEntry(false);
      setEditingJournal(null);
      fetchJournals();
      fetchSentimentStats();
    } catch (error) {
      console.error('Error saving journal:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    try {
      await makeRequest(`/journal/${id}`, { method: 'DELETE' });
      fetchJournals();
      fetchSentimentStats();
      setShowViewModal(false);
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  const handlePin = async (journal) => {
    try {
      await makeRequest(`/journal/${journal._id}`, {
        method: 'PUT',
        body: { isPinned: !journal.isPinned }
      });
      fetchJournals();
    } catch (error) {
      console.error('Error pinning journal:', error);
    }
  };

  const handleEdit = (journal) => {
    setEditingJournal(journal);
    setFormData({
      title: journal.title,
      content: journal.content,
      tags: journal.tags,
      mood: journal.mood || '',
      isPrivate: journal.isPrivate
    });
    setShowNewEntry(true);
  };

  const handleView = (journal) => {
    setSelectedJournal(journal);
    setShowViewModal(true);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getSentimentColor = (label) => {
    const colors = {
      'very-positive': 'text-green-600 bg-green-50 border-green-200',
      'positive': 'text-green-500 bg-green-50 border-green-200',
      'neutral': 'text-gray-600 bg-gray-50 border-gray-200',
      'negative': 'text-orange-600 bg-orange-50 border-orange-200',
      'very-negative': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[label] || colors.neutral;
  };

  const getSentimentIcon = (label) => {
    if (label === 'very-positive' || label === 'positive') return <Smile className="h-4 w-4" />;
    if (label === 'very-negative' || label === 'negative') return <Frown className="h-4 w-4" />;
    return <Meh className="h-4 w-4" />;
  };

  const emotionEmojis = {
    joy: '😊',
    sadness: '😢',
    anger: '😠',
    fear: '😨',
    surprise: '😲',
    trust: '🤝',
    anticipation: '🎯'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Journal</h1>
          <p className="text-gray-600">Express yourself and track your emotional journey with AI-powered sentiment analysis</p>
        </div>
        <button
          onClick={() => {
            setShowNewEntry(true);
            setEditingJournal(null);
            setFormData({
              title: '',
              content: '',
              tags: [],
              mood: '',
              isPrivate: true
            });
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Entry</span>
        </button>
      </div>

      {sentimentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Total Entries</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{sentimentStats.totalEntries}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-900">Avg Sentiment</span>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-gray-900">
  {sentimentStats.avgSentiment?.toFixed(1) ?? '0.0'}
</p>

              {sentimentStats.avgSentiment > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : sentimentStats.avgSentiment < 0 ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <Minus className="h-5 w-5 text-gray-600" />
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Smile className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">Positive</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(sentimentStats.sentimentDistribution['very-positive'] || 0) + (sentimentStats.sentimentDistribution['positive'] || 0)}

            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-5 w-5 text-pink-600" />
              <span className="font-medium text-gray-900">This Month</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{Math.min(sentimentStats.sentimentTrend.length, 30)}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredJournals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJournals.map((journal) => (
            <div
              key={journal._id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleView(journal)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{journal.title}</h3>
                      {journal.isPinned && <Pin className="h-4 w-4 text-blue-600" />}
                      {journal.isPrivate ? (
                        <Lock className="h-3 w-3 text-gray-400" />
                      ) : (
                        <Globe className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{journal.content}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(journal.sentiment.label)}`}>
                      {getSentimentIcon(journal.sentiment.label)}
                      <span className="capitalize">{journal.sentiment.label.replace('-', ' ')}</span>
                    </span>
                    {journal.emotions.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {journal.emotions.slice(0, 3).map((emotion, idx) => (
                          <span key={idx} title={emotion}>
                            {emotionEmojis[emotion]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(journal.createdAt)}</span>
                </div>

                {journal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {journal.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No journal entries found matching your search' : 'No journal entries yet. Start writing!'}
          </p>
        </div>
      )}

      {showNewEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingJournal ? 'Edit Entry' : 'New Journal Entry'}
                </h2>
                <button
                  onClick={() => {
                    setShowNewEntry(false);
                    setEditingJournal(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Give your entry a title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Write your thoughts..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a tag..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mood (Optional)
                  </label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a mood...</option>
                    <option value="very-happy">😄 Very Happy</option>
                    <option value="happy">🙂 Happy</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="sad">😔 Sad</option>
                    <option value="very-sad">😢 Very Sad</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-gray-700">
                    Keep this entry private
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Your entry will be analyzed for sentiment and emotions using AI to help you track your emotional well-being over time.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewEntry(false);
                      setEditingJournal(null);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingJournal ? 'Update' : 'Save'} Entry</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
{sentimentStats && (
  <SentimentChart data={sentimentStats.sentimentTrend} />
)}
 {sentimentStats?.sentimentDistribution && (
  <SentimentPieChart distribution={sentimentStats.sentimentDistribution} />
)}

      {showViewModal && selectedJournal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedJournal.title}</h2>
                    {selectedJournal.isPinned && <Pin className="h-5 w-5 text-blue-600" />}
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(selectedJournal.createdAt)}</p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Sentiment Analysis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Overall Sentiment</p>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium border ${getSentimentColor(selectedJournal.sentiment.label)}`}>
                        {getSentimentIcon(selectedJournal.sentiment.label)}
                        <span className="capitalize">{selectedJournal.sentiment.label.replace('-', ' ')}</span>
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Confidence</p>
                      <p className="text-lg font-bold text-gray-900">{(selectedJournal.sentiment.confidence).toFixed(0)}%</p>
                    </div>
                  </div>
                  {selectedJournal.emotions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2">Detected Emotions</p>
                      <div className="flex items-center space-x-2">
                        {selectedJournal.emotions.map((emotion, idx) => (
                          <span
                            key={idx}
                            className="flex items-center space-x-1 px-2 py-1 bg-white rounded text-sm"
                          >
                            <span>{emotionEmojis[emotion]}</span>
                            <span className="capitalize">{emotion}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedJournal.content}</p>
                </div>

                {selectedJournal.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJournal.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-sm bg-blue-50 text-blue-600 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePin(selectedJournal)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Pin className="h-4 w-4" />
                      <span>{selectedJournal.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEdit(selectedJournal);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedJournal._id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
