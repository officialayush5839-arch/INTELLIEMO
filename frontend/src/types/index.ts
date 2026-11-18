// ── Analysis Types ──

export interface ExplanationToken {
  token: string;
  contribution: number;
  positive: boolean;
}

export interface Explanation {
  method: string;
  tokens: ExplanationToken[];
  note: string;
  target_emotion?: string;
  baseline_confidence?: number;
}

export interface ModelInfo {
  name: string;
  version: string;
  architecture: string;
}

export interface AnalysisResult {
  id: string;
  text: string;
  dominant_emotion: string;
  secondary_emotion?: string | null;
  is_mixed_emotion?: boolean;
  emotional_shift?: string | null;
  confidence: number;
  probabilities: Record<string, number>;
  language: string;
  word_count: number;
  character_count: number;
  processing_time_ms: number;
  model: ModelInfo;
  explanation: Explanation | null;
  interpretation?: string;
  features?: TextFeatures;
  created_at?: string;
  is_demo?: boolean;
}

export interface TextFeatures {
  has_negation: boolean;
  has_intensifier: boolean;
  exclamation_count: number;
  question_count: number;
  keywords: string[];
}

// ── History Types ──

export interface AnalysisListItem {
  id: string;
  text: string;
  dominant_emotion: string;
  confidence: number;
  language: string;
  word_count: number;
  processing_time_ms: number;
  created_at: string;
  is_demo: boolean;
}

export interface HistoryResponse {
  items: AnalysisListItem[];
  total: number;
  skip: number;
  limit: number;
}

// ── Batch Types ──

export interface BatchResult {
  id: number;
  text: string;
  predicted_emotion: string;
  confidence: number;
  probabilities: Record<string, number>;
  processing_time_ms: number;
  error?: string;
}

export interface BatchJobResult {
  job_id: string;
  total_records: number;
  processed: number;
  successful: number;
  failed: number;
  average_confidence: number;
  most_common_emotion: string;
  results: BatchResult[];
}

// ── Analytics Types ──

export interface AnalyticsSummary {
  total_analyses: number;
  average_confidence: number;
  most_frequent_emotion: string;
  dominant_emotion: string;
  emotion_distribution: Record<string, number>;
  daily_counts: { date: string; count: number }[];
}

// ── Model Types ──

export interface ModelStatus {
  loaded: boolean;
  device: string;
  model_name: string;
  num_labels: number;
  load_time: number;
}

export interface ModelInfoResponse {
  id: string;
  name: string;
  version: string;
  architecture: string;
  dataset: string;
  classification_type: string;
  num_classes: number;
  labels: string[];
  max_length: number;
  device: string;
  loaded: boolean;
  load_time_seconds: number;
  parameters: number;
  tokenizer: string;
  training_date: string;
  model_version_id: string;
  status: string;
}

export interface EvaluationMetrics {
  available: boolean;
  accuracy: number | null;
  precision_macro: number | null;
  recall_macro: number | null;
  f1_macro: number | null;
  f1_weighted: number | null;
  per_class: Record<string, { precision: number; recall: number; "f1-score": number; support: number }>;
  confusion_matrix: number[][];
  labels: string[];
  message?: string;
}

export interface ModelComparison {
  name: string;
  accuracy: number | null;
  f1_macro: number | null;
  f1_weighted: number | null;
  inference_latency_ms: number | null;
  model_size: string;
  training_time: string;
  status: string;
  is_current?: boolean;
}

// ── Emotion Types ──

export interface EmotionInfo {
  name: string;
  color: string;
  icon: string;
  description: string;
}

// ── Health Types ──

export interface HealthResponse {
  status: string;
  version: string;
  model_loaded: boolean;
  model_ready?: boolean;
  model_status?: string;
  database: string;
}
