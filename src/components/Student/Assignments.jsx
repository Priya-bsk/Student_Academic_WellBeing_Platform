import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { BookMarked, Plus, Calendar, AlertCircle, X, Save, Sparkles, Send } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";


const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  submitted: 'bg-purple-100 text-purple-700',
};

export default function Assignments() {
  const { state } = useAuth();
const { user, isLoading } = state;
  const { makeRequest, loading: apiLoading, error: apiError } = useApi();
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
const [loadingAssignments, setLoadingAssignments] = useState(true);

  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'not_started',
    notes: '',
  });

 



useEffect(() => {
  if (!isLoading && user?._id) {
    fetchAssignments();
  }
}, [isLoading, user]);


  // Fetch assignments
const fetchAssignments = async () => {
  setLoadingAssignments(true);
  try {
    const data = await makeRequest('/assignments');
    console.log('Assignments fetched:', data);
    setAssignments(data.assignments || []);
  } catch (error) {
    console.error('Error loading assignments:', error);
    setAssignments([]);
  } finally {
    setLoadingAssignments(false);
  }
};



if (loadingAssignments) {
       return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
   );
 }




  // Save new assignment
  const handleSaveAssignment = async () => {
  if (!formData.title.trim() || !formData.subject.trim() || !formData.dueDate) return;

  try {
    await makeRequest('/assignments', {
      method: 'POST',
      body: {
        subject: formData.subject,
        title: formData.title,
        description: formData.description || '',
        dueDate: formData.dueDate
, // map frontend field to backend schema
        priority: formData.priority || 'medium',
        status: formData.status || 'not_started',
        notes: formData.notes || ''
      }
    });

    setFormData({
      subject: '',
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'not_started',
      notes: '',
    });
    setShowForm(false);
    fetchAssignments(); // reload assignments
  } catch (error) {
    console.error('Error saving assignment:', error.message);
  }
};

  // Update assignment status
  const updateAssignmentStatus = async (assignmentId, newStatus) => {
  try {
    await makeRequest(`/assignments/${assignmentId}/status`, {
      method: 'PATCH', // your backend uses PATCH
      body: { status: newStatus }
    });

    fetchAssignments();
  } catch (error) {
    console.error('Error updating assignment status:', error.message);
  }
};

  // Fetch AI conversations
  const fetchConversations = async (assignmentId) => {
    try {
      const data = await makeRequest(`/assignments/${assignmentId}/ai-help`);
      setConversations(data.aiHelp || []);
    } catch (err) {
      console.error('Error fetching conversations:', err.message);
    }
  };

  // Ask AI question
  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !selectedAssignment) return;
    setAiLoading(true);

    try {
      const assignment = assignments.find(a => a._id === selectedAssignment);
      const response = generateAIResponse(aiQuestion, assignment);

      await makeRequest(`/assignments/${selectedAssignment}/ai-help`, {
        method: 'POST',
        body: { question: aiQuestion.trim() },
      });

      setAiQuestion('');
      fetchConversations(selectedAssignment);
    } catch (err) {
      console.error('Error asking AI:', err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const generateAIResponse = (question, assignment) => {
  const lowerQuestion = question.toLowerCase();

  // Starting or planning the assignment
  if (lowerQuestion.includes('how') || lowerQuestion.includes('start') || lowerQuestion.includes('approach')) {
    return `Suggested approach for "${assignment?.title || 'your assignment'}":\n- Break the task into smaller steps\n- Research the topic thoroughly\n- Create a clear outline\n- Start with the easiest sections\n- Review and revise before submission`;
  }

  // Time management and scheduling
  if (lowerQuestion.includes('time') || lowerQuestion.includes('manage') || lowerQuestion.includes('schedule') || lowerQuestion.includes('deadline')) {
    return `Time management tips for "${assignment?.title || 'your assignment'}":\n- Set specific goals for each session\n- Use the Pomodoro technique or time blocks\n- Avoid multitasking and distractions\n- Work during your peak focus hours\n- Leave buffer time before the due date`;
  }

  // Research and sources
  if (lowerQuestion.includes('research') || lowerQuestion.includes('source') || lowerQuestion.includes('reference') || lowerQuestion.includes('citation')) {
    return `Research strategies for "${assignment?.title || 'your assignment'}":\n- Start with your course materials\n- Use academic databases like Google Scholar or JSTOR\n- Evaluate source credibility\n- Organize your notes systematically\n- Properly cite all sources`;
  }

  // Stress, motivation, and mental health
  if (lowerQuestion.includes('stress') || lowerQuestion.includes('anxious') || lowerQuestion.includes('overwhelm') || lowerQuestion.includes('motivation')) {
    return `Tips to manage stress and stay motivated:\n- Break tasks into smaller, manageable chunks\n- Focus on progress, not perfection\n- Take regular breaks\n- Practice deep breathing or mindfulness\n- Ask for help if needed\n- Reward yourself for milestones achieved`;
  }

  // Writing help
  if (lowerQuestion.includes('write') || lowerQuestion.includes('draft') || lowerQuestion.includes('essay') || lowerQuestion.includes('report')) {
    return `Writing tips for "${assignment?.title || 'your assignment'}":\n- Start with a clear thesis or objective\n- Create a structured outline\n- Write in clear, concise paragraphs\n- Revise and proofread carefully\n- Check for grammar and formatting`;
  }

  // Presentations or projects
  if (lowerQuestion.includes('present') || lowerQuestion.includes('presentation') || lowerQuestion.includes('project') || lowerQuestion.includes('slide')) {
    return `Tips for preparing your project/presentation:\n- Outline key points clearly\n- Use visuals to support your ideas\n- Rehearse multiple times\n- Keep slides concise and readable\n- Engage your audience with questions or examples`;
  }

  // Collaboration and group work
  if (lowerQuestion.includes('group') || lowerQuestion.includes('team') || lowerQuestion.includes('collaborate') || lowerQuestion.includes('partner')) {
    return `Tips for group assignments:\n- Define roles clearly\n- Communicate regularly with your team\n- Set deadlines for each subtask\n- Use collaborative tools (Google Docs, Trello)\n- Review each other's work and provide feedback`;
  }

  // Default general advice
  return `Advice for "${assignment?.title || 'your assignment'}":\n- Review assignment requirements carefully\n- Create a plan with clear milestones\n- Allocate time for research, writing, and revision\n- Seek help from your instructor if unclear\n- Stay consistent and track your progress`;
};


  const openAIHelper = (assignmentId) => {
    setSelectedAssignment(assignmentId);
    setShowAI(true);
    fetchConversations(assignmentId);
  };

  if (apiLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <p>Error loading assignments: {apiError}</p>
      </div>
    );
  }

// if (loadingAssignments) {
//   return (
//     <div className="flex items-center justify-center h-screen">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//     </div>
//   );
// }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl">
              <BookMarked className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>
              <p className="text-gray-600">Track your work and get AI assistance</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 transform hover:scale-[1.02] transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Assignment
          </button>
        </div>

        {/* Assignment Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">New Assignment</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                      placeholder="Math, English, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                    placeholder="Assignment title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all resize-none"
                    placeholder="Assignment details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="submitted">Submitted</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveAssignment}
                  disabled={!formData.title.trim() || !formData.subject.trim() || !formData.dueDate}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  Save Assignment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Helper Modal */}
        {showAI && selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full h-[600px] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">AI Assignment Helper</h2>
                    <p className="text-sm text-gray-600">
                      {assignments.find(a => a._id === selectedAssignment)?.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAI(false);
                    setSelectedAssignment(null);
                    setConversations([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Ask me anything about your assignment!</p>
                    <p className="text-sm text-gray-500 mt-2">
                      I can help with planning, research, time management, and more.
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div key={conv._id} className="space-y-3">
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%]">
                          {conv.question}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] text-sm leading-snug">
  <ReactMarkdown
    components={{
      p: ({ children }) => (
        <p className="m-0 mb-0.5">{children}</p> // compact lines
      ),
      ul: ({ children }) => (
        <ul className="m-0 ml-4 list-disc space-y-0.5">{children}</ul>
      ),
      li: ({ children }) => <li className="m-0">{children}</li>,
      h1: ({ children }) => (
        <h1 className="text-base font-semibold m-0 mb-1">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-sm font-semibold m-0 mb-1">{children}</h2>
      ),
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      code: ({ children }) => (
        <code className="bg-gray-200 text-gray-900 px-1 py-0.5 rounded text-xs">
          {children}
        </code>
      ),
    }}
  >
    {conv.response}
  </ReactMarkdown>
</div>


                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !aiLoading && handleAskAI()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                    placeholder="Ask a question about your assignment..."
                    disabled={aiLoading}
                  />
                  <button
                    onClick={handleAskAI}
                    disabled={!aiQuestion.trim() || aiLoading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
                  >
                    {aiLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment List */}
        <div className="grid gap-6">
          {assignments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
              <BookMarked className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No assignments yet</h3>
              <p className="text-gray-500">Add your first assignment to get started</p>
            </div>
          ) : (
            assignments.map((assignment) => {
              const dueDate = new Date(assignment.dueDate);
              const isOverdue = dueDate < new Date() && assignment.status !== 'completed' && assignment.status !== 'submitted';
              const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={assignment._id}
                  className={`bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all ${
                    isOverdue ? 'border-2 border-red-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {assignment.subject}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[assignment.priority]}`}>
                          {assignment.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{assignment.title}</h3>
                      {assignment.description && (
                        <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                          {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                          {dueDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {!isOverdue && daysUntilDue >= 0 && daysUntilDue <= 7 && (
                            <span className="ml-1 text-orange-600 font-medium">
                              ({daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days`})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <select
                        value={assignment.status}
                        onChange={(e) => updateAssignmentStatus(assignment._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${statusColors[assignment.status]}`}
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="submitted">Submitted</option>
                      </select>

                      <button
                        onClick={() => openAIHelper(assignment._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl text-sm font-semibold hover:from-purple-500 hover:to-pink-500 transform hover:scale-[1.02] transition-all shadow-md"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Help
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
