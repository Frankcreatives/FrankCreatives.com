import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { MessageSquare, Plus, Star } from 'lucide-react';

export default function Feedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  // Fetch Projects for the dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    },
  });

  // Fetch My Feedback
  const { data: myFeedback, isLoading } = useQuery({
    queryKey: ['my-feedback'],
    queryFn: async () => {
      const { data } = await api.get('/feedback/me');
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newFeedback) => {
      return await api.post('/feedback', newFeedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-feedback']);
      reset();
      setIsSubmitting(false);
      alert('Feedback submitted successfully!');
    },
    onError: (error) => {
      setIsSubmitting(false);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  });

  const onSubmit = (data) => {
    setIsSubmitting(true);
    mutation.mutate({
      ...data,
      rating: parseInt(data.rating),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Submit Feedback Form */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center mb-4">
            <Plus className="w-5 h-5 mr-2 text-blue-500" />
            Submit Feedback
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <select
                {...register('project_id', { required: 'Project is required' })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              >
                <option value="">Select a project</option>
                {projects?.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              {errors.project_id && <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  {...register('category', { required: true })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                >
                  <option value="general">General</option>
                  <option value="bug">Bug Report</option>
                  <option value="ux">UX / Design</option>
                  <option value="feature">Feature Request / Idea Proposal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                <select
                   {...register('rating', { required: true })}
                   className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Terrible</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                {...register('message', { required: 'Message is required' })}
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                placeholder="What's on your mind?"
              />
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>

      {/* My Feedback List */}
      <div className="space-y-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
            My Recent Feedback
        </h3>
        {isLoading ? (
            <p>Loading...</p>
        ) : myFeedback?.length === 0 ? (
            <p className="text-gray-500">No feedback submitted yet.</p>
        ) : (
             myFeedback?.map((item) => (
              <div key={item.id} className="bg-white shadow rounded-lg p-4 border border-gray-100">
                <div className="flex justify-between items-start">
                    <span className="font-medium text-blue-600 text-sm">{item.projects?.title || 'Unknown Project'}</span>
                    <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center mt-1 mb-2">
                     <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase mr-2 
                        ${item.category === 'bug' ? 'bg-red-100 text-red-800' : 
                          item.category === 'feature' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.category}
                     </span>
                     <div className="flex items-center text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs text-gray-600 ml-1">{item.rating}/5</span>
                     </div>
                </div>
                <p className="text-sm text-gray-700">{item.message}</p>
                {item.admin_reply && (
                    <div className="mt-3 bg-blue-50 border-l-2 border-blue-500 p-2 rounded-r-md">
                        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Response from Admin</p>
                        <p className="text-sm text-gray-800">{item.admin_reply}</p>
                    </div>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}
