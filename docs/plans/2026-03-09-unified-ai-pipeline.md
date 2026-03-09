# Unified AI Evaluation Pipeline

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the AI evaluation from a 3-phase system (eval → questions → second eval) into a linear pipeline (questions first → evaluate once), with mixed question types and conditional follow-up.

**Architecture:** Single `ai-eval.js` replaces both `ai-eval.js` and `ai-diffdx.js`. Three-step pipeline: generate questions → check sufficiency → stream final evaluation. State tracked in module-level variables.

**Tech Stack:** Vanilla JS, OpenAI Chat Completions API (gpt-5.4), streaming via ReadableStream

---

### Task 1: Rewrite ai-eval.js as unified pipeline

**Files:**
- Rewrite: `js/ai-eval.js`

**Step 1: Write the new ai-eval.js**

The file has these sections:
1. Constants + state
2. Score helpers (buildScorePayload, formatScoresForPrompt) — kept as-is
3. API helpers (callOpenAI for JSON, callOpenAIStream for streaming) — callOpenAI is new
4. Step 1: generateQuestions() — generates follow-up questions as JSON
5. renderQuestions() — renders mixed-type question cards
6. collectAnswers() — gathers all answers as formatted text
7. Step 2: submitAnswers() — sends answers, AI decides evaluate or ask more
8. Step 3: generateFinalEvaluation() — streams comprehensive report
9. startEvaluation() — entry point replacing old generateEvaluation()

Key details:
- Question JSON format supports types: "choice", "boolean", "freetext"
- Sufficiency check returns `{"action":"evaluate"}` or `{"action":"followup","questions":[...]}`
- Final evaluation prompt merges the old eval prompt + diff-dx impressions prompt into one
- Max 2 rounds of questions (round 1 always, round 2 only if AI requests)

**Step 2: Verify no syntax errors**

Open in browser, check console for parse errors.

**Step 3: Commit**

```bash
git add js/ai-eval.js
git commit -m "feat: rewrite ai-eval.js as unified question-first pipeline"
```

---

### Task 2: Update index.html — remove toggle, restructure AI section

**Files:**
- Modify: `index.html` (lines 754-858)

**Step 1: Replace the AI eval section HTML**

Changes:
- Remove "Deeper Clinical Context" toggle + disclaimer (lines 782-817)
- Change button text from "Generate Evaluation" to "Begin AI Evaluation"
- Change onclick from `generateEvaluation()` to `startEvaluation()`
- Move the questions section (diffDxSection) ABOVE the eval result
- Rename IDs: diffDxSection → followUpSection, diffDxQuestions → followUpQuestions, etc.
- Remove separate diffDxResult/diffDxStatus containers (single result container)
- Change submit button text to "Submit Answers"
- Change submit onclick from `submitDiffDx()` to `submitAnswers()`
- Remove `<script src="js/ai-diffdx.js"></script>` from script tags

**Step 2: Verify page loads correctly**

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: restructure AI section HTML for question-first flow"
```

---

### Task 3: Update ui.js — remove toggle function

**Files:**
- Modify: `js/ui.js`

**Step 1: Remove onDeepClinicalToggle()**

Delete the function entirely. Keep toggleKeyVis().

**Step 2: Commit**

```bash
git add js/ui.js
git commit -m "chore: remove unused onDeepClinicalToggle from ui.js"
```

---

### Task 4: Update questionnaire.js — fix retake()

**Files:**
- Modify: `js/questionnaire.js`

**Step 1: Update retake() for new element IDs**

Change references:
- `diffDxSection` → `followUpSection`
- `diffDxResult` → remove (no longer exists)
- `diffDxStatus` → `followUpStatus`
- Remove `deepClinicalToggle` and `deepClinicalDisclaimer` references
- Reset `followUpQuestionsData` instead of `diffDxQuestionsData`

**Step 2: Commit**

```bash
git add js/questionnaire.js
git commit -m "chore: update retake() for new AI pipeline element IDs"
```

---

### Task 5: Delete ai-diffdx.js

**Files:**
- Delete: `js/ai-diffdx.js`

**Step 1: Delete the file**

```bash
rm js/ai-diffdx.js
```

**Step 2: Commit**

```bash
git add -u js/ai-diffdx.js
git commit -m "chore: remove ai-diffdx.js (absorbed into ai-eval.js)"
```

---

### Task 6: Add CSS for freetext inputs

**Files:**
- Modify: `css/styles.css`

**Step 1: Add textarea styles**

Add styles for `.diff-dx-freetext` textarea and `.diff-dx-boolean` button group to match existing design system.

**Step 2: Commit**

```bash
git add css/styles.css
git commit -m "feat: add CSS for freetext and boolean question types"
```
