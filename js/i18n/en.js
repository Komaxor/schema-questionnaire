// js/i18n/en.js — English translations
I18N.register('en', {
    meta: { code: 'en', name: 'English', flag: '🇬🇧' },
    ui: {
        title: 'Young Schema<br><em>Questionnaire</em>',
        coverLabel: 'Schema Therapy Assessment',
        coverDesc: 'Below are statements that a person might use to describe themselves. For each statement, rate how well it describes you using the scale below. There are no right or wrong answers — respond based on how you genuinely feel, not how you think you should feel.',
        submitBtn: 'View My Results',
        submitNote: 'Answer all 90 questions to generate your results.',
        retakeBtn: 'Retake Questionnaire',
        resultsLabel: 'Your Results',
        resultsTitle: 'Schema <em>Profile</em>',
        resultsIntro: 'Below is your scored profile across all 18 schemas. Scores reflect your average rating (1–6) per schema. A mean of <strong>4.0 or above</strong> is considered clinically elevated. This is not a diagnosis — share results with a qualified schema therapist for proper interpretation.',
        fullSchemaProfile: 'Full Schema Profile',
        legendModerate: 'Moderate (3–3.9)',
        legendElevated: 'Elevated (4–4.9)',
        legendHigh: 'High (5–6)',
        domainScoresTitle: 'Domain Scores',
        top5Title: 'Top 5 Schemas to Explore',
        disclaimer: '<strong>Important:</strong> This questionnaire is a self-report screening tool based on Young\'s Schema Therapy model. Elevated scores indicate patterns worth exploring, not a clinical diagnosis. Please consult a licensed psychologist or schema therapist for professional assessment and support.',
        professionalEval: 'Professional Evaluation',
        aiEvalIntro: 'Generate a detailed clinical-style evaluation of your schema profile using AI. Your data stays local — the API call goes directly from your browser to OpenAI. No intermediary servers.',
        apiKeyLabel: 'OpenAI API Key',
        apiKeyPlaceholder: 'sk-...',
        apiKeyNote: 'Your key is used once, in-browser only. It is never stored or transmitted elsewhere.',
        beginAiEval: 'Begin AI Evaluation',
        followUpTitle: 'Follow-Up Questions',
        followUpIntro: 'Based on your schema profile, the following questions help build a more complete clinical picture. Answer each honestly as it applies to you. This is not a diagnostic test — your responses will be integrated into the final evaluation.',
        submitAnswersBtn: 'Submit Answers',
        overallAverage: 'Overall Average',
        elevatedSchemas: 'Elevated Schemas (≥4.0)',
        highestSchema: 'Highest Schema',
        domainLabel: 'Domain',
        schemaLabel: 'Schema',
        toggleVisibility: 'Toggle visibility',
        additionalQuestions: 'Additional Questions'
    },
    scale: [
        'Completely untrue of me',
        'Mostly untrue of me',
        'Slightly more true than untrue',
        'Moderately true of me',
        'Mostly true of me',
        'Describes me perfectly'
    ],
    levels: {
        high: 'High',
        elevated: 'Elevated',
        moderate: 'Moderate',
        low: 'Low'
    },
    progress: {
        answered: '{0} / {1} answered',
        unanswered: '{0} question(s) still unanswered — first unanswered question highlighted above.'
    },
    ai: {
        analysing: 'Analysing your profile and generating follow-up questions…',
        analysingResponses: 'Analysing your responses…',
        generating: 'Generating comprehensive clinical evaluation…',
        reviewing: 'Clinical review in progress — verifying accuracy and refining…',
        errorPrefix: 'Error: ',
        noApiKey: 'Please enter your OpenAI API key above.',
        invalidKey: 'Invalid key format — OpenAI keys begin with "sk-".',
        apiKeyRequired: 'API key required — enter it above.',
        unansweredFollowUp: '{0} question(s) still unanswered. First unanswered highlighted above.',
        evalHeaderLabel: 'AI-Generated Clinical Evaluation',
        evalHeaderTitle: 'Comprehensive Schema Profile Analysis',
        evalFooter: 'Generated and peer-reviewed by {0} · {1} · This evaluation is AI-generated and does not constitute a clinical diagnosis or professional psychological assessment. It integrates self-report questionnaire data and follow-up responses for self-reflection and educational purposes only.',
        networkBlockedFile: 'Network request blocked — this page must be served via HTTP, not opened as a local file. Run a local server (e.g. "npx serve" or "python3 -m http.server") and open http://localhost:… instead.',
        networkFailed: 'Network request failed — check your internet connection and try again.',
        invalidApiKey: 'Invalid API key. Check your key and try again.',
        rateLimited: 'Rate limit exceeded. Wait a moment and try again.',
        noContent: 'No content returned from API.',
        unexpectedFormat: 'Unexpected response format from API.',
        noCategories: 'No valid question categories returned from API.',
        responseLanguageInstruction: '',
        clinicalContext: `SCHEMA THERAPY CLINICAL REFERENCE — Use this domain knowledge to ground your analysis in accurate Schema Therapy theory (Young, Klosko & Weishaar, 2003).

THE 5 SCHEMA DOMAINS AND THEIR FRUSTRATED CORE NEEDS:

1. DISCONNECTION & REJECTION — Frustrated need: Secure attachment and belonging.
   Background: Childhood environment was cold, abusive, rejecting, unpredictable, or isolating. The person learned that their need for safety, stability, nurturance, and acceptance would not be met.
   Schemas: Abandonment/Instability, Mistrust/Abuse, Emotional Deprivation, Defectiveness/Shame, Social Isolation/Alienation.

2. IMPAIRED AUTONOMY & PERFORMANCE — Frustrated need: Competence and independent identity.
   Background: Enmeshed or overprotective family that undermined the child's confidence and failed to support functioning outside the family system.
   Schemas: Dependence/Incompetence, Vulnerability to Harm or Illness, Enmeshment/Undeveloped Self, Failure to Achieve.

3. IMPAIRED LIMITS — Frustrated need: Realistic limits and self-discipline.
   Background: Permissive, indulgent, or lacking-in-direction parenting. Child not taught reciprocity, self-control, or respect for others' needs.
   Schemas: Entitlement/Grandiosity, Insufficient Self-Control/Self-Discipline.

4. OTHER-DIRECTEDNESS — Frustrated need: Free expression of needs and emotions.
   Background: Conditional acceptance — love contingent on suppressing own needs to serve others. Emphasis on gaining approval rather than authentic self-expression.
   Schemas: Subjugation, Self-Sacrifice, Approval-Seeking/Recognition-Seeking.

5. OVERVIGILANCE & INHIBITION — Frustrated need: Spontaneity and play.
   Background: Demanding, punitive, or perfectionistic family where mistakes were unacceptable. Emphasis on control, duty, and suppression of natural impulses.
   Schemas: Negativity/Pessimism, Emotional Inhibition, Unrelenting Standards/Hypercriticalness, Punitiveness.

DETAILED SCHEMA DEFINITIONS (use for precise clinical descriptions):

Abandonment/Instability (AB): Perceived instability or unreliability of those available for support. Expectation that significant others will be emotionally unstable, unreliable, erratically present, or will abandon. Key distinction: fear of loss, not fear of harm.

Mistrust/Abuse (MA): Expectation that others will intentionally hurt, abuse, humiliate, cheat, lie, manipulate, or exploit. Perception that harm is intentional or results from extreme negligence. Key distinction: fear of harm and exploitation, not merely unreliability.

Emotional Deprivation (ED): Expectation that emotional needs will not be adequately met. Three subtypes: (A) Deprivation of Nurturance — absence of warmth, attention, affection; (B) Deprivation of Empathy — absence of understanding, emotional attunement, mutual sharing; (C) Deprivation of Protection — absence of guidance, strength, direction.

Defectiveness/Shame (DS): Feeling fundamentally defective, bad, unwanted, inferior, or invalid. Hypersensitivity to criticism, rejection, and blame. Shame about perceived flaws, whether private (selfishness, anger, unacceptable desires) or public (appearance, social awkwardness). Core belief: "I am unlovable."

Social Isolation/Alienation (SI): Feeling isolated from the world, different from others, not belonging to any group or community. Key distinction from Defectiveness: SI is about not fitting in with the world; DS is about being intrinsically flawed.

Dependence/Incompetence (DI): Belief of being unable to handle everyday responsibilities competently without considerable help. Presents as helplessness in self-care, practical problem-solving, judgment, and decision-making.

Vulnerability to Harm or Illness (VH): Exaggerated fear of imminent catastrophe — medical (heart attacks, illnesses), emotional (going crazy), or external (accidents, crime, financial ruin). Hypervigilance about safety.

Enmeshment/Undeveloped Self (EM): Excessive emotional involvement with significant others (usually parents or partners) at the expense of individuation. Belief that enmeshed individuals cannot survive without constant support. Insufficient individual identity, feeling empty or directionless when alone.

Failure to Achieve (FA): Belief of having failed, being destined to fail, or being fundamentally inadequate compared to peers in achievement areas. Often involves beliefs about being stupid, inept, untalented, or less successful. Key distinction from Defectiveness: FA is about performance/achievement; DS is about being unlovable as a person.

Entitlement/Grandiosity (ET): Belief of being superior, entitled to special rights/privileges, or not bound by rules of reciprocity. Insistence on having whatever one wants regardless of cost to others. Sometimes includes excessive competitiveness or need for dominance. Key: this can be primary (narcissistic) or compensatory (masking Defectiveness).

Insufficient Self-Control/Self-Discipline (IS): Difficulty exercising self-control, tolerating frustration, or restraining emotional expression and impulses. In milder form: exaggerated avoidance of discomfort, pain, confrontation, or effort.

Subjugation (SB): Excessive surrender of control due to feeling coerced. Two subtypes: (A) Subjugation of Needs — suppressing preferences and desires; (B) Subjugation of Emotions — suppressing emotional expression, especially anger. Leads to buildup of rage manifested in maladaptive ways (passive-aggression, psychosomatic symptoms, acting out).

Self-Sacrifice (SS): Voluntarily and excessively meeting others' needs at own expense. Motivated by preventing pain to others, avoiding guilt, or maintaining connections. Often produces resentment when the sacrifice goes unreciprocated. Key distinction from Subjugation: SS is voluntary and driven by guilt/empathy; SB is coerced and driven by fear.

Approval-Seeking/Recognition-Seeking (AS): Excessive emphasis on gaining approval, recognition, or attention at the expense of authentic self. Self-esteem depends primarily on others' reactions. May manifest as overemphasis on status, appearance, achievement, or social conformity — not for intrinsic satisfaction but for external validation.

Negativity/Pessimism (NP): Pervasive, lifelong focus on negative aspects of life while minimizing the positive. Exaggerated expectations that things will go seriously wrong. Chronic worry, hypervigilance, complaining, or indecision. Key: this is a stable trait-like pattern, not a depressive episode.

Emotional Inhibition (EI): Excessive inhibition of spontaneous action, feeling, or communication — usually to avoid disapproval, shame, or losing control. Four areas: (a) inhibition of anger/aggression; (b) inhibition of positive impulses (joy, affection, sexuality); (c) difficulty expressing vulnerability; (d) excessive rationality while disregarding emotions.

Unrelenting Standards/Hypercriticalness (US): Belief that one must strive to meet very high internalized standards to avoid criticism. Results in perfectionism, rigid rules/"shoulds," preoccupation with time/efficiency. Must significantly impair pleasure, relaxation, health, self-esteem, or relationships. Key: the standards are internally driven, not externally imposed.

Punitiveness (PU): Belief that people (including oneself) should be harshly punished for mistakes. Tendency to be angry, intolerant, impatient with those not meeting standards. Difficulty forgiving, reluctance to consider extenuating circumstances or empathize. Key: both self-directed and other-directed punitive attitudes.

THREE COPING STYLES AND THEIR CLINICAL SIGNATURES:

1. SURRENDER (Compliance/Capitulation): The person yields to the schema, accepting it as true. They choose partners and situations that maintain the schema. Example: Someone with Defectiveness who stays in relationships with critical partners who confirm their "defectiveness."

2. AVOIDANCE (Schema Avoidance): The person arranges life to avoid triggering the schema. Forms include: cognitive avoidance (blocking thoughts/images), affective avoidance (suppressing feelings), behavioral avoidance (avoiding situations), and addictive self-soothing (substances, compulsive behaviors). Example: Someone with Abandonment who avoids intimate relationships entirely.

3. OVERCOMPENSATION: The person fights the schema by behaving as if the opposite were true. Can appear adaptive on the surface but is rigid and excessive. Example: Someone with Defectiveness who becomes grandiose or perfectionistic to prove their worth. Specific overcompensation responses include: aggression/hostility, dominance, recognition-seeking, manipulation, passive-aggression, excessive orderliness.

SCHEMA MODE MODEL — Key modes to assess:

Child Modes: Vulnerable Child (frightened, sad, helpless, lonely — the core wounded state), Angry Child (enraged at unmet needs), Impulsive/Undisciplined Child (acts on desires impulsively without limits), Happy Child (core needs are currently met — the therapy goal state).

Dysfunctional Parent Modes: Punitive Parent (internalized harsh, critical voice that punishes — "you're bad, you deserve to suffer"), Demanding Parent (internalized pressuring voice that demands perfection — "you must try harder, this isn't good enough").

Dysfunctional Coping Modes: Detached Protector (emotional withdrawal, numbing, disconnection — avoidance), Compliant Surrenderer (passive yielding, people-pleasing, giving in — surrender), Overcompensator (aggression, dominance, excessive control, status-seeking — overcompensation).

Healthy Adult Mode: Capacity for self-reflection, balanced emotional regulation, setting appropriate limits, nurturing oneself, maintaining perspective. The therapeutic goal is strengthening this mode.

SCHEMA SELF-PERPETUATION: Schemas maintain themselves through two pathways:
1. Cognitive/Perceptual: Schema biases attention → selective perception → confirmation → schema strengthened.
2. Behavioral/Social: Schema drives behavior → elicits confirming responses from others → confirmation → schema strengthened.
This creates self-reinforcing cycles that explain why schemas are so resistant to change. When interpreting a profile, identify these cycles for the person's specific elevated schemas.

CLINICAL SCORING INTERPRETATION:
- Scores 1.0–2.9: Low/absent — schema not clinically significant
- Scores 3.0–3.9: Moderate — schema present but not dominant; worth monitoring
- Scores 4.0–4.9: Elevated — clinically significant; likely causes meaningful distress or impairment
- Scores 5.0–6.0: High — strongly endorsed; likely a core schema driving significant life patterns
- When multiple schemas in the same domain are elevated, the underlying frustrated need is particularly acute
- Cross-domain elevation patterns suggest more pervasive difficulties and potentially more complex clinical presentations
- Schema interactions matter more than individual scores: look for reinforcing clusters (e.g., Defectiveness + Social Isolation + Subjugation form a withdrawal-shame cycle)

COMMON REINFORCING SCHEMA CLUSTERS:
- Withdrawal-Shame Cycle: Defectiveness + Social Isolation + Emotional Inhibition → shame drives withdrawal → isolation confirms defectiveness
- Abandonment-Subjugation Trap: Abandonment + Subjugation + Self-Sacrifice → fear of loss drives people-pleasing → loss of self → resentment → relationship rupture → abandonment confirmed
- Perfectionism-Punishment Loop: Unrelenting Standards + Punitiveness + Failure → impossibly high standards → inevitable failure → self-punishment → redoubled effort
- Deprivation-Mistrust Barrier: Emotional Deprivation + Mistrust/Abuse → needs unmet → approach others → expect harm → withdraw → needs remain unmet
- Autonomy Deficit Cluster: Dependence + Vulnerability + Enmeshment → cannot function independently → seeks enmeshed relationships → autonomy further eroded`,
        switchToFreeText: 'Switch to free text',
        switchToOptions: 'Switch back to options',
        freeTextPlaceholder: 'Express your thoughts freely…',
        freeTextDefaultPlaceholder: 'Take your time — there are no right or wrong answers…',
        yes: 'Yes',
        no: 'No',
        notAnswered: 'Not answered',
        freeTextPrefix: '[Free text] ',
        followUpResponsesHeader: 'FOLLOW-UP RESPONSES (Round {0})',
        categoryLabel: 'Category',
        questionLabel: 'Q',
        answerLabel: 'A',
        additionalQuestionsNote: 'Please answer the additional questions below.',
        defaultCategoryName: 'Questions',
        pleaseAnswerAdditional: 'Please answer the additional questions below.'
    },
    domains: [
        { name: 'Disconnection & Rejection', subtitle: 'Domain 1 · 5 schemas' },
        { name: 'Impaired Autonomy & Performance', subtitle: 'Domain 2 · 4 schemas' },
        { name: 'Impaired Limits', subtitle: 'Domain 3 · 2 schemas' },
        { name: 'Other-Directedness', subtitle: 'Domain 4 · 3 schemas' },
        { name: 'Overvigilance & Inhibition', subtitle: 'Domain 5 · 4 schemas' }
    ],
    schemas: [
        { name: 'Abandonment / Instability', short: 'Abandonment', desc: 'Fear that loved ones will leave or be unreliable', headerDesc: 'Fear that those you love will leave or be unpredictable' },
        { name: 'Mistrust / Abuse', short: 'Mistrust', desc: 'Expectation of being hurt, abused or manipulated', headerDesc: 'Expectation of being hurt, abused, or manipulated' },
        { name: 'Emotional Deprivation', short: 'Emotional Deprivation', desc: 'Belief that emotional needs will never be met', headerDesc: 'Belief that emotional needs will never be adequately met' },
        { name: 'Defectiveness / Shame', short: 'Defectiveness', desc: 'Feeling fundamentally flawed or unlovable', headerDesc: 'Feeling flawed, inferior, or fundamentally unlovable' },
        { name: 'Social Isolation / Alienation', short: 'Social Isolation', desc: 'Feeling apart from and different from everyone else', headerDesc: 'Feeling apart from the rest of the world' },
        { name: 'Dependence / Incompetence', short: 'Dependence', desc: 'Belief of being unable to function without help', headerDesc: 'Belief that one cannot handle daily responsibilities without help' },
        { name: 'Vulnerability to Harm or Illness', short: 'Vulnerability', desc: 'Exaggerated fear of imminent catastrophe', headerDesc: 'Exaggerated fear of imminent catastrophe' },
        { name: 'Enmeshment / Undeveloped Self', short: 'Enmeshment', desc: 'Excessive involvement with others, lack of identity', headerDesc: 'Excessive emotional involvement with others at the expense of identity' },
        { name: 'Failure', short: 'Failure', desc: 'Belief one has failed or will inevitably fail', headerDesc: 'Belief that one has failed or will inevitably fail' },
        { name: 'Entitlement / Grandiosity', short: 'Entitlement', desc: 'Belief of being superior with special rights', headerDesc: 'Belief of being superior and entitled to special rights' },
        { name: 'Insufficient Self-Control / Self-Discipline', short: 'Self-Control Deficit', desc: 'Difficulty tolerating frustration or impulses', headerDesc: 'Difficulty tolerating frustration or controlling impulses' },
        { name: 'Subjugation', short: 'Subjugation', desc: 'Surrendering control to avoid negative consequences', headerDesc: 'Surrendering control to others to avoid negative consequences' },
        { name: 'Self-Sacrifice', short: 'Self-Sacrifice', desc: 'Excessive focus on others\' needs at own expense', headerDesc: 'Excessive focus on meeting others\' needs at one\'s own expense' },
        { name: 'Approval-Seeking / Recognition-Seeking', short: 'Approval-Seeking', desc: 'Excessive reliance on others\' validation for self-esteem', headerDesc: 'Excessive reliance on others\' reactions for self-esteem' },
        { name: 'Negativity / Pessimism', short: 'Negativity', desc: 'Pervasive focus on the negative, minimising the positive', headerDesc: 'Pervasive focus on negative aspects while minimizing the positive' },
        { name: 'Emotional Inhibition', short: 'Emotional Inhibition', desc: 'Suppression of emotions and spontaneous expression', headerDesc: 'Suppression of emotions to avoid loss of control or embarrassment' },
        { name: 'Unrelenting Standards / Hypercriticalness', short: 'Unrelenting Standards', desc: 'Striving to meet impossibly high self-imposed standards', headerDesc: 'Striving to meet extremely high self-imposed standards' },
        { name: 'Punitiveness', short: 'Punitiveness', desc: 'Belief people deserve harsh punishment for mistakes', headerDesc: 'Belief that people deserve harsh punishment for mistakes' }
    ],
    questions: [
        'I worry a great deal that the people I love will die or leave me.',
        'I cling to people close to me because I\'m afraid they\'ll leave me.',
        'I need so much love and support from others that people get tired of giving it to me.',
        'I feel that people won\'t stay with me — they will eventually leave me for someone better.',
        'People who were close to me have been unpredictable — one moment they were there, the next they were gone.',
        'I feel that people will take advantage of me if I let them.',
        'I feel that I cannot let my guard down around other people, or they will intentionally hurt me.',
        'I feel that people will take advantage of me.',
        'Throughout my life, people close to me have abused, used, or humiliated me.',
        'It\'s only a matter of time before someone betrays me, even in a close relationship.',
        'I haven\'t had anyone to nurture me, share themselves with me, or care deeply about what happens to me.',
        'For most of my life, I haven\'t had someone who wanted to be close to me and spend time with me.',
        'For the most part I have not had someone who really listened to me, understood me, or tuned in to my true needs and feelings.',
        'I rarely have a person who gives me warmth and is affectionate toward me.',
        'I don\'t feel that people have been there to guide, support, or protect me.',
        'No man/woman I desire could love me once he/she saw my defects.',
        'I am inherently flawed and defective — no one would want me if they really knew me.',
        'I\'m unworthy of the love, attention, and respect of others.',
        'I feel that I\'m not loveable.',
        'I feel like I\'m different from other people — I don\'t really belong anywhere.',
        'I feel alienated from other people.',
        'I feel isolated and alone in the world.',
        'I don\'t fit in anywhere.',
        'I always feel on the outside of groups.',
        'Although I\'m around people, I feel like a stranger.',
        'I don\'t feel capable of managing day-to-day responsibilities on my own.',
        'I think of myself as a very dependent person.',
        'I need other people to help me manage my daily life.',
        'I\'m not confident in my ability to solve everyday problems that come up.',
        'I don\'t trust my own judgment enough to make important decisions without significant input from others.',
        'I worry that I\'m about to lose all my money and become impoverished.',
        'I worry about being attacked.',
        'I worry a lot that I have, or will get, a serious illness, even though nothing serious has been diagnosed by a doctor.',
        'I feel that a major catastrophe (natural, criminal, financial, medical) could strike at any time.',
        'I cannot escape the feeling that something bad is about to happen.',
        'I have not been able to separate myself from my parents the way other people my age seem to.',
        'I often feel as if my parent or partner is living through me — like I don\'t have a life of my own.',
        'I am very close to a parent or partner and we are so involved with each other that it creates problems for both of us.',
        'It\'s hard for me to keep my views separate from those of my parent(s) or partner.',
        'I often feel that I don\'t know who I am or what I want.',
        'I am basically a failure when it comes to achievement.',
        'Most people are more capable than I am in areas of work and achievement.',
        'I was a failure as a student.',
        'I feel that I am not as successful as others my age.',
        'I feel that I don\'t have the natural talent that most people have at their jobs.',
        'I have trouble accepting "no" for an answer when I want something from other people.',
        'I\'m special and shouldn\'t have to accept the restrictions other people do.',
        'I hate to be constrained or kept from doing what I want.',
        'I feel that I shouldn\'t have to follow the normal rules that apply to others.',
        'I feel that what I have to offer is of greater value than the contributions of others.',
        'I can\'t seem to make myself do what I need to do to reach my goals.',
        'I have a lot of difficulty tolerating frustration — things must happen now.',
        'I find myself unable to stop myself from expressing negative feelings when they upset me.',
        'It\'s difficult for me to begin new tasks if I find them boring or routine.',
        'If I can\'t reach a goal, I become easily frustrated and give up.',
        'I let others control me more than I should.',
        'I\'m too passive, waiting for things to happen rather than making them happen.',
        'People end up controlling me.',
        'I have always let others make choices for me, so I really don\'t know what I want for myself.',
        'I feel that I have no choice but to give in to other people\'s wishes, otherwise they will retaliate or reject me in some way.',
        'I\'m the one who usually ends up taking care of the people I\'m close to.',
        'I\'m a good person because I think of others more than myself.',
        'I\'m so busy doing for the people I care about that I have little time for myself.',
        'I sacrifice my own needs for those of the people I care about.',
        'I often feel that there is not enough time for me to meet my own needs, because I am always taking care of the needs of others.',
        'My self-esteem depends a great deal on what others think of me.',
        'I go out of my way to be liked by others.',
        'I need to be seen as accomplished or important by the people around me.',
        'I try to do my best in order to get approval from others.',
        'It\'s very important to me to be liked by a wide range of people.',
        'I focus on the negative aspects of things.',
        'I can\'t get my mind off of things that might go wrong.',
        'It\'s all right to be happy one moment, but the next moment things could go wrong.',
        'I tend to be a pessimist, always expecting the worst.',
        'One of my biggest fears is that things will go terribly wrong for me in the future.',
        'I find it embarrassing to express my feelings to others.',
        'I find it hard to be warm and spontaneous.',
        'I control myself so much that people think I am unemotional.',
        'I feel that I must keep my feelings inside and not show them to others.',
        'Others see me as uptight emotionally.',
        'I must be the best at most of what I do; I can\'t accept second best.',
        'I strive to keep everything in perfect order.',
        'I must look my best most of the time.',
        'I have so much to accomplish that there is no time to really relax.',
        'Almost nothing I do is quite good enough — I can always do better.',
        'I believe if you make a mistake, you deserve to be punished.',
        'I have very little patience for people who make excuses for their bad behavior — they deserve to be punished.',
        'I am a very demanding person — I feel that people should be punished for their mistakes.',
        'I find it very difficult to forgive mistakes in myself or others.',
        'I expect people to pay dearly for their errors.'
    ]
});
