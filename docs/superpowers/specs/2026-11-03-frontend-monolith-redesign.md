# INTELLIEMO — Precision Monolith Studio Redesign Specification

- **Date**: 2026-11-03
- **Author**: Antigravity & Ayush Vishwakarma
- **Design Philosophy**: Precision Monolith Studio (Inspired by Linear, Raycast & Stripe)
- **Status**: Approved for Implementation

---

## 1. Executive Summary & Core Principles

This specification defines the complete UI/UX overhaul of the INTELLIEMO emotion intelligence platform. The objective is to replace generic AI aesthetics with an enterprise-grade, human-crafted design standard.

### Core Tenets
1. **Zero AI-Slop**:
   - Completely remove purple/violet radial background glows and ambient blur stains.
   - Eliminate heavy frosted-glass panels (`backdrop-filter: blur(20px)`).
   - Enforce disciplined card radii (`rounded-lg` / 8px max) and eliminate oversized pills or floating glass shells.
   - Use high-contrast Lucide icons with dedicated semantic context rather than emojis.
2. **Precision Craftsmanship**:
   - Monochromatic base surfaces using deep zinc tones (`#09090B`, `#121215`, `#18181B`).
   - Hair-thin 1px borders (`border-zinc-800/80`) with optical dual-border insets (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04)`).
   - Strict 4px/8px typographic and layout rhythm.
   - High-contrast typography: `Plus Jakarta Sans` for headers with tight letter tracking (`tracking-[-0.035em]`), and `Fira Code` for confidence scores and model telemetry.
3. **Kinetic Motion Engineering**:
   - Strict GPU-only animation (`transform` and `opacity`).
   - Standardized spring physics (Emil Kowalski / Motion v12): `springSnappy`, `springGentle`, `springMorph`.
   - Tactile button press mechanics (`transform: scale(0.97)` on active with 120ms release).
   - Full accessibility compliance with `@media (prefers-reduced-motion: reduce)`.

---

## 2. Design Tokens & Styling Architecture

### 2.1 Color Tokens (`frontend/src/index.css`)
- **Canvas / Root Background**: `#09090B` (zinc-950)
- **Primary Surface / Cards**: `#121215` (zinc-900 with subtle cool tint)
- **Elevated Surfaces / Inputs**: `#18181B` (zinc-900 pure)
- **Borders & Dividers**: `rgba(39, 39, 42, 0.8)` (`border-zinc-800`)
- **Text Primary**: `#F4F4F5` (zinc-100)
- **Text Secondary / Muted**: `#A1A1AA` (zinc-400)
- **Text Tertiary / Ghost**: `#71717A` (zinc-500)

### 2.2 Semantic Emotion Tokens
- **Joy**: `#F59E0B` (Amber-500) | Surface: `rgba(245, 158, 11, 0.08)` | Border: `rgba(245, 158, 11, 0.25)`
- **Sadness**: `#38BDF8` (Sky-400) | Surface: `rgba(56, 189, 248, 0.08)` | Border: `rgba(56, 189, 248, 0.25)`
- **Anger**: `#F43F5E` (Rose-500) | Surface: `rgba(244, 63, 94, 0.08)` | Border: `rgba(244, 63, 94, 0.25)`
- **Fear**: `#A855F7` (Purple-500) | Surface: `rgba(168, 85, 247, 0.08)` | Border: `rgba(168, 85, 247, 0.25)`
- **Love**: `#F472B6` (Pink-400) | Surface: `rgba(244, 114, 182, 0.08)` | Border: `rgba(244, 114, 182, 0.25)`
- **Surprise**: `#FB923C` (Orange-400) | Surface: `rgba(251, 146, 60, 0.08)` | Border: `rgba(251, 146, 60, 0.25)`
- **Neutral**: `#94A3B8` (Slate-400) | Surface: `rgba(148, 163, 184, 0.08)` | Border: `rgba(148, 163, 184, 0.25)`

---

## 3. Component & Page Specifications

