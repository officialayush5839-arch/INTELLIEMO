import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Brain,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { analyzeText } from '../api/client';
import { MAX_TEXT_LENGTH } from '../constants';
import { getEmotionColor, cn } from '../utils';
import { springSnappy, springGentle } from '../constants/motion';
import type { AnalysisResult, ExplanationToken } from '../types';

const SAMPLE_PROMPTS = [
  {
    label: 'Emotional Shift',
    text: 'I was terrified and worried at first, but now I feel so relieved and thrilled by our success!',
  },
  {
    label: 'Deep Grief',
    text: 'I feel completely heartbroken and devastated by this tragic loss.',
  },
  {
    label: 'Ecstatic Triumph',
    text: 'We worked all night and finally launched the product! I could not be happier and prouder.',
  },
  {
    label: 'Enraged Discontent',
    text: 'This is absolutely unacceptable and ridiculous. I am furious with this total disregard!',
  },
];

function ConfidenceBar({ emotion, value }: { emotion: string; value: number }) {
  const color = getEmotionColor(emotion);
  return (
    <div className="flex items-center gap-3 py-1.5 group select-none">
      <div className="flex items-center gap-2 w-24 shrink-0">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-mono font-medium text-zinc-300 capitalize truncate">{emotion}</span>
      </div>
      <div className="flex-1 h-2 bg-[#18181B] rounded overflow-hidden border border-[#27272A]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(value * 100, 1.5)}%` }}
          transition={springGentle}
          className="h-full rounded"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-zinc-200 w-14 text-right">
        {(value * 100).toFixed(1)}%
      </span>
    </div>
  );
}

