// js/ai-eval.js — OpenAI integration: score payload, streaming API call, Phase 1 clinical evaluation

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

    // Set up result shell for streaming — shown immediately so text appears as it arrives
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
