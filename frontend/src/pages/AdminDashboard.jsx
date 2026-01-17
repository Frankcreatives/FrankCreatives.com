import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Users, Layout, MessageSquare, Plus, X, Trash2, Pen } from 'lucide-react';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [pollFormData, setPollFormData] = useState({
     question: '',
     options: ['', '']
  });
  
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'idea',
    github_link: '',
    demo_link: '',
    image_url: '',
    version: '0.1.0',
    tags: ''
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'], 
    queryFn: async () => (await api.get('/projects')).data,
  });

  const { data: feedback, isLoading: feedbackLoading, error: feedbackError } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => (await api.get('/admin/feedback')).data,
  });

  const { data: polls, isLoading: pollsLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: async () => (await api.get('/polls')).data,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (newProject) => {
        const payload = { 
            ...newProject, 
            tags: newProject.tags ? newProject.tags.split(',').map(t => t.trim()) : [] 
        };
        return await api.post('/projects', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['admin-stats']);
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateProjectDetailsMutation = useMutation({
    mutationFn: async ({ id, data }) => {
        const payload = {
            ...data,
            tags: data.tags ? data.tags.split(',').map(t => t.trim()) : []
        };
        return await api.put(`/projects/${id}`, payload);
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        setIsModalOpen(false);
        resetForm();
    }
  });

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
        title: '',
        description: '',
        status: 'idea',
        github_link: '',
        demo_link: '',
        image_url: '',
        version: '0.1.0',
        tags: ''
      });
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setFormData({
        title: project.title,
        description: project.description,
        status: project.status,
        github_link: project.github_link || '',
        demo_link: project.demo_link || '',
        image_url: project.image_url || '',
        version: project.version || '0.1.0',
        tags: project.tags ? project.tags.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const createPollMutation = useMutation({
    mutationFn: async (newPoll) => {
        // filter empty options
        const payload = {
            ...newPoll,
            options: newPoll.options.filter(o => o.trim() !== '')
        };
        return await api.post('/polls', payload);
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['polls']);
        setPollModalOpen(false);
        setPollFormData({ question: '', options: ['', ''] });
    }
  });

  const updateProjectStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await api.put(`/projects/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id) => {
        return await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(['admin-stats']);
    }
  });

  const replyFeedbackMutation = useMutation({
     mutationFn: async ({ id, reply }) => {
        return await api.put(`/admin/feedback/${id}/reply`, { reply });
     },
     onSuccess: () => {
        queryClient.invalidateQueries(['admin-feedback']);
        setReplyModalOpen(false);
        setReplyText('');
        setSelectedFeedback(null);
     }
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/admin/feedback/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-feedback']);
      queryClient.invalidateQueries(['admin-stats']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
        updateProjectDetailsMutation.mutate({ id: editingProject.id, data: formData });
    } else {
        createProjectMutation.mutate(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePollOptionChange = (index, value) => {
     const newOptions = [...pollFormData.options];
     newOptions[index] = value;
     setPollFormData({ ...pollFormData, options: newOptions });
  };

  const addPollOption = () => {
     setPollFormData({ ...pollFormData, options: [...pollFormData.options, ''] });
  };

  const removePollOption = (index) => {
     const newOptions = pollFormData.options.filter((_, i) => i !== index);
     setPollFormData({ ...pollFormData, options: newOptions });
  };

  const handleDeleteFeedback = (id) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      deleteFeedbackMutation.mutate(id);
    }
  };

  return ( <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {statsLoading ? (
            <>
                <div className="bg-white h-32 rounded-lg shadow animate-pulse"></div>
                <div className="bg-white h-32 rounded-lg shadow animate-pulse"></div>
                <div className="bg-white h-32 rounded-lg shadow animate-pulse"></div>
            </>
        ) : (
            <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</dd>
                        </dl>
                    </div>
                    </div>
                </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Layout className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.totalProjects || 0}</dd>
                        </dl>
                    </div>
                    </div>
                </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Feedback</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.totalFeedback || 0}</dd>
                        </dl>
                    </div>
                    </div>
                </div>
                </div>
            </>
        )}
      </div>

       {/* Polls Section */}
       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
           <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Community Polls</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Engage the community with polls.</p>
           </div>
           <button
            onClick={() => setPollModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Poll
          </button>
        </div>
        <div className="border-t border-gray-200">
           {polls?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No active polls.</div>
           ) : (
                <ul role="list" className="divide-y divide-gray-200">
                    {polls?.map((poll) => (
                    <li key={poll.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex flex-col space-y-2">
                             <div className="flex justify-between">
                                <span className="font-medium text-blue-600">{poll.question}</span>
                                <span className="text-xs text-gray-500">
                                    {poll.totalVotes} votes • {new Date(poll.created_at).toLocaleDateString()}
                                </span>
                             </div>
                             <div className="space-y-1">
                                {poll.options.map(opt => (
                                    <div key={opt.id} className="flex justify-between text-sm text-gray-600">
                                        <span>{opt.option_text}</span>
                                        <span>{opt.votes} votes</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </li>
                    ))}
                </ul>
           )}
        </div>
      </div>

       {/* Project Management Section */}
       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
           <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Projects</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage all projects here.</p>
           </div>
           <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </button>
        </div>
        <div className="border-t border-gray-200">
           {projectsLoading ? (
               <div className="p-6 text-center text-gray-500">Loading projects...</div>
           ) : projects?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No projects yet.</div>
           ) : (
                <ul role="list" className="divide-y divide-gray-200">
                    {projects?.map((project) => (
                    <li key={project.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="truncate">
                                <p className="text-sm font-medium text-blue-600 truncate">{project.title}</p>
                                <p className="text-sm text-gray-500 truncate">{project.description}</p>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex items-center">
                                <select 
                                    value={project.status}
                                    onChange={(e) => updateProjectStatusMutation.mutate({ id: project.id, status: e.target.value })}
                                    className={`text-xs font-semibold rounded-full border-0 py-1 pl-2 pr-6 cursor-pointer focus:ring-2 focus:ring-blue-500
                                    ${project.status === 'released' ? 'bg-green-100 text-green-800' : 
                                      project.status === 'beta' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-gray-100 text-gray-800'}`}
                                >
                                    <option value="idea">Idea</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="beta">Beta</option>
                                    <option value="released">Released</option>
                                </select>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                <button 
                                    onClick={() => handleEditClick(project)}
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Edit Project"
                                >
                                    <Pen className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => {
                                        if(confirm('Are you sure you want to delete this project?')) {
                                            deleteProjectMutation.mutate(project.id);
                                        }
                                    }}
                                    className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete Project"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </li>
                    ))}
                </ul>
           )}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">User Feedback</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Review feedback from the community.</p>
        </div>
        <div className="border-t border-gray-200">
           {feedbackLoading ? (
                <div className="p-6 text-center text-gray-500">Loading feedback...</div>
           ) : feedbackError ? (
                <div className="p-6 text-center text-red-500">Error loading feedback: {feedbackError.message}</div>
           ) : feedback?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No feedback yet.</div>
           ) : (
                <ul role="list" className="divide-y divide-gray-200">
                    {feedback?.map((item) => (
                    <li key={item.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 group">
                        <div className="flex flex-col space-y-2">
                             <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${item.category === 'bug' ? 'bg-red-100 text-red-800' : 
                                        item.category === 'feature' ? 'bg-purple-100 text-purple-800' : 
                                        'bg-blue-100 text-blue-800'}`}>
                                        {item.category}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => {
                                            setSelectedFeedback(item);
                                            setReplyText(item.admin_reply || '');
                                            setReplyModalOpen(true);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        {item.admin_reply ? 'Edit Reply' : 'Reply'}
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteFeedback(item.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Delete Feedback"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                             </div>
                             <p className="text-sm text-gray-900">{item.message}</p>
                             {item.admin_reply && (
                                <div className="ml-4 mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-blue-500">
                                    <span className="font-bold">Admin response:</span> {item.admin_reply}
                                </div>
                             )}
                             <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>Rating: {item.rating}/5</span>
                                <span>By: {item.profiles?.email || 'Unknown User'}</span>
                             </div>
                        </div>
                    </li>
                    ))}
                </ul>
           )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Registered Users</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage community members.</p>
        </div>
        <div className="border-t border-gray-200">
          {usersLoading ? (
               <div className="p-6 text-center text-gray-500">Loading users...</div>
          ) : (
            <ul role="list" className="divide-y divide-gray-200">
                {users?.map((user) => (
                <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                        </span>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600 truncate">{user.email}</p>
                            <p className="flex items-center text-sm text-gray-500">
                                {user.role}
                            </p>
                        </div>
                    </div>
                    <div>
                        {/* Placeholder for actions */}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                        </span>
                    </div>
                    </div>
                </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Add New Project
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" required value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option value="idea">Idea</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="beta">Beta</option>
                                    <option value="released">Released</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Version</label>
                                <input type="text" name="version" value={formData.version} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="react, tailwind, supabase" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">GitHub Link</label>
                                <input type="url" name="github_link" value={formData.github_link} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Demo Link</label>
                                <input type="url" name="demo_link" value={formData.demo_link} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image URL</label>
                            <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.png" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={createProjectMutation.isPending}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Reply Modal */}
      {replyModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setReplyModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button onClick={() => setReplyModalOpen(false)} className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                        <span className="sr-only">Close</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Reply to Feedback</h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">"{selectedFeedback?.message}"</p>
                    <textarea 
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder="Write your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end space-x-2">
                         <button onClick={() => setReplyModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">Cancel</button>
                         <button 
                            onClick={() => replyFeedbackMutation.mutate({ id: selectedFeedback.id, reply: replyText })}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            disabled={replyFeedbackMutation.isPending}
                        >
                            {replyFeedbackMutation.isPending ? 'Sending...' : 'Send Reply'}
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
      {/* Create Poll Modal */}
      {pollModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setPollModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button onClick={() => setPollModalOpen(false)} className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                        <span className="sr-only">Close</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Poll</h3>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Question</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={pollFormData.question}
                            onChange={(e) => setPollFormData({...pollFormData, question: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input 
                            type="text" 
                            name="image_url"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="https://example.com/image.png"
                            value={pollFormData.image_url}
                            onChange={(e) => setPollFormData({...pollFormData, image_url: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                        {pollFormData.options.map((opt, idx) => (
                            <div key={idx} className="flex mb-2 space-x-2">
                                <input 
                                    type="text" 
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt}
                                    onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                                />
                                {pollFormData.options.length > 2 && (
                                    <button onClick={() => removePollOption(idx)} className="text-red-500 hover:text-red-700">
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={addPollOption} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                            <Plus className="h-4 w-4 mr-1" /> Add Option
                        </button>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                         <button 
                            onClick={() => createPollMutation.mutate(pollFormData)}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            disabled={createPollMutation.isPending}
                        >
                            {createPollMutation.isPending ? 'Creating...' : 'Create Poll'}
                        </button>
                         <button onClick={() => setPollModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
