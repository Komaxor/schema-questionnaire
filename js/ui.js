// js/ui.js — Shared UI helpers: API key visibility toggle, deep clinical toggle
        function toggleKeyVis() {
            const inp = document.getElementById('apiKeyInput');
            inp.type = inp.type === 'password' ? 'text' : 'password';
        }

        function onDeepClinicalToggle() {
            const on = document.getElementById('deepClinicalToggle').checked;
            document.getElementById('deepClinicalDisclaimer').style.display = on ? 'flex' : 'none';
        }
