# Schema Questionnaire — Multi-File Project Split Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `schema-questionnaire2.html` (2715-line monolith) into a clean multi-file static project, plus upgrade the AI integration to GPT-5 with streaming.

**Architecture:** Extract CSS, JS modules, and HTML into separate files loaded via `<script src>` and `<link rel="stylesheet">` tags. No build step — pure static files. All JS uses global scope (no ES modules) so it works with `file://` and GitHub Pages equally. Script load order in `index.html` matters: `data.js` → `markdown.js` → `ui.js` → `questionnaire.js` → `results.js` → `ai-eval.js` → `ai-diffdx.js`.

**Tech Stack:** Vanilla HTML/CSS/JS, OpenAI Chat Completions API (streaming), GitHub Pages compatible.

**Source file:** `/Users/x/Documents/GitHub/schema-questionnaire2.html`

---

### Task 1: Create `css/styles.css`

**Files:**
- Create: `css/styles.css`

**Step 1: Extract all CSS**

Copy everything between the two `<style>` blocks in the source file into one CSS file. There are two style blocks:
- Lines 11–382: base styles (`:root`, layout, questionnaire, progress bar, submit)
- Lines 1228–2014: results styles (results cover, bars, stat cards, AI eval, diff-dx, toggle)

Create `css/styles.css` containing both blocks merged (no `<style>` tags, just the rules):

```css
/* === BASE STYLES (lines 11–382 of source) === */
:root {
    --ink: #1a1410;
    --paper: #f5f0e8;
    --cream: #ede8dc;
    --rust: #8b3a2a;
    --gold: #c4973a;
    --muted: #7a7060;
    --line: #d4cec0;
    --white: #fefcf8;
}
/* ... paste full contents of both <style> blocks here ... */
```

**Step 2: Verify**

Open `css/styles.css` and confirm it has no `<style>` or `</style>` tags — just raw CSS rules.

**Step 3: Commit**

```bash
cd /Users/x/Documents/GitHub/schema-questionnaire
git init
git add css/styles.css
git commit -m "feat: extract CSS into css/styles.css"
```

---

### Task 2: Create `js/data.js`

**Files:**
- Create: `js/data.js`

**Step 1: Extract data constants**

From source lines 2017–2046, extract `TOTAL`, `SCHEMAS`, and `DOMAINS` into `js/data.js`:

```js
// js/data.js
// All static data: schema definitions and domain groupings

const TOTAL = 90;

const SCHEMAS = [
    { id: 1, name: 'Abandonment / Instability', short: 'Abandonment', desc: 'Fear that loved ones will leave or be unreliable', domain: 1, qs: [1, 2, 3, 4, 5] },
    { id: 2, name: 'Mistrust / Abuse', short: 'Mistrust', desc: 'Expectation of being hurt, abused or manipulated', domain: 1, qs: [6, 7, 8, 9, 10] },
    { id: 3, name: 'Emotional Deprivation', short: 'Emotional Deprivation', desc: 'Belief that emotional needs will never be met', domain: 1, qs: [11, 12, 13, 14, 15] },
    { id: 4, name: 'Defectiveness / Shame', short: 'Defectiveness', desc: 'Feeling fundamentally flawed or unlovable', domain: 1, qs: [16, 17, 18, 19, 20] },
    { id: 5, name: 'Social Isolation / Alienation', short: 'Social Isolation', desc: 'Feeling apart from and different from everyone else', domain: 1, qs: [21, 22, 23, 24, 25] },
    { id: 6, name: 'Dependence / Incompetence', short: 'Dependence', desc: 'Belief of being unable to function without help', domain: 2, qs: [26, 27, 28, 29, 30] },
    { id: 7, name: 'Vulnerability to Harm', short: 'Vulnerability', desc: 'Exaggerated fear of imminent catastrophe', domain: 2, qs: [31, 32, 33, 34, 35] },
    { id: 8, name: 'Enmeshment / Undeveloped Self', short: 'Enmeshment', desc: 'Excessive involvement with others, lack of identity', domain: 2, qs: [36, 37, 38, 39, 40] },
    { id: 9, name: 'Failure', short: 'Failure', desc: 'Belief one has failed or will inevitably fail', domain: 2, qs: [41, 42, 43, 44, 45] },
    { id: 10, name: 'Entitlement / Grandiosity', short: 'Entitlement', desc: 'Belief of being superior with special rights', domain: 3, qs: [46, 47, 48, 49, 50] },
    { id: 11, name: 'Insufficient Self-Control', short: 'Self-Control Deficit', desc: 'Difficulty tolerating frustration or impulses', domain: 3, qs: [51, 52, 53, 54, 55] },
    { id: 12, name: 'Subjugation', short: 'Subjugation', desc: 'Surrendering control to avoid negative consequences', domain: 4, qs: [56, 57, 58, 59, 60] },
    { id: 13, name: 'Self-Sacrifice', short: 'Self-Sacrifice', desc: "Excessive focus on others' needs at own expense", domain: 4, qs: [61, 62, 63, 64, 65] },
    { id: 14, name: 'Approval-Seeking', short: 'Approval-Seeking', desc: "Excessive reliance on others' validation for self-esteem", domain: 4, qs: [66, 67, 68, 69, 70] },
    { id: 15, name: 'Negativity / Pessimism', short: 'Negativity', desc: 'Pervasive focus on the negative, minimising the positive', domain: 5, qs: [71, 72, 73, 74, 75] },
    { id: 16, name: 'Emotional Inhibition', short: 'Emotional Inhibition', desc: 'Suppression of emotions and spontaneous expression', domain: 5, qs: [76, 77, 78, 79, 80] },
    { id: 17, name: 'Unrelenting Standards', short: 'Unrelenting Standards', desc: 'Striving to meet impossibly high self-imposed standards', domain: 5, qs: [81, 82, 83, 84, 85] },
    { id: 18, name: 'Punitiveness', short: 'Punitiveness', desc: 'Belief people deserve harsh punishment for mistakes', domain: 5, qs: [86, 87, 88, 89, 90] },
];

const DOMAINS = [
    { id: 1, name: 'Disconnection & Rejection', schemas: [1, 2, 3, 4, 5] },
    { id: 2, name: 'Impaired Autonomy & Performance', schemas: [6, 7, 8, 9] },
    { id: 3, name: 'Impaired Limits', schemas: [10, 11] },
    { id: 4, name: 'Other-Directedness', schemas: [12, 13, 14] },
    { id: 5, name: 'Overvigilance & Inhibition', schemas: [15, 16, 17, 18] },
];
```

