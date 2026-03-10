// js/ai-eval.js — Unified AI evaluation pipeline: questions → sufficiency check → comprehensive evaluation

const AI_MODEL = 'gpt-5.4-2026-03-05';

// ─── State ──────────────────────────────────────────────────────

let followUpQuestionsData = [];
let answersHistory = [];
let currentRound = 0;

// ─── Utilities ──────────────────────────────────────────────────

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Score Helpers ──────────────────────────────────────────────

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

// ─── API Helpers ────────────────────────────────────────────────

async function callOpenAI(apiKey, systemPrompt, userPrompt, opts = {}) {
    const body = {
        model: AI_MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: opts.temperature ?? 0.3,
        max_completion_tokens: opts.max_completion_tokens ?? 4096
    };
    if (opts.response_format) body.response_format = opts.response_format;

    let response;
    try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });
    } catch (networkErr) {
        if (location.protocol === 'file:') {
            throw new Error('Network request blocked — this page must be served via HTTP, not opened as a local file. Run a local server (e.g. "npx serve" or "python3 -m http.server") and open http://localhost:… instead.');
        }
        throw new Error('Network request failed — check your internet connection and try again. (' + networkErr.message + ')');
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('Invalid API key. Check your key and try again.');
        if (response.status === 429) throw new Error('Rate limit exceeded. Wait a moment and try again.');
        throw new Error(err.error?.message || `API returned status ${response.status}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content returned from API.');
    return content;
}

async function callOpenAIStream(apiKey, systemPrompt, userPrompt, onChunk, opts = {}) {
    let response;
    try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                temperature: opts.temperature ?? 0.5,
                max_completion_tokens: opts.max_completion_tokens ?? 16384
            })
        });
    } catch (networkErr) {
        if (location.protocol === 'file:') {
            throw new Error('Network request blocked — this page must be served via HTTP, not opened as a local file. Run a local server (e.g. "npx serve" or "python3 -m http.server") and open http://localhost:… instead.');
        }
        throw new Error('Network request failed — check your internet connection and try again. (' + networkErr.message + ')');
    }

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

// ─── Step 1: Generate Follow-Up Questions ───────────────────────

async function startEvaluation() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const statusEl = document.getElementById('aiEvalStatus');

    if (!apiKey) { statusEl.textContent = 'Please enter your OpenAI API key above.'; statusEl.className = 'ai-eval-status error'; return; }
    if (!apiKey.startsWith('sk-')) { statusEl.textContent = 'Invalid key format — OpenAI keys begin with "sk-".'; statusEl.className = 'ai-eval-status error'; return; }

    // Reset state
    followUpQuestionsData = [];
    answersHistory = [];
    currentRound = 1;

    const btn = document.getElementById('aiEvalBtn');
    btn.disabled = true; btn.style.opacity = '0.5';
    statusEl.innerHTML = '<span class="spinner"></span> Analysing your profile and generating follow-up questions…';
    statusEl.className = 'ai-eval-status';
    document.getElementById('aiEvalResult').style.display = 'none';
    document.getElementById('followUpSection').style.display = 'none';

    const data = buildScorePayload();
    const scoresText = formatScoresForPrompt(data);

    try {
        await generateQuestions(apiKey, scoresText);
    } catch (err) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.className = 'ai-eval-status error';
    } finally {
        btn.disabled = false; btn.style.opacity = '1';
    }
}

async function generateQuestions(apiKey, scoresText) {
    const statusEl = document.getElementById('aiEvalStatus');

    const sysPrompt = `You are a licensed clinical psychologist with specialised training in Schema Therapy (Young, Klosko & Weishaar, 2003). You have received a completed Young Schema Questionnaire (YSQ-S3) profile and need to gather additional clinical context before writing your evaluation.

Your task is to generate targeted follow-up questions that will help you:
1. Understand the person's subjective experience around their specific elevated schemas
2. Differentiate between DSM-5/ICD-11 conditions commonly associated with their pattern
3. Explore coping modes (surrender, avoidance, overcompensation), triggers, and relational patterns
4. Identify protective factors and strengths not captured by the questionnaire

RULES:
1. Study the profile data carefully. Note which specific schemas are elevated (≥4.0) and high (≥5.0), which domains are most activated, and what clinical patterns these suggest. Select question categories that directly target the clinical hypotheses raised by THIS profile — do not use a generic template.

2. Generate questions organised into clinically meaningful categories. Examples (select only those relevant to this profile):
   - Schema Experience & Triggers (how the person's specific elevated schemas manifest in daily life)
   - Mood & Emotional Patterns (depression, anxiety, emotional regulation)
   - Trauma & Stress History (PTSD, Complex PTSD, adverse experiences)
   - Relational & Attachment Patterns (attachment style, interpersonal dynamics)
   - Personality & Coping Styles (Cluster A/B/C traits, schema coping modes)
   - Self-Regulation & Impulse Control (ADHD, substance use, behavioural patterns)
   - Somatic & Dissociative Experiences (if relevant to profile)
   - Obsessive-Compulsive Patterns (if relevant to profile)
   Only include categories where the schema profile provides genuine clinical rationale.

3. Per category, generate 3–5 questions. Each question MUST specify its type:
   - "choice": Multiple choice with defined options (for frequency, severity, or categorical responses)
   - "boolean": Yes/No question (for screening specific experiences)
   - "freetext": Open-ended question inviting narrative response (for subjective experience, context, examples)

   Use the RIGHT type for each question:
   - Use "choice" for frequency/severity screening (e.g., "How often do you...")
   - Use "boolean" for binary screening (e.g., "Have you ever experienced...")
   - Use "freetext" for experiential/contextual questions (e.g., "Describe a recent situation where...")

4. Order questions within each category from least sensitive to most sensitive. Begin with concrete, behavioural questions before moving to emotionally charged or trauma-related ones. This follows standard clinical intake practice.

5. Each question should:
   - Be specific and behavioural (not vague)
   - Target a distinguishing feature relevant to the clinical picture
   - Include brief clinical context explaining WHY this question matters for this specific profile
   - Reference the relevant elevated schema(s) by name in the context field where applicable

6. Output valid JSON. The structure must be:
[
  {
    "category": "Category Name",
    "rationale": "Brief explanation of why this category is relevant to this schema profile",
    "questions": [
      {
        "id": "q1",
        "type": "choice",
        "text": "Question text here?",
        "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
        "context": "Brief clinical note on what this question screens for"
      },
      {
        "id": "q2",
        "type": "boolean",
        "text": "Have you experienced X?",
        "context": "Clinical note"
      },
      {
        "id": "q3",
        "type": "freetext",
        "text": "Describe a situation where...",
        "placeholder": "Take your time — there are no right or wrong answers...",
        "context": "Clinical note"
      }
    ]
  }
]

Generate between 20–35 questions total across all relevant categories. Quality over quantity. Every question should earn its place by providing clinical signal that the YSQ alone cannot.`;

    const userMsg = `Here is the schema profile to generate follow-up questions for:\n\n${scoresText}\n\nGenerate the JSON array of categorised follow-up questions now.`;

    const content = await callOpenAI(apiKey, sysPrompt, userMsg, {
        temperature: 0.3,
        max_completion_tokens: 4096,
        response_format: { type: 'json_object' }
    });

    const parsed = JSON.parse(content);
    // Handle both direct array and wrapped object (e.g. {"categories": [...]})
    let categories = Array.isArray(parsed) ? parsed : (parsed.categories || parsed.questions || Object.values(parsed)[0]);
    if (!Array.isArray(categories)) throw new Error('Unexpected response format from API.');

    // Detect flat question arrays (items have 'text' but no 'questions') vs category arrays
    if (categories.length > 0 && categories[0].text && !categories[0].questions) {
        // API returned a flat list of questions — wrap into a single category
        categories = [{ category: 'Follow-Up Questions', questions: categories }];
    }
    // Ensure every category has a questions array
    categories = categories.filter(cat => Array.isArray(cat.questions) && cat.questions.length > 0);
    if (categories.length === 0) throw new Error('No valid question categories returned from API.');

    followUpQuestionsData = categories;

    renderQuestions(categories, 1, false);
    statusEl.textContent = '';
    document.getElementById('followUpSection').style.display = 'block';
    document.getElementById('followUpSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Question Rendering ────────────────────────────────────────

function renderQuestions(categories, round, append) {
    const container = document.getElementById('followUpQuestions');

    const existingCats = append ? container.querySelectorAll('.diff-dx-category').length : 0;

    let html = '';
    if (append) {
        html += `<div class="diff-dx-round-separator"><span>Additional Questions</span></div>`;
    }

    let newQ = 0;
    categories.forEach((cat, ci) => {
        if (!cat || !Array.isArray(cat.questions)) return;
        const badgeNum = existingCats + ci + 1;
        html += `<div class="diff-dx-category">`;
        html += `<div class="diff-dx-category-header"><div class="diff-dx-cat-badge">${badgeNum}</div>${escapeHtml(cat.category || 'Questions')}</div>`;
        if (cat.rationale) {
            html += `<div class="diff-dx-q-context" style="margin-bottom:14px;margin-top:-6px;">${escapeHtml(cat.rationale)}</div>`;
        }
        cat.questions.forEach((q, qi) => {
            const qid = `fu_r${round}_${ci}_${qi}`;
            newQ++;
            html += `<div class="diff-dx-q-card" id="card_${qid}">`;
            html += `<div class="diff-dx-q-text">${escapeHtml(q.text)}</div>`;
            if (q.context) html += `<div class="diff-dx-q-context">${escapeHtml(q.context)}</div>`;

            if (q.type === 'freetext') {
                html += `<div class="diff-dx-freetext-wrap">`;
                html += `<textarea class="diff-dx-freetext" name="${qid}" placeholder="${escapeHtml(q.placeholder || 'Take your time — there are no right or wrong answers…')}" oninput="onFollowUpAnswer('${qid}')"></textarea>`;
                html += `</div>`;
            } else if (q.type === 'boolean') {
                html += `<div class="diff-dx-answer-area">`;
                html += `<div class="diff-dx-options">`;
                html += `<input type="radio" name="${qid}" id="${qid}_yes" value="Yes" onchange="onFollowUpAnswer('${qid}')">`;
                html += `<label for="${qid}_yes">Yes</label>`;
                html += `<input type="radio" name="${qid}" id="${qid}_no" value="No" onchange="onFollowUpAnswer('${qid}')">`;
                html += `<label for="${qid}_no">No</label>`;
                html += `</div>`;
                html += `<div class="diff-dx-freetext-wrap" style="display:none"><textarea class="diff-dx-freetext" name="${qid}_ft" placeholder="Express your thoughts freely…" oninput="onFollowUpAnswer('${qid}')"></textarea></div>`;
                html += `<button type="button" class="freetext-toggle" title="Switch to free text" onclick="toggleFollowUpFreeText('${qid}', this)">✎</button>`;
                html += `</div>`;
            } else {
                const options = q.options || ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'];
                html += `<div class="diff-dx-answer-area">`;
                html += `<div class="diff-dx-options">`;
                options.forEach((opt, oi) => {
                    html += `<input type="radio" name="${qid}" id="${qid}_${oi}" value="${escapeHtml(opt)}" onchange="onFollowUpAnswer('${qid}')">`;
                    html += `<label for="${qid}_${oi}">${escapeHtml(opt)}</label>`;
                });
                html += `</div>`;
                html += `<div class="diff-dx-freetext-wrap" style="display:none"><textarea class="diff-dx-freetext" name="${qid}_ft" placeholder="Express your thoughts freely…" oninput="onFollowUpAnswer('${qid}')"></textarea></div>`;
                html += `<button type="button" class="freetext-toggle" title="Switch to free text" onclick="toggleFollowUpFreeText('${qid}', this)">✎</button>`;
                html += `</div>`;
            }

            html += `</div>`;
        });
        html += `</div>`;
    });

    if (append) {
        container.insertAdjacentHTML('beforeend', html);
    } else {
        container.innerHTML = html;
    }

    // Count ALL questions in container for progress
    const totalQ = container.querySelectorAll('.diff-dx-q-card').length;
    const answeredQ = container.querySelectorAll('.diff-dx-q-card.answered').length;
    document.getElementById('followUpProgressText').textContent = `${answeredQ} / ${totalQ} answered`;
    container.dataset.total = totalQ;
}

function toggleFollowUpFreeText(qid, btn) {
    const card = document.getElementById('card_' + qid);
    if (!card) return;
    const answerArea = btn.closest('.diff-dx-answer-area');
    const options = answerArea.querySelector('.diff-dx-options');
    const ftWrap = answerArea.querySelector('.diff-dx-freetext-wrap');
    const isFreeText = ftWrap.style.display !== 'none';

    if (isFreeText) {
        ftWrap.style.display = 'none';
        options.style.display = 'flex';
        btn.classList.remove('active');
        btn.title = 'Switch to free text';
    } else {
        options.style.display = 'none';
        ftWrap.style.display = 'block';
        btn.classList.add('active');
        btn.title = 'Switch back to options';
        ftWrap.querySelector('textarea').focus();
    }
    onFollowUpAnswer(qid);
}

function onFollowUpAnswer(qid) {
    const card = document.getElementById('card_' + qid);
    if (!card) return;

    // Check if this card has a toggled free-text area that is visible
    const answerArea = card.querySelector('.diff-dx-answer-area');
    if (answerArea) {
        const ftWrap = answerArea.querySelector('.diff-dx-freetext-wrap');
        if (ftWrap && ftWrap.style.display !== 'none') {
            const ta = ftWrap.querySelector('textarea');
            if (ta && ta.value.trim()) { card.classList.add('answered'); } else { card.classList.remove('answered'); }
        } else {
            // Radio selected
            const selected = card.querySelector(`input[name="${qid}"]:checked`);
            if (selected) { card.classList.add('answered'); } else { card.classList.remove('answered'); }
        }
    } else {
        // Pure freetext card (no answer-area wrapper)
        const textarea = card.querySelector('textarea');
        if (textarea) {
            if (textarea.value.trim()) { card.classList.add('answered'); } else { card.classList.remove('answered'); }
        } else {
            card.classList.add('answered');
        }
    }

    const container = document.getElementById('followUpQuestions');
    const total = parseInt(container.dataset.total || 0);
    const answered = container.querySelectorAll('.diff-dx-q-card.answered').length;
    document.getElementById('followUpProgressText').textContent = `${answered} / ${total} answered`;
}

function collectAnswers() {
    let text = `FOLLOW-UP RESPONSES (Round ${currentRound}):\n\n`;
    followUpQuestionsData.forEach((cat, ci) => {
        if (!cat || !Array.isArray(cat.questions)) return;
        text += `Category: ${cat.category}\n`;
        cat.questions.forEach((q, qi) => {
            const qid = `fu_r${currentRound}_${ci}_${qi}`;
            let val = 'Not answered';

            if (q.type === 'freetext') {
                const textarea = document.querySelector(`textarea[name="${qid}"]`);
                if (textarea && textarea.value.trim()) val = textarea.value.trim();
            } else {
                // Check if user toggled to free-text mode
                const card = document.getElementById('card_' + qid);
                const ftWrap = card?.querySelector('.diff-dx-freetext-wrap');
                if (ftWrap && ftWrap.style.display !== 'none') {
                    const ta = ftWrap.querySelector('textarea');
                    if (ta && ta.value.trim()) val = '[Free text] ' + ta.value.trim();
                } else {
                    const selected = document.querySelector(`input[name="${qid}"]:checked`);
                    if (selected) val = selected.value;
                }
            }

            text += `  Q: ${q.text}\n  A: ${val}\n`;
        });
        text += '\n';
    });
    return text;
}

// ─── Step 2: Submit Answers & Check Sufficiency ─────────────────

async function submitAnswers() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const statusEl = document.getElementById('followUpStatus');
    const container = document.getElementById('followUpQuestions');
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

    const btn = document.getElementById('followUpSubmitBtn');
    btn.disabled = true; btn.style.opacity = '0.5';
    statusEl.innerHTML = '<span class="spinner"></span> Analysing your responses…';
    statusEl.className = 'ai-eval-status';

    const answersText = collectAnswers();
    answersHistory.push(answersText);

    const data = buildScorePayload();
    const scoresText = formatScoresForPrompt(data);

    // Round 2+: skip sufficiency check, go straight to evaluation
    if (currentRound >= 2) {
        try {
            await generateFinalEvaluation(apiKey, scoresText);
        } catch (err) {
            statusEl.textContent = 'Error: ' + err.message;
            statusEl.className = 'ai-eval-status error';
            document.getElementById('aiEvalResult').style.display = 'none';
        } finally {
            btn.disabled = false; btn.style.opacity = '1';
        }
        return;
    }

    // Round 1: check sufficiency
    const allAnswers = answersHistory.join('\n');

    const sysPrompt = `You are a clinical psychologist reviewing a Young Schema Questionnaire profile and the client's follow-up responses. Decide whether you have sufficient information to write a comprehensive clinical evaluation, or whether specific follow-up questions are needed to resolve a genuinely important clinical ambiguity.

RULES:
- Default to evaluating. Only request follow-up if there is a clearly important clinical ambiguity that the current data cannot resolve — for example, contradictory screening answers, a high-severity profile with no experiential context, or a critical differential that cannot be distinguished without additional information.
- If requesting follow-up, limit to 5–10 focused questions maximum. These should target ONLY the specific gap, not re-cover ground already addressed.
- Do NOT request follow-up simply to gather "more context" — the evaluation prompt can work with incomplete information and will note limitations where appropriate.

Output valid JSON in one of these two formats:

If sufficient:
{"action": "evaluate"}

If follow-up genuinely needed:
{"action": "followup", "reason": "Brief explanation of the specific clinical ambiguity", "questions": [array of category objects in this exact format:
  {"category": "Category Name", "rationale": "Why needed", "questions": [
    {"id": "q1", "type": "choice|boolean|freetext", "text": "Question?", "options": ["..."] (for choice only), "placeholder": "..." (for freetext only), "context": "Clinical note"}
  ]}
]}`;

    const userMsg = `Schema profile:\n\n${scoresText}\n\n${allAnswers}\n\nDo you have sufficient information to write a comprehensive evaluation? Output JSON.`;

    try {
        const content = await callOpenAI(apiKey, sysPrompt, userMsg, {
            temperature: 0.2,
            max_completion_tokens: 2048,
            response_format: { type: 'json_object' }
        });

        const decision = JSON.parse(content);

        if (decision.action === 'followup' && decision.questions?.length) {
            currentRound = 2;
            followUpQuestionsData = decision.questions;
            renderQuestions(decision.questions, 2, true);
            if (decision.reason) {
                statusEl.innerHTML = `<em>${escapeHtml(decision.reason)}</em> — Please answer the additional questions below.`;
            } else {
                statusEl.textContent = '';
            }
            document.getElementById('followUpSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            btn.disabled = false; btn.style.opacity = '1';
        } else {
            await generateFinalEvaluation(apiKey, scoresText);
            btn.disabled = false; btn.style.opacity = '1';
        }

    } catch (err) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.className = 'ai-eval-status error';
        document.getElementById('aiEvalResult').style.display = 'none';
        btn.disabled = false; btn.style.opacity = '1';
    }
}

// ─── Evaluation Prompt ──────────────────────────────────────────

const EVAL_SYSTEM_PROMPT = `You are a licensed clinical psychologist with specialised training in Schema Therapy (Young, Klosko & Weishaar, 2003). You are writing a comprehensive professional evaluation report based on:
1. A completed Young Schema Questionnaire (YSQ-S3, 90 items, 18 schemas, 5 domains, 1–6 Likert scale)
2. The client's responses to targeted follow-up questions designed specifically for their profile

Your task is to produce a thorough, clinically precise, and empathic evaluation that integrates both data sources. Write in the voice of a seasoned clinician preparing a report for a client who will read it directly. Be direct about what the data shows — do not minimise or catastrophise. Ground every interpretation in the actual scores and follow-up responses — do not speculate beyond what the data supports.

Structure your report with these exact section headings (use ### markdown headings):

### Overview
A 2–3 sentence summary: overall severity level, number of elevated schemas, and which domain(s) are most activated. State whether the profile suggests clinically significant patterns.

### Domain-Level Analysis
For each of the 5 domains, provide a brief interpretation. Focus more on domains with elevated scores (≥3.5) and briefly acknowledge low domains. Name the domain, state the score, and explain what this means in terms of the person's inner world and relational patterns. Where relevant, integrate specific insights from the follow-up responses — quote or paraphrase the client's own words when they illuminate a pattern.

### Elevated Schema Profiles
For each schema scoring ≥4.0 (if any), provide:
- What this schema typically looks like in daily life
- Common emotional triggers
- Likely coping modes (surrender, avoidance, overcompensation)
- How this schema might interact with other elevated schemas in this profile
- Specific insights from the client's follow-up responses that illuminate this schema — cite their answers directly where meaningful

If no schemas are ≥4.0, discuss the top 2–3 schemas and what their moderate activation suggests.

### Schema Interactions & Pattern Dynamics
Identify the 2–3 most significant schema clusters or interactions in this profile. Explain how they may reinforce each other, creating cyclical patterns. Be specific to THIS person's scores and follow-up responses — show the mechanism, not just the correlation.

### Commonly Associated Clinical Conditions
Based on the schema profile AND the follow-up screening responses, identify conditions that may be relevant:
- For each condition, provide the condition name, association strength (Strong / Moderate / Tentative), evidence from this profile (cite specific schema scores and screening answers that converge), and key differentiators (what would confirm vs. rule out this condition clinically)
- Order from strongest to weakest association. Identify 3–6 conditions.
- For personality patterns, describe TRAITS and TENDENCIES (e.g., "features consistent with avoidant personality style") rather than assigning full personality disorder diagnoses
- Frame all conditions as ASSOCIATIONS and HYPOTHESES, never confirmed diagnoses
- Include a brief caveat for each about what else could explain the pattern

### Recommended Assessment Instruments
Based on the conditions identified, recommend 4–8 specific validated instruments for formal assessment:
- **Instrument name** (acronym + full name)
- What it assesses and why it's relevant for this profile specifically
- Administration notes (self-report vs. clinician-administered, approximate time)
Prioritise the most diagnostically informative instruments for this profile.

### Protective Factors & Strengths
Identify schemas that scored low (≤2.0) and frame these as genuine strengths and resilience factors. Explain what low scores in these areas suggest about the person's emotional resources. Also note any strengths that emerged from the follow-up responses (e.g., self-awareness, help-seeking behaviour, relational capacities).

### Clinical Recommendations
Provide 4–6 specific, actionable recommendations including:
- Which schemas to prioritise in therapy and why
- Suggested therapeutic modalities (schema therapy techniques, limited reparenting, chair work, mode work, behavioural pattern-breaking, etc.)
- Self-help strategies the person can begin immediately
- When professional support is strongly advised vs. optional

### Risk Considerations
If any schema scores ≥5.0, flag specific emotional vulnerabilities. If overall profile is significantly elevated, note this clearly but without alarm. If the profile is relatively mild, state that no acute concerns are indicated.

Formatting rules:
- Use ### for section headings only
- Use **bold** for schema names and condition names when referenced
- Use *italics* for clinical terms on first mention
- Write in second person ("you", "your") for directness
- Keep total length between 1800–2800 words
- Do not use numbered lists for the main sections — use flowing paragraphs with bullets only where listing specifics
- Begin with a single-line disclaimer: "⚠ This evaluation integrates AI-generated analysis of self-report data. It is not a clinical diagnosis and does not constitute professional psychological assessment. Use it for self-reflection and as a conversation starter with a licensed professional."
- End with a note reminding the reader of this

Ethical standards:
- Do not diagnose any DSM/ICD condition — frame everything as associations and hypotheses
- Frame everything as patterns and tendencies, not pathology
- Maintain a tone that is warm, direct, and clinically precise
- Acknowledge that self-report measures have inherent limitations
- Make clear that self-report screening cannot replace structured clinical interview
- Respect the courage it takes to complete an assessment like this`;

// ─── Clinical Review Prompt ─────────────────────────────────────

const REVIEW_SYSTEM_PROMPT = `You are a senior clinical psychologist and peer reviewer specialising in Schema Therapy. You are reviewing an AI-generated clinical evaluation report for professional quality, clinical accuracy, and ethical compliance.

You will receive the original data (schema scores + follow-up responses) and the draft evaluation. Your task is to produce a REVISED version of the evaluation that corrects any issues found.

Review criteria — check and fix each:

1. **Data Accuracy**: Every score cited must match the actual data. Every client quote or paraphrase must reflect what they actually said. Remove or correct any fabricated details.

2. **Clinical Precision**: Interpretations must follow logically from the data. Correct any overstatements (claiming strong association when data is ambiguous), understatements (downplaying clearly elevated patterns), or unsupported inferences.

3. **Ethical Compliance**: No confirmed diagnoses — only associations and hypotheses. Personality patterns framed as traits/tendencies, not disorders. Appropriate caveats present. Disclaimer intact.

4. **Internal Consistency**: The report must not contradict itself (e.g., calling a schema "highly activated" in one section and "moderate" in another). Schema interactions must be consistent with individual schema descriptions.

5. **Integration Quality**: Follow-up responses should be meaningfully woven in, not just appended. Client's own words should illuminate patterns, not merely be listed.

6. **Completeness**: All required sections present and substantive. No section should be perfunctory or generic. Every elevated schema (≥4.0) must be discussed.

7. **Tone & Readability**: Warm but clinically precise. Second person. No jargon without explanation. No catastrophising or false reassurance.

8. **Condition Associations**: Evidence cited for each condition must be specific and traceable to actual scores/answers. Differentiators should be genuinely useful. Strength ratings (Strong/Moderate/Tentative) must be calibrated appropriately.

IMPORTANT: Output ONLY the revised evaluation text in full. Do not include commentary, review notes, or a summary of changes. If the evaluation is already excellent, return it with only minor refinements. Always return the complete report — never truncate or summarise sections.

Maintain the same markdown formatting (### headings, **bold**, *italics*) as the original.`;

// ─── Step 3: Final Evaluation ───────────────────────────────────

async function generateFinalEvaluation(apiKey, scoresText) {
    const statusEl = document.getElementById('followUpStatus');
    const resultEl = document.getElementById('aiEvalResult');

    statusEl.innerHTML = '<span class="spinner"></span> Generating comprehensive clinical evaluation…';
    statusEl.className = 'ai-eval-status';

    const allAnswers = answersHistory.join('\n');
    const userPrompt = `Here is all available data for evaluation:\n\n${scoresText}\n\n${allAnswers}\n\nPlease generate the comprehensive professional evaluation report now.`;

    resultEl.innerHTML = `
        <div class="eval-header">
          <div class="eval-header-label">AI-Generated Clinical Evaluation</div>
          <div class="eval-header-title">Comprehensive Schema Profile Analysis</div>
        </div>
        <div class="eval-body" id="evalBodyStream"></div>
        <div class="eval-footer" id="evalFooter" style="display:none;"></div>
    `;
    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const bodyEl = document.getElementById('evalBodyStream');

    try {
        // Phase 1: Generate draft evaluation (streaming for user feedback)
        const draftText = await callOpenAIStream(apiKey, EVAL_SYSTEM_PROMPT, userPrompt, (_token, full) => {
            bodyEl.innerHTML = renderEvalMarkdown(full);
        }, {
            temperature: 0.5,
            max_completion_tokens: 16384
        });

        bodyEl.innerHTML = renderEvalMarkdown(draftText);

        // Phase 2: Clinical peer review pass
        statusEl.innerHTML = '<span class="spinner"></span> Clinical review in progress — verifying accuracy and refining…';

        const reviewUserPrompt = `ORIGINAL DATA:\n\n${scoresText}\n\n${allAnswers}\n\n---\n\nDRAFT EVALUATION TO REVIEW:\n\n${draftText}\n\n---\n\nReview this evaluation against the original data. Output the complete revised evaluation.`;

        const reviewedText = await callOpenAI(apiKey, REVIEW_SYSTEM_PROMPT, reviewUserPrompt, {
            temperature: 0.2,
            max_completion_tokens: 16384
        });

        bodyEl.innerHTML = renderEvalMarkdown(reviewedText);
        const footerEl = document.getElementById('evalFooter');
        footerEl.textContent = `Generated and peer-reviewed by ${AI_MODEL} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · This evaluation is AI-generated and does not constitute a clinical diagnosis or professional psychological assessment. It integrates self-report questionnaire data and follow-up responses for self-reflection and educational purposes only.`;
        footerEl.style.display = '';
        statusEl.textContent = '';
    } catch (err) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.className = 'ai-eval-status error';
        resultEl.style.display = 'none';
    }
}
