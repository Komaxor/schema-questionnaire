// js/questionnaire.js — Radio button builder, progress tracking, form submission, retake

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
                // Find first unanswered and scroll to it
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

            // All answered — score and show results
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
            // Clear all answers
            document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
            updateProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