**Step 2: Commit**

```bash
git add js/data.js
git commit -m "feat: extract SCHEMAS and DOMAINS data into js/data.js"
```

---

### Task 3: Create `js/markdown.js`

**Files:**
- Create: `js/markdown.js`

**Step 1: Extract markdown renderer**

From source lines 2695–2711:

```js
// js/markdown.js
// Minimal markdown → HTML renderer for AI evaluation output

function renderEvalMarkdown(md) {
    let h = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    h = h.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
    h = h.replace(/^- (.+)$/gm, '<li>$1</li>');
    h = h.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
    h = h.split(/\n{2,}/).map(block => {
        block = block.trim();
        if (!block) return '';
        if (block.startsWith('<h3>') || block.startsWith('<ul>') || block.startsWith('<ol>')) return block;
        if (!block.startsWith('<')) return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
        return block;
    }).join('\n');
    return h;
}
```

**Step 2: Commit**

```bash
git add js/markdown.js
git commit -m "feat: extract markdown renderer into js/markdown.js"
```

---

### Task 4: Create `js/ui.js`

**Files:**
- Create: `js/ui.js`

**Step 1: Extract shared UI helpers**

From source lines 2231–2239:

```js
// js/ui.js
// Shared UI helpers: key visibility toggle, deep clinical toggle

function toggleKeyVis() {
    const inp = document.getElementById('apiKeyInput');
    inp.type = inp.type === 'password' ? 'text' : 'password';
}

function onDeepClinicalToggle() {
    const on = document.getElementById('deepClinicalToggle').checked;
    document.getElementById('deepClinicalDisclaimer').style.display = on ? 'flex' : 'none';
}
```

**Step 2: Commit**

```bash
git add js/ui.js
git commit -m "feat: extract UI helpers into js/ui.js"
```

---

### Task 5: Create `js/questionnaire.js`

**Files:**
- Create: `js/questionnaire.js`

**Step 1: Extract questionnaire logic**

From source lines 2048–2084 and 2100–2127 and 2214–2229:

```js
// js/questionnaire.js
// Radio button builder, progress tracking, form submission, retake

// Build radio buttons for all 90 questions
for (let i = 1; i <= TOTAL; i++) {
    const container = document.getElementById('q' + i);
    if (!container) continue;
    for (let v = 1; v <= 6; v++) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'q' + i;
        input.id = 'q' + i + '_' + v;
        input.value = v;
        const label = document.createElement('label');
        label.htmlFor = 'q' + i + '_' + v;
        label.textContent = v;
        container.appendChild(input);
        container.appendChild(label);
    }
}

// Progress tracking
function updateProgress() {
    let answered = 0;
    for (let i = 1; i <= TOTAL; i++) {
        if (document.querySelector('input[name="q' + i + '"]:checked')) answered++;
    }
    document.getElementById('progressFill').style.width = (answered / TOTAL * 100) + '%';
    document.getElementById('progressText').textContent = answered + ' / ' + TOTAL + ' answered';
    return answered;
}

document.querySelectorAll('input[type="radio"]').forEach(el => {
    el.addEventListener('change', updateProgress);
});

function getScore(q) {
    const el = document.querySelector('input[name="q' + q + '"]:checked');
    return el ? parseInt(el.value) : null;
}

function handleSubmit() {
    const answered = updateProgress();
    const note = document.getElementById('submitNote');

    if (answered < TOTAL) {
        for (let i = 1; i <= TOTAL; i++) {
            if (!document.querySelector('input[name="q' + i + '"]:checked')) {
                const el = document.getElementById('q' + i);
                if (el) {
                    const row = el.closest('.question-row');
                    if (row) {
                        row.style.background = 'rgba(139,58,42,0.10)';
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => { row.style.background = ''; }, 2000);
                    }
                }
                break;
            }
        }
        note.textContent = (TOTAL - answered) + ' question(s) still unanswered — first unanswered question highlighted above.';
        note.style.color = '#8b3a2a';
        return;
    }

    buildResults();
}

function retake() {
    document.getElementById('resultsPanel').style.display = 'none';
    document.getElementById('aiEvalResult').style.display = 'none';
    document.getElementById('aiEvalStatus').textContent = '';
    document.getElementById('aiEvalStatus').className = 'ai-eval-status';
    document.getElementById('diffDxSection').style.display = 'none';
    document.getElementById('diffDxResult').style.display = 'none';
    document.getElementById('diffDxStatus').textContent = '';
    document.getElementById('deepClinicalToggle').checked = false;
    document.getElementById('deepClinicalDisclaimer').style.display = 'none';
    diffDxQuestionsData = [];
    document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

**Step 2: Commit**

```bash
git add js/questionnaire.js
git commit -m "feat: extract questionnaire logic into js/questionnaire.js"
```

---

### Task 6: Create `js/results.js`

**Files:**
- Create: `js/results.js`

**Step 1: Extract results rendering**

From source lines 2086–2098 and 2129–2212:

```js
// js/results.js
// Score helpers and results panel rendering (bar charts, domain scores, top-5 cards)

