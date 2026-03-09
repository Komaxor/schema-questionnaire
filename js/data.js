// js/data.js — Schema and domain definitions for the Young Schema Questionnaire
        const TOTAL = 90;

        const SCHEMAS = [
            { id: 1, name: 'Abandonment / Instability', short: 'Abandonment', desc: 'Fear that loved ones will leave or be unreliable', domain: 1, qs: [1, 2, 3, 4, 5] },
            { id: 2, name: 'Mistrust / Abuse', short: 'Mistrust', desc: 'Expectation of being hurt, abused or manipulated', domain: 1, qs: [6, 7, 8, 9, 10] },
            { id: 3, name: 'Emotional Deprivation', short: 'Emotional Deprivation', desc: 'Belief that emotional needs will never be met', domain: 1, qs: [11, 12, 13, 14, 15] },
            { id: 4, name: 'Defectiveness / Shame', short: 'Defectiveness', desc: 'Feeling fundamentally flawed or unlovable', domain: 1, qs: [16, 17, 18, 19, 20] },
            { id: 5, name: 'Social Isolation / Alienation', short: 'Social Isolation', desc: 'Feeling apart from and different from everyone else', domain: 1, qs: [21, 22, 23, 24, 25] },
            { id: 6, name: 'Dependence / Incompetence', short: 'Dependence', desc: 'Belief of being unable to function without help', domain: 2, qs: [26, 27, 28, 29, 30] },
            { id: 7, name: 'Vulnerability to Harm', short: 'Vulnerability', desc: 'Exaggerated fear of imminent catastrophe', domain: 2, qs: [31, 32, 33, 34, 35] },
            { id: 8, name: 'Enmeshment / Undeveloped Self', short: 'Enmeshment', desc: 'Excessive involvement with others, lack of identity', domain: 2, qs: [36, 37, 38, 39, 40] },
            { id: 9, name: 'Failure', short: 'Failure', desc: 'Belief one has failed or will inevitably fail', domain: 2, qs: [41, 42, 43, 44, 45] },
            { id: 10, name: 'Entitlement / Grandiosity', short: 'Entitlement', desc: 'Belief of being superior with special rights', domain: 3, qs: [46, 47, 48, 49, 50] },
            { id: 11, name: 'Insufficient Self-Control', short: 'Self-Control Deficit', desc: 'Difficulty tolerating frustration or impulses', domain: 3, qs: [51, 52, 53, 54, 55] },
            { id: 12, name: 'Subjugation', short: 'Subjugation', desc: 'Surrendering control to avoid negative consequences', domain: 4, qs: [56, 57, 58, 59, 60] },
            { id: 13, name: 'Self-Sacrifice', short: 'Self-Sacrifice', desc: 'Excessive focus on others\' needs at own expense', domain: 4, qs: [61, 62, 63, 64, 65] },
            { id: 14, name: 'Approval-Seeking', short: 'Approval-Seeking', desc: 'Excessive reliance on others\' validation for self-esteem', domain: 4, qs: [66, 67, 68, 69, 70] },
            { id: 15, name: 'Negativity / Pessimism', short: 'Negativity', desc: 'Pervasive focus on the negative, minimising the positive', domain: 5, qs: [71, 72, 73, 74, 75] },
            { id: 16, name: 'Emotional Inhibition', short: 'Emotional Inhibition', desc: 'Suppression of emotions and spontaneous expression', domain: 5, qs: [76, 77, 78, 79, 80] },
            { id: 17, name: 'Unrelenting Standards', short: 'Unrelenting Standards', desc: 'Striving to meet impossibly high self-imposed standards', domain: 5, qs: [81, 82, 83, 84, 85] },
            { id: 18, name: 'Punitiveness', short: 'Punitiveness', desc: 'Belief people deserve harsh punishment for mistakes', domain: 5, qs: [86, 87, 88, 89, 90] },
        ];

        const DOMAINS = [
            { id: 1, name: 'Disconnection & Rejection', schemas: [1, 2, 3, 4, 5] },
            { id: 2, name: 'Impaired Autonomy & Performance', schemas: [6, 7, 8, 9] },
            { id: 3, name: 'Impaired Limits', schemas: [10, 11] },
            { id: 4, name: 'Other-Directedness', schemas: [12, 13, 14] },
            { id: 5, name: 'Overvigilance & Inhibition', schemas: [15, 16, 17, 18] },
        ];
