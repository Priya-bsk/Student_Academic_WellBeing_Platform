import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { 
  CheckSquare, 
  Plus, 
  Clock,
  AlertCircle,
  Edit3,
  Trash2,
  X
} from 'lucide-react';

const TasksPage = () => {
  const { makeRequest, loading } = useApi();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [modalTask, setModalTask] = useState(null); // unified modal
  const [taskStats, setTaskStats] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, filterStatus, filterPriority]);

  const fetchTasks = async () => {
    try {
      const response = await makeRequest('/tasks');
      setTasks(response.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchTaskStats = async () => {
    try {
      const response = await makeRequest('/tasks/stats');
      setTaskStats(response.stats);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (filterStatus === 'pending') filtered = filtered.filter(t => !t.isCompleted);
    else if (filterStatus === 'completed') filtered = filtered.filter(t => t.isCompleted);

    if (filterPriority !== 'all') filtered = filtered.filter(t => t.priority === filterPriority);

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!modalTask) return;

    try {
      if (modalTask._id) {
        // Edit
        await makeRequest(`/tasks/${modalTask._id}`, { method: 'PUT', body: modalTask });
      } else {
        // Create
        await makeRequest('/tasks', { method: 'POST', body: modalTask });
      }
      setModalTask(null);
      fetchTasks();
      fetchTaskStats();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleToggleComplete = async (taskId, isCompleted) => {
    try {
      await makeRequest(`/tasks/${taskId}`, { method: 'PUT', body: { isCompleted: !isCompleted } });
      fetchTasks();
      fetchTaskStats();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await makeRequest(`/tasks/${taskId}`, { method: 'DELETE' });
        fetchTasks();
        fetchTaskStats();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isOverdue = date < today && !tasks.find(t => t.dueDate === dateString)?.isCompleted;

    return {
      formatted: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      }),
      isOverdue
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Organize your study tasks, set priorities, and track your progress</p>
        </div>
        <button
          onClick={() => setModalTask({
            title: '',
            description: '',
            subject: '',
            priority: 'medium',
            dueDate: '',
            estimatedHours: 1,
            tags: []
          })}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-[#a5b4fc] text-white rounded-lg hover:bg-[#a5b4fc]/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Stats */}
      {taskStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <CheckSquare className="h-8 w-8 text-[#a5b4fc]" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.pending}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.overdue}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length ? (
          filteredTasks.map(task => {
            const dateInfo = formatDate(task.dueDate);
            return (
              <div key={task._id} className="p-4 hover:bg-gray-50 flex items-start space-x-3 transition-colors">
                <button
                  onClick={() => handleToggleComplete(task._id, task.isCompleted)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.isCompleted ? 'bg-[#a5b4fc] border-[#a5b4fc] text-white' : 'border-gray-300 hover:border-[#a5b4fc]'
                  }`}
                >
                  {task.isCompleted && <CheckSquare className="h-3 w-3" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">{task.subject}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`text-sm ${dateInfo.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          Due: {dateInfo.formatted}
                        </span>
                        <span className="text-sm text-gray-500">{task.estimatedHours}h estimated</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button onClick={() => setModalTask(task)} className="p-1 text-gray-400 hover:text-[#a5b4fc]"><Edit3 className="h-4 w-4"/></button>
                      <button onClick={() => handleDeleteTask(task._id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4"/></button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tasks found</p>
            <button onClick={() => setModalTask({
              title: '',
              description: '',
              subject: '',
              priority: 'medium',
              dueDate: '',
              estimatedHours: 1,
              tags: []
            })} className="mt-2 text-[#a5b4fc] hover:text-[#a5b4fc]/80 font-medium">Create your first task</button>
          </div>
        )}
      </div>

      {/* Unified Create/Edit Modal */}
      {/* Unified Create/Edit Modal */}
{modalTask && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{modalTask._id ? 'Edit Task' : 'Create Task'}</h2>
        <button onClick={() => setModalTask(null)}><X className="h-5 w-5"/></button>
      </div>
      <form onSubmit={handleSaveTask} className="space-y-4">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            required
            placeholder="Task title"
            value={modalTask.title}
            onChange={e => setModalTask({...modalTask, title: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
          <input
            type="text"
            required
            placeholder="Task subject"
            value={modalTask.subject}
            onChange={e => setModalTask({...modalTask, subject: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="Task description"
            value={modalTask.description}
            onChange={e => setModalTask({...modalTask, description: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={modalTask.priority}
            onChange={e => setModalTask({...modalTask, priority: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
          <input
            type="datetime-local"
            required
            value={modalTask.dueDate}
            onChange={e => setModalTask({...modalTask, dueDate: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Estimated Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
          <input
            type="number"
            min="0.5"
            max="50"
            step="0.5"
            value={modalTask.estimatedHours}
            onChange={e => setModalTask({...modalTask, estimatedHours: parseFloat(e.target.value)})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => setModalTask(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-[#a5b4fc] text-white rounded-lg">{modalTask._id ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default TasksPage;
