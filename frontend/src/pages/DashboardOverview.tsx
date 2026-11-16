import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Target,
  Brain,
  TrendingUp,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { getAnalyticsSummary, getHistory } from '../api/client';
import { EMOTION_COLORS, formatConfidence, formatNumber, getEmotionColor } from '../utils';
import { springSnappy, springGentle } from '../constants/motion';
import type { AnalyticsSummary } from '../types';

function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  badgeText,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  badgeText?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: springSnappy }}
      className="monolith-card specular-rim p-4 sm:p-5 flex flex-col justify-between cursor-default transition-shadow hover:shadow-lg hover:shadow-black/40"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
          <div className="w-7 h-7 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-400">
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">{value}</div>
      </div>
      {(subtitle || badgeText) && (
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#27272A] text-[11px]">
          {subtitle && <span className="text-zinc-500 font-mono">{subtitle}</span>}
          {badgeText && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardOverview() {
  const { data: summary } = useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary'],
    queryFn: getAnalyticsSummary,
  });

  const { data: history } = useQuery({
    queryKey: ['history-recent'],
    queryFn: () => getHistory({ limit: 5, sort_by: 'latest' }),
  });

  const distribution = summary?.emotion_distribution || {};
  const totalInDistribution = Object.values(distribution).reduce((acc, c) => acc + c, 0);
  const pieData = Object.entries(distribution)
    .filter(([_, count]) => count > 0)
    .map(([emotion, count]) => ({
      name: emotion,
      value: count,
      color: EMOTION_COLORS[emotion] || '#94A3B8',
      pct: totalInDistribution > 0 ? ((count / totalInDistribution) * 100).toFixed(0) : '0',
    }));

  const dailyData = summary?.daily_counts || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
      className="space-y-6"
    >
      {/* Top Banner Deck */}
      <motion.div
        whileHover={{ y: -2, transition: springSnappy }}
        className="monolith-card specular-rim p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#18181B] border border-zinc-700/80 text-zinc-300 text-[11px] font-mono mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radar-ping" />
            <span>Ayush Vishwakarma's model • 92.7% Macro F1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.035em] text-zinc-100">
            Emotion Intelligence Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Real-time inference telemetry, historical discourse distributions, and deep language classification metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/dashboard/analyze"
            className="tactile-btn inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-md shadow-xs border border-zinc-200"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Open Console</span>
          </Link>
          <Link
            to="/dashboard/batch"
            className="tactile-btn inline-flex items-center gap-2 px-3.5 py-2 bg-[#18181B] hover:bg-[#202024] border border-[#27272A] text-zinc-300 font-semibold text-xs rounded-md"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Batch Upload</span>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Total Inferences"
          value={formatNumber(summary?.total_analyses ?? 0)}
          subtitle="All recorded events"
          icon={Activity}
          badgeText="PERSISTED"
        />
        <KPICard
          label="Mean Confidence"
          value={formatConfidence(summary?.average_confidence ?? 0)}
          subtitle="Model certainty"
          icon={Target}
          badgeText="92.7% F1"
        />
        <KPICard
          label="Dominant Cluster"
          value={summary?.dominant_emotion || 'Joy'}
          subtitle="Most frequent label"
          icon={Brain}
          badgeText="PRIMARY"
        />
        <KPICard
          label="Mean Latency"
          value="< 15ms"
          subtitle="CPU / GPU pipeline"
          icon={Clock}
          badgeText="OPTIMIZED"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Inference Frequency */}
        <motion.div
          whileHover={{ y: -3, transition: springSnappy }}
          className="lg:col-span-7 monolith-card specular-rim p-5 sm:p-6"
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27272A]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
                Inference Velocity by Day
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">PAST 7 DAYS</span>
          </div>

          <div className="h-56 w-full">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="date" tick={{ fill: '#A1A1AA', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#71717A', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      borderColor: '#3F3F46',
                      borderRadius: 6,
                      color: '#F4F4F5',
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="count" fill="#F4F4F5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                No activity recorded yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Emotion Distribution Donut */}
        <motion.div
          whileHover={{ y: -3, transition: springSnappy }}
          className="lg:col-span-5 monolith-card specular-rim p-5 sm:p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#27272A]">
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
              Taxonomy Dispersion
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">CUMULATIVE</span>
          </div>

          <div className="h-44 w-full relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#121215" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      borderColor: '#3F3F46',
                      borderRadius: 6,
                      color: '#F4F4F5',
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                No emotion data
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[#27272A]">
            {pieData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 capitalize truncate">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="text-zinc-200">{item.pct}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent History Table */}
      <motion.div
        whileHover={{ y: -2, transition: springSnappy }}
        className="monolith-card specular-rim p-5 sm:p-6"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#27272A]">
          <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
            Recent Discourse Inferences
          </h3>
          <Link
            to="/dashboard/history"
            className="text-xs font-mono text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272A] text-zinc-500 font-mono text-[11px]">
                <th className="py-2 px-3">Text Payload</th>
                <th className="py-2 px-3 w-32">Classification</th>
                <th className="py-2 px-3 w-24 text-right">Confidence</th>
                <th className="py-2 px-3 w-28 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/60">
              {history?.items && history.items.length > 0 ? (
                history.items.slice(0, 5).map((item) => {
                  const color = getEmotionColor(item.dominant_emotion);
                  return (
                    <tr key={item.id} className="hover:bg-[#18181B]/60 transition-colors">
                      <td className="py-2.5 px-3 text-zinc-200 font-sans max-w-md truncate" title={item.text}>
                        {item.text}
                      </td>
                      <td className="py-2.5 px-3">
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
                      <td className="py-2.5 px-3 text-right font-mono text-zinc-200">
                        {formatConfidence(item.confidence)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-zinc-500 text-[11px]">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-zinc-500 font-mono">
                    No recent events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
