import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  Brain,
  Type,
  Hash,
  MessageSquare,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { analyzeText } from '../api/client';
import { MAX_TEXT_LENGTH } from '../constants';
import {
  formatConfidence,
  getEmotionColor,
  cn,
} from '../utils';
import type { AnalysisResult, ExplanationToken } from '../types';

function ConfidenceBar({ emotion, value }: { emotion: string; value: number }) {
  const color = getEmotionColor(emotion);
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-2 w-28 shrink-0">
        <span className="w-2 h-2 rounded-full shadow-2xs" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-slate-700 capitalize truncate">{emotion}</span>
      </div>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
        <div
          className="h-full rounded-full animate-fill transition-all"
          style={{
            width: `${Math.max(value * 100, 1)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-slate-800 w-16 text-right">
        {(value * 100).toFixed(1)}%
      </span>
    </div>
  );
}

function TokenAttribution({ tokens }: { tokens: ExplanationToken[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tokens.slice(0, 18).map((t, i) => (
        <span
          key={i}
          className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-2xs transition-transform hover:scale-105',
            t.positive
              ? 'bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          )}
          title={`Contribution: ${(t.contribution * 100).toFixed(1)}%`}
        >
          <span>{t.token}</span>
          <span className="text-[10px] opacity-70">
            {t.positive ? `+${(t.contribution * 100).toFixed(0)}%` : `${(t.contribution * 100).toFixed(0)}%`}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function AnalyzeText() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [vizMode, setVizMode] = useState<'bars' | 'list'>('bars');
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
        'Failed to analyze text. Please make sure the backend server is running.';
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

  // Sort probabilities for display
  const sortedProbs = result
    ? Object.entries(result.probabilities)
        .sort(([, a], [, b]) => b - a)
    : [];

  const isLoading = analyzeMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-blue-600" />
            Analyze Emotion in Text
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Detect primary and mixed emotional nuances, discourse transitions, and token-level signals.
          </p>
        </div>
        <div className="text-xs text-text-secondary font-medium hidden sm:block bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Tip: Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border shadow-2xs">Ctrl + Enter</kbd> to analyze
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste your text here (e.g. 'I am happy but after some time I feel angry and sad')..."
          className="w-full h-36 resize-none border border-border/80 rounded-xl px-4 py-3.5 text-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm leading-relaxed"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500">
              {text.length} / {MAX_TEXT_LENGTH} chars
            </span>
            {text && (
              <button
                onClick={() => { setText(''); setResult(null); }}
                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || isLoading}
            className={cn(
              'px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm',
              text.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Language...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract Emotions
              </>
            )}
          </button>
        </div>

        {/* Sample inputs */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            Quick Examples:
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Mixed Discourse', text: 'i am happy but after some time i am angry and sad' },
              { label: 'Joy / Success', text: "I finally got the job I've been working toward for months!" },
              { label: 'Frustration', text: 'The continuous delays and broken promises are infuriating.' },
              { label: 'Fear / Anxiety', text: 'I am terrified of what might happen if the audit fails.' },
            ].map((s, i) => (
              <button
                key={i}
                onClick={() => setText(s.text)}
                className="text-xs px-3 py-1.5 bg-slate-50 border border-border/80 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all flex items-center gap-1.5"
              >
                <span className="font-semibold text-[10px] uppercase text-blue-600 bg-blue-100/60 px-1 py-0.2 rounded">
                  {s.label}
                </span>
                <span className="truncate max-w-[200px]">"{s.text}"</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-sm text-red-700 animate-fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold">Analysis Notice</div>
            <div className="text-xs text-red-600 mt-0.5">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white border border-border/80 rounded-2xl p-10 text-center shadow-xs">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-text">Running Transformer & Discourse Engine...</p>
          <p className="text-xs text-text-secondary mt-1">Evaluating multi-clause emotion boundaries & token drops</p>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Dominant Emotion Card */}
          <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Primary Analysis Result</span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Model: Ayush Vishwakarma's model
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div
                className="w-18 h-18 rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-md shrink-0"
                style={{
                  backgroundColor: `${getEmotionColor(result.dominant_emotion)}20`,
                  color: getEmotionColor(result.dominant_emotion),
                  border: `2px solid ${getEmotionColor(result.dominant_emotion)}40`,
                }}
              >
                {result.dominant_emotion.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-2xl font-bold text-text uppercase tracking-tight">
                    {result.dominant_emotion}
                  </span>
                  {result.is_mixed_emotion && result.secondary_emotion && (
                    <span className="text-xl font-bold text-slate-500 uppercase tracking-tight">
                      + {result.secondary_emotion}
                    </span>
                  )}
                  {result.is_mixed_emotion ? (
                    <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      Mixed Emotions Detected
                    </span>
                  ) : (
                    result.confidence > 0.85 && (
                      <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-full">
                        High Confidence
                      </span>
                    )
                  )}
                </div>

                <div className="text-sm font-medium text-text-secondary mt-1 flex items-center gap-2">
                  <span>Confidence: <strong className="font-mono text-slate-900">{formatConfidence(result.confidence)}</strong></span>
                  {result.is_mixed_emotion && (
                    <span className="text-xs text-blue-600 font-normal">
                      (Balanced with secondary emotion)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Emotional Shift Banner */}
            {result.emotional_shift && (
              <div className="mt-4 px-4 py-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-100 rounded-xl text-xs font-medium text-purple-950 flex items-center gap-3 shadow-2xs">
                <span className="font-bold text-purple-700 uppercase tracking-wider text-[10px] bg-purple-100 px-2 py-0.5 rounded-md shrink-0">
                  Emotional Transition
                </span>
                <span className="text-slate-800">{result.emotional_shift}</span>
              </div>
            )}

            {/* Interpretation */}
            {result.interpretation && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Semantic Summary:
                </div>
                <p>{result.interpretation}</p>
              </div>
            )}
          </div>

          {/* Confidence Distribution */}
          <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-text text-base">Confidence Distribution</h3>
                <p className="text-xs text-text-secondary">Softmax probability across 6 emotion classes</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setVizMode('bars')}
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                    vizMode === 'bars' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-text'
                  )}
                >
                  Distribution Bars
                </button>
                <button
                  onClick={() => setVizMode('list')}
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                    vizMode === 'list' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-text'
                  )}
                >
                  Grid
                </button>
              </div>
            </div>

            {vizMode === 'bars' ? (
              <div className="space-y-3">
                {sortedProbs.map(([emotion, value]) => (
                  <ConfidenceBar key={emotion} emotion={emotion} value={value} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sortedProbs.map(([emotion, value]) => {
                  const color = getEmotionColor(emotion);
                  return (
                    <div
                      key={emotion}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="capitalize text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          {emotion}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {(value * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${value * 100}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Text Insights */}
          <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
            <h3 className="font-semibold text-text text-base mb-4 pb-2 border-b border-slate-100">
              Linguistic & Text Insights
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center shrink-0">
                  <Type className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-text-secondary uppercase">Characters</div>
                  <div className="font-mono font-bold text-base text-text">{result.character_count}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center shrink-0">
                  <Hash className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-text-secondary uppercase">Word Count</div>
                  <div className="font-mono font-bold text-base text-text">{result.word_count}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-text-secondary uppercase">Language</div>
                  <div className="font-mono font-bold text-base text-text uppercase">{result.language}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center shrink-0">
                  <Brain className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-text-secondary uppercase">Latency</div>
                  <div className="font-mono font-bold text-base text-text">{Math.round(result.processing_time_ms)} ms</div>
                </div>
              </div>
            </div>

            {result.features && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detected Modifiers:</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {result.features.has_negation && (
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-medium rounded-lg border border-purple-200 flex items-center gap-1">
                      Negation particle detected
                    </span>
                  )}
                  {result.features.has_intensifier && (
                    <span className="px-2.5 py-1 bg-orange-50 text-orange-700 font-medium rounded-lg border border-orange-200 flex items-center gap-1">
                      Intensifier detected
                    </span>
                  )}
                  {result.features.keywords.length > 0 && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-medium rounded-lg border border-blue-200">
                      Emotional cues: {result.features.keywords.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Explainability */}
          {result.explanation && (
            <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-xs card-hover">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center gap-2.5 w-full text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Lightbulb className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text text-base">Explainable AI (Token Attribution)</h3>
                  <p className="text-xs text-text-secondary">Token sensitivity analysis for model interpretability</p>
                </div>
                <div className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                  {showExplanation ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>
              {showExplanation && (
                <div className="mt-4 space-y-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-mono">
                    Methodology: <strong className="text-slate-700">{result.explanation.method}</strong>
                  </div>
                  {result.explanation.tokens && result.explanation.tokens.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
                        Token saliency (Red = Positive emotional driver):
                      </div>
                      <TokenAttribution tokens={result.explanation.tokens} />
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {result.explanation.note}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
