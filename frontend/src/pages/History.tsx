import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getHistory, deleteAnalysis, clearHistory } from '../api/client';
import { formatConfidence, formatDate, getEmotionColor } from '../utils';
import { springSnappy, springGentle } from '../constants/motion';

const EMOTIONS = ['joy', 'sadness', 'anger', 'fear', 'love', 'surprise', 'neutral'];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest_confidence', label: 'Highest Certainty' },
  { value: 'lowest_confidence', label: 'Lowest Certainty' },
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono mb-2">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>AUDIT TRAIL & HISTORICAL LOGS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-[-0.035em]">
            Inference History & Logs
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Audit, inspect, and filter historical inference payloads and classification predictions.
          </p>
        </div>

        {data && data.total > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete all historical analysis records?')) {
                clearMutation.mutate();
              }
            }}
            className="tactile-btn px-3 py-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-900/60 rounded cursor-pointer"
          >
            Clear All History
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <motion.div
        whileHover={{ y: -2, transition: springSnappy }}
        className="monolith-card specular-rim p-3 sm:p-4"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search historical text..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-sans"
              />
            </div>
          </div>

          <select
            value={emotionFilter}
            onChange={(e) => { setEmotionFilter(e.target.value); setPage(0); }}
            className="bg-[#18181B] border border-[#27272A] rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            <option value="">All Emotions</option>
            {EMOTIONS.map((e) => (
              <option key={e} value={e}>
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#18181B] border border-[#27272A] rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Table Card */}
      <motion.div
        whileHover={{ y: -2, transition: springSnappy }}
        className="monolith-card specular-rim overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272A] text-zinc-500 font-mono text-[11px] bg-[#18181B]/40">
                <th className="py-2.5 px-4">Payload Text</th>
                <th className="py-2.5 px-4 w-32">Classification</th>
                <th className="py-2.5 px-4 w-24 text-right">Confidence</th>
                <th className="py-2.5 px-4 w-36 text-right">Timestamp</th>
                <th className="py-2.5 px-4 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-zinc-500 font-mono">
                    Loading audit trail...
                  </td>
                </tr>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((item) => {
                  const color = getEmotionColor(item.dominant_emotion);
                  return (
                    <tr key={item.id} className="hover:bg-[#18181B]/60 transition-colors">
                      <td className="py-3 px-4 text-zinc-200 font-sans max-w-md truncate" title={item.text}>
                        {item.text}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border"
                          style={{
                            backgroundColor: `${color}15`,
                            borderColor: `${color}35`,
                            color: color,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                          <span className="capitalize">{item.dominant_emotion}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-200">
                        {formatConfidence(item.confidence)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-500 text-[11px]">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="text-zinc-600 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-zinc-500 font-mono">
                    No matching history records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#27272A] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>
              Page {page + 1} of {totalPages} ({data?.total} records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="tactile-btn p-1.5 rounded bg-[#18181B] border border-[#27272A] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="tactile-btn p-1.5 rounded bg-[#18181B] border border-[#27272A] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
