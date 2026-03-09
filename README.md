# Young Schema Questionnaire

Interactive self-assessment tool based on the Young Schema Questionnaire (YSQ-S3).
90 questions across 18 schemas and 5 clinical domains. Includes AI-generated clinical
evaluation and differential diagnostic screening via OpenAI.

## Running locally

Open `index.html` directly in a browser — no server or build step required.

## Deploying

Push to GitHub and enable GitHub Pages (Settings → Pages → Deploy from branch → main → / (root)).

## Project structure

| File | Purpose |
|------|---------|
| `index.html` | Full questionnaire and results HTML |
| `css/styles.css` | All styles |
| `js/data.js` | Schema and domain definitions |
| `js/markdown.js` | Minimal markdown renderer |
| `js/ui.js` | Shared UI helpers |
| `js/questionnaire.js` | Radio buttons, progress, submit, retake |
| `js/results.js` | Bar charts, domain scores, top-5 cards |
| `js/ai-eval.js` | OpenAI streaming call + Phase 1 evaluation |
| `js/ai-diffdx.js` | Phase 2 diff-dx questions + Phase 3 impressions |

## AI features

Requires an OpenAI API key (entered in the UI — never stored). Uses `gpt-5.4-2026-03-05`
with streaming for real-time output.