function barColor(score) {
    if (score >= 5) return '#8b1a1a';
    if (score >= 4) return '#c4703a';
    if (score >= 3) return '#e8c97a';
    return '#b8d4b0';
}

function levelLabel(score) {
    if (score >= 5) return 'High';
    if (score >= 4) return 'Elevated';
    if (score >= 3) return 'Moderate';
    return 'Low';
}

function buildResults() {
    const schemaScores = SCHEMAS.map(s => {
        const vals = s.qs.map(getScore);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return { ...s, score: parseFloat(avg.toFixed(2)) };
    });

    const domainScores = DOMAINS.map(d => {
        const relevant = schemaScores.filter(s => d.schemas.includes(s.id));
        const avg = relevant.reduce((a, b) => a + b.score, 0) / relevant.length;
        return { ...d, score: parseFloat(avg.toFixed(2)) };
    });

    const elevated = schemaScores.filter(s => s.score >= 4).length;
    const highest = schemaScores.reduce((a, b) => a.score > b.score ? a : b);
    const overall = schemaScores.reduce((a, b) => a + b.score, 0) / schemaScores.length;

    document.getElementById('summaryStats').innerHTML = `
      <div class="stat-card"><div class="stat-val">${overall.toFixed(1)}</div><div class="stat-label">Overall Average</div></div>
      <div class="stat-card"><div class="stat-val">${elevated}</div><div class="stat-label">Elevated Schemas (≥4.0)</div></div>
      <div class="stat-card"><div class="stat-val">${highest.short}</div><div class="stat-label">Highest Schema</div></div>
    `;

    const barsEl = document.getElementById('allSchemasBars');
    barsEl.innerHTML = schemaScores.map(s => `
      <div class="bar-row">
        <div class="bar-label">${s.short}<small>Schema ${s.id}</small></div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(s.score / 6) * 100}%; background:${barColor(s.score)};"></div>
        </div>
        <div class="bar-score" style="color:${barColor(s.score)}">${s.score}</div>
      </div>
    `).join('');

    const domainEl = document.getElementById('domainBars');
    domainEl.innerHTML = domainScores.map(d => `
      <div class="domain-bar-row">
        <div class="domain-bar-top">
          <div class="domain-bar-name">${d.name}</div>
          <div class="domain-bar-score" style="color:${barColor(d.score)}">${d.score} <span style="font-size:13px;color:var(--muted);font-family:'DM Sans',sans-serif;">${levelLabel(d.score)}</span></div>
        </div>
        <div class="domain-bar-track">
          <div class="domain-bar-fill" style="width:${(d.score / 6) * 100}%; background:${barColor(d.score)};"></div>
        </div>
      </div>
    `).join('');

    const top5 = [...schemaScores].sort((a, b) => b.score - a.score).slice(0, 5);
    const domainName = id => DOMAINS.find(d => d.schemas.includes(id)).name;
    const topEl = document.getElementById('topSchemas');
    topEl.innerHTML = top5.map((s, i) => {
        const cls = s.score >= 5 ? 'high' : s.score >= 4 ? 'elevated' : '';
        return `
        <div class="top-schema-card ${cls}">
          <div class="top-rank">${i + 1}</div>
          <div>
            <div class="top-schema-name">${s.name}</div>
            <div class="top-schema-desc">${s.desc}</div>
            <div class="top-schema-domain">Domain: ${domainName(s.id)}</div>
          </div>
          <div class="top-score-badge" style="color:${barColor(s.score)}">${s.score}</div>
        </div>
      `;
    }).join('');

    document.getElementById('resultsPanel').style.display = 'block';
    document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
        document.querySelectorAll('.bar-fill, .domain-bar-fill').forEach(el => {
            const w = el.style.width;
            el.style.width = '0';
            requestAnimationFrame(() => { el.style.width = w; });
        });
    }, 100);
}
```

**Step 2: Commit**

```bash
git add js/results.js
git commit -m "feat: extract results rendering into js/results.js"
```

---

### Task 7: Create `js/ai-eval.js` with GPT-5 streaming

**Files:**
- Create: `js/ai-eval.js`

**Step 1: Extract and upgrade AI evaluation**

Key changes from source:
- Replace `models = ['gpt-4.1', 'gpt-4o']` with single model `gpt-5.4-2026-03-05`
- Replace non-streaming `fetch` + `json.choices[0].message.content` with streaming via `ReadableStream`
- Stream tokens into the result element as they arrive (append to `eval-body` div in real-time)
- Keep all prompts identical to source

```js
// js/ai-eval.js
// OpenAI integration: score payload builder, streaming API call, Phase 1 evaluation

const AI_MODEL = 'gpt-5.4-2026-03-05';

// ─── Score Helpers ───────────────────────────────────────────────

