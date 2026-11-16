# INTELLIEMO — Precision Monolith Studio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the entire frontend of INTELLIEMO into a high-precision, production-grade text emotion intelligence platform inspired by Linear and Raycast, enforcing strict anti-slop standards and GPU spring motion physics.

**Architecture:** Monochromatic dark zinc base surfaces (`#09090B`, `#121215`, `#18181B`) with hair-thin 1px borders and dual-border insets. Framer Motion (Motion v12) spring physics for all interactions without layout thrashing. Dual-pane live inference console with token attribution heatmap and emotional shift trajectory tracking.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion v14, Lucide React, Recharts, Vite 8, Axios.

**Spec:** [`docs/superpowers/specs/2026-11-03-frontend-monolith-redesign.md`](../specs/2026-11-03-frontend-monolith-redesign.md)

## Global Constraints

- Monochromatic base structure (`#09090B` root canvas, `#121215` cards, `#18181B` inputs).
- Hair-thin 1px borders (`border-zinc-800`) with optical dual-insets (`inset 0 1px 0 rgba(255, 255, 255, 0.04)`).
- Zero AI-Slop: No purple radial background glows, no heavy frosted-glass panels (`backdrop-blur`), no oversized card radii (max 8px), and no emojis as icons.
- Strict kinetic craft: Animate ONLY GPU-composited properties (`transform` and `opacity`). Micro-interactions under 150ms.
- Model attribution must state: `"Ayush Vishwakarma's model"`.
- STRICT USER CONSTRAINT: Do NOT push any commits to GitHub without explicit user instruction.

## Review Focus

1. **Token Heatmap Click Inspection**: Clicking any token chip in the explanation must cleanly highlight the token and display its exact contribution weight without layout jumping.
2. **Compound Emotion Shift Indicator**: Sentences containing emotional transitions (e.g. fear to joy) must cleanly render the shift trajectory pill without overflowing on mobile screens.
3. **Empty / Cold State Graceful Fallback**: If the backend is loading or unavailable, interactive controls must display polite fallback state without crashing or rendering blank white screens.
4. **Keyboard Shortcuts**: `Ctrl + Enter` (and `⌘ + Enter`) must trigger analysis from anywhere inside the text input area.
5. **Zero Layout Thrashing**: Animations in tabs, lists, and drawers must run smoothly without frame drops.

---

### Task 1: Design Tokens, CSS Optics & Spring Presets

**Files:**
- Modify: `frontend/src/index.css`
- Create: `frontend/src/constants/motion.ts`

**Interfaces:**
- Produces: CSS utility classes (`.monolith-card`, `.monolith-input`, `.monolith-button`, `.monolith-border`, `.token-chip`) and exported Framer Motion presets (`springSnappy`, `springGentle`, `springMorph`).

- [ ] **Step 1: Create motion physics presets in `frontend/src/constants/motion.ts`**
  Define `springSnappy`, `springGentle`, `springMorph` and cubic-bezier decelerations.
- [ ] **Step 2: Update `frontend/src/index.css` with clean zinc monochromatic tokens**
  Remove all purple/violet radial background glows, blur-20px filters, and generic animations. Add clean dark surfaces, 1px optical borders, sub-pixel insets, custom scrollbars, and tactile button press mechanics (`transform: scale(0.97)` on `:active`).
- [ ] **Step 3: Verify TypeScript compilation**
  Run: `npm run build` in `frontend/`
  Expected: PASS with 0 errors.

---

### Task 2: Precision Shell & Navigation Rail (`DashboardLayout.tsx`)

**Files:**
- Modify: `frontend/src/layouts/DashboardLayout.tsx`

**Interfaces:**
- Consumes: `frontend/src/constants/motion.ts`, `frontend/src/api/client.ts` (`getHealth`)
- Produces: Persistent 240px sidebar, active navigation indicator (`layoutId="active-nav-indicator"`), live server health heartbeat radar, and keyboard navigation shortcuts.

- [ ] **Step 1: Re-architect `DashboardLayout.tsx` to Linear/Raycast dark precision**
  Replace frosted-glass header and rounded pills with fixed 240px zinc rail, 1px right border, crisp typography (`tracking-[-0.035em]`), active spring indicator pill, and live latency indicator.
