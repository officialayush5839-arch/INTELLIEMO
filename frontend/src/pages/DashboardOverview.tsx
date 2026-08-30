import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  Target,
  Brain,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { getAnalyticsSummary, getHistory } from '../api/client';
import { EMOTION_COLORS, formatConfidence, formatNumber, getEmotionColor, cn } from '../utils';
import type { AnalyticsSummary } from '../types';

function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = 'text-blue-600',
  bgColor = 'bg-blue-50',
  badgeText,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
  bgColor?: string;
  badgeText?: string;
}) {
  return (
    <div className="bg-white border border-border/80 rounded-2xl p-5 shadow-xs card-hover flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</span>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 shadow-2xs', bgColor, color)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-text tracking-tight">{value}</div>
      </div>
      {(subtitle || badgeText) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {badgeText && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardOverview() {
  const { data: summary, isLoading: summaryLoading } = useQuery<AnalyticsSummary>({
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
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-blue-200 mb-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Fine-tuned DistilBERT • 92.7% Accuracy
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Text Emotion Intelligence Engine
          </h1>
          <p className="text-sm text-blue-100/80 leading-relaxed mb-6">
            Multi-class emotion detection with token-level explainability, discourse shift decomposition, and offline inference capabilities.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard/analyze"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-900/40 transition-all"
            >
              <Brain className="w-4 h-4" />
              Analyze New Text
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/dashboard/model"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition-all"
            >
              Model Benchmarks
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Analyses"
          value={summaryLoading ? '—' : formatNumber(summary?.total_analyses || 0)}
          subtitle="Processed sentences"
          icon={BarChart3}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KPICard
          label="Average Confidence"
          value={summaryLoading ? '—' : formatConfidence(summary?.average_confidence || 0)}
          subtitle="Model certainty score"
          icon={Target}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          badgeText="High Reliability"
        />
        <KPICard
          label="Most Detected"
          value={summaryLoading ? '—' : (summary?.most_frequent_emotion || 'N/A')}
          subtitle="Dominant emotion"
          icon={TrendingUp}
          color="text-amber-600"
          bgColor="bg-amber-50"
          badgeText="Top Category"
        />
        <KPICard
          label="Active Model"
          value="Ayush Vishwakarma"
          subtitle="DistilBERT 67M params"
          icon={Brain}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
          badgeText="92.7% Acc"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Distribution */}
        <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-semibold text-text text-base">Emotion Distribution</h3>
            <span className="text-xs text-text-secondary">Across all user analyses</span>
          </div>
          {pieData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-48 h-48 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} samples`, 'Count']}
                      contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '10px', border: 'none', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="capitalize font-medium text-text">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">{entry.pct}%</span>
                      <span className="font-bold text-slate-800 font-mono w-8 text-right">{entry.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-text-secondary">
              No data yet. Analyze some text to see distribution.
            </div>
          )}
        </div>

        {/* Emotion Trend */}
        <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-semibold text-text text-base">Analysis Volume Over Time</h3>
            <span className="text-xs text-text-secondary">Daily request throughput</span>
          </div>
          {dailyData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '10px', border: 'none', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-text-secondary">
              No trend data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-text text-base">Recent Analyses</h3>
            <p className="text-xs text-text-secondary">Latest text emotion extractions</p>
          </div>
          <Link
            to="/dashboard/history"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/70 transition-colors"
          >
            View all history <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {history && history.items.length > 0 ? (
          <div className="overflow-x-auto border border-border/80 rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-left text-text-secondary text-xs">
                  <th className="py-2.5 px-4 font-semibold">Analyzed Text</th>
                  <th className="py-2.5 px-4 font-semibold">Detected Emotion</th>
                  <th className="py-2.5 px-4 font-semibold">Confidence</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {history.items.map((item) => {
                  const emotionColor = getEmotionColor(item.dominant_emotion);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 max-w-sm truncate text-text font-medium" title={item.text}>
                        {item.text}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize inline-flex items-center gap-1.5 shadow-2xs"
                          style={{
                            backgroundColor: `${emotionColor}18`,
                            color: emotionColor,
                            border: `1px solid ${emotionColor}35`,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: emotionColor }} />
                          {item.dominant_emotion}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {formatConfidence(item.confidence)}
                      </td>
                      <td className="py-3 px-4 text-text-secondary text-xs font-mono text-right">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(item.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-text-secondary">
            <Clock className="w-8 h-8 mx-auto mb-2 text-text-secondary/40" />
            <p className="font-medium text-slate-700">No analyses yet.</p>
            <Link to="/dashboard/analyze" className="text-blue-600 hover:underline mt-1.5 inline-block text-xs font-semibold">
              Analyze your first text →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
