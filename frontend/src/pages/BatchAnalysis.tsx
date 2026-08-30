import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Upload,
  Download,
  Loader2,
  XCircle,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { analyzeBatch } from '../api/client';
import { EMOTION_COLORS, formatConfidence, cn } from '../utils';
import type { BatchJobResult } from '../types';

export default function BatchAnalysis() {
  const [jobResult, setJobResult] = useState<BatchJobResult | null>(null);
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
    a.download = 'batch_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!jobResult) return;
    const blob = new Blob([JSON.stringify(jobResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build pie data
  const emotionCounts: Record<string, number> = {};
  jobResult?.results.forEach((r) => {
    emotionCounts[r.predicted_emotion] = (emotionCounts[r.predicted_emotion] || 0) + 1;
  });
  const pieData = Object.entries(emotionCounts).map(([name, value]) => ({
    name,
    value,
    color: EMOTION_COLORS[name] || '#D1D5DB',
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Batch Analysis</h1>
        <p className="text-sm text-text-secondary mt-1">
          Upload a CSV file with a "text" column for bulk emotion analysis.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'bg-white border-2 border-dashed rounded-xl p-12 text-center transition-colors',
          uploadMutation.isPending
            ? 'border-primary/30 bg-primary/5'
            : 'border-border hover:border-primary/30'
        )}
      >
        {uploadMutation.isPending ? (
          <div>
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-text-secondary">Processing batch...</p>
          </div>
        ) : (
          <div>
            <Upload className="w-10 h-10 text-text-secondary/40 mx-auto mb-4" />
            <p className="text-sm text-text font-medium mb-1">
              Drop a CSV file here or{' '}
              <button
                onClick={() => fileRef.current?.click()}
                className="text-primary hover:underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-text-secondary">
              Maximum 100 records. CSV must contain a "text" column.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      {uploadMutation.isError && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 text-sm text-danger">
          Failed to process batch. Please check your CSV format.
        </div>
      )}

      {/* Results */}
      {jobResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary mb-1">Total</div>
              <div className="text-xl font-bold text-text">{jobResult.total_records}</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary mb-1">Successful</div>
              <div className="text-xl font-bold text-success">{jobResult.successful}</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary mb-1">Failed</div>
              <div className="text-xl font-bold text-danger">{jobResult.failed}</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary mb-1">Avg Confidence</div>
              <div className="text-xl font-bold text-text">{formatConfidence(jobResult.average_confidence)}</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary mb-1">Most Common</div>
              <div className="text-xl font-bold text-primary capitalize">{jobResult.most_common_emotion}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Distribution Chart */}
            <div className="bg-white border border-border rounded-xl p-5">
              <h3 className="font-semibold text-text mb-3">Emotion Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 mt-2">
                {pieData.map((e) => (
                  <div key={e.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                    <span className="capitalize text-text-secondary">{e.name}</span>
                    <span className="ml-auto font-medium">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Results Table */}
            <div className="lg:col-span-2 bg-white border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text">Results</h3>
                <div className="flex gap-2">
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    onClick={downloadJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> JSON
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-border text-left text-text-secondary">
                      <th className="pb-2 font-medium">#</th>
                      <th className="pb-2 font-medium">Text</th>
                      <th className="pb-2 font-medium">Emotion</th>
                      <th className="pb-2 font-medium">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobResult.results.map((r) => (
                      <tr key={r.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 text-text-secondary">{r.id + 1}</td>
                        <td className="py-2 max-w-xs truncate text-text">{r.text}</td>
                        <td className="py-2">
                          {r.error ? (
                            <span className="text-danger text-xs flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Error
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-primary/5 text-primary">
                              {r.predicted_emotion}
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-text-secondary">{formatConfidence(r.confidence)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
