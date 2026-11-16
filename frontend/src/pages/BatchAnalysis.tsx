import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Upload,
  Download,
  Loader2,
  XCircle,
  FileSpreadsheet,
  Search,
  FileDown,
  Layers,
} from 'lucide-react';
import { analyzeBatch } from '../api/client';
import { formatConfidence, getEmotionColor, cn } from '../utils';
import { springSnappy } from '../constants/motion';
import type { BatchJobResult } from '../types';

export default function BatchAnalysis() {
  const [jobResult, setJobResult] = useState<BatchJobResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => analyzeBatch(file),
    onSuccess: (data) => setJobResult(data),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      uploadMutation.mutate(file);
    }
  };

  const downloadSampleCSV = () => {
    const sample = `text\n"I was terrified at first, but our presentation succeeded wonderfully!"\n"This unexpected delivery made my entire week so special!"\n"The continuous delay and lack of support is completely unacceptable."\n"I feel so heartbroken and exhausted from everything."\n"The scheduled quarterly review is set for Monday at 10 AM."`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_emotion_input.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!jobResult) return;
    const headers = ['id', 'text', 'predicted_emotion', 'confidence', 'processing_time_ms'];
    const rows = jobResult.results.map((r) =>
      [r.id, `"${r.text.replace(/"/g, '""')}"`, r.predicted_emotion, r.confidence, r.processing_time_ms].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_emotion_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!jobResult) return;
    const blob = new Blob([JSON.stringify(jobResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_emotion_results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Emotion distribution counts
  const emotionCounts: Record<string, number> = {};
  jobResult?.results.forEach((r) => {
    emotionCounts[r.predicted_emotion] = (emotionCounts[r.predicted_emotion] || 0) + 1;
  });

  const filteredResults = jobResult?.results.filter((r) => {
    const matchesSearch = r.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmotion =
      selectedEmotionFilter === 'all' || r.predicted_emotion.toLowerCase() === selectedEmotionFilter.toLowerCase();
    return matchesSearch && matchesEmotion;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springSnappy}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono mb-2">
            <Layers className="w-3 h-3 text-zinc-400" />
            <span>BULK VECTORIZED INFERENCE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-[-0.035em]">
            Batch Analysis Workspace
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Ingest CSV files up to 100 entries for concurrent multi-class transformer classification.
          </p>
        </div>

        <button
          onClick={downloadSampleCSV}
          className="tactile-btn self-start sm:self-auto px-3 py-1.5 bg-[#121215] hover:bg-[#18181B] border border-[#27272A] text-zinc-300 rounded text-xs font-mono flex items-center gap-2 cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
          <span>Get Sample CSV</span>
        </button>
      </div>

      {/* Upload Dropzone */}
      <motion.div
        whileHover={{ y: -2, transition: springSnappy }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          'monolith-card specular-rim border-dashed p-8 text-center cursor-pointer transition-colors',
          uploadMutation.isPending
            ? 'border-zinc-500 bg-[#18181B]'
            : 'border-[#3F3F46] hover:border-zinc-500 bg-[#121215]'
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-10 h-10 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center mb-3">
            {uploadMutation.isPending ? (
              <Loader2 className="w-5 h-5 text-zinc-300 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-zinc-400" />
            )}
          </div>

          <h3 className="text-sm font-semibold text-zinc-100 tracking-[-0.02em]">
            {uploadMutation.isPending ? 'Processing Batch Data...' : 'Drop CSV file here or click to browse'}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            CSV must include a <code className="font-mono text-zinc-400">text</code> column (maximum 100 records per execution).
          </p>
        </div>
      </motion.div>

      {/* Error Message */}
      {uploadMutation.isError && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-md text-xs text-rose-300 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            {uploadMutation.error instanceof Error ? uploadMutation.error.message : 'Batch processing failed.'}
          </span>
        </div>
      )}

      {/* Job Results Display */}
      {jobResult && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSnappy}
          className="space-y-6"
        >
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="monolith-card p-3.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Records Processed</div>
              <div className="text-xl font-mono font-bold text-zinc-100 mt-1">
                {jobResult.processed} / {jobResult.total_records}
              </div>
            </div>

            <div className="monolith-card p-3.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Successful / Failed</div>
              <div className="text-xl font-mono font-bold text-zinc-100 mt-1">
                <span className="text-emerald-400">{jobResult.successful}</span>
                <span className="text-zinc-600 mx-1">/</span>
                <span className={jobResult.failed > 0 ? 'text-rose-400' : 'text-zinc-500'}>
                  {jobResult.failed}
                </span>
              </div>
            </div>

            <div className="monolith-card p-3.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Mean Confidence</div>
              <div className="text-xl font-mono font-bold text-zinc-100 mt-1">
                {formatConfidence(jobResult.average_confidence)}
              </div>
            </div>

            <div className="monolith-card p-3.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Dominant Cluster</div>
              <div className="text-lg font-bold text-zinc-100 capitalize mt-1 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getEmotionColor(jobResult.most_common_emotion) }}
                />
                {jobResult.most_common_emotion}
              </div>
            </div>
          </div>

          {/* Results Table Section */}
          <div className="monolith-card p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 mb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search records..."
                    className="bg-[#18181B] border border-[#27272A] rounded pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <select
                  value={selectedEmotionFilter}
                  onChange={(e) => setSelectedEmotionFilter(e.target.value)}
                  className="bg-[#18181B] border border-[#27272A] rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 cursor-pointer"
                >
                  <option value="all">All Emotions</option>
                  {Object.keys(emotionCounts).map((emo) => (
                    <option key={emo} value={emo}>
                      {emo.charAt(0).toUpperCase() + emo.slice(1)} ({emotionCounts[emo]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={downloadCSV}
                  className="tactile-btn px-2.5 py-1.5 bg-[#18181B] hover:bg-[#202024] border border-[#27272A] text-zinc-200 rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-zinc-400" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={downloadJSON}
                  className="tactile-btn px-2.5 py-1.5 bg-[#18181B] hover:bg-[#202024] border border-[#27272A] text-zinc-200 rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-3 h-3 text-zinc-400" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#27272A] text-zinc-500 font-mono text-[11px]">
                    <th className="py-2 px-3 w-12">#</th>
                    <th className="py-2 px-3">Input Text</th>
                    <th className="py-2 px-3 w-32">Predicted Emotion</th>
                    <th className="py-2 px-3 w-28 text-right">Confidence</th>
                    <th className="py-2 px-3 w-20 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]/60">
                  {filteredResults?.map((r) => {
                    const color = getEmotionColor(r.predicted_emotion);
                    return (
                      <tr key={r.id} className="hover:bg-[#18181B]/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-zinc-500">{r.id + 1}</td>
                        <td className="py-2.5 px-3 text-zinc-200 font-sans max-w-md truncate" title={r.text}>
                          {r.text}
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
                            <span className="capitalize">{r.predicted_emotion}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-200">
                          {formatConfidence(r.confidence)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-500 text-[11px]">
                          {r.processing_time_ms.toFixed(1)}ms
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
