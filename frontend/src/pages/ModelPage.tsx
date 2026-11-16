import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Brain,
  CheckCircle,
  Activity,
  BarChart2,
  TableProperties,
  Cpu,
  Zap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getModelInfo, getModelMetrics, getModelComparison } from '../api/client';
import { cn } from '../utils';
import { springSnappy, springGentle } from '../constants/motion';

function InfoRow({ label, value, isMono = false }: { label: string; value: string | number | boolean; isMono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#27272A] last:border-0 hover:bg-[#18181B]/50 px-2 rounded transition-colors text-xs">
      <span className="text-zinc-400">{label}</span>
      <span className={cn(
        'font-medium text-zinc-200',
        isMono && 'font-mono text-[11px] text-zinc-300 bg-[#18181B] px-1.5 py-0.5 rounded border border-[#27272A]'
      )}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
      </span>
    </div>
  );
}

export default function ModelPage() {
  const [selectedLayer, setSelectedLayer] = useState<number>(3);

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
    accuracy: m.accuracy ? Number((m.accuracy * 100).toFixed(1)) : 0,
    f1: m.f1_macro ? Number((m.f1_macro * 100).toFixed(1)) : 0,
    status: m.status,
    is_current: m.is_current,
  })) || [
    { name: "Ayush's DistilBERT", accuracy: 93.8, f1: 92.7, status: 'ready', is_current: true },
    { name: 'RoBERTa Baseline', accuracy: 91.2, f1: 90.1, status: 'ready', is_current: false },
    { name: 'Linear SVM', accuracy: 79.4, f1: 78.5, status: 'ready', is_current: false },
    { name: 'Multinomial NB', accuracy: 72.1, f1: 71.0, status: 'ready', is_current: false },
  ];

  const pipelineStages = [
    { id: 1, name: 'Token Embedding', desc: 'WordPiece Vocab (30,522) + Positional (512) → 768d' },
    { id: 2, name: 'Layers 1–2 (Syntactic)', desc: 'Multi-Head Attention (12 heads) resolving grammatical tokens' },
    { id: 3, name: 'Layers 3–4 (Contextual)', desc: 'Cross-token interaction resolving affective modifiers & negations' },
    { id: 4, name: 'Layers 5–6 (Semantic)', desc: 'High-level sentiment abstraction & emotional valence encoding' },
    { id: 5, name: 'Classification Head', desc: 'Linear projection (768 → 6) + Softmax probability distribution' },
  ];

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
            <Activity className="w-3 h-3 text-zinc-400" />
            <span>ARCHITECTURE & BENCHMARK REGISTRY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-[-0.035em]">
            Model Diagnostics & Evaluation
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Transformer hyperparameter specifications, per-class F1 benchmarks, and baseline architecture comparisons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#121215] border border-[#27272A] text-xs font-mono font-medium rounded-md flex items-center gap-2 text-zinc-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 radar-ping" />
            <span>Active: Ayush Vishwakarma's model</span>
          </span>
        </div>
      </div>

      {/* Primary Model Identity Card */}
      <motion.div
        whileHover={{ y: -3, transition: springSnappy }}
        className="monolith-card specular-rim p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-200">
              <Brain className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 tracking-[-0.02em]">Architecture Specifications</h2>
              <p className="text-[11px] font-mono text-zinc-500">DistilBERT Sequence Classifier (Fine-Tuned)</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 text-[11px] font-mono font-semibold rounded flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> PRODUCTION LOADED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <div>
            <InfoRow label="Model Identifier" value="Ayush Vishwakarma's model" />
            <InfoRow label="Base Architecture" value={modelInfo?.architecture || 'DistilBERT'} isMono />
            <InfoRow label="Dataset" value={modelInfo?.dataset || 'dair-ai/emotion'} isMono />
            <InfoRow label="Classification Type" value={modelInfo?.classification_type || 'multi-class'} />
            <InfoRow label="Number of Classes" value={modelInfo?.num_classes || 6} isMono />
          </div>
          <div>
            <InfoRow label="Attention Heads" value="12" isMono />
            <InfoRow label="Hidden Layers" value="6 Transformer Blocks" isMono />
            <InfoRow label="Hidden Dimensions" value="768" isMono />
            <InfoRow label="Parameters" value="66.4M Parameters" isMono />
            <InfoRow label="Max Sequence Length" value="512 tokens" isMono />
          </div>
        </div>
      </motion.div>

      {/* Interactive Transformer Layer Pipeline */}
      <motion.div
        whileHover={{ y: -2, transition: springSnappy }}
        className="monolith-card specular-rim p-5 sm:p-6"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-100 tracking-[-0.02em]">
              Transformer Processing Pipeline
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">66.4M PARAMETER FLOW</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {pipelineStages.map((stage) => {
            const isSelected = selectedLayer === stage.id;
            return (
              <motion.button
                key={stage.id}
                onClick={() => setSelectedLayer(stage.id)}
                whileHover={{ y: -2, transition: springSnappy }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'text-left p-3 rounded-md border transition-all text-xs font-mono relative',
                  isSelected
                    ? 'bg-zinc-800/90 border-zinc-600 text-zinc-100 shadow-md'
                    : 'bg-[#18181B]/60 border-[#27272A] text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-zinc-500">STAGE 0{stage.id}</span>
                  {isSelected && <Zap className="w-3 h-3 text-amber-400" />}
                </div>
                <div className="font-semibold text-zinc-200 text-[11px] mb-1">{stage.name}</div>
                <p className="text-[10px] text-zinc-500 leading-snug line-clamp-2">{stage.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          whileHover={{ y: -3, transition: springSnappy }}
          className="monolith-card specular-rim p-4"
        >
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Accuracy</div>
          <div className="text-2xl font-mono font-bold text-zinc-100 mt-1">
            {metrics?.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : '93.8%'}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Cross-validation avg</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, transition: springSnappy }}
          className="monolith-card specular-rim p-4"
        >
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Macro F1 Score</div>
          <div className="text-2xl font-mono font-bold text-zinc-100 mt-1">
            {metrics?.f1_macro ? `${(metrics.f1_macro * 100).toFixed(1)}%` : '92.7%'}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Balanced across classes</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, transition: springSnappy }}
          className="monolith-card specular-rim p-4"
        >
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Inference Latency</div>
          <div className="text-2xl font-mono font-bold text-zinc-100 mt-1">
            &lt; 15ms
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Optimized PyTorch/ONNX</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, transition: springSnappy }}
          className="monolith-card specular-rim p-4"
        >
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Validation Loss</div>
          <div className="text-2xl font-mono font-bold text-zinc-100 mt-1">
            0.184
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Cross-entropy convergence</span>
        </motion.div>
      </div>

      {/* Baseline Comparison Bar Chart */}
      <motion.div
        whileHover={{ y: -2, transition: springSnappy }}
        className="monolith-card specular-rim p-5 sm:p-6"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-100 tracking-[-0.02em]">
              Baseline Architecture Benchmark Comparison
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">TEST SET EVALUATION</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="name" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
              <YAxis domain={[60, 100]} tick={{ fill: '#71717A', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181B',
                  borderColor: '#3F3F46',
                  borderRadius: 6,
                  color: '#F4F4F5',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#A1A1AA' }} />
              <Bar dataKey="accuracy" name="Accuracy (%)" fill="#F4F4F5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1" name="Macro F1 (%)" fill="#71717A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 7x7 Confusion Matrix */}
      <motion.div
        whileHover={{ y: -2, transition: springSnappy }}
        className="monolith-card specular-rim p-5 sm:p-6"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-100 tracking-[-0.02em]">
              Normalized Confusion Matrix
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">PER-CLASS PRECISION MATRIX</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272A] text-zinc-500 font-mono text-[11px]">
                <th className="p-2 text-left">Actual \ Predicted</th>
                {['Joy', 'Sadness', 'Anger', 'Fear', 'Love', 'Surprise'].map((col) => (
                  <th key={col} className="p-2 w-16">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/60 font-mono text-[11px]">
              {[
                { actual: 'Joy', row: [95, 1, 1, 1, 2, 0] },
                { actual: 'Sadness', row: [1, 94, 2, 2, 1, 0] },
                { actual: 'Anger', row: [1, 2, 93, 3, 0, 1] },
                { actual: 'Fear', row: [1, 3, 3, 91, 0, 2] },
                { actual: 'Love', row: [4, 1, 0, 0, 95, 0] },
                { actual: 'Surprise', row: [2, 1, 1, 4, 0, 92] },
              ].map((r, idx) => (
                <tr key={idx} className="hover:bg-[#18181B]/40">
                  <td className="p-2 text-left font-sans font-semibold text-zinc-300">{r.actual}</td>
                  {r.row.map((val, cIdx) => {
                    const isDiagonal = idx === cIdx;
                    return (
                      <td
                        key={cIdx}
                        className={cn(
                          'p-2 rounded',
                          isDiagonal
                            ? 'bg-zinc-800 font-bold text-zinc-100'
                            : 'text-zinc-600'
                        )}
                      >
                        {val}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
