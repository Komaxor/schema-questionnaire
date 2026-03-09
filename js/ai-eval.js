// js/ai-eval.js — Unified AI evaluation pipeline: questions → sufficiency check → comprehensive evaluation

const AI_MODEL = 'gpt-5.4-2026-03-05';

// ─── State ──────────────────────────────────────────────────────

let followUpQuestionsData = [];
let answersHistory = [];
let currentRound = 0;

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

async function callOpenAI(apiKey, systemPrompt, userPrompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.5,
            max_completion_tokens: 4096
        })
    });

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

async function callOpenAIStream(apiKey, systemPrompt, userPrompt, onChunk) {
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
            max_completion_tokens: 4096
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
1. Understand the person's subjective experience around their elevated schemas
2. Differentiate between DSM-5/ICD-11 conditions commonly associated with their pattern
3. Explore coping modes, triggers, and relational patterns
4. Identify protective factors and strengths not captured by the questionnaire

RULES:
1. Generate questions organised into clinically meaningful categories. Select RELEVANT categories based on the profile — examples include:
   - Schema Experience & Triggers (how elevated schemas manifest in daily life)
   - Mood & Emotional Patterns (depression, anxiety, emotional regulation)
   - Trauma & Stress History (PTSD, Complex PTSD, adverse experiences)
   - Relational & Attachment Patterns (attachment style, interpersonal dynamics)
   - Personality & Coping Styles (Cluster A/B/C traits, coping modes)
   - Self-Regulation & Impulse Control (ADHD, substance use, behavioural patterns)
   - Somatic & Dissociative Experiences (if relevant to profile)
   - Obsessive-Compulsive Patterns (if relevant to profile)
   Only include categories where the schema profile provides genuine clinical rationale.

2. Per category, generate 3–5 questions. Each question MUST specify its type:
   - "choice": Multiple choice with defined options (for frequency, severity, or categorical responses)
   - "boolean": Yes/No question (for screening specific experiences)
   - "freetext": Open-ended question inviting narrative response (for subjective experience, context, examples)

   Use the RIGHT type for each question:
   - Use "choice" for frequency/severity screening (e.g., "How often do you...")
   - Use "boolean" for binary screening (e.g., "Have you ever experienced...")
   - Use "freetext" for experiential/contextual questions (e.g., "Describe a recent situation where...")

3. Each question should:
   - Be specific and behavioural (not vague)
   - Target a distinguishing feature relevant to the clinical picture
   - Include brief clinical context explaining WHY this question matters for this profile

4. Output ONLY valid JSON — no markdown, no commentary, no code fences. The structure must be:
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

    const userMsg = `Here is the schema profile to generate follow-up questions for:\n\n${scoresText}\n\nGenerate the JSON array of categorised follow-up questions now. Output ONLY valid JSON.`;

    const content = await callOpenAI(apiKey, sysPrompt, userMsg);

    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
    }
    const categories = JSON.parse(cleaned);
    followUpQuestionsData = categories;

    renderQuestions(categories);
    statusEl.textContent = '';
    document.getElementById('followUpSection').style.display = 'block';
    document.getElementById('followUpSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Question Rendering ────────────────────────────────────────

function renderQuestions(categories) {
    const container = document.getElementById('followUpQuestions');
    let totalQ = 0;

    let html = '';
    categories.forEach((cat, ci) => {
        html += `<div class="diff-dx-category">`;
        html += `<div class="diff-dx-category-header"><div class="diff-dx-cat-badge">${ci + 1}</div>${cat.category}</div>`;
        if (cat.rationale) {
            html += `<div class="diff-dx-q-context" style="margin-bottom:14px;margin-top:-6px;">${cat.rationale}</div>`;
        }
        cat.questions.forEach((q, qi) => {
            const qid = `fu_${ci}_${qi}`;
            totalQ++;
            html += `<div class="diff-dx-q-card" id="card_${qid}">`;
            html += `<div class="diff-dx-q-text">${q.text}</div>`;
            if (q.context) html += `<div class="diff-dx-q-context">${q.context}</div>`;

            if (q.type === 'freetext') {
                html += `<div class="diff-dx-freetext-wrap">`;
                html += `<textarea class="diff-dx-freetext" name="${qid}" placeholder="${q.placeholder || 'Take your time — there are no right or wrong answers…'}" oninput="onFollowUpAnswer('${qid}')"></textarea>`;
                html += `</div>`;
            } else if (q.type === 'boolean') {
                html += `<div class="diff-dx-options">`;
                html += `<input type="radio" name="${qid}" id="${qid}_yes" value="Yes" onchange="onFollowUpAnswer('${qid}')">`;
                html += `<label for="${qid}_yes">Yes</label>`;
                html += `<input type="radio" name="${qid}" id="${qid}_no" value="No" onchange="onFollowUpAnswer('${qid}')">`;
                html += `<label for="${qid}_no">No</label>`;
                html += `</div>`;
            } else {
                const options = q.options || ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'];
                html += `<div class="diff-dx-options">`;
                options.forEach((opt, oi) => {
                    html += `<input type="radio" name="${qid}" id="${qid}_${oi}" value="${opt}" onchange="onFollowUpAnswer('${qid}')">`;
                    html += `<label for="${qid}_${oi}">${opt}</label>`;
                });
                html += `</div>`;
            }

            html += `</div>`;
        });
        html += `</div>`;
    });

    container.innerHTML = html;
    document.getElementById('followUpProgressText').textContent = `0 / ${totalQ} answered`;
    container.dataset.total = totalQ;
}

function onFollowUpAnswer(qid) {
    const card = document.getElementById('card_' + qid);
    if (!card) return;

    const textarea = card.querySelector('textarea');
    if (textarea) {
        if (textarea.value.trim()) {
            card.classList.add('answered');
        } else {
            card.classList.remove('answered');
        }
    } else {
        card.classList.add('answered');
    }

    const container = document.getElementById('followUpQuestions');
    const total = parseInt(container.dataset.total || 0);
    const answered = container.querySelectorAll('.diff-dx-q-card.answered').length;
    document.getElementById('followUpProgressText').textContent = `${answered} / ${total} answered`;
}

function collectAnswers() {
    let text = `FOLLOW-UP RESPONSES (Round ${currentRound}):\n\n`;
    followUpQuestionsData.forEach((cat, ci) => {
        text += `Category: ${cat.category}\n`;
        cat.questions.forEach((q, qi) => {
            const qid = `fu_${ci}_${qi}`;
            let val = 'Not answered';

            if (q.type === 'freetext') {
                const textarea = document.querySelector(`textarea[name="${qid}"]`);
                if (textarea && textarea.value.trim()) val = textarea.value.trim();
            } else {
                const selected = document.querySelector(`input[name="${qid}"]:checked`);
                if (selected) val = selected.value;
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
        } finally {
            btn.disabled = false; btn.style.opacity = '1';
        }
        return;
    }

    // Round 1: check sufficiency
    const allAnswers = answersHistory.join('\n');

    const sysPrompt = `You are a clinical psychologist reviewing a Young Schema Questionnaire profile and the client's follow-up responses. Decide whether you have sufficient information to write a comprehensive clinical evaluation, or whether specific follow-up questions are needed.

RULES:
- Default to evaluating. Only request follow-up if there is a genuinely important clinical ambiguity that the current data cannot resolve.
- If requesting follow-up, limit to 5–10 focused questions maximum.
- Output ONLY valid JSON — no markdown, no commentary, no code fences.

If sufficient, output:
{"action": "evaluate"}

If follow-up needed, output:
{"action": "followup", "reason": "Brief explanation of what needs clarification", "questions": [same question format as the original — array of category objects with typed questions]}`;

    const userMsg = `Schema profile:\n\n${scoresText}\n\n${allAnswers}\n\nDo you have sufficient information to write a comprehensive evaluation? Output JSON.`;

    try {
        const content = await callOpenAI(apiKey, sysPrompt, userMsg);

        let cleaned = content.trim();
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
        }
        const decision = JSON.parse(cleaned);

        if (decision.action === 'followup' && decision.questions?.length) {
            currentRound = 2;
            followUpQuestionsData = decision.questions;
            renderQuestions(decision.questions);
            statusEl.innerHTML = decision.reason ? `<em>${decision.reason}</em> — Please answer the additional questions below.` : '';
            document.getElementById('followUpSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            btn.disabled = false; btn.style.opacity = '1';
        } else {
            await generateFinalEvaluation(apiKey, scoresText);
            btn.disabled = false; btn.style.opacity = '1';
        }

    } catch (err) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.className = 'ai-eval-status error';
        btn.disabled = false; btn.style.opacity = '1';
    }
}

// ─── Step 3: Final Evaluation ───────────────────────────────────

async function generateFinalEvaluation(apiKey, scoresText) {
    const statusEl = document.getElementById('followUpStatus');
    const resultEl = document.getElementById('aiEvalResult');

    statusEl.innerHTML = '<span class="spinner"></span> Generating comprehensive clinical evaluation…';
    statusEl.className = 'ai-eval-status';

    const allAnswers = answersHistory.join('\n');

    const systemPrompt = `You are a licensed clinical psychologist with specialised training in Schema Therapy (Young, Klosko & Weishaar, 2003). You are writing a comprehensive professional evaluation report based on:
1. A completed Young Schema Questionnaire (YSQ-S3, 90 items, 18 schemas, 5 domains, 1–6 Likert scale)
2. The client's responses to targeted follow-up questions you generated based on their profile

Your task is to produce a thorough, clinically precise, and empathic evaluation that integrates both data sources. Write in the voice of a seasoned clinician preparing a report for a client who will read it directly. Be direct about what the data shows — do not minimise or catastrophise.

Structure your report with these exact section headings (use ### markdown headings):

### Overview
A 2–3 sentence summary: overall severity level, number of elevated schemas, and which domain(s) are most activated. State whether the profile suggests clinically significant patterns.

### Domain-Level Analysis
For each of the 5 domains, provide a brief interpretation. Focus more on domains with elevated scores (≥3.5) and briefly acknowledge low domains. Name the domain, state the score, and explain what this means in terms of the person's inner world and relational patterns. Where relevant, integrate insights from the follow-up responses.

### Elevated Schema Profiles
For each schema scoring ≥4.0 (if any), provide:
- What this schema typically looks like in daily life
- Common emotional triggers
- Likely coping modes (surrender, avoidance, overcompensation)
- How this schema might interact with other elevated schemas in this profile
- Specific insights from the client's follow-up responses that illuminate this schema

If no schemas are ≥4.0, discuss the top 2–3 schemas and what their moderate activation suggests.

### Schema Interactions & Pattern Dynamics
Identify the 2–3 most significant schema clusters or interactions in this profile. Explain how they may reinforce each other, creating cyclical patterns. Be specific to THIS person's scores and follow-up responses.

### Commonly Associated Clinical Conditions
Based on the schema profile AND the follow-up screening responses, identify conditions that may be relevant:
- For each condition, provide the condition name, association strength (Strong / Moderate / Tentative), evidence from this profile (cite specific schema scores and screening answers), and key differentiators
- Order from strongest to weakest association. Identify 3–6 conditions.
- For personality patterns, describe TRAITS and TENDENCIES rather than assigning full diagnoses
- Frame all conditions as ASSOCIATIONS and HYPOTHESES, never confirmed diagnoses

### Recommended Assessment Instruments
Based on the conditions identified, recommend 4–8 specific validated instruments for formal assessment:
- Instrument name (acronym + full name)
- What it assesses and why it's relevant for this profile
- Administration notes (self-report vs. clinician-administered, approximate time)

### Protective Factors & Strengths
Identify schemas that scored low (≤2.0) and frame these as genuine strengths and resilience factors. Explain what low scores in these areas suggest about the person's emotional resources.

### Clinical Recommendations
Provide 4–6 specific, actionable recommendations including:
- Which schemas to prioritise in therapy
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
- Keep total length between 1800–2500 words
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

    const fullText = await callOpenAIStream(apiKey, systemPrompt, userPrompt, (_token, full) => {
        bodyEl.innerHTML = renderEvalMarkdown(full);
    });

    bodyEl.innerHTML = renderEvalMarkdown(fullText);
    const footerEl = document.getElementById('evalFooter');
    footerEl.textContent = `Generated by ${AI_MODEL} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · This evaluation is AI-generated and does not constitute a clinical diagnosis or professional psychological assessment. It integrates self-report questionnaire data and follow-up responses for self-reflection and educational purposes only.`;
    footerEl.style.display = '';
    statusEl.textContent = '';
}
