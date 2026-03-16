// js/questionnaire.js — Dynamic question rendering, radio buttons, progress tracking, form submission, retake

        // Render the entire questionnaire from translation data
        function renderQuestionnaire() {
            const main = document.getElementById('questionnaireMain');
            const questions = I18N.t('questions');
            const schemas = I18N.t('schemas');
            const domains = I18N.t('domains');
            let html = '';

            DOMAINS.forEach((d, di) => {
                const dt = domains[di];
                html += `<div class="domain-block">`;
                html += `<div class="domain-header">`;
                html += `<div class="domain-number">${DOMAIN_NUMERALS[di]}</div>`;
                html += `<div class="domain-info">`;
                html += `<div class="domain-name">${dt.name}</div>`;
                html += `<div class="domain-subtitle">${dt.subtitle}</div>`;
                html += `</div></div>`;

                d.schemas.forEach(sid => {
                    const s = SCHEMAS.find(s => s.id === sid);
                    const st = schemas[sid - 1];
                    html += `<div class="schema-block">`;
                    html += `<div class="schema-header">`;
                    html += `<div class="schema-badge">${s.id}</div>`;
                    html += `<div class="schema-name">${st.name}</div>`;
                    html += `<div class="schema-desc">${st.headerDesc}</div>`;
                    html += `</div>`;
                    html += `<div class="questions">`;
                    s.qs.forEach(q => {
                        html += `<div class="question-row">`;
                        html += `<div class="question-text" data-q="${q}">${questions[q - 1]}</div>`;
                        html += `<div class="rating-group" id="q${q}"></div>`;
                        html += `</div>`;
                    });
                    html += `</div></div>`;
                });

                html += `</div>`;
            });

            main.innerHTML = html;

            // Build radio buttons
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

            document.querySelectorAll('input[type="radio"]').forEach(el => {
                el.addEventListener('change', updateProgress);
            });
        }

        // Render scale legend
        function renderScaleLegend() {
            const legend = document.getElementById('scaleLegend');
            if (!legend) return;
            const scale = I18N.t('scale');
            legend.innerHTML = scale.map((s, i) =>
                `<div class="scale-item"><span class="scale-num">${i + 1}</span> ${s}</div>`
            ).join('');
        }

        // Update question texts only (for language switch without losing answers)
        function renderQuestionTexts() {
            const questions = I18N.t('questions');
            const schemas = I18N.t('schemas');
            const domains = I18N.t('domains');

            // Update question texts
            document.querySelectorAll('.question-text[data-q]').forEach(el => {
                const q = parseInt(el.getAttribute('data-q'));
                if (questions[q - 1]) el.textContent = questions[q - 1];
            });

            // Update schema headers
            const schemaBlocks = document.querySelectorAll('.schema-block');
            schemaBlocks.forEach((block, i) => {
                if (!schemas[i]) return;
                const nameEl = block.querySelector('.schema-name');
                const descEl = block.querySelector('.schema-desc');
                const badgeEl = block.querySelector('.schema-badge');
                if (nameEl) nameEl.textContent = schemas[i].name;
                if (descEl) descEl.textContent = schemas[i].headerDesc;
            });

            // Update domain headers
            const domainBlocks = document.querySelectorAll('.domain-block');
            domainBlocks.forEach((block, i) => {
                if (!domains[i]) return;
                const nameEl = block.querySelector('.domain-name');
                const subtitleEl = block.querySelector('.domain-subtitle');
                if (nameEl) nameEl.textContent = domains[i].name;
                if (subtitleEl) subtitleEl.textContent = domains[i].subtitle;
            });

            // Update scale legend
            renderScaleLegend();
        }

        // Progress tracking
        function updateProgress() {
            let answered = 0;
            for (let i = 1; i <= TOTAL; i++) {
                if (document.querySelector('input[name="q' + i + '"]:checked')) answered++;
            }
            document.getElementById('progressFill').style.width = (answered / TOTAL * 100) + '%';
            const tmpl = I18N.t('progress.answered');
            document.getElementById('progressText').textContent = tmpl.replace('{0}', answered).replace('{1}', TOTAL);
            return answered;
        }

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
                const tmpl = I18N.t('progress.unanswered');
                note.textContent = tmpl.replace('{0}', TOTAL - answered);
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
            document.getElementById('followUpSection').style.display = 'none';
            document.getElementById('followUpStatus').textContent = '';
            document.getElementById('followUpStatus').className = 'ai-eval-status';
            followUpQuestionsData = [];
            answersHistory = [];
            currentRound = 0;
            document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
            updateProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // TEST: Preset answers — remove when no longer needed
        const TEST_ANSWERS = '54255534522454321112211221111221111322421212232112321432312464212323221211154343154211212221';
        function TEST_fillAnswers() {
            const answers = TEST_ANSWERS.slice(0, 90);
            for (let i = 0; i < answers.length; i++) {
                const radio = document.querySelector('input[name="q' + (i + 1) + '"][value="' + answers[i] + '"]');
                if (radio) radio.checked = true;
            }
            updateProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // END TEST

        // Initialize
        renderQuestionnaire();
        renderScaleLegend();
        I18N.init();
