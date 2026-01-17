import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { BarChart2, CheckCircle } from 'lucide-react';

export default function Polls() {
  const queryClient = useQueryClient();
  const [votedPolls, setVotedPolls] = useState({}); // Track locally for optimistic updates or just relies on invalidation

  const { data: polls, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: async () => (await api.get('/polls')).data,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }) => {
      return await api.post(`/polls/${pollId}/vote`, { option_id: optionId });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['polls']);
      alert('Vote recorded!');
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Failed to vote');
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Community Polls
        </h1>
        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
          Have your say in the future of our community.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center dark:text-gray-300">Loading polls...</div>
      ) : polls?.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">No active polls at the moment.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {polls?.map((poll) => (
            <div key={poll.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4 flex items-start">
                    <BarChart2 className="h-5 w-5 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                    {poll.question}
                </h3>
                
                <div className="space-y-4">
                  {poll.options.map((option) => {
                    const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                    return (
                        <div key={option.id} className="relative">
                            <div className="flex justify-between items-center text-sm font-medium mb-1">
                                <span className="text-gray-700 dark:text-gray-300">{option.option_text}</span>
                                <span className="text-gray-500 dark:text-gray-400">{percentage}% ({option.votes})</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <button
                                onClick={() => voteMutation.mutate({ pollId: poll.id, optionId: option.id })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Click to vote"
                                disabled={voteMutation.isPending}
                            />
                        </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-right">
                    Total Votes: {poll.totalVotes}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