- [ ] **Step 2: Add keyboard shortcuts for navigation**
  Support navigation hotkeys (`⌘1` to `⌘6` / `Ctrl+1` to `Ctrl+6`) to jump between pages.
- [ ] **Step 3: Verify build**
  Run: `npm run build` in `frontend/`
  Expected: PASS with 0 errors.

---

### Task 3: Dual-Pane Live Inference Console (`AnalyzeText.tsx`)

**Files:**
- Modify: `frontend/src/pages/AnalyzeText.tsx`

**Interfaces:**
- Consumes: `analyzeText` from `frontend/src/api/client.ts`, motion presets from `frontend/src/constants/motion.ts`
- Produces: Split ingestion deck and intelligence output console with token heatmap attribution and emotional shift banner.

- [ ] **Step 1: Refactor `AnalyzeText.tsx` into a high-density dual-pane console**
  Left Pane: Text editor with character count, word count, quick preset buttons, and `Ctrl+Enter` shortcut.
  Right Pane: Dominant emotion hero card with confidence score, emotional shift trajectory banner, interactive token attribution chips with sensitivity inspector, and horizontal probability bars.
- [ ] **Step 2: Add copy utilities for formatted JSON and cURL commands**
  Allow instant copying with checkmark feedback.
- [ ] **Step 3: Verify build**
  Run: `npm run build` in `frontend/`
  Expected: PASS with 0 errors.

---

### Task 4: Interactive Landing Page Overhaul (`LandingPage.tsx`)

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`

**Interfaces:**
- Consumes: `analyzeText` from `frontend/src/api/client.ts`, `springSnappy` from `frontend/src/constants/motion.ts`
- Produces: Hero section with embedded zero-friction live emotion playground, bento diagnostics matrix, and 7-class emotion wheel.

- [ ] **Step 1: Clean hero layout and remove all AI-slop gradients**
  Replace soft gradients with monochromatic precision grid, sharp typography, and live emotion testbed.
- [ ] **Step 2: Bento performance matrix & 7-class emotion wheel**
  Showcase 92.7% Macro F1, sub-15ms latency, local privacy guarantee, and interactive emotion triggers.
- [ ] **Step 3: Verify build**
  Run: `npm run build` in `frontend/`
  Expected: PASS with 0 errors.

---

### Task 5: Batch Analysis, Model Diagnostics, Analytics & History

**Files:**
- Modify: `frontend/src/pages/BatchAnalysis.tsx`
- Modify: `frontend/src/pages/ModelPage.tsx`
- Modify: `frontend/src/pages/Analytics.tsx`
- Modify: `frontend/src/pages/History.tsx`
- Modify: `frontend/src/pages/Documentation.tsx`

**Interfaces:**
- Consumes: `analyzeBatch`, `getModelInfo`, `getModelMetrics`, `getAnalyticsSummary`, `getHistory`
- Produces: Consistent Linear/Raycast UI across all secondary views.

- [ ] **Step 1: Update `BatchAnalysis.tsx`**
  Implement dashed 1px drag-and-drop dropzone, sample CSV generator download, live data table with virtual scroll, and CSV/JSON exports.
- [ ] **Step 2: Update `ModelPage.tsx`**
  Showcase "Ayush Vishwakarma's model" architecture specs, 7x7 confusion matrix heatmap, and baseline model comparison charts.
- [ ] **Step 3: Update `Analytics.tsx` & `History.tsx`**
  Monochrome charts with custom dark tooltips, confidence distribution histogram, and paginated audit table.
- [ ] **Step 4: Update `Documentation.tsx`**
  Clean developer API reference with syntax-highlighted cURL, Python, and TypeScript examples.
- [ ] **Step 5: Verify build**
  Run: `npm run build` in `frontend/`
  Expected: PASS with 0 errors.

---

### Task 6: Full Verification & Live Test Run

**Files:**
- Test: All frontend routes and backend APIs.

- [ ] **Step 1: Run complete frontend build**
  Run: `npm run build` in `frontend/`
  Expected: Exit code 0, 0 errors.
- [ ] **Step 2: Run backend test suite**
  Run: `pytest tests/test_api.py -v`
  Expected: 7/7 PASSED.
- [ ] **Step 3: Verify live local server rendering**
  Ensure Port `7036` (Web) and Port `236` (API) are running and responding HTTP 200.
- [ ] **Step 4: Check git status**
  Ensure all changes remain strictly local with zero unapproved git pushes.
