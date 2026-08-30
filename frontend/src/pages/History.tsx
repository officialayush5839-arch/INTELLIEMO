import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getHistory, deleteAnalysis, clearHistory } from '../api/client';
import {  formatConfidence, formatDate } from '../utils';

const EMOTIONS = ['joy', 'sadness', 'anger', 'fear', 'love', 'surprise', 'neutral'];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest_confidence', label: 'Highest Confidence' },
  { value: 'lowest_confidence', label: 'Lowest Confidence' },
];

export default function History() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['history', search, emotionFilter, sortBy, page],
    queryFn: () =>
      getHistory({
        skip: page * limit,
        limit,
        search: search || undefined,
        emotion: emotionFilter || undefined,
        sort_by: sortBy,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  });

  const clearMutation = useMutation({
    mutationFn: clearHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">History</h1>
          <p className="text-sm text-text-secondary mt-1">
            {data?.total || 0} analyses recorded
          </p>
        </div>
        {data && data.total > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all history?')) clearMutation.mutate();
            }}
            className="px-3 py-1.5 text-xs text-danger border border-danger/20 rounded-lg hover:bg-danger/5 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search text..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={emotionFilter}
            onChange={(e) => { setEmotionFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-border rounded-lg text-sm text-text-secondary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All emotions</option>
            {EMOTIONS.map((e) => (
              <option key={e} value={e} className="capitalize">{e}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm text-text-secondary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-text-secondary">Loading...</div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary bg-gray-50/50">
                    <th className="px-4 py-3 font-medium">Text</th>
                    <th className="px-4 py-3 font-medium">Emotion</th>
                    <th className="px-4 py-3 font-medium">Confidence</th>
                    <th className="px-4 py-3 font-medium">Words</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 max-w-xs">
                        <div className="truncate text-text">{item.text}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-primary/5 text-primary">
                          {item.dominant_emotion}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{formatConfidence(item.confidence)}</td>
                      <td className="px-4 py-3 text-text-secondary">{item.word_count}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="p-1.5 text-text-secondary hover:text-danger transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-text-secondary">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <Clock className="w-8 h-8 text-text-secondary/30 mx-auto mb-3" />
            <p className="text-sm text-text-secondary">No analyses yet.</p>
            <p className="text-xs text-text-secondary/60 mt-1">
              Analyze your first piece of text to start building your emotion history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
