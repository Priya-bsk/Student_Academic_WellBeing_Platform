import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  FileText,
  Link,
  Upload,
  Trash2,
  Eye,
  BookOpen,
  Video,
  Music,
  Share2,
  Users,
  User,
  Calendar
} from 'lucide-react';

const CounselorResources = () => {
  // ✅ Static Dummy Data
  const [resources, setResources] = useState([
    {
      _id: '1',
      title: 'Time Management Tips for Students',
      type: 'note',
      content: 'Plan your study hours, prioritize tasks, and take breaks.',
      subject: 'Academic Skills',
      folder: 'Counseling Resources',
      description: 'Guidelines for improving productivity and focus',
      tags: ['productivity', 'study', 'focus'],
      isPublic: true,
      createdAt: '2025-11-01',
    },
    {
      _id: '2',
      title: 'Coping with Exam Stress - Video Session',
      type: 'video',
      subject: 'Mental Health',
      folder: 'Counseling Videos',
      description: 'Short video on managing exam anxiety',
      tags: ['stress', 'mental health', 'exam'],
      isPublic: false,
      createdAt: '2025-10-25',
    },
    {
      _id: '3',
      title: 'Career Guidance for Final Year Students',
      type: 'link',
      content: 'https://careerresources.university.edu',
      subject: 'Career Development',
      folder: 'Career Support',
      description: 'External resources for career planning and interview prep',
      tags: ['career', 'placement'],
      isPublic: true,
      createdAt: '2025-11-03',
    },
  ]);

  const [folders, setFolders] = useState(['Counseling Resources', 'Counseling Videos', 'Career Support']);
  const [subjects, setSubjects] = useState(['Academic Skills', 'Mental Health', 'Career Development']);

  const [filteredResources, setFilteredResources] = useState(resources);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFolder, setFilterFolder] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');

  // 🗒 Private Counsellor Notes (Static)
  const [privateNotes] = useState([
    {
      id: 1,
      studentName: 'Priya B',
      studentYear: 'Sophomore',
      department: 'Computer Science',
      sessionDate: '2025-11-05',
      notes:
        'Student expressed stress about managing deadlines. Suggested time blocking and regular breaks.',
      followUp: 'Check progress on weekly planner next session.',
    },
    {
      id: 2,
      studentName: 'Madhumita Raj',
      studentYear: 'Junior',
      department: 'Electrical Engineering',
      sessionDate: '2025-10-29',
      notes:
        'Discussed anxiety related to internships. Encouraged joining career mentorship program.',
      followUp: 'Follow up on internship progress by end of semester.',
    },
    {
      id: 3,
      studentName: 'Arjun Yadhav',
      studentYear: 'Freshman',
      department: 'Mechanical Engineering',
      sessionDate: '2025-11-01',
      notes:
        'Had trouble adjusting to academic routine. Advised participation in peer learning group.',
      followUp: 'Review academic engagement in December.',
    },
  ]);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, filterFolder, filterSubject, filterType, filterVisibility]);

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterFolder !== 'all') filtered = filtered.filter((r) => r.folder === filterFolder);
    if (filterSubject !== 'all') filtered = filtered.filter((r) => r.subject === filterSubject);
    if (filterType !== 'all') filtered = filtered.filter((r) => r.type === filterType);
    if (filterVisibility === 'public') filtered = filtered.filter((r) => r.isPublic);
    else if (filterVisibility === 'private') filtered = filtered.filter((r) => !r.isPublic);

    setFilteredResources(filtered);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'link':
        return <Link className="h-5 w-5 text-green-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'audio':
        return <Music className="h-5 w-5 text-purple-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="space-y-8">
      {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Counsellor Resource Library</h1>
          <p className="text-gray-600">Manage your counseling materials and private student notes</p>
        </div>
        <button
          onClick={() => setShowNewResource(true)}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-[#e9d5ff] text-[#7c3aed] rounded-lg hover:bg-[#e9d5ff]/80 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-[#a78bfa]" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Resources</p>
              <p className="text-2xl font-bold">6</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <Share2 className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Public</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Private</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-[#7c3aed]" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Folders</p>
              <p className="text-2xl font-bold">{folders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a5b4fc]"
            />
          </div>

          <div className="flex gap-2">
            <select value={filterFolder} onChange={(e) => setFilterFolder(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Folders</option>
              {folders.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Types</option>
              <option value="note">Notes</option>
              <option value="video">Videos</option>
              <option value="link">Links</option>
            </select>
            <select value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
          <Share2 className="h-5 w-5 mr-2 text-green-500" />
          Public Resources
        </h2>
     
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((r) => (
              <div key={r._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center space-x-2 mb-2">
                  {getResourceIcon(r.type)}
                  <span className="text-xs text-gray-500 capitalize">{r.type}</span>
                  {r.isPublic && (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">Public</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{r.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{r.description}</p>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>{r.subject}</span>
                  <span>{formatDate(r.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No resources found</p>
        )}
      </div>
      

      {/* 🧠 Private Counsellor Notes Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Private Counsellor Notes</h2>
        <p className="text-sm text-gray-600 mb-6">
          
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {privateNotes.map((note) => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{note.studentName}</span>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {note.sessionDate}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2 whitespace-pre-line">{note.notes}</p>
              <p className="text-xs text-indigo-600">
                <strong>Follow-up:</strong> {note.followUp}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CounselorResources;