function buildScorePayload() {
    const schemaScores = SCHEMAS.map(s => {
        const vals = s.qs.map(getScore);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return { id: s.id, name: s.name, short: s.short, domain: s.domain, score: parseFloat(avg.toFixed(2)), desc: s.desc };
    });
    const domainScores = DOMAINS.map(d => {
        const relevant = schemaScores.filter(s => d.schemas.includes(s.id));
        const avg = relevant.reduce((a, b) => a + b.score, 0) / relevant.length;
        return { name: d.name, score: parseFloat(avg.toFixed(2)) };
    });
    const overall = schemaScores.reduce((a, b) => a + b.score, 0) / schemaScores.length;
    const elevated = schemaScores.filter(s => s.score >= 4);
    const high = schemaScores.filter(s => s.score >= 5);
    const top5 = [...schemaScores].sort((a, b) => b.score - a.score).slice(0, 5);
    return { schemaScores, domainScores, overall: parseFloat(overall.toFixed(2)), elevated, high, top5 };
}

function formatScoresForPrompt(data) {
    let txt = `YOUNG SCHEMA QUESTIONNAIRE — SCORED PROFILE\n`;
    txt += `Overall Mean: ${data.overall} / 6.00\n`;
    txt += `Elevated Schemas (≥4.0): ${data.elevated.length}\n`;
    txt += `High Schemas (≥5.0): ${data.high.length}\n\n`;
    txt += `DOMAIN SCORES:\n`;
    data.domainScores.forEach(d => { txt += `  ${d.name}: ${d.score}\n`; });
    txt += `\nSCHEMA SCORES (all 18):\n`;
    data.schemaScores.forEach(s => {
        const flag = s.score >= 5 ? ' [HIGH]' : s.score >= 4 ? ' [ELEVATED]' : '';
        txt += `  ${s.name}: ${s.score}${flag}\n`;
    });
    txt += `\nTOP 5 SCHEMAS:\n`;
    data.top5.forEach((s, i) => { txt += `  ${i + 1}. ${s.name} — ${s.score} (${s.desc})\n`; });
    return txt;
}

// ─── Streaming API Call ──────────────────────────────────────────

