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

// ─── Language instruction for AI prompts ────────────────────────

function langInstruction() {
    const inst = I18N.t('ai.responseLanguageInstruction');
    const ctx = I18N.t('ai.clinicalContext');
    let result = '';
    if (inst) result += '\n\n' + inst;
    if (ctx) result += '\n\n' + ctx;
    return result;
}

// ─── Score Helpers ──────────────────────────────────────────────

function buildScorePayload() {
    const schemaScores = SCHEMAS.map(s => {
        const t = I18N.t('schemas')[s.id - 1];
        const vals = s.qs.map(getScore);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return { id: s.id, name: t.name, short: t.short, domain: s.domain, score: parseFloat(avg.toFixed(2)), desc: t.desc };
    });
    const domainScores = DOMAINS.map(d => {
        const t = I18N.t('domains')[d.id - 1];
        const relevant = schemaScores.filter(s => d.schemas.includes(s.id));
        const avg = relevant.reduce((a, b) => a + b.score, 0) / relevant.length;
        return { name: t.name, score: parseFloat(avg.toFixed(2)) };
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
            throw new Error(I18N.t('ai.networkBlockedFile'));
        }
        throw new Error(I18N.t('ai.networkFailed') + ' (' + networkErr.message + ')');
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error(I18N.t('ai.invalidApiKey'));
        if (response.status === 429) throw new Error(I18N.t('ai.rateLimited'));
        throw new Error(err.error?.message || `API returned status ${response.status}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error(I18N.t('ai.noContent'));
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
            throw new Error(I18N.t('ai.networkBlockedFile'));
        }
        throw new Error(I18N.t('ai.networkFailed') + ' (' + networkErr.message + ')');
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error(I18N.t('ai.invalidApiKey'));
        if (response.status === 429) throw new Error(I18N.t('ai.rateLimited'));
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

    if (!apiKey) { statusEl.textContent = I18N.t('ai.noApiKey'); statusEl.className = 'ai-eval-status error'; return; }
    if (!apiKey.startsWith('sk-')) { statusEl.textContent = I18N.t('ai.invalidKey'); statusEl.className = 'ai-eval-status error'; return; }

    // Reset state
    followUpQuestionsData = [];
    answersHistory = [];
    currentRound = 1;

    const btn = document.getElementById('aiEvalBtn');
    btn.disabled = true; btn.style.opacity = '0.5';
    statusEl.innerHTML = '<span class="spinner"></span> ' + I18N.t('ai.analysing');
    statusEl.className = 'ai-eval-status';
    document.getElementById('aiEvalResult').style.display = 'none';
    document.getElementById('followUpSection').style.display = 'none';

    const data = buildScorePayload();
    const scoresText = formatScoresForPrompt(data);

    try {
        await generateQuestions(apiKey, scoresText);
    } catch (err) {
        statusEl.textContent = I18N.t('ai.errorPrefix') + err.message;
        statusEl.className = 'ai-eval-status error';
    } finally {
        btn.disabled = false; btn.style.opacity = '1';
    }
}

async function generateQuestions(apiKey, scoresText) {
    const statusEl = document.getElementById('aiEvalStatus');

    const sysPrompt = `You are a licensed clinical psychologist with specialised training in Schema Therapy (Young, Klosko & Weishaar, 2003). You have received a completed Young Schema Questionnaire (YSQ-S3) profile and need to gather additional clinical context before writing your evaluation.

Your task is to generate targeted follow-up questions that will help you build a comprehensive clinical picture. Specifically:
1. Understand the person's subjective experience around their specific elevated schemas — how they feel, think, and behave when a schema is activated
2. Explore schema origins: developmental and childhood experiences that may have given rise to the elevated schemas (e.g., early caregiving environment, attachment disruptions, adverse experiences, family dynamics)
3. Map schema mode activation: identify which modes (Vulnerable Child, Angry Child, Detached Protector, Compliant Surrenderer, Overcompensator, Punitive Parent, Demanding Parent, Healthy Adult) are most active and in what contexts
4. Identify unmet core emotional needs (safety, nurturance, autonomy, self-expression, spontaneity, realistic limits) and how these manifest in current relationships and behaviour
5. Differentiate between DSM-5/ICD-11 conditions commonly associated with their pattern — gather the screening data needed to distinguish overlapping presentations
6. Assess coping styles (surrender, avoidance, overcompensation) across different life domains (work, relationships, self-care, emotional regulation)
7. Identify protective factors, strengths, and Healthy Adult capacity not captured by the questionnaire

RULES:
1. Study the profile data carefully. Note which specific schemas are elevated (≥4.0) and high (≥5.0), which domains are most activated, and what clinical patterns these suggest. Select question categories that directly target the clinical hypotheses raised by THIS profile — do not use a generic template.

2. Generate questions organised into clinically meaningful categories. You may use any categories that serve the clinical picture — examples include but are not limited to:
   - Schema Origins & Developmental History (childhood caregiving, family dynamics, early attachment, adverse experiences — essential for understanding how schemas formed)
   - Schema Mode Patterns (which modes activate in which situations, mode flipping, awareness of inner critic / vulnerable child / protector parts)
   - Schema Experience & Triggers (how the person's specific elevated schemas manifest in daily life, activation contexts, intensity)
   - Coping Styles Across Domains (surrender, avoidance, overcompensation patterns in work, relationships, self-care)
   - Mood & Emotional Regulation (depression, anxiety, emotional intensity, distress tolerance, alexithymia)
   - Trauma & Stress History (PTSD, Complex PTSD, adverse experiences, relational trauma)
   - Relational & Attachment Patterns (attachment style, partner selection, interpersonal cycles, intimacy patterns)
   - Personality & Identity (Cluster A/B/C traits, self-concept, identity diffusion)
   - Self-Regulation & Impulse Control (ADHD, substance use, behavioural patterns, compulsions)
   - Somatic & Dissociative Experiences (if relevant to profile)
   - Functional Impact (work/academic functioning, social life, daily living — how schemas concretely impair or shape life)
   Create any category the clinical picture demands. Only include categories where the schema profile provides genuine clinical rationale.

3. Per category, generate 3–5 questions. Each question MUST specify its type:
   - "choice": Multiple choice with defined options (for frequency, severity, or categorical responses)
   - "boolean": Yes/No question (for screening specific experiences)
   - "freetext": Open-ended question inviting narrative response (for subjective experience, context, examples)

   Choose the type that best fits each question's clinical purpose — do not force a fixed distribution. Freetext questions are especially valuable for schema origins, mode experiences, and relational narratives where the person's own language reveals schema activation. Use choice/boolean when you need specific screening data (frequency, severity, binary presence/absence).

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

Generate as many questions as the clinical picture warrants — let the complexity of the profile guide you. A complex multi-schema profile with several high-severity elevations may need 30+ questions across many categories; a simpler profile with few elevations may need only 15. Every question should earn its place by providing clinical signal the YSQ alone cannot.` + langInstruction();

    const userMsg = `Here is the schema profile to generate follow-up questions for:\n\n${scoresText}\n\nGenerate the JSON array of categorised follow-up questions now.`;

    const content = await callOpenAI(apiKey, sysPrompt, userMsg, {
        temperature: 0.3,
        max_completion_tokens: 4096,
        response_format: { type: 'json_object' }
    });

    const parsed = JSON.parse(content);
    let categories = Array.isArray(parsed) ? parsed : (parsed.categories || parsed.questions || Object.values(parsed)[0]);
    if (!Array.isArray(categories)) throw new Error(I18N.t('ai.unexpectedFormat'));

    if (categories.length > 0 && categories[0].text && !categories[0].questions) {
        categories = [{ category: I18N.t('ai.defaultCategoryName'), questions: categories }];
    }
    categories = categories.filter(cat => Array.isArray(cat.questions) && cat.questions.length > 0);
    if (categories.length === 0) throw new Error(I18N.t('ai.noCategories'));

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
        html += `<div class="diff-dx-round-separator"><span>${I18N.t('ui.additionalQuestions')}</span></div>`;
    }

    let newQ = 0;
    categories.forEach((cat, ci) => {
        if (!cat || !Array.isArray(cat.questions)) return;
        const badgeNum = existingCats + ci + 1;
        html += `<div class="diff-dx-category">`;
        html += `<div class="diff-dx-category-header"><div class="diff-dx-cat-badge">${badgeNum}</div>${escapeHtml(cat.category || I18N.t('ai.defaultCategoryName'))}</div>`;
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
                html += `<textarea class="diff-dx-freetext" name="${qid}" placeholder="${escapeHtml(q.placeholder || I18N.t('ai.freeTextDefaultPlaceholder'))}" oninput="onFollowUpAnswer('${qid}')"></textarea>`;
                html += `</div>`;
            } else if (q.type === 'boolean') {
                html += `<div class="diff-dx-answer-area">`;
                html += `<div class="diff-dx-options">`;
                html += `<input type="radio" name="${qid}" id="${qid}_yes" value="${I18N.t('ai.yes')}" onchange="onFollowUpAnswer('${qid}')">`;
                html += `<label for="${qid}_yes">${I18N.t('ai.yes')}</label>`;
                html += `<input type="radio" name="${qid}" id="${qid}_no" value="${I18N.t('ai.no')}" onchange="onFollowUpAnswer('${qid}')">`;
                html += `<label for="${qid}_no">${I18N.t('ai.no')}</label>`;
                html += `</div>`;
                html += `<div class="diff-dx-freetext-wrap" style="display:none"><textarea class="diff-dx-freetext" name="${qid}_ft" placeholder="${I18N.t('ai.freeTextPlaceholder')}" oninput="onFollowUpAnswer('${qid}')"></textarea></div>`;
                html += `<button type="button" class="freetext-toggle" title="${I18N.t('ai.switchToFreeText')}" onclick="toggleFollowUpFreeText('${qid}', this)">✎</button>`;
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
                html += `<div class="diff-dx-freetext-wrap" style="display:none"><textarea class="diff-dx-freetext" name="${qid}_ft" placeholder="${I18N.t('ai.freeTextPlaceholder')}" oninput="onFollowUpAnswer('${qid}')"></textarea></div>`;
                html += `<button type="button" class="freetext-toggle" title="${I18N.t('ai.switchToFreeText')}" onclick="toggleFollowUpFreeText('${qid}', this)">✎</button>`;
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

    const totalQ = container.querySelectorAll('.diff-dx-q-card').length;
    const answeredQ = container.querySelectorAll('.diff-dx-q-card.answered').length;
    const tmpl = I18N.t('progress.answered');
    document.getElementById('followUpProgressText').textContent = tmpl.replace('{0}', answeredQ).replace('{1}', totalQ);
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
        btn.title = I18N.t('ai.switchToFreeText');
    } else {
        options.style.display = 'none';
        ftWrap.style.display = 'block';
        btn.classList.add('active');
        btn.title = I18N.t('ai.switchToOptions');
        ftWrap.querySelector('textarea').focus();
    }
    onFollowUpAnswer(qid);
}

function onFollowUpAnswer(qid) {
    const card = document.getElementById('card_' + qid);
    if (!card) return;

    const answerArea = card.querySelector('.diff-dx-answer-area');
    if (answerArea) {
        const ftWrap = answerArea.querySelector('.diff-dx-freetext-wrap');
        if (ftWrap && ftWrap.style.display !== 'none') {
            const ta = ftWrap.querySelector('textarea');
            if (ta && ta.value.trim()) { card.classList.add('answered'); } else { card.classList.remove('answered'); }
        } else {
            const selected = card.querySelector(`input[name="${qid}"]:checked`);
            if (selected) { card.classList.add('answered'); } else { card.classList.remove('answered'); }
        }
    } else {
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
    const tmpl = I18N.t('progress.answered');
    document.getElementById('followUpProgressText').textContent = tmpl.replace('{0}', answered).replace('{1}', total);
}

function collectAnswers() {
    const roundTmpl = I18N.t('ai.followUpResponsesHeader');
    let text = roundTmpl.replace('{0}', currentRound) + `:\n\n`;
    followUpQuestionsData.forEach((cat, ci) => {
        if (!cat || !Array.isArray(cat.questions)) return;
        text += `${I18N.t('ai.categoryLabel')}: ${cat.category}\n`;
        cat.questions.forEach((q, qi) => {
            const qid = `fu_r${currentRound}_${ci}_${qi}`;
            let val = I18N.t('ai.notAnswered');

            if (q.type === 'freetext') {
                const textarea = document.querySelector(`textarea[name="${qid}"]`);
                if (textarea && textarea.value.trim()) val = textarea.value.trim();
            } else {
                const card = document.getElementById('card_' + qid);
                const ftWrap = card?.querySelector('.diff-dx-freetext-wrap');
                if (ftWrap && ftWrap.style.display !== 'none') {
                    const ta = ftWrap.querySelector('textarea');
                    if (ta && ta.value.trim()) val = I18N.t('ai.freeTextPrefix') + ta.value.trim();
                } else {
                    const selected = document.querySelector(`input[name="${qid}"]:checked`);
                    if (selected) val = selected.value;
                }
            }

            text += `  ${I18N.t('ai.questionLabel')}: ${q.text}\n  ${I18N.t('ai.answerLabel')}: ${val}\n`;
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
        const tmpl = I18N.t('ai.unansweredFollowUp');
        statusEl.textContent = tmpl.replace('{0}', total - answered);
        statusEl.className = 'ai-eval-status error';
        return;
    }

    if (!apiKey) { statusEl.textContent = I18N.t('ai.apiKeyRequired'); statusEl.className = 'ai-eval-status error'; return; }

    const btn = document.getElementById('followUpSubmitBtn');
    btn.disabled = true; btn.style.opacity = '0.5';
    statusEl.innerHTML = '<span class="spinner"></span> ' + I18N.t('ai.analysingResponses');
    statusEl.className = 'ai-eval-status';

    const answersText = collectAnswers();
    answersHistory.push(answersText);

    const data = buildScorePayload();
    const scoresText = formatScoresForPrompt(data);

    if (currentRound >= 2) {
        try {
            await generateFinalEvaluation(apiKey, scoresText);
        } catch (err) {
            statusEl.textContent = I18N.t('ai.errorPrefix') + err.message;
            statusEl.className = 'ai-eval-status error';
            document.getElementById('aiEvalResult').style.display = 'none';
        } finally {
            btn.disabled = false; btn.style.opacity = '1';
        }
        return;
    }

    const allAnswers = answersHistory.join('\n');

    const sysPrompt = `You are a licensed clinical psychologist with specialised training in Schema Therapy (Young, Klosko & Weishaar, 2003). You are reviewing a completed YSQ-S3 profile and the client's follow-up responses to determine whether you have sufficient clinical data to write a comprehensive schema-focused evaluation.

To write a strong evaluation, you ideally need:
- Enough data to formulate schema origins (developmental/childhood context for the key elevated schemas)
- Understanding of the person's primary coping styles and schema modes across key life domains
- Sufficient screening data to meaningfully discuss associated clinical conditions
- Some sense of the person's Healthy Adult capacity and protective factors

RULES:
- Default to evaluating. Only request follow-up if there is a clearly important clinical gap that would materially weaken the evaluation — for example, contradictory screening answers that make clinical interpretation ambiguous, a high-severity profile (multiple schemas ≥5.0) with no developmental context whatsoever, or a critical differential diagnosis that cannot be addressed without specific additional data.
- If requesting follow-up, generate only the questions needed to fill the specific gap. These should target ONLY what is missing, not re-cover ground already addressed.
- Do NOT request follow-up simply to gather "more context" or "richer data" — the evaluation can acknowledge limitations where data is thin. Only request follow-up when the gap would lead to a materially incomplete or misleading evaluation.

Output valid JSON in one of these two formats:

If sufficient:
{"action": "evaluate"}

If follow-up genuinely needed:
{"action": "followup", "reason": "Brief explanation of the specific clinical ambiguity", "questions": [array of category objects in this exact format:
  {"category": "Category Name", "rationale": "Why needed", "questions": [
    {"id": "q1", "type": "choice|boolean|freetext", "text": "Question?", "options": ["..."] (for choice only), "placeholder": "..." (for freetext only), "context": "Clinical note"}
  ]}
]}` + langInstruction();

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
                statusEl.innerHTML = `<em>${escapeHtml(decision.reason)}</em> — ${I18N.t('ai.pleaseAnswerAdditional')}`;
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
        statusEl.textContent = I18N.t('ai.errorPrefix') + err.message;
        statusEl.className = 'ai-eval-status error';
        document.getElementById('aiEvalResult').style.display = 'none';
        btn.disabled = false; btn.style.opacity = '1';
    }
}

// ─── Evaluation Prompt ──────────────────────────────────────────

const EVAL_SYSTEM_PROMPT = `You are a licensed clinical psychologist with deep specialisation in Schema Therapy (Young, Klosko & Weishaar, 2003). Your clinical framework encompasses the full Schema Therapy model: 18 Early Maladaptive Schemas grouped into 5 domains, the schema mode model (child modes, dysfunctional parent modes, dysfunctional coping modes, and the Healthy Adult), three coping styles (surrender, avoidance, overcompensation), and the concept of core unmet emotional needs driving schema development.

You are writing a comprehensive professional evaluation report based on:
1. A completed Young Schema Questionnaire (YSQ-S3, 90 items, 18 schemas, 5 domains, 1–6 Likert scale)
2. The client's responses to targeted follow-up questions designed specifically for their profile

Your task is to produce a thorough, clinically precise, and empathic evaluation that integrates both data sources. Write in the voice of a seasoned Schema Therapy clinician preparing a report for a client who will read it directly. Be direct about what the data shows — do not minimise or catastrophise. Ground every interpretation in the actual scores and follow-up responses. Where data is insufficient, you may note clinical hypotheses but clearly label them as such.

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
Identify the most significant schema clusters or interactions in this profile. Explain how they reinforce each other, creating cyclical patterns. Be specific to THIS person's scores and follow-up responses — show the mechanism, not just the correlation. Where relevant, describe the typical activation sequence (trigger → schema activation → mode shift → coping behaviour → consequence → schema reinforcement).

### Schema Mode Conceptualisation
Based on the schema profile and follow-up responses, outline the person's likely mode map:
- Which child modes are most active (Vulnerable Child, Angry Child, Undisciplined Child, etc.) and what triggers them
- Which dysfunctional coping modes dominate (Detached Protector, Compliant Surrenderer, Overcompensator, etc.) and in which life domains
- Evidence of Punitive Parent or Demanding Parent modes (inner critic, self-punishment, perfectionism)
- Signs of Healthy Adult capacity — self-awareness, ability to seek help, areas of balanced functioning
If the follow-up data does not provide sufficient information for certain modes, note this as a limitation rather than omitting the section.

### Developmental Formulation
Drawing on the follow-up responses about childhood, family, and early experiences, outline a brief developmental hypothesis for the person's core schemas. Which early environments and experiences likely contributed to the elevated schemas? Connect the person's reported history to the schema origins described in Schema Therapy theory. If developmental data is limited, note what a clinician would want to explore further.

### Commonly Associated Clinical Conditions
Based on the schema profile AND the follow-up screening responses, identify conditions that may be relevant:
- For each condition, provide the condition name, association strength (Strong / Moderate / Tentative), evidence from this profile (cite specific schema scores and screening answers that converge), and key differentiators (what would confirm vs. rule out this condition clinically)
- Order from strongest to weakest association. Identify all conditions with meaningful evidence — do not cap the list artificially, but do not pad it either.
- For personality patterns, describe TRAITS and TENDENCIES (e.g., "features consistent with avoidant personality style") rather than assigning full personality disorder diagnoses
- Frame all conditions as ASSOCIATIONS and HYPOTHESES, never confirmed diagnoses
- Include a brief caveat for each about what else could explain the pattern

### Recommended Assessment Instruments
Based on the conditions identified, recommend the most diagnostically relevant validated instruments for formal assessment:
- **Instrument name** (acronym + full name)
- What it assesses and why it's relevant for this profile specifically
- Administration notes (self-report vs. clinician-administered, approximate time)
Prioritise instruments that would most effectively resolve the diagnostic hypotheses raised in this report. Include Schema Therapy-specific instruments (e.g., SMI, YPI) where appropriate alongside broader clinical measures.

### Protective Factors & Strengths
Identify schemas that scored low (≤2.0) and frame these as genuine strengths and resilience factors. Explain what low scores in these areas suggest about the person's emotional resources. Also note any strengths that emerged from the follow-up responses (e.g., self-awareness, help-seeking behaviour, relational capacities).

### Clinical Recommendations
Provide specific, actionable recommendations tailored to this profile, including:
- Which schemas and modes to prioritise in therapy and why (consider which schemas are most pervasive and which maintain the most dysfunction)
- Specific Schema Therapy techniques matched to this person's presentation (limited reparenting, chair work/mode dialogues, imagery rescripting for schema origins, behavioural pattern-breaking, schema flash cards, mode mapping)
- Other evidence-based modalities that may complement Schema Therapy for this profile (e.g., EMDR for trauma, DBT skills for emotion dysregulation, ACT for avoidance patterns)
- Self-help strategies the person can begin immediately — ground these in their specific schemas rather than offering generic advice
- When professional support is strongly advised vs. optional, with specificity about what type of professional (Schema Therapy trained, trauma-specialist, etc.)

### Risk Considerations
If any schema scores ≥5.0, flag specific emotional vulnerabilities. If overall profile is significantly elevated, note this clearly but without alarm. If the profile is relatively mild, state that no acute concerns are indicated.

Formatting rules:
- Use ### for section headings only
- Use **bold** for schema names and condition names when referenced
- Use *italics* for clinical terms on first mention
- Write in second person ("you", "your") for directness
- Write as comprehensively as the data warrants — do not truncate analysis to meet an arbitrary length. A complex, multi-schema profile deserves a thorough report; a simpler profile may be shorter. Depth and clinical utility take priority over brevity.
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

const REVIEW_SYSTEM_PROMPT = `You are a senior clinical psychologist, board-certified in Schema Therapy, conducting a peer review of a clinical evaluation report. You have extensive experience supervising Schema Therapy trainees and reviewing case conceptualisations. Your review is rigorous but constructive — you improve the report rather than merely criticising it.

You will receive the original data (schema scores + follow-up responses) and the draft evaluation. Your task is to produce a REVISED version that corrects any issues found and strengthens the clinical quality.

Review criteria — check and fix each:

1. **Data Accuracy**: Every score cited must match the actual data. Every client quote or paraphrase must reflect what they actually said. Remove or correct any fabricated or hallucinated details. Cross-reference each cited score against the provided data.

2. **Schema Therapy Theoretical Accuracy**: Schema descriptions must align with Young's definitions. Schema-domain assignments must be correct. Mode conceptualisations must follow the established mode model (child modes, parent modes, coping modes, Healthy Adult). Coping styles must be correctly categorised as surrender, avoidance, or overcompensation. Schema origins must be developmentally plausible.

3. **Clinical Precision**: Interpretations must follow logically from the data. Correct any overstatements (claiming strong association when data is ambiguous), understatements (downplaying clearly elevated patterns), or unsupported inferences. Ensure the severity language matches the actual score levels (e.g., a score of 4.1 is mildly elevated, not "extremely high").

4. **Ethical Compliance**: No confirmed diagnoses — only associations and hypotheses. Personality patterns framed as traits/tendencies, not disorders. Appropriate caveats present. Disclaimer intact.

5. **Internal Consistency**: The report must not contradict itself across sections. Schema severity descriptions must be consistent. Mode descriptions must align with the schema and coping style analysis. Recommendations must target the schemas and modes actually identified.

6. **Integration Quality**: Follow-up responses should be meaningfully woven into the analysis — the client's own words and reported experiences should illuminate schema patterns, mode activations, and developmental origins. Not merely listed or appended.

7. **Completeness**: All sections present and substantive. Every elevated schema (≥4.0) must be addressed. Mode conceptualisation should cover the primary modes evident in the data. Developmental formulation should connect to the schema profile.

8. **Tone & Readability**: Warm but clinically precise. Second person. Schema Therapy terminology should be introduced naturally with brief explanation on first use. No catastrophising or false reassurance.

9. **Condition Associations**: Evidence cited for each condition must be specific and traceable to actual scores/answers. Differentiators should be genuinely useful. Strength ratings (Strong/Moderate/Tentative) must be calibrated to the actual evidence, not inflated.

10. **Recommendation Specificity**: Therapeutic recommendations must be tailored to THIS profile. Generic advice (e.g., "consider therapy") should be replaced with specific, actionable guidance tied to the person's identified schemas, modes, and coping patterns.

IMPORTANT: Output ONLY the revised evaluation text in full. Do not include commentary, review notes, or a summary of changes. If the evaluation is already excellent, return it with only minor refinements. Always return the complete report — never truncate or summarise sections.

Maintain the same markdown formatting (### headings, **bold**, *italics*) as the original.`;

// ─── Step 3: Final Evaluation ───────────────────────────────────

async function generateFinalEvaluation(apiKey, scoresText) {
    const statusEl = document.getElementById('followUpStatus');
    const resultEl = document.getElementById('aiEvalResult');

    statusEl.innerHTML = '<span class="spinner"></span> ' + I18N.t('ai.generating');
    statusEl.className = 'ai-eval-status';

    const allAnswers = answersHistory.join('\n');
    const userPrompt = `Here is all available data for evaluation:\n\n${scoresText}\n\n${allAnswers}\n\nPlease generate the comprehensive professional evaluation report now.`;

    resultEl.innerHTML = `
        <div class="eval-header">
          <div class="eval-header-label">${I18N.t('ai.evalHeaderLabel')}</div>
          <div class="eval-header-title">${I18N.t('ai.evalHeaderTitle')}</div>
        </div>
        <div class="eval-body" id="evalBodyStream"></div>
        <div class="eval-footer" id="evalFooter" style="display:none;"></div>
    `;
    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const bodyEl = document.getElementById('evalBodyStream');

    const evalPrompt = EVAL_SYSTEM_PROMPT + langInstruction();
    const reviewPrompt = REVIEW_SYSTEM_PROMPT + langInstruction();

    try {
        const draftText = await callOpenAIStream(apiKey, evalPrompt, userPrompt, (_token, full) => {
            bodyEl.innerHTML = renderEvalMarkdown(full);
        }, {
            temperature: 0.5,
            max_completion_tokens: 16384
        });

        bodyEl.innerHTML = renderEvalMarkdown(draftText);

        statusEl.innerHTML = '<span class="spinner"></span> ' + I18N.t('ai.reviewing');

        const reviewUserPrompt = `ORIGINAL DATA:\n\n${scoresText}\n\n${allAnswers}\n\n---\n\nDRAFT EVALUATION TO REVIEW:\n\n${draftText}\n\n---\n\nReview this evaluation against the original data. Output the complete revised evaluation.`;

        const reviewedText = await callOpenAI(apiKey, reviewPrompt, reviewUserPrompt, {
            temperature: 0.2,
            max_completion_tokens: 16384
        });

        bodyEl.innerHTML = renderEvalMarkdown(reviewedText);
        const footerEl = document.getElementById('evalFooter');
        const dateStr = new Date().toLocaleDateString(I18N.currentLang() === 'en' ? 'en-GB' : I18N.currentLang(), { day: 'numeric', month: 'long', year: 'numeric' });
        const tmpl = I18N.t('ai.evalFooter');
        footerEl.textContent = tmpl.replace('{0}', AI_MODEL).replace('{1}', dateStr);
        footerEl.style.display = '';
        statusEl.textContent = '';
    } catch (err) {
        statusEl.textContent = I18N.t('ai.errorPrefix') + err.message;
        statusEl.className = 'ai-eval-status error';
        resultEl.style.display = 'none';
    }
}
