// js/ui.js — Shared UI helpers: API key visibility toggle
        function toggleKeyVis() {
            const inp = document.getElementById('apiKeyInput');
            inp.type = inp.type === 'password' ? 'text' : 'password';
        }