// Calls OpenAI with stream:true. Calls onChunk(text) for each streamed token.
// Returns the full accumulated text when done.
async function callOpenAIStream(apiKey, systemPrompt, userPrompt, statusEl, onChunk) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: AI_MODEL,
            stream: true,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.5,
            max_tokens: 4096
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('Invalid API key. Check your key and try again.');
        if (response.status === 429) throw new Error('Rate limit exceeded. Wait a moment and try again.');
        throw new Error(err.error?.message || `API returned status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
                const parsed = JSON.parse(data);
                const token = parsed.choices?.[0]?.delta?.content;
                if (token) {
                    fullText += token;
                    if (onChunk) onChunk(token, fullText);
                }
            } catch (_) { /* ignore malformed chunks */ }
        }
    }

    return fullText;
}

// ─── Phase 1: Generate Evaluation ────────────────────────────────

async function generateEvaluation() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const statusEl = document.getElementById('aiEvalStatus');
    const resultEl = document.getElementById('aiEvalResult');
    const deepOn = document.getElementById('deepClinicalToggle').checked;

    if (!apiKey) { statusEl.textContent = 'Please enter your OpenAI API key above.'; statusEl.className = 'ai-eval-status error'; return; }
    if (!apiKey.startsWith('sk-')) { statusEl.textContent = 'Invalid key format — OpenAI keys begin with "sk-".'; statusEl.className = 'ai-eval-status error'; return; }

    const btn = document.getElementById('aiEvalBtn');
    btn.disabled = true; btn.style.opacity = '0.5';
    statusEl.innerHTML = '<span class="spinner"></span> Generating clinical evaluation…';
    statusEl.className = 'ai-eval-status';
    resultEl.style.display = 'none';
    document.getElementById('diffDxSection').style.display = 'none';

    const data = buildScorePayload();
    const scoresText = formatScoresForPrompt(data);

    // System prompt — identical to original
    const systemPrompt = `You are a licensed clinical psychologist with specialised training in Schema Therapy (Young, Klosko & Weishaar, 2003). You are writing a professional evaluation report based on a completed Young Schema Questionnaire (YSQ-S3, 90 items, 18 schemas, 5 domains, 1–6 Likert scale).

Your task is to produce a thorough, clinically precise, and empathic evaluation. Write in the voice of a seasoned clinician preparing a report for a client who will read it directly. Be direct about what the data shows — do not minimise or catastrophise.

Structure your report with these exact section headings (use ### markdown headings):

### Overview
A 2–3 sentence summary: overall severity level, number of elevated schemas, and which domain(s) are most activated. State whether the profile suggests clinically significant patterns.

### Domain-Level Analysis
For each of the 5 domains, provide a brief interpretation. Focus more on domains with elevated scores (≥3.5) and briefly acknowledge low domains. Name the domain, state the score, and explain what this means in terms of the person's inner world and relational patterns.

### Elevated Schema Profiles
For each schema scoring ≥4.0 (if any), provide:
- What this schema typically looks like in daily life
- Common emotional triggers
- Likely coping modes (surrender, avoidance, overcompensation)
- How this schema might interact with other elevated schemas in this profile

If no schemas are ≥4.0, discuss the top 2–3 schemas and what their moderate activation suggests.

### Schema Interactions & Pattern Dynamics
Identify the 2–3 most significant schema clusters or interactions in this profile. Explain how they may reinforce each other, creating cyclical patterns. Be specific to THIS person's scores.

### Protective Factors & Strengths
Identify schemas that scored low (≤2.0) and frame these as genuine strengths and resilience factors. Explain what low scores in these areas suggest about the person's emotional resources.

### Clinical Recommendations
Provide 4–6 specific, actionable recommendations. These should include:
- Which schemas to prioritise in therapy
- Suggested therapeutic modalities (schema therapy techniques, limited reparenting, chair work, mode work, behavioural pattern-breaking, etc.)
- Self-help strategies the person can begin immediately
- When professional support is strongly advised vs. optional

### Risk Considerations
If any schema scores ≥5.0, flag specific emotional vulnerabilities. If overall profile is significantly elevated, note this clearly but without alarm. If the profile is relatively mild, state that no acute concerns are indicated.

Formatting rules:
- Use ### for section headings only
- Use **bold** for schema names when referenced
- Use *italics* for clinical terms on first mention
- Write in second person ("you", "your") for directness
- Keep total length between 1200–1800 words
- Do not use numbered lists for the main sections — use flowing paragraphs with bullets only where listing specifics
- End with a single-line disclaimer reminding the reader that this AI-generated evaluation is not a substitute for professional assessment

Ethical standards:
- Do not diagnose any DSM/ICD condition
- Frame everything as patterns and tendencies, not pathology
- Maintain a tone that is warm, direct, and clinically precise
- Acknowledge that self-report measures have inherent limitations
- Respect the courage it takes to complete an assessment like this`;

    const userPrompt = `Here is the completed questionnaire data for evaluation:\n\n${scoresText}\n\nPlease generate the professional evaluation report now.`;

    // Set up result shell for streaming
    resultEl.innerHTML = `
        <div class="eval-header">
          <div class="eval-header-label">AI-Generated Clinical Evaluation</div>
          <div class="eval-header-title">Schema Profile — Professional Interpretation</div>
        </div>
        <div class="eval-body" id="evalBodyStream"></div>
        <div class="eval-footer" id="evalFooter" style="display:none;"></div>
    `;
    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const bodyEl = document.getElementById('evalBodyStream');
    let accumulatedMd = '';

    try {
        const fullText = await callOpenAIStream(apiKey, systemPrompt, userPrompt, statusEl, (token, full) => {
            accumulatedMd = full;
            bodyEl.innerHTML = renderEvalMarkdown(accumulatedMd);
        });

        // Final render and footer
        bodyEl.innerHTML = renderEvalMarkdown(fullText);
        const footerEl = document.getElementById('evalFooter');
        footerEl.textContent = `Generated by ${AI_MODEL} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · This evaluation is AI-generated and does not constitute a clinical diagnosis or professional psychological assessment. It is intended for self-reflection and educational purposes only.`;
        footerEl.style.display = '';

        statusEl.textContent = '';

        if (deepOn) {
            setTimeout(() => generateDiffDxQuestions(apiKey, data, scoresText), 600);
        }

    } catch (err) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.className = 'ai-eval-status error';
        resultEl.style.display = 'none';
    } finally {
        btn.disabled = false; btn.style.opacity = '1';
    }
}
```

**Step 2: Commit**

```bash
git add js/ai-eval.js
git commit -m "feat: extract AI eval into js/ai-eval.js with GPT-5 streaming"
```

---

### Task 8: Create `js/ai-diffdx.js` with streaming

**Files:**
- Create: `js/ai-diffdx.js`

**Step 1: Extract diff-dx logic**

From source lines 2427–2691. Key change: `submitDiffDx` streams its result the same way as `generateEvaluation`.
The `generateDiffDxQuestions` call uses JSON mode — streaming is not suitable for JSON parsing, so it stays non-streaming (fetch → full response → JSON.parse). Only `submitDiffDx` (the impressions report) gets streaming.

```js
// js/ai-diffdx.js
// Phase 2: Generate differential diagnostic questions (non-streaming, JSON output)
// Phase 3: Submit diff-dx answers and stream diagnostic impressions

let diffDxQuestionsData = [];

// ─── Phase 2: Generate Differential Dx Questions ─────────────────

async function generateDiffDxQuestions(apiKey, data, scoresText) {
    const section = document.getElementById('diffDxSection');
    const statusEl = document.getElementById('aiEvalStatus');
    section.style.display = 'block';
    statusEl.innerHTML = '<span class="spinner"></span> Generating differential diagnostic questions based on your profile…';

    // [Full sysPrompt identical to source lines 2435–2475]
    const sysPrompt = `You are a clinical psychologist generating differential diagnostic screening questions based on a Young Schema Questionnaire profile. Your task is to produce a structured JSON array of questions that help differentiate between DSM-5/ICD-11 conditions commonly associated with the person's elevated schema pattern.

RULES:
1. Use a MECE approach (Mutually Exclusive, Collectively Exhaustive) — cover all plausible diagnostic categories without redundancy.
2. Generate questions organised into clinical categories. Typical categories (select the RELEVANT ones based on the profile — not all will apply):
   - Mood Disorders (MDD, Persistent Depressive Disorder, Bipolar spectrum)
   - Anxiety Disorders (GAD, Social Anxiety, Panic Disorder, Specific Phobias)
   - Trauma & Stress-Related (PTSD, Complex PTSD, Adjustment Disorders)
   - Personality Patterns (Cluster A/B/C traits — be specific about which)
   - Attachment & Relational (Attachment insecurity patterns, Codependency)
   - Impulse Control & Self-Regulation (ADHD, Substance Use, Behavioral Addictions)
   - Somatic & Dissociative (Somatic symptom patterns, Dissociation)
   - Obsessive-Compulsive Spectrum (OCD, Perfectionism-driven patterns)
   - Eating & Body Image (if relevant schemas are elevated)
   Only include categories where the schema profile provides genuine clinical rationale.

3. Per category generate 3–5 questions. Each question should:
   - Be specific and behavioural (not vague)
   - Target a distinguishing feature of the condition
   - Be answerable with frequency-based responses
   - Include brief clinical context explaining WHY this question is relevant to this profile

4. Response options for ALL questions must be: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]

5. Output ONLY valid JSON — no markdown, no commentary, no code fences. The structure must be:
[
  {
    "category": "Category Name",
    "rationale": "Brief explanation of why this category is relevant to this schema profile",
    "questions": [
      {
        "id": "q1",
        "text": "Question text here?",
        "context": "Brief clinical note on what this question screens for",
        "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
      }
    ]
  }
]

Generate between 20–35 questions total across all relevant categories. Quality over quantity. Every question should earn its place by providing differential signal.`;

    const userMsg = `Here is the schema profile to generate differential diagnostic questions for:\n\n${scoresText}\n\nGenerate the JSON array of categorised differential screening questions now. Output ONLY valid JSON.`;

    try {
        // Non-streaming: need complete JSON before we can parse
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [
                    { role: 'system', content: sysPrompt },
                    { role: 'user', content: userMsg }
                ],
                temperature: 0.5,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `API returned status ${response.status}`);
        }

        const json = await response.json();
        let content = json.choices?.[0]?.message?.content?.trim() || '';
        if (content.startsWith('```')) {
            content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
        }
        const categories = JSON.parse(content);
        diffDxQuestionsData = categories;

        renderDiffDxQuestions(categories);
        statusEl.textContent = '';
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        statusEl.textContent = 'Error generating questions: ' + err.message;
        statusEl.className = 'ai-eval-status error';
    }
}