### 3.1 Shell & Layout Architecture (`DashboardLayout.tsx`)
- **Left Navigation Rail**: Fixed 240px wide, solid dark background (`#09090B`), 1px right border (`border-zinc-800`).
- **Active Navigation Pill**: Motion v12 `layoutId="active-nav-indicator"` with `springSnappy` physics.
- **Top Utility Bar**:
  - Live server heartbeat pill (`/api/v1/health`) with animated green radar ping.
  - Active model indicator: `"Ayush Vishwakarma's model" (DistilBERT v1.0.0)`.
  - Quick keyboard shortcut badge (`⌘K` / `Ctrl+K`).
- **Footer Diagnostics**: Sub-15ms latency telemetry and SQLite connection status.

### 3.2 Landing Page (`LandingPage.tsx`)
- **Hero Grid**: Precision typography, high-contrast headline with -0.035em tracking, live zero-friction emotion testbed directly in the hero with instant execution.
- **Bento Diagnostics Matrix**:
  - 92.7% Macro F1 benchmark card with precision line graph.
  - Sub-15ms latency benchmarks on CPU & GPU.
  - Local-first privacy guarantees with zero cloud leakage.
  - 6+1 class emotion taxonomy matrix with interactive trigger states.
- **Action Triggers**: Sharp, tactile buttons with dual border insets and micro-scale feedback.

### 3.3 Live Inference Console (`AnalyzeText.tsx`)
- **Split-View Ingestion & Intelligence Console**:
  - Left Deck: High-performance text area with quick-prompt chips (e.g., *Complex Emotional Transition*, *Understated Grief*, *Joyful Triumph*), character counter, and `Ctrl + Enter` trigger.
  - Right Deck:
    - Dominant Emotion Card with large percentage readout and confidence meter.
    - Emotional Trajectory Banner showing transition paths (e.g. *"Transitioned from fear into joy"*).
    - Interactive Token Attribution Heatmap: Each token is an inspectable chip; clicking displays its sensitivity weight.
    - Horizontal probability distribution bars with animated springs.
    - One-click formatted JSON and cURL copy actions.

### 3.4 Batch Analysis Workspace (`BatchAnalysis.tsx`)
- Drag-and-drop CSV ingestion area with dashed 1px border.
- Built-in CSV sample generator download button.
- Live data grid with virtualized scrolling, search filter, and emotion category tags.
- Direct export to CSV and JSON.

### 3.5 Model Diagnostics & Benchmark Suite (`ModelPage.tsx`)
- Architecture card featuring "Ayush Vishwakarma's model".
- 7x7 confusion matrix with calibrated monochrome/tint density cells.
- Baseline benchmark comparison chart (DistilBERT vs. RoBERTa vs. Linear SVM vs. Naive Bayes).
- Transformer hyperparameter breakdown table (parameters, layers, attention heads, max sequence length).

### 3.6 Analytics & History (`Analytics.tsx` & `History.tsx`)
- Recharts emotion distribution donut with high-contrast custom tooltips.
- Confidence distribution histogram.
- Audit history table with pagination, keyword search, emotion filtering, and single/all deletion.

---

## 4. Motion Engineering & Kinetic Guidelines

```typescript
// Shared Motion Configurations
export const springSnappy = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 0.8,
};

export const springGentle = {
  type: "spring" as const,
  stiffness: 320,
  damping: 28,
  mass: 1,
};

export const springMorph = {
  type: "spring" as const,
  stiffness: 400,
  damping: 32,
  bounce: 0.12,
};
```

- Any hover effects must be gated behind `@media (hover: hover) and (pointer: fine)`.
- All transitions use CSS transitions or Framer Motion springs; linear transitions are strictly forbidden.

---

## 5. Verification & Quality Gates
- **TypeScript**: `npm run build` must complete with zero errors and zero unused variable warnings.
- **Backend Sync**: Ensure compatibility with port `236` API and `http://localhost:7036` frontend.
- **Vercel Readiness**: Ensure `vercel.json` and client API endpoints function seamlessly both locally and on Vercel.
- **Git State**: Local repository updates only. No remote push without explicit user command.
