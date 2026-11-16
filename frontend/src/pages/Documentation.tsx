import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Shield,
  Layers,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import { cn } from '../utils';
import { springSnappy, springGentle } from '../constants/motion';

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-md bg-[#121215] border border-[#27272A] overflow-hidden font-mono text-xs text-zinc-200">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#18181B] border-b border-[#27272A] text-[11px] text-zinc-400">
        <span className="font-semibold uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="tactile-btn flex items-center gap-1 px-2 py-0.5 rounded bg-[#27272A] hover:bg-zinc-700 text-zinc-200 cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto leading-relaxed">
        <pre>{code}</pre>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: springSnappy }}
      className="monolith-card specular-rim p-5 sm:p-6 space-y-3"
    >
      <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2.5 pb-2.5 border-b border-[#27272A] tracking-[-0.02em]">
        <div className="w-7 h-7 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-300">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span>{title}</span>
      </h2>
      <div className="text-xs text-zinc-400 leading-relaxed space-y-2.5">{children}</div>
    </motion.div>
  );
}

export default function Documentation() {
  const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'ts'>('curl');

  const codeSnippets = {
    curl: `curl -X POST "http://localhost:236/api/v1/analyze" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "I was anxious at first, but everything succeeded wonderfully!", "include_explanation": true}'`,
    python: `import urllib.request
import json

url = "http://localhost:236/api/v1/analyze"
payload = json.dumps({
    "text": "I was anxious at first, but everything succeeded wonderfully!",
    "include_explanation": True
}).encode("utf-8")

req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    print("Dominant Emotion:", data["dominant_emotion"])
    print("Confidence:", f"{data['confidence']*100:.1f}%")
    print("Model:", data["model"]["name"])`,
    ts: `const response = await fetch("http://localhost:236/api/v1/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "I was anxious at first, but everything succeeded wonderfully!",
    include_explanation: true
  })
});

const data = await response.json();
console.log(data.dominant_emotion, data.confidence);`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono mb-2">
            <BookOpen className="w-3 h-3 text-zinc-400" />
            <span>DEVELOPER REFERENCE & SPECIFICATIONS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-[-0.035em]">
            System Architecture & API Docs
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            RESTful endpoints, JSON schemas, and SDK integration guides for the INTELLIEMO transformer engine.
          </p>
        </div>
      </div>

      {/* Code Snippets Section */}
      <motion.div
        whileHover={{ y: -2, transition: springSnappy }}
        className="monolith-card specular-rim p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
              Inference Endpoint Integration
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-[#18181B] p-0.5 rounded border border-[#27272A]">
            {(['curl', 'python', 'ts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'tactile-btn px-2.5 py-1 rounded text-[11px] font-mono uppercase cursor-pointer',
                  activeTab === tab
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <CodeBlock code={codeSnippets[activeTab]} language={activeTab} />
      </motion.div>

      {/* Endpoint Specs */}
      <Section title="REST API Endpoints" icon={Layers}>
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded bg-[#18181B] border border-[#27272A] flex items-baseline gap-3">
            <span className="text-emerald-400 font-bold">GET</span>
            <span className="text-zinc-200">/api/v1/health</span>
            <span className="text-zinc-500 font-sans text-xs ml-auto">Health check & model status</span>
          </div>
          <div className="p-3 rounded bg-[#18181B] border border-[#27272A] flex items-baseline gap-3">
            <span className="text-sky-400 font-bold">POST</span>
            <span className="text-zinc-200">/api/v1/analyze</span>
            <span className="text-zinc-500 font-sans text-xs ml-auto">Single text emotion inference</span>
          </div>
          <div className="p-3 rounded bg-[#18181B] border border-[#27272A] flex items-baseline gap-3">
            <span className="text-sky-400 font-bold">POST</span>
            <span className="text-zinc-200">/api/v1/analyze/batch</span>
            <span className="text-zinc-500 font-sans text-xs ml-auto">CSV batch processing (max 100)</span>
          </div>
          <div className="p-3 rounded bg-[#18181B] border border-[#27272A] flex items-baseline gap-3">
            <span className="text-emerald-400 font-bold">GET</span>
            <span className="text-zinc-200">/api/v1/model</span>
            <span className="text-zinc-500 font-sans text-xs ml-auto">Model specs & weights info</span>
          </div>
          <div className="p-3 rounded bg-[#18181B] border border-[#27272A] flex items-baseline gap-3">
            <span className="text-emerald-400 font-bold">GET</span>
            <span className="text-zinc-200">/api/v1/analytics/summary</span>
            <span className="text-zinc-500 font-sans text-xs ml-auto">Aggregate analytics & KPIs</span>
          </div>
        </div>
      </Section>

      {/* Model Attribution & Security */}
      <Section title="Model Attribution & Privacy Guarantees" icon={Shield}>
        <p>
          The core classification model is <strong className="text-zinc-200">Ayush Vishwakarma's model</strong>, a fine-tuned DistilBERT transformer sequence classifier configured for 6 primary emotion labels (Joy, Sadness, Anger, Fear, Love, Surprise) plus Neutral baseline detection.
        </p>
        <p>
          Inference is fully air-gapped on local hardware with zero external cloud dependencies. No text or user identifiers are transmitted over public networks.
        </p>
      </Section>
    </motion.div>
  );
}