// ─── Render Diff-Dx Question Cards ───────────────────────────────

function renderDiffDxQuestions(categories) {
    const container = document.getElementById('diffDxQuestions');
    let totalQ = 0;
    let html = '';

    categories.forEach((cat, ci) => {
        html += `<div class="diff-dx-category">`;
        html += `<div class="diff-dx-category-header"><div class="diff-dx-cat-badge">${ci + 1}</div>${cat.category}</div>`;
        if (cat.rationale) {
            html += `<div class="diff-dx-q-context" style="margin-bottom:14px;margin-top:-6px;">${cat.rationale}</div>`;
        }
        cat.questions.forEach((q, qi) => {
            const qid = `ddx_${ci}_${qi}`;
            totalQ++;
            html += `<div class="diff-dx-q-card" id="card_${qid}">`;
            html += `<div class="diff-dx-q-text">${q.text}</div>`;
            if (q.context) html += `<div class="diff-dx-q-context">${q.context}</div>`;
            html += `<div class="diff-dx-options">`;
            q.options.forEach((opt, oi) => {
                html += `<input type="radio" name="${qid}" id="${qid}_${oi}" value="${opt}" onchange="onDiffDxAnswer('${qid}')">`;
                html += `<label for="${qid}_${oi}">${opt}</label>`;
            });
            html += `</div></div>`;
        });
        html += `</div>`;
    });

    container.innerHTML = html;
    document.getElementById('diffDxProgressText').textContent = `0 / ${totalQ} answered`;
    container.dataset.total = totalQ;
}

function onDiffDxAnswer(qid) {
    const card = document.getElementById('card_' + qid);
    if (card) card.classList.add('answered');

    const container = document.getElementById('diffDxQuestions');
    const total = parseInt(container.dataset.total || 0);
    const answered = container.querySelectorAll('.diff-dx-q-card.answered').length;
    document.getElementById('diffDxProgressText').textContent = `${answered} / ${total} answered`;
}

// ─── Phase 3: Submit Differential Dx & Stream Diagnostic Impressions ─

