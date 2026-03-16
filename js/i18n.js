// js/i18n.js — Lightweight i18n engine: registration, detection, fallback, DOM binding

const I18N = (function () {
    const langs = {};
    let current = 'en';
    const fallback = 'en';

    function register(code, translations) {
        langs[code] = translations;
    }

    function available() {
        return Object.keys(langs).map(code => ({
            code,
            name: langs[code].meta.name,
            flag: langs[code].meta.flag
        }));
    }

    function detect() {
        const stored = localStorage.getItem('ysq-lang');
        if (stored && langs[stored]) return stored;
        const browserLang = (navigator.language || '').split('-')[0].toLowerCase();
        if (langs[browserLang]) return browserLang;
        return fallback;
    }

    function t(key) {
        const keys = key.split('.');
        let val = langs[current];
        for (const k of keys) {
            if (val == null) break;
            val = val[k];
        }
        if (val != null) return val;
        // Fallback to English
        val = langs[fallback];
        for (const k of keys) {
            if (val == null) break;
            val = val[k];
        }
        return val != null ? val : key;
    }

    function applyDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = t(key);
            if (typeof val === 'string') {
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = val;
                } else {
                    el.innerHTML = val;
                }
            }
        });
        document.documentElement.lang = current;
    }

    function setLang(code) {
        if (!langs[code]) return;
        current = code;
        localStorage.setItem('ysq-lang', code);
        applyDOM();
        if (typeof renderQuestionTexts === 'function') renderQuestionTexts();
        if (typeof updateProgress === 'function') updateProgress();
    }

    function init() {
        current = detect();
        applyDOM();
        if (typeof renderQuestionTexts === 'function') renderQuestionTexts();
        buildSwitcher();
    }

    function buildSwitcher() {
        const container = document.getElementById('langSwitcher');
        if (!container) return;
        const avail = available();
        if (avail.length < 2) { container.style.display = 'none'; return; }
        const select = document.createElement('select');
        select.className = 'lang-select';
        select.setAttribute('aria-label', 'Language');
        avail.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.code;
            opt.textContent = l.flag + ' ' + l.name;
            if (l.code === current) opt.selected = true;
            select.appendChild(opt);
        });
        select.addEventListener('change', () => setLang(select.value));
        container.innerHTML = '';
        container.appendChild(select);
    }

    function currentLang() { return current; }

    return { register, t, setLang, init, currentLang, available };
})();
