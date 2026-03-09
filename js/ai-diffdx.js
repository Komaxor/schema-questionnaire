// js/ai-diffdx.js — Phase 2: diff-dx question generation | Phase 3: streaming diagnostic impressions

let diffDxQuestionsData = [];

async function generateDiffDxQuestions(apiKey, data, scoresText) {
    const section = document.getElementById('diffDxSection');
    const statusEl = document.getElementById('aiEvalStatus');
    section.style.display = 'block';
    statusEl.innerHTML = '<span class="spinner"></span> Generating differential diagnostic questions based on your profile...';

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
            if (response.status === 401) throw new Error('Invalid API key. Check your key and try again.');
            if (response.status === 429) throw new Error('Rate limit exceeded. Wait a moment and try again.');
            throw new Error(err.error?.message || `API returned status ${response.status}`);
        }

        const json = await response.json();
        const content = json.choices?.[0]?.message?.content;
        if (!content) throw new Error('No content returned from API.');

        // Parse JSON — handle possible markdown code fences
        let cleaned = content.trim();
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
        }
        const categories = JSON.parse(cleaned);
        diffDxQuestionsData = categories;

        renderDiffDxQuestions(categories);
        statusEl.textContent = '';
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        statusEl.textContent = 'Error generating questions: ' + err.message;
        statusEl.className = 'ai-eval-status error';
    }
}

function renderDiffDxQuestions(categories) {
    const container = document.getElementById('diffDxQuestions');
    let globalIdx = 0;
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

    // Store total for progress
    container.dataset.total = totalQ;
}

function onDiffDxAnswer(qid) {
    const card = document.getElementById('card_' + qid);
    if (card) card.classList.add('answered');

    // Update progress
    const container = document.getElementById('diffDxQuestions');
    const total = parseInt(container.dataset.total || 0);
    const answered = container.querySelectorAll('.diff-dx-q-card.answered').length;
    document.getElementById('diffDxProgressText').textContent = `${answered} / ${total} answered`;
}

// ─── Phase 3: Submit Differential Dx & Get Diagnostic Impressions ─

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

    // Streaming result shell
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
