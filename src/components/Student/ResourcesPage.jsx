import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  FolderOpen, 
  Plus, 
  Search,
  Filter,
  FileText,
  Link,
  Upload,
  Download,
  Trash2,
  Edit3,
  Eye,
  BookOpen,
  Video,
  Music
} from 'lucide-react';

const ResourcesPage = () => {
  const { makeRequest, loading } = useApi();
  
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [folders, setFolders] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFolder, setFilterFolder] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  const [showNewResource, setShowNewResource] = useState(false);
  const [resourceType, setResourceType] = useState('note');
  
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'note',
    content: '',
    subject: '',
    folder: 'General',
    description: '',
    tags: []
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchResources();
    fetchFolders();
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, filterFolder, filterSubject, filterType]);

  const fetchResources = async () => {
    try {
      const response = await makeRequest('/resources');
      setResources(response.resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await makeRequest('/resources/folders');
      setFolders(response.folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await makeRequest('/resources/subjects');
      setSubjects(response.subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by folder
    if (filterFolder !== 'all') {
      filtered = filtered.filter(resource => resource.folder === filterFolder);
    }

    // Filter by subject
    if (filterSubject !== 'all') {
      filtered = filtered.filter(resource => resource.subject === filterSubject);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(resource => resource.type === filterType);
    }

    setFilteredResources(filtered);
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    
    try {
      if (resourceType === 'upload' && selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', newResource.title);
        formData.append('subject', newResource.subject);
        formData.append('folder', newResource.folder);
        formData.append('description', newResource.description);

        const response = await fetch('http://localhost:5000/api/resources/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }
      } else {
        // Handle text/link resource
        await makeRequest('/resources', {
          method: 'POST',
          body: {
            ...newResource,
            type: resourceType === 'link' ? 'link' : 'note'
          }
        });
      }
      
      setShowNewResource(false);
      resetForm();
      fetchResources();
      fetchFolders();
      fetchSubjects();
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await makeRequest(`/resources/${resourceId}`, { method: 'DELETE' });
        fetchResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const resetForm = () => {
    setNewResource({
      title: '',
      type: 'note',
      content: '',
      subject: '',
      folder: 'General',
      description: '',
      tags: []
    });
    setSelectedFile(null);
    setResourceType('note');
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600">Organize your study materials and notes</p>
        </div>
        <button
          onClick={() => setShowNewResource(true)}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-[#bfdbfe] text-[#1e40af] rounded-lg hover:bg-[#bfdbfe]/80 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterFolder}
              onChange={(e) => setFilterFolder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
            
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="note">Notes</option>
              <option value="document">Documents</option>
              <option value="link">Links</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <div key={resource._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getResourceIcon(resource.type)}
                      <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          if (resource.type === 'link' && resource.content) {
                            window.open(resource.content, '_blank');
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-[#a5b4fc] transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  
                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>{resource.subject}</span>
                      <span>{resource.folder}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>{formatDate(resource.createdAt)}</span>
                      {resource.fileSize && (
                        <span>{formatFileSize(resource.fileSize)}</span>
                      )}
                    </div>
                    
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="text-gray-400">+{resource.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No resources found</p>
            <button
              onClick={() => setShowNewResource(true)}
              className="text-[#a5b4fc] hover:text-[#a5b4fc]/80 font-medium"
            >
              Add your first resource
            </button>
          </div>
        )}
      </div>

      {/* New Resource Modal */}
      {showNewResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Add Resource</h2>
                <button
                  onClick={() => {
                    setShowNewResource(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {/* Resource Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResourceType('note')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      resourceType === 'note'
                        ? 'border-[#a5b4fc] bg-[#a5b4fc]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <BookOpen className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs">Note</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceType('link')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      resourceType === 'link'
                        ? 'border-[#a5b4fc] bg-[#a5b4fc]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Link className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs">Link</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceType('upload')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      resourceType === 'upload'
                        ? 'border-[#a5b4fc] bg-[#a5b4fc]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Upload className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs">Upload</div>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleCreateResource} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                    placeholder="Resource title"
                  />
                </div>
                
                {resourceType === 'upload' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File *
                    </label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.mov"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {resourceType === 'link' ? 'URL *' : 'Content *'}
                    </label>
                    <textarea
                      required
                      value={newResource.content}
                      onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                      rows={resourceType === 'link' ? 2 : 4}
                      placeholder={resourceType === 'link' ? 'https://example.com' : 'Enter your notes here...'}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={newResource.subject}
                      onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                      placeholder="e.g., Math, History"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Folder
                    </label>
                    <input
                      type="text"
                      value={newResource.folder}
                      onChange={(e) => setNewResource({ ...newResource, folder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                      placeholder="General"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent"
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewResource(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#bfdbfe] text-[#1e40af] rounded-lg hover:bg-[#bfdbfe]/80 transition-colors"
                  >
                    Add Resource
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

export default ResourcesPage;