async function submitDiffDx() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const statusEl = document.getElementById('diffDxStatus');
    const resultEl = document.getElementById('diffDxResult');
    const container = document.getElementById('diffDxQuestions');
    const total = parseInt(container.dataset.total || 0);
    const answered = container.querySelectorAll('.diff-dx-q-card.answered').length;

    if (answered < total) {
        const allCards = container.querySelectorAll('.diff-dx-q-card');
        for (const card of allCards) {
            if (!card.classList.contains('answered')) {
                card.style.border = '1.5px solid #8b3a2a';
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => { card.style.border = ''; }, 2000);
                break;
            }
        }
        statusEl.textContent = `${total - answered} question(s) still unanswered. First unanswered highlighted above.`;
        statusEl.className = 'ai-eval-status error';
        return;
    }

    if (!apiKey) { statusEl.textContent = 'API key required — enter it above.'; statusEl.className = 'ai-eval-status error'; return; }

    const btn = document.getElementById('diffDxSubmitBtn');
    btn.disabled = true; btn.style.opacity = '0.5';
    statusEl.innerHTML = '<span class="spinner"></span> Analysing your responses — generating diagnostic impressions…';
    statusEl.className = 'ai-eval-status';
    resultEl.style.display = 'none';

    const data = buildScorePayload();
    const scoresText = formatScoresForPrompt(data);

    let answersText = 'DIFFERENTIAL DIAGNOSTIC SCREENING RESPONSES:\n\n';
    diffDxQuestionsData.forEach((cat, ci) => {
        answersText += `Category: ${cat.category}\n`;
        cat.questions.forEach((q, qi) => {
            const qid = `ddx_${ci}_${qi}`;
            const selected = document.querySelector(`input[name="${qid}"]:checked`);
            const val = selected ? selected.value : 'Not answered';
            answersText += `  Q: ${q.text}\n  A: ${val}\n`;
        });
        answersText += '\n';
    });

    // [Full sysPrompt identical to source lines 2596–2663]
    const sysPrompt = `You are a licensed clinical psychologist producing a diagnostic impressions report. You have access to:
1. A completed Young Schema Questionnaire profile (18 schemas, 5 domains)
2. The client's responses to a differential diagnostic screening questionnaire designed specifically for their schema profile

Your task is to produce a report with TWO main sections. This is a PSEUDO-DIAGNOSTIC report — it is AI-generated, not clinically valid, and represents common associations and clinical hypotheses, not confirmed diagnoses.

Structure (use ### markdown headings):

### Commonly Associated DSM-5 / ICD-11 Conditions

For each condition you identify as potentially relevant, provide:
- **Condition name** with DSM-5 and ICD-11 codes
- **Association strength**: Strong / Moderate / Tentative — based on how strongly the schema profile AND screening responses converge
- **Evidence from this profile**: Cite the specific schema scores and screening answers that point toward this condition
- **Key differentiators**: What would confirm vs. rule out this condition clinically
- **Caveat**: One sentence on what else could explain this pattern

Order conditions from strongest to weakest association. Typically identify 3–6 conditions. Do not pad with weakly supported conditions.

For personality patterns, describe TRAITS and TENDENCIES (e.g., "Cluster C personality traits consistent with avoidant and dependent features") rather than assigning a full personality disorder diagnosis. However, if the evidence is strong, name the specific personality pattern clearly.

### Recommended Structured Diagnostic Instruments

Based on the conditions identified above, recommend specific validated instruments for formal assessment. For each:
- **Instrument name** (acronym + full name)
- **What it assesses**
- **Why it's relevant for this profile** — tie it directly to the conditions above
- **Administration notes** (self-report vs. clinician-administered, approximate time, availability)

Recommend instruments in priority order. Typical instruments to consider (select only those relevant):
- SCID-5-CV / SCID-5-PD (Structured Clinical Interview for DSM-5)
- PDQ-4+ (Personality Diagnostic Questionnaire)
- MCMI-IV (Millon Clinical Multiaxial Inventory)
- PHQ-9 (Patient Health Questionnaire for depression)
- GAD-7 (Generalised Anxiety Disorder scale)
- PCL-5 (PTSD Checklist)
- ITQ (International Trauma Questionnaire for Complex PTSD)
- LSAS (Liebowitz Social Anxiety Scale)
- ASRS (Adult ADHD Self-Report Scale)
- EDE-Q (Eating Disorder Examination Questionnaire)
- OCI-R (Obsessive-Compulsive Inventory)
- DES-II (Dissociative Experiences Scale)
- ECR-R (Experiences in Close Relationships for attachment)
- DERS (Difficulties in Emotion Regulation Scale)
- Any other validated instrument that fits

Recommend 4–8 instruments. Prioritise the most diagnostically informative ones.

### Clinical Synthesis & Next Steps
A 3–4 paragraph synthesis that:
- Summarises the overall clinical picture integrating schemas + screening
- Identifies the single most important clinical question remaining
- Suggests a practical next-step pathway (which professional, what type of assessment, urgency level)
- Ends with an encouraging but honest statement

Formatting rules:
- Use ### for section headings
- Use **bold** for condition names and instrument names
- Use *italics* for clinical terms
- Write in second person
- Keep total 1000–1600 words
- Begin the report with a single-line prominent disclaimer: "⚠ PSEUDO-DIAGNOSIS — This is an AI-generated analysis of common diagnostic associations. It is not a clinical diagnosis and has no diagnostic validity. Use it only as a reflective tool and a conversation starter with a licensed professional."

Ethical standards:
- Frame all conditions as ASSOCIATIONS and HYPOTHESES, never as confirmed diagnoses
- Use language like "patterns consistent with", "features suggestive of", "warrants further exploration"
- Make clear that self-report screening cannot replace structured clinical interview
- Do not minimise genuine clinical signals, but do not catastrophise either`;

    const userMsg = `Here is all available data:\n\n${scoresText}\n\n${answersText}\n\nGenerate the diagnostic impressions report now.`;

    // Set up streaming result shell
    resultEl.innerHTML = `
        <div class="eval-header dx-impressions-header">
          <div class="eval-header-label">AI-Generated Diagnostic Impressions</div>
          <div class="eval-header-title">Pseudo-Diagnostic Analysis & Recommended Instruments</div>
        </div>
        <div class="eval-body" id="diffDxBodyStream"></div>
        <div class="eval-footer" id="diffDxFooter" style="display:none; background:rgba(196,112,58,0.08);border-top-color:rgba(196,112,58,0.2);"></div>
    `;
    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const bodyEl = document.getElementById('diffDxBodyStream');
    let accumulatedMd = '';

    try {
        const fullText = await callOpenAIStream(apiKey, sysPrompt, userMsg, statusEl, (token, full) => {
            accumulatedMd = full;
            bodyEl.innerHTML = renderEvalMarkdown(accumulatedMd);
        });

        bodyEl.innerHTML = renderEvalMarkdown(fullText);
        const footerEl = document.getElementById('diffDxFooter');
        footerEl.textContent = `⚠ PSEUDO-DIAGNOSIS · Generated by ${AI_MODEL} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · This analysis is AI-generated and has NO diagnostic validity. It identifies common associations and hypotheses based on self-report data. It is not a clinical diagnosis under DSM-5, ICD-11, or any other standard. A licensed clinician using validated structured interviews is the only path to a valid diagnosis.`;
        footerEl.style.display = '';
        statusEl.textContent = '';

    } catch (err) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.className = 'ai-eval-status error';
        resultEl.style.display = 'none';
    } finally {
        btn.disabled = false; btn.style.opacity = '1';
    }
}
```

**Step 2: Commit**

```bash
git add js/ai-diffdx.js
git commit -m "feat: extract diff-dx into js/ai-diffdx.js with streaming impressions"
```

---

### Task 9: Create `index.html`

**Files:**
- Create: `index.html`

**Step 1: Build index.html**

Take the full HTML body from source (lines 385–1226) — all the questionnaire HTML and results panel HTML — and wrap it with a new `<head>` that loads the extracted CSS and JS files instead of inline styles and scripts.

Script load order is critical (each file depends on the ones before it):
1. `js/data.js` — `TOTAL`, `SCHEMAS`, `DOMAINS`
2. `js/markdown.js` — `renderEvalMarkdown`
3. `js/ui.js` — `toggleKeyVis`, `onDeepClinicalToggle`
4. `js/results.js` — `barColor`, `levelLabel`, `buildResults`
5. `js/ai-eval.js` — `AI_MODEL`, `buildScorePayload`, `callOpenAIStream`, `generateEvaluation`
6. `js/ai-diffdx.js` — `diffDxQuestionsData`, `generateDiffDxQuestions`, `submitDiffDx`
7. `js/questionnaire.js` — runs immediately on load, references `buildResults` from results.js

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Young Schema Questionnaire</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

    <!-- [Paste full body HTML from source lines 387–1226 here, unchanged] -->

    <script src="js/data.js"></script>
    <script src="js/markdown.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/results.js"></script>
    <script src="js/ai-eval.js"></script>
    <script src="js/ai-diffdx.js"></script>
    <script src="js/questionnaire.js"></script>
</body>
</html>
```

