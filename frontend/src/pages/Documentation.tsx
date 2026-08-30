import { BookOpen, Brain, AlertTriangle, Shield, Layers } from 'lucide-react';
import { APP_NAME } from '../constants';

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-text flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h2>
      <div className="text-sm text-text-secondary leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function Documentation() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Documentation</h1>
        <p className="text-sm text-text-secondary mt-1">
          Technical documentation for the {APP_NAME} emotion detection system.
        </p>
      </div>

      <Section title="What is Emotion Detection?" icon={BookOpen}>
        <p>
          Emotion detection from text is an NLP task that identifies the emotional state
          expressed in written language. The system analyzes words, phrases, punctuation,
          and linguistic patterns to classify text into discrete emotion categories.
        </p>
        <p>
          {APP_NAME} uses a transformer-based deep learning model (DistilBERT) fine-tuned
          on emotion-labeled datasets to perform this classification.
        </p>
      </Section>

      <Section title="How the Model Works" icon={Brain}>
        <p><strong>Architecture:</strong> DistilBERT — a lightweight, efficient transformer
        pre-trained on large text corpora and fine-tuned for emotion classification.</p>
        <p><strong>Input:</strong> Raw text (up to 2000 characters)</p>
        <p><strong>Processing:</strong></p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Text normalization (unicode, URLs, mentions, repeated characters)</li>
          <li>Tokenization using WordPiece</li>
          <li>Transformer encoder processes token embeddings</li>
          <li>Classification head produces emotion logits</li>
          <li>Softmax converts logits to probability scores</li>
        </ol>
        <p><strong>Output:</strong> Probability scores for each emotion class, with the highest-scoring
        emotion as the dominant prediction.</p>
      </Section>

      <Section title="NLP Pipeline" icon={Layers}>
        <div className="bg-bg rounded-lg p-4 font-mono text-xs leading-relaxed">
          <pre>{`INPUT TEXT
  ↓
Validation (length, format)
  ↓
Language Detection
  ↓
Text Normalization
  ↓
Tokenization (WordPiece)
  ↓
Transformer Encoder (DistilBERT)
  ↓
Classification Head
  ↓
Softmax / Probability Scores
  ↓
Post-processing & Thresholding
  ↓
Explainability (Token Attribution)
  ↓
JSON Response → Frontend`}</pre>
        </div>
      </Section>

      <Section title="Supported Emotions" icon={Brain}>
        <p>The model supports 6 core emotions:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {['Joy', 'Sadness', 'Anger', 'Fear', 'Love', 'Surprise'].map((e) => (
            <div key={e} className="px-3 py-2 bg-bg rounded-lg text-sm font-medium text-text capitalize">{e}</div>
          ))}
        </div>
        <p className="mt-2">
          Extended models (GoEmotions) support 28 emotion categories including neutral.
        </p>
      </Section>

      <Section title="Confidence Scores" icon={Layers}>
        <p>
          Each prediction includes a confidence score between 0 and 1, representing the
          model's certainty. Higher confidence indicates stronger emotional signal in the text.
        </p>
        <p>
          <strong>Low confidence (&lt; 0.45):</strong> The system flags predictions as potentially
          ambiguous. Text may contain mixed emotions, sarcasm, or insufficient emotional signal.
        </p>
      </Section>

      <Section title="Privacy" icon={Shield}>
        <p>
          All text analysis happens <strong>locally</strong> on the application server.
          No text data is sent to external AI services or third-party APIs.
        </p>
        <p>
          Analysis history is stored in a local SQLite database. Users can clear their
          history at any time. Text is only stored when the user chooses to save an analysis.
        </p>
      </Section>

      <Section title="Limitations" icon={AlertTriangle}>
        <ul className="list-disc pl-5 space-y-1">
          <li>Emotion detection is probabilistic, not deterministic.</li>
          <li>Text can be ambiguous — context may be missing.</li>
          <li>Sarcasm and irony are difficult to detect.</li>
          <li>Cultural differences affect emotion expression.</li>
          <li>The model may not perform well on domain-specific jargon.</li>
          <li>Short texts may have lower confidence predictions.</li>
          <li>Multi-label scenarios may have overlapping emotions.</li>
        </ul>
        <p className="mt-2 text-text font-medium">
          This system predicts emotional categories from textual patterns. It does not
          determine a person's actual psychological or mental state and should not be
          used for medical, clinical, legal, employment, or other high-stakes decisions.
        </p>
      </Section>

      <Section title="Technology Stack" icon={Layers}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-text mb-2">Backend</h4>
            <ul className="space-y-1">
              <li>Python 3.10+</li>
              <li>FastAPI</li>
              <li>PyTorch</li>
              <li>Transformers (HuggingFace)</li>
              <li>SQLAlchemy + SQLite</li>
              <li>scikit-learn</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text mb-2">Frontend</h4>
            <ul className="space-y-1">
              <li>React 19 + TypeScript</li>
              <li>Vite</li>
              <li>Tailwind CSS</li>
              <li>Recharts</li>
              <li>TanStack Query</li>
              <li>Lucide Icons</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}
