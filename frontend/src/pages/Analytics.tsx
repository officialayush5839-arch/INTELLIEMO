import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Target,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { getAnalyticsSummary, getConfidenceDistribution } from '../api/client';
import { EMOTION_COLORS, formatConfidence, formatNumber } from '../utils';

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
      color: EMOTION_COLORS[emotion] || '#D1D5DB',
    }));

  const confidenceData = confidence
    ? Object.entries(confidence).map(([range, count]) => ({
        range,
        count: count as number,
      }))
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Analytics</h1>
        <p className="text-sm text-text-secondary mt-1">
          Overview of all emotion analysis data.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-sm text-text-secondary">Total Analyses</span>
          </div>
          <div className="text-3xl font-bold text-text">{formatNumber(summary?.total_analyses || 0)}</div>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-success" />
            <span className="text-sm text-text-secondary">Average Confidence</span>
          </div>
          <div className="text-3xl font-bold text-text">{formatConfidence(summary?.average_confidence || 0)}</div>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-warning" />
            <span className="text-sm text-text-secondary">Most Detected</span>
          </div>
          <div className="text-3xl font-bold text-text capitalize">{summary?.most_frequent_emotion || 'N/A'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Distribution */}
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="font-semibold text-text mb-4">Emotion Distribution</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-56 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="capitalize text-text-secondary">{entry.name}</span>
                    <span className="ml-auto font-medium text-text">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-sm text-text-secondary">
              No distribution data yet.
            </div>
          )}
        </div>

        {/* Confidence Distribution */}
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="font-semibold text-text mb-4">Confidence Distribution</h3>
          {confidenceData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-sm text-text-secondary">
              No confidence data yet.
            </div>
          )}
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="font-semibold text-text mb-4">Analysis Volume Over Time</h3>
        {summary?.daily_counts && summary.daily_counts.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.daily_counts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Analyses" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-sm text-text-secondary">
            No trend data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
