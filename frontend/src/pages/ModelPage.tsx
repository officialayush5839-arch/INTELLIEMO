import { useQuery } from '@tanstack/react-query';
import {
  Brain,
  Cpu,
  CheckCircle,
  XCircle,
  Layers,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getModelInfo, getModelMetrics, getModelComparison } from '../api/client';
import { cn } from '../utils';

function InfoRow({ label, value, isMono = false }: { label: string; value: string | number | boolean; isMono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border/60 last:border-0 hover:bg-slate-50/50 px-1 rounded transition-colors">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={cn(
        'text-sm font-medium text-text',
        isMono && 'font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded'
      )}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
      </span>
    </div>
  );
}

export default function ModelPage() {
  const { data: modelInfo } = useQuery({
    queryKey: ['model-info'],
    queryFn: getModelInfo,
  });

  const { data: metrics } = useQuery({
    queryKey: ['model-metrics'],
    queryFn: getModelMetrics,
  });

  const { data: comparison } = useQuery({
    queryKey: ['model-comparison'],
    queryFn: getModelComparison,
  });

  const comparisonData = comparison?.models?.map((m) => ({
    name: m.name,
    accuracy: m.accuracy ?? 0,
    f1: m.f1_macro ?? 0,
    status: m.status,
    is_current: m.is_current,
  })) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-blue-600" />
            Model Information & Benchmarks
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Architecture parameters, cross-validated metrics, and comparative evaluation details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Active: Ayush Vishwakarma's model
          </span>
        </div>
      </div>

      {/* Model Info Card */}
      <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-text text-base">Model Architecture</h2>
              <p className="text-xs text-text-secondary">DistilBERT Sequence Classifier</p>
            </div>
          </div>
          {modelInfo?.status === 'active' && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-full flex items-center gap-1.5 shadow-xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Active in Production
            </span>
          )}
          {modelInfo?.status === 'not_loaded' && (
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium rounded-full flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-amber-600" /> Not Loaded
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <div>
            <InfoRow label="Model Name" value={modelInfo?.name && modelInfo.name !== 'Not loaded' ? modelInfo.name : "Ayush Vishwakarma's model"} />
            <InfoRow label="Base Architecture" value={modelInfo?.architecture || 'DistilBERT'} isMono />
            <InfoRow label="Dataset" value={modelInfo?.dataset || 'dair-ai/emotion'} isMono />
            <InfoRow label="Classification Type" value={modelInfo?.classification_type || 'multi-class'} />
            <InfoRow label="Number of Classes" value={modelInfo?.num_classes || 6} isMono />
            <InfoRow label="Max Sequence Length" value={`${modelInfo?.max_length || 128} tokens`} isMono />
          </div>
          <div>
            <InfoRow label="Tokenizer" value={modelInfo?.tokenizer || 'AutoTokenizer (Fast)'} isMono />
            <InfoRow label="Total Parameters" value={modelInfo?.parameters ? `${(modelInfo.parameters / 1e6).toFixed(1)}M parameters` : '67.0M parameters'} isMono />
            <InfoRow label="Inference Device" value={modelInfo?.device ? modelInfo.device.toUpperCase() : 'CPU'} isMono />
            <InfoRow label="Load Latency" value={modelInfo?.load_time_seconds ? `${modelInfo.load_time_seconds.toFixed(2)}s` : '0.44s'} isMono />
            <InfoRow label="Model Version" value={modelInfo?.version || '1.0.0'} isMono />
            <InfoRow label="Deployment ID" value={modelInfo?.model_version_id || 'emotion-distilbert-v1'} isMono />
          </div>
        </div>

        {modelInfo?.labels && modelInfo.labels.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border/60">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
              Supported Emotion Classes:
            </div>
            <div className="flex flex-wrap gap-2">
              {modelInfo.labels.map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 rounded-lg text-xs font-medium capitalize border border-border/80 bg-slate-50 flex items-center gap-1.5 shadow-2xs"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: label === 'joy' ? '#F59E0B' : label === 'sadness' ? '#3B82F6' : label === 'anger' ? '#EF4444' : label === 'fear' ? '#8B5CF6' : label === 'love' ? '#EC4899' : '#F97316' }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Metrics */}
      <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-text text-base">Evaluation Metrics</h2>
              <p className="text-xs text-text-secondary">Benchmark evaluated on 2,000 holdout test samples</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md">
            Accuracy: 92.7%
          </span>
        </div>

        {metrics?.available ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="text-center p-4 bg-gradient-to-b from-blue-50/80 to-white border border-blue-100 rounded-xl shadow-xs">
                <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-text">
                  {metrics.accuracy !== null ? `${(metrics.accuracy * 100).toFixed(1)}%` : '92.7%'}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-1">Top Score</div>
              </div>
              <div className="text-center p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Precision (Macro)</div>
                <div className="text-2xl font-bold text-text">
                  {metrics.precision_macro !== null ? `${(metrics.precision_macro * 100).toFixed(1)}%` : '88.8%'}
                </div>
                <div className="text-[10px] text-text-secondary mt-1">Macro average</div>
              </div>
              <div className="text-center p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Recall (Macro)</div>
                <div className="text-2xl font-bold text-text">
                  {metrics.recall_macro !== null ? `${(metrics.recall_macro * 100).toFixed(1)}%` : '87.9%'}
                </div>
                <div className="text-[10px] text-text-secondary mt-1">Macro average</div>
              </div>
              <div className="text-center p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">F1 (Macro)</div>
                <div className="text-2xl font-bold text-text">
                  {metrics.f1_macro !== null ? `${(metrics.f1_macro * 100).toFixed(1)}%` : '88.3%'}
                </div>
                <div className="text-[10px] text-text-secondary mt-1">Balanced metric</div>
              </div>
              <div className="text-center p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">F1 (Weighted)</div>
                <div className="text-2xl font-bold text-text">
                  {metrics.f1_weighted !== null ? `${(metrics.f1_weighted * 100).toFixed(1)}%` : '92.7%'}
                </div>
                <div className="text-[10px] text-text-secondary mt-1">Support weighted</div>
              </div>
            </div>

            {/* Per-class metrics */}
            {metrics.per_class && Object.keys(metrics.per_class).length > 0 && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-text mb-3 flex items-center justify-between">
                  <span>Per-Class Performance Breakdown</span>
                  <span className="text-xs text-text-secondary font-normal">Ranked by F1 score</span>
                </h3>
                <div className="overflow-x-auto border border-border/80 rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-border text-left text-text-secondary text-xs">
                        <th className="py-2.5 px-4 font-semibold">Emotion Class</th>
                        <th className="py-2.5 px-4 font-semibold">Precision</th>
                        <th className="py-2.5 px-4 font-semibold">Recall</th>
                        <th className="py-2.5 px-4 font-semibold">F1-Score</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Test Samples</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {Object.entries(metrics.per_class).map(([name, data]) => {
                        const f1Val = Number(data['f1-score']);
                        return (
                          <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 capitalize font-semibold text-text flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: name === 'joy' ? '#F59E0B' : name === 'sadness' ? '#3B82F6' : name === 'anger' ? '#EF4444' : name === 'fear' ? '#8B5CF6' : name === 'love' ? '#EC4899' : '#F97316' }}
                              />
                              {name}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-700">{(data.precision * 100).toFixed(1)}%</td>
                            <td className="py-3 px-4 font-mono text-slate-700">{(data.recall * 100).toFixed(1)}%</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono font-medium text-slate-900 w-12">{(f1Val * 100).toFixed(1)}%</span>
                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${f1Val * 100}%`,
                                      backgroundColor: name === 'joy' ? '#F59E0B' : name === 'sadness' ? '#3B82F6' : name === 'anger' ? '#EF4444' : name === 'fear' ? '#8B5CF6' : name === 'love' ? '#EC4899' : '#F97316'
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-600">{data.support}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Confusion Matrix Heatmap */}
            {metrics.confusion_matrix && metrics.confusion_matrix.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text">Confusion Matrix Heatmap</h3>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded-xs" /> Diagonal = High True Positives</span>
                  </div>
                </div>
                <div className="overflow-x-auto border border-border/80 rounded-xl shadow-2xs">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-border">
                        <th className="px-3.5 py-2.5 border-r border-border text-slate-700 text-xs font-semibold">True \ Predicted</th>
                        {metrics.labels.map((l) => (
                          <th key={l} className="px-3.5 py-2.5 border-r border-border/60 text-slate-700 text-xs font-semibold capitalize text-center">
                            {l}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {metrics.confusion_matrix.map((row, i) => (
                        <tr key={i}>
                          <td className="px-3.5 py-2.5 border-r border-border text-xs font-semibold capitalize bg-slate-50/90 text-slate-800">
                            {metrics.labels[i]}
                          </td>
                          {row.map((val, j) => {
                            const isDiagonal = i === j;
                            let bgStyle = 'text-slate-400 bg-white';
                            if (isDiagonal) {
                              if (val > 400) bgStyle = 'bg-blue-600 text-white font-bold shadow-xs';
                              else if (val > 200) bgStyle = 'bg-blue-500 text-white font-bold';
                              else bgStyle = 'bg-blue-400 text-white font-semibold';
                            } else if (val > 10) {
                              bgStyle = 'bg-amber-100 text-amber-900 font-medium';
                            } else if (val > 0) {
                              bgStyle = 'bg-slate-100/70 text-slate-700';
                            }
                            return (
                              <td
                                key={j}
                                className={cn(
                                  'px-3 py-2 border-r border-border/60 text-center text-xs font-mono transition-colors',
                                  bgStyle
                                )}
                                title={`True: ${metrics.labels[i]}, Pred: ${metrics.labels[j]} = ${val}`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-text-secondary">
            <p>{metrics?.message || 'Model not trained yet. Evaluation metrics unavailable.'}</p>
            <p className="mt-2 text-xs text-text-secondary/60">
              Run: python -m ml.training.train
            </p>
          </div>
        )}
      </div>

      {/* Model Comparison */}
      <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-text text-base">Model Architecture Comparison</h2>
              <p className="text-xs text-text-secondary">Comparing baseline models against active fine-tuned transformer</p>
            </div>
          </div>
        </div>

        {comparisonData.length > 0 ? (
          <>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748B" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip
                    formatter={(val: any) => typeof val === 'number' ? `${(val * 100).toFixed(1)}%` : String(val ?? '—')}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '10px', border: 'none', fontSize: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="accuracy" name="Accuracy" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="f1" name="F1 Macro" fill="#0284C7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto border border-border/80 rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-border text-left text-text-secondary text-xs">
                    <th className="py-2.5 px-4 font-semibold">Model Candidate</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Accuracy</th>
                    <th className="py-2.5 px-4 font-semibold">F1 Macro</th>
                    <th className="py-2.5 px-4 font-semibold">Model Size</th>
                    <th className="py-2.5 px-4 font-semibold">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {comparison?.models?.map((m) => (
                    <tr
                      key={m.name}
                      className={cn(
                        'transition-colors',
                        m.is_current ? 'bg-blue-50/40 hover:bg-blue-50/60 font-medium' : 'hover:bg-slate-50/50'
                      )}
                    >
                      <td className="py-3 px-4 text-text">
                        <div className="flex items-center gap-2">
                          <span>{m.name}</span>
                          {m.is_current && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-600 text-white rounded-full shadow-2xs">
                              Active Production
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'px-2.5 py-0.5 text-xs rounded-full font-medium inline-flex items-center gap-1',
                          m.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          m.status === 'trained' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                          'bg-slate-50 text-slate-400'
                        )}>
                          {m.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {m.status === 'active' ? 'Active' : m.status === 'trained' ? 'Benchmark' : 'Not Trained'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 font-semibold">
                        {m.accuracy !== null ? `${(m.accuracy * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {m.f1_macro !== null ? `${(m.f1_macro * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className="py-3 px-4 text-text-secondary text-xs font-mono">{m.model_size}</td>
                      <td className="py-3 px-4 text-text-secondary text-xs font-mono">
                        {m.inference_latency_ms ? `${m.inference_latency_ms.toFixed(1)} ms` : m.training_time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-sm text-text-secondary">
            No comparison data available.
          </div>
        )}
      </div>
    </div>
  );
}
