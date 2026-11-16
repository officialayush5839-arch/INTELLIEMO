import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Target,
  Activity,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { getAnalyticsSummary, getConfidenceDistribution } from '../api/client';
import { EMOTION_COLORS, formatConfidence, formatNumber } from '../utils';
import { springSnappy, springGentle } from '../constants/motion';

export default function Analytics() {
  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: getAnalyticsSummary,
  });

  const { data: confidence } = useQuery({
    queryKey: ['confidence-dist'],
    queryFn: getConfidenceDistribution,
  });

  const distribution = summary?.emotion_distribution || {};
  const pieData = Object.entries(distribution)
    .filter(([_, count]) => count > 0)
    .map(([emotion, count]) => ({
      name: emotion,
      value: count,
      color: EMOTION_COLORS[emotion] || '#94A3B8',
    }));

  const confidenceData = confidence
    ? Object.entries(confidence).map(([range, count]) => ({
        range,
        count: count as number,
      }))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono mb-2">
            <Activity className="w-3 h-3 text-zinc-400" />
            <span>AGGREGATE TELEMETRY ENGINE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-[-0.035em]">
            Analytics & Emotion Dispersion
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Historical aggregation of inference requests, sentiment dispersion clusters, and model certainty bins.
          </p>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <motion.div
          whileHover={{ y: -4, transition: springSnappy }}
          className="monolith-card specular-rim p-4 sm:p-5 cursor-default transition-shadow hover:shadow-lg hover:shadow-black/40"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Total Inferences</span>
            <div className="w-7 h-7 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-400">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-100 tracking-tight">
            {formatNumber(summary?.total_analyses || 0)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">Recorded inference transactions</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, transition: springSnappy }}
          className="monolith-card specular-rim p-4 sm:p-5 cursor-default transition-shadow hover:shadow-lg hover:shadow-black/40"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Mean Confidence</span>
            <div className="w-7 h-7 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-400">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-100 tracking-tight">
            {formatConfidence(summary?.average_confidence || 0)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">Model Certainty Index</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, transition: springSnappy }}
          className="monolith-card specular-rim p-4 sm:p-5 cursor-default transition-shadow hover:shadow-lg hover:shadow-black/40"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Dominant Mode</span>
            <div className="w-7 h-7 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 tracking-tight capitalize">
            {summary?.most_frequent_emotion || 'N/A'}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">Highest recurring class</div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Emotion Distribution Donut */}
        <motion.div
          whileHover={{ y: -3, transition: springSnappy }}
          className="monolith-card specular-rim p-5 sm:p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#27272A]">
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
              Emotion Distribution
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">AGGREGATE</span>
          </div>

          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
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
                No telemetry recorded yet
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#27272A]">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 capitalize truncate">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
                <span className="text-zinc-200 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Confidence Distribution Histogram */}
        <motion.div
          whileHover={{ y: -3, transition: springSnappy }}
          className="monolith-card specular-rim p-5 sm:p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#27272A]">
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
              Certainty Bins (Confidence Histogram)
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">PROBABILITY DENSITY</span>
          </div>

          <div className="h-64 w-full">
            {confidenceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="range" tick={{ fill: '#A1A1AA', fontSize: 10 }} />
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
                No confidence distribution data
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono text-zinc-500 pt-3 border-t border-[#27272A]">
            Binned by decimal confidence intervals from 0.0 to 1.0.
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
