import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Cpu,
  Brain,
  Sparkles,
  Heart,
  Frown,
  Flame,
  AlertTriangle,
  Zap,
  Minus,
  ExternalLink,
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE, SAMPLE_TEXTS } from '../constants';
import { getEmotionColor } from '../utils';

const STEPS = [
  { icon: FileText, title: 'Enter Text', desc: 'Write or paste any text — messages, reviews, or notes.' },
  { icon: Cpu, title: 'NLP Processing', desc: 'The text is tokenized and normalized for analysis.' },
  { icon: Brain, title: 'Deep Learning', desc: 'A transformer model identifies emotional patterns.' },
  { icon: Sparkles, title: 'Emotion Insights', desc: 'Get predictions, confidence, and token explanations.' },
];

const EMOTIONS = [
  { name: 'Joy', icon: Heart, color: getEmotionColor('joy') },
  { name: 'Sadness', icon: Frown, color: getEmotionColor('sadness') },
  { name: 'Anger', icon: Flame, color: getEmotionColor('anger') },
  { name: 'Fear', icon: AlertTriangle, color: getEmotionColor('fear') },
  { name: 'Love', icon: Heart, color: getEmotionColor('love') },
  { name: 'Surprise', icon: Zap, color: getEmotionColor('surprise') },
  { name: 'Neutral', icon: Minus, color: getEmotionColor('neutral') },
];

const TECH = ['NLP', 'Transformers', 'Deep Learning', 'PyTorch', 'FastAPI', 'React', 'Explainable AI'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* ── Navigation ── */}
      <nav className="border-b border-border/70 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-2xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-700 via-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-white/50">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-text tracking-tight">{APP_NAME}</span>
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-md">AI</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-text-secondary hover:text-text transition-colors">
              Dashboard
            </Link>
            <Link to="/dashboard/model" className="text-sm font-medium text-text-secondary hover:text-text transition-colors hidden sm:block">
              Model Specs
            </Link>
            <Link
              to="/dashboard/analyze"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-all hover:-translate-y-0.5"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-border/60 bg-gradient-to-b from-white via-blue-50/20 to-slate-50">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200/80 rounded-full text-xs font-semibold text-blue-700 mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Gen Deep Learning Emotion Intelligence</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-text tracking-tight leading-[1.15] mb-6">
              Decode the Human Emotion Behind Every Word
            </h1>
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8 max-w-2xl">
              {APP_TAGLINE} Powered by fine-tuned DistilBERT with discourse decomposition,
              token-level interpretability, and instant compound emotion recognition.
            </p>
            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                to="/dashboard/analyze"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
              >
                Start Analyzing Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard/model"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-border/80 text-text font-semibold text-sm rounded-xl hover:bg-slate-50 transition-all shadow-xs"
              >
                Model Benchmarks (92.7%)
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white border-b border-border/80 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Pipeline</span>
              <h2 className="text-3xl font-bold text-text mt-1">How It Works</h2>
            </div>
            <p className="text-sm text-text-secondary max-w-md mt-2 sm:mt-0">
              Four architectural stages from unstructured human text to verifiable emotion attribution.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="p-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl relative card-hover">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-4 text-blue-600 shadow-2xs">
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-blue-600 mb-1 font-mono">0{i + 1}</div>
                <h3 className="font-semibold text-text text-base mb-1.5">{step.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported Emotions ── */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Taxonomy</span>
            <h2 className="text-3xl font-bold text-text mt-1">Supported Emotion Dimensions</h2>
            <p className="text-sm text-text-secondary mt-2">
              Deep representations trained to distinguish subtle emotional polarities.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {EMOTIONS.map((e) => (
              <div
                key={e.name}
                className="bg-white border border-border/80 rounded-2xl p-5 text-center shadow-xs card-hover flex flex-col items-center justify-center"
              >
                <div
                  className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: e.color + '20', border: `1px solid ${e.color}35` }}
                >
                  <e.icon className="w-5 h-5" style={{ color: e.color }} />
                </div>
                <span className="text-sm font-semibold text-text">{e.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology ── */}
      <section className="bg-white border-y border-border/80 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Architecture</span>
            <h2 className="text-3xl font-bold text-text mt-1">Core Technology Stack</h2>
            <p className="text-sm text-text-secondary mt-2">
              Engineered with modern deep learning and high-performance web frameworks.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {TECH.map((t) => (
              <span
                key={t}
                className="px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample Inputs ── */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Demonstration</span>
            <h2 className="text-3xl font-bold text-text mt-1">Test Samples & Benchmarks</h2>
            <p className="text-sm text-text-secondary mt-2">
              See expected classifications across common textual patterns.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_TEXTS.map((s, i) => (
              <div key={i} className="bg-white border border-border/80 rounded-2xl p-5 shadow-xs card-hover flex flex-col justify-between">
                <p className="text-text text-sm mb-3 leading-relaxed font-medium">"{s.text}"</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-text-secondary">Predicted Label:</span>
                  <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold uppercase">
                    {s.expected}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-border/80 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <Brain className="w-4.5 h-4.5" />
                </div>
                <span className="font-bold text-base text-text">{APP_NAME}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                An Intelligent Emotion Detection System from Text Using NLP and Deep Learning.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-3 text-xs uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li><Link to="/dashboard/analyze" className="hover:text-blue-600 transition-colors">Analyze Text</Link></li>
                <li><Link to="/dashboard/model" className="hover:text-blue-600 transition-colors">Ayush Vishwakarma's model</Link></li>
                <li><Link to="/dashboard/docs" className="hover:text-blue-600 transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-3 text-xs uppercase tracking-wider">Technology</h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li>PyTorch & HuggingFace</li>
                <li>DistilBERT Transformer</li>
                <li>FastAPI REST Engine</li>
                <li>React 19 & Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-3 text-xs uppercase tracking-wider">Creator</h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="font-semibold text-slate-800">Ayush Vishwakarma</li>
                <li>AI & Machine Learning System</li>
                <li>Emotion Intelligence v1.0</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-secondary gap-3">
            <span>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
            <span>Developed by <strong>Ayush Vishwakarma</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