function InteractiveTokenAttribution({ tokens }: { tokens: ExplanationToken[] }) {
  const [selectedToken, setSelectedToken] = useState<ExplanationToken | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {tokens.slice(0, 32).map((t, i) => {
          const isSelected = selectedToken?.token === t.token;
          return (
            <button
              key={i}
              onClick={() => setSelectedToken(isSelected ? null : t)}
              className={cn(
                'tactile-btn px-2 py-1 rounded text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer select-none',
                t.positive
                  ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:border-rose-600'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600',
                isSelected && 'ring-1 ring-zinc-100 border-zinc-100 text-white'
              )}
              title={`Click to inspect attribution sensitivity`}
            >
              <span>{t.token}</span>
              <span className="text-[10px] opacity-70">
                {t.positive ? `+${(t.contribution * 100).toFixed(0)}%` : `${(t.contribution * 100).toFixed(0)}%`}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedToken && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={springSnappy}
            className="p-3 bg-[#18181B] border border-zinc-700 rounded-md text-xs text-zinc-300 flex items-center justify-between"
          >
            <div>
              Token <code className="font-mono bg-[#121215] px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-100">"{selectedToken.token}"</code> contributed{' '}
              <strong className="text-zinc-100">{(selectedToken.contribution * 100).toFixed(1)}%</strong> to the{' '}
              <span className={selectedToken.positive ? 'text-rose-400 font-semibold' : 'text-zinc-400 font-semibold'}>
                {selectedToken.positive ? 'positive amplification' : 'suppression'}
              </span>{' '}
              of the target emotion.
            </div>
            <button
              onClick={() => setSelectedToken(null)}
              className="text-zinc-400 hover:text-zinc-200 text-[10px] font-mono uppercase ml-3 cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnalyzeText() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(true);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: (input: string) => analyzeText(input, true),
    onSuccess: (data) => {
      setResult(data);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail?.error?.message ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Inference failed. Check that the backend is active on Port 236.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setErrorMessage(null);
    analyzeMutation.mutate(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAnalyze();
    }
  };

  const handleCopyJSON = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const sortedProbs = result
    ? Object.entries(result.probabilities).sort(([, a], [, b]) => b - a)
    : [];

  const isLoading = analyzeMutation.isPending;
  const dominantColor = result ? getEmotionColor(result.dominant_emotion) : '#38BDF8';

  return (
    <div className="space-y-6">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono mb-2">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            <span>EXPLAINABLE INFERENCE CONSOLE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-[-0.035em]">
            Real-Time Emotion Intelligence
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Token-level attribution, sentiment shift decomposition, and calibrated probability matrices powered by{' '}
            <strong className="text-zinc-200">Ayush Vishwakarma's model</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono text-zinc-400 bg-[#121215] px-2.5 py-1.5 rounded-md border border-[#27272A] hidden sm:flex items-center gap-1.5">
            <span>Execute:</span>
            <kbd className="bg-[#18181B] text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-700 text-[10px] font-bold">
              Ctrl + Enter
            </kbd>
          </div>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pane: Ingestion Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="monolith-card specular-rim p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#27272A]">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-400">
                Text Ingestion Buffer
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-zinc-500">
                  {text.length}/{MAX_TEXT_LENGTH}
                </span>
                {text && (
                  <button
                    onClick={() => {
                      setText('');
                      setResult(null);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
              onKeyDown={handleKeyDown}
              placeholder="Enter text to analyze (e.g. 'I was nervous at first, but the presentation went incredibly well and I am so relieved!')..."
              rows={6}
              disabled={isLoading}
              className="w-full bg-[#18181B] border border-[#27272A] rounded-md p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-sans leading-relaxed resize-none"
            />

            <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#27272A]">
              <span className="text-[11px] font-mono text-zinc-500">
                {text.trim() ? text.trim().split(/\s+/).length : 0} words
              </span>
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || isLoading}
                className={cn(
                  'tactile-btn px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 border cursor-pointer',
                  text.trim() && !isLoading
                    ? 'bg-zinc-100 hover:bg-white text-zinc-950 border-zinc-200'
                    : 'bg-[#18181B] text-zinc-600 border-[#27272A] cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Inference...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Inference</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt Presets */}
            <div className="mt-4 pt-3 border-t border-[#27272A]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                Curated Evaluation Benchmarks
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setText(p.text);
                      analyzeMutation.mutate(p.text);
                    }}
                    className="tactile-btn p-2 text-left rounded bg-[#18181B] hover:bg-[#202024] border border-[#27272A] hover:border-zinc-700 transition-colors cursor-pointer group"
                  >
                    <div className="text-[11px] font-medium text-zinc-300 group-hover:text-white truncate">
                      {p.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate mt-0.5 font-sans">
                      {p.text}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-md text-xs text-rose-300 flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Inference Error:</strong> {errorMessage}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Pane: Intelligence Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Dominant Hero Card */}
              <div className="monolith-card specular-rim p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dominantColor }} />
                    <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                      Dominant Classification
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyJSON}
                      className="tactile-btn px-2 py-1 bg-[#18181B] hover:bg-[#222226] border border-[#27272A] text-zinc-300 rounded text-[11px] font-mono flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedJSON ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedJSON ? 'Copied' : 'JSON'}</span>
                    </button>
                    <span className="text-[10px] font-mono text-zinc-500 bg-[#18181B] px-2 py-1 rounded border border-[#27272A]">
                      {result.processing_time_ms.toFixed(1)}ms
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.035em] text-white capitalize">
                      {result.dominant_emotion}
                    </h3>
                    {result.secondary_emotion && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400">
                        Sub: {result.secondary_emotion}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-white">
                    {(result.confidence * 100).toFixed(1)}% <span className="text-xs text-zinc-500 font-sans font-normal">confidence</span>
                  </div>
                </div>

                {/* Compound Emotional Shift Trajectory */}
                {result.emotional_shift && (
                  <div className="mt-3.5 p-2.5 rounded bg-[#18181B] border border-zinc-800 flex items-center gap-2 text-xs text-zinc-300">
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>
                      <strong className="text-zinc-100 font-semibold">Trajectory:</strong> {result.emotional_shift}
                    </span>
                  </div>
                )}

                {/* Interpretation */}
                {result.interpretation && (
                  <p className="mt-3 text-xs text-zinc-400 leading-relaxed border-t border-[#27272A] pt-3">
                    {result.interpretation}
                  </p>
                )}
              </div>

              {/* Token Attribution Heatmap */}
              {result.explanation?.tokens && result.explanation.tokens.length > 0 && (
                <div className="monolith-card p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
                        Token-Drop Sensitivity Map
                      </span>
                    </div>
                    <button
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                    >
                      {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {showExplanation && (
                    <InteractiveTokenAttribution tokens={result.explanation.tokens} />
                  )}
                </div>
              )}

              {/* Complete Probability Dispersion */}
              <div className="monolith-card p-4 sm:p-5">
                <div className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400 pb-2.5 mb-2.5 border-b border-[#27272A]">
                  Multi-Class Confidence Dispersion
                </div>
                <div className="space-y-1">
                  {sortedProbs.map(([emotion, val]) => (
                    <ConfidenceBar key={emotion} emotion={emotion} value={val} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="monolith-card p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-10 h-10 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center mb-3">
                <Code2 className="w-5 h-5 text-zinc-500" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 tracking-[-0.02em]">
                Telemetry Engine Idle
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-relaxed">
                Enter text or select a benchmark preset from the left deck to execute inference through the fine-tuned DistilBERT transformer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
