import axios from 'axios';
import type {
  AnalysisResult,
  HistoryResponse,
  BatchJobResult,
  AnalyticsSummary,
  ModelStatus,
  ModelInfoResponse,
  EvaluationMetrics,
  ModelComparison,
  EmotionInfo,
  HealthResponse,
} from '../types';

let rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
if (rawBaseUrl && !rawBaseUrl.startsWith('http://') && !rawBaseUrl.startsWith('https://')) {
  rawBaseUrl = `https://${rawBaseUrl}`;
}
const api = axios.create({
  baseURL: rawBaseUrl ? (rawBaseUrl.endsWith('/api/v1') ? rawBaseUrl : `${rawBaseUrl}/api/v1`) : '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Health ──
export const getHealth = () =>
  api.get<HealthResponse>('/health').then((r) => r.data);

// ── Emotion Analysis ──
export const analyzeText = (text: string, includeExplanation = true) =>
  api
    .post<AnalysisResult>('/analyze', {
      text,
      include_explanation: includeExplanation,
    })
    .then((r) => r.data);

export const getEmotions = () =>
  api.get<{ emotions: EmotionInfo[] }>('/emotions').then((r) => r.data);

// ── Batch Analysis ──
export const analyzeBatch = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post<BatchJobResult>('/analyze/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

// ── History ──
export const getHistory = (params?: {
  skip?: number;
  limit?: number;
  emotion?: string;
  search?: string;
  sort_by?: string;
}) =>
  api.get<HistoryResponse>('/analyses', { params }).then((r) => r.data);

export const getAnalysis = (id: string) =>
  api.get<AnalysisResult>(`/analyses/${id}`).then((r) => r.data);

export const deleteAnalysis = (id: string) =>
  api.delete(`/analyses/${id}`).then((r) => r.data);

export const clearHistory = () =>
  api.delete('/analyses').then((r) => r.data);

// ── Analytics ──
export const getAnalyticsSummary = () =>
  api.get<AnalyticsSummary>('/analytics/summary').then((r) => r.data);

export const getEmotionDistribution = () =>
  api.get('/analytics/emotions').then((r) => r.data);

export const getConfidenceDistribution = () =>
  api.get('/analytics/confidence').then((r) => r.data);

// ── Model ──
export const getModelInfo = () =>
  api.get<ModelInfoResponse>('/model').then((r) => r.data);

export const getModelStatus = () =>
  api.get<ModelStatus>('/model/status').then((r) => r.data);

export const getModelMetrics = () =>
  api.get<EvaluationMetrics>('/model/metrics').then((r) => r.data);

export const getModelComparison = () =>
  api.get<{ models: ModelComparison[] }>('/model/comparison').then((r) => r.data);

export const getConfusionMatrix = () =>
  api.get('/model/confusion-matrix').then((r) => r.data);

export default api;