**Step 2: Verify no inline `<style>` or `<script>` blocks remain in index.html**

```bash
grep -n "<style>" index.html   # should return nothing
grep -n "<script>" index.html  # should return only the 7 <script src="..."> tags
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: create index.html loading all extracted CSS/JS modules"
```

---

### Task 10: Add `.gitignore` and `README.md`

**Files:**
- Create: `.gitignore`
- Create: `README.md`

**Step 1: Create `.gitignore`**

```
.DS_Store
*.log
```

**Step 2: Create `README.md`**

```markdown
# Young Schema Questionnaire

Interactive self-assessment tool based on the Young Schema Questionnaire (YSQ-S3).
90 questions across 18 schemas and 5 clinical domains. Includes AI-generated clinical
evaluation and differential diagnostic screening via OpenAI.

## Running locally

Open `index.html` directly in a browser — no server or build step required.

## Deploying

Push to GitHub and enable GitHub Pages (Settings → Pages → Deploy from branch → main → / (root)).

## Project structure

| File | Purpose |
|------|---------|
| `index.html` | Full questionnaire and results HTML |
| `css/styles.css` | All styles |
| `js/data.js` | Schema and domain definitions |
| `js/markdown.js` | Minimal markdown renderer |
| `js/ui.js` | Shared UI helpers |
| `js/questionnaire.js` | Radio buttons, progress, submit, retake |
| `js/results.js` | Bar charts, domain scores, top-5 cards |
| `js/ai-eval.js` | OpenAI streaming call + Phase 1 evaluation |
| `js/ai-diffdx.js` | Phase 2 diff-dx questions + Phase 3 impressions |

## AI features

Requires an OpenAI API key (entered in the UI — never stored). Uses `gpt-5.4-2026-03-05`
with streaming for real-time output.
```

**Step 3: Commit**

```bash
git add .gitignore README.md
git commit -m "chore: add .gitignore and README"
```

---

### Task 11: Smoke test

**Step 1: Open in browser**

Open `index.html` in a browser. Verify:
- [ ] Questionnaire renders with all 90 radio button groups
- [ ] Progress bar updates as you answer questions
- [ ] "View My Results" button highlights first unanswered question if not all answered
- [ ] After answering all 90, results panel appears with bar charts
- [ ] Domain scores and Top 5 schemas render correctly
- [ ] "Retake" button resets the form

**Step 2: Test AI eval (optional, requires API key)**

- [ ] Enter an OpenAI key and click "Generate Evaluation" — text streams in real-time
- [ ] Enable "Deeper Clinical Context" — diff-dx questions appear after eval completes
- [ ] Answer diff-dx questions and click "Generate Diagnostic Impressions" — streams in real-time

**Step 3: Commit if all good**

```bash
git add -A
git commit -m "chore: verified smoke test passes"
```

---

### Task 12: Delete the source monolith (optional)

Once verified, the original file can be archived or deleted.

```bash
# Option A: keep as reference
mv /Users/x/Documents/GitHub/schema-questionnaire2.html /Users/x/Documents/GitHub/schema-questionnaire/schema-questionnaire2.original.html
git add schema-questionnaire2.original.html
git commit -m "chore: archive original monolith for reference"

# Option B: just delete it (it's in git history anyway)
rm /Users/x/Documents/GitHub/schema-questionnaire2.html
```
