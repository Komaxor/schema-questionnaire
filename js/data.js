// js/data.js — Schema and domain definitions for the Young Schema Questionnaire
// Translatable strings (names, descriptions) live in js/i18n/*.js
        const TOTAL = 90;
        const DOMAIN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

        const SCHEMAS = [
            { id: 1, domain: 1, qs: [1, 2, 3, 4, 5] },
            { id: 2, domain: 1, qs: [6, 7, 8, 9, 10] },
            { id: 3, domain: 1, qs: [11, 12, 13, 14, 15] },
            { id: 4, domain: 1, qs: [16, 17, 18, 19, 20] },
            { id: 5, domain: 1, qs: [21, 22, 23, 24, 25] },
            { id: 6, domain: 2, qs: [26, 27, 28, 29, 30] },
            { id: 7, domain: 2, qs: [31, 32, 33, 34, 35] },
            { id: 8, domain: 2, qs: [36, 37, 38, 39, 40] },
            { id: 9, domain: 2, qs: [41, 42, 43, 44, 45] },
            { id: 10, domain: 3, qs: [46, 47, 48, 49, 50] },
            { id: 11, domain: 3, qs: [51, 52, 53, 54, 55] },
            { id: 12, domain: 4, qs: [56, 57, 58, 59, 60] },
            { id: 13, domain: 4, qs: [61, 62, 63, 64, 65] },
            { id: 14, domain: 4, qs: [66, 67, 68, 69, 70] },
            { id: 15, domain: 5, qs: [71, 72, 73, 74, 75] },
            { id: 16, domain: 5, qs: [76, 77, 78, 79, 80] },
            { id: 17, domain: 5, qs: [81, 82, 83, 84, 85] },
            { id: 18, domain: 5, qs: [86, 87, 88, 89, 90] },
        ];

        const DOMAINS = [
            { id: 1, schemas: [1, 2, 3, 4, 5] },
            { id: 2, schemas: [6, 7, 8, 9] },
            { id: 3, schemas: [10, 11] },
            { id: 4, schemas: [12, 13, 14] },
            { id: 5, schemas: [15, 16, 17, 18] },
        ];

        // Helper to get translated schema/domain info
        function schemaT(id) {
            const s = SCHEMAS.find(s => s.id === id);
            const t = I18N.t('schemas')[id - 1];
            return { ...s, name: t.name, short: t.short, desc: t.desc };
        }

        function domainT(id) {
            const d = DOMAINS.find(d => d.id === id);
            const t = I18N.t('domains')[id - 1];
            return { ...d, name: t.name };
        }
