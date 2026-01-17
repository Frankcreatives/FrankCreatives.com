import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { ExternalLink, Github, Tag } from 'lucide-react';

export default function Projects() {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    },
  });

  if (isLoading) return <div className="text-center py-10">Loading projects...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading projects</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col">
            {project.image_url && (
                <div className="h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                    <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}
            <div className="px-4 py-5 sm:p-6 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      {project.title}
                  </h3>
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${project.status === 'released' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      project.status === 'beta' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                      project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {project.status}
                    </span>
               </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-3 h-16">
                {project.description}
              </p>
              
               <div className="mt-4 flex flex-wrap gap-2">
                {project.tags?.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                    </span>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                {project.demo_link && (
                  <a
                    href={project.demo_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Demo
                  </a>
                )}
                {project.github_link && (
                   <a
                    href={project.github_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Code
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
