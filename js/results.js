// js/results.js — Score helpers and results panel rendering (bar charts, domain scores, top-5 cards)

        function barColor(score) {
            if (score >= 5) return '#8b1a1a';
            if (score >= 4) return '#c4703a';
            if (score >= 3) return '#e8c97a';
            return '#b8d4b0';
        }

        function levelLabel(score) {
            const levels = I18N.t('levels');
            if (score >= 5) return levels.high;
            if (score >= 4) return levels.elevated;
            if (score >= 3) return levels.moderate;
            return levels.low;
        }

        function buildResults() {
            const schemaScores = SCHEMAS.map(s => {
                const t = I18N.t('schemas')[s.id - 1];
                const vals = s.qs.map(getScore);
                const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                return { ...s, name: t.name, short: t.short, desc: t.desc, score: parseFloat(avg.toFixed(2)) };
            });

            const domainScores = DOMAINS.map(d => {
                const t = I18N.t('domains')[d.id - 1];
                const relevant = schemaScores.filter(s => d.schemas.includes(s.id));
                const avg = relevant.reduce((a, b) => a + b.score, 0) / relevant.length;
                return { ...d, name: t.name, score: parseFloat(avg.toFixed(2)) };
            });

            const elevated = schemaScores.filter(s => s.score >= 4).length;
            const highest = schemaScores.reduce((a, b) => a.score > b.score ? a : b);
            const overall = schemaScores.reduce((a, b) => a + b.score, 0) / schemaScores.length;

            document.getElementById('summaryStats').innerHTML = `
      <div class="stat-card"><div class="stat-val">${overall.toFixed(1)}</div><div class="stat-label">${I18N.t('ui.overallAverage')}</div></div>
      <div class="stat-card"><div class="stat-val">${elevated}</div><div class="stat-label">${I18N.t('ui.elevatedSchemas')}</div></div>
      <div class="stat-card"><div class="stat-val">${highest.short}</div><div class="stat-label">${I18N.t('ui.highestSchema')}</div></div>
    `;

            const barsEl = document.getElementById('allSchemasBars');
            barsEl.innerHTML = schemaScores.map(s => `
      <div class="bar-row">
        <div class="bar-label">${s.short}<small>${I18N.t('ui.schemaLabel')} ${s.id}</small></div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(s.score / 6) * 100}%; background:${barColor(s.score)};"></div>
        </div>
        <div class="bar-score" style="color:${barColor(s.score)}">${s.score}</div>
      </div>
    `).join('');

            const domainEl = document.getElementById('domainBars');
            domainEl.innerHTML = domainScores.map(d => `
      <div class="domain-bar-row">
        <div class="domain-bar-top">
          <div class="domain-bar-name">${d.name}</div>
          <div class="domain-bar-score" style="color:${barColor(d.score)}">${d.score} <span style="font-size:13px;color:var(--muted);font-family:'DM Sans',sans-serif;">${levelLabel(d.score)}</span></div>
        </div>
        <div class="domain-bar-track">
          <div class="domain-bar-fill" style="width:${(d.score / 6) * 100}%; background:${barColor(d.score)};"></div>
        </div>
      </div>
    `).join('');

            const top5 = [...schemaScores].sort((a, b) => b.score - a.score).slice(0, 5);
            const domainName = id => {
                const di = DOMAINS.findIndex(d => d.schemas.includes(id));
                return I18N.t('domains')[di].name;
            };
            const topEl = document.getElementById('topSchemas');
            topEl.innerHTML = top5.map((s, i) => {
                const cls = s.score >= 5 ? 'high' : s.score >= 4 ? 'elevated' : '';
                return `
        <div class="top-schema-card ${cls}">
          <div class="top-rank">${i + 1}</div>
          <div>
            <div class="top-schema-name">${s.name}</div>
            <div class="top-schema-desc">${s.desc}</div>
            <div class="top-schema-domain">${I18N.t('ui.domainLabel')}: ${domainName(s.id)}</div>
          </div>
          <div class="top-score-badge" style="color:${barColor(s.score)}">${s.score}</div>
        </div>
      `;
            }).join('');

            document.getElementById('resultsPanel').style.display = 'block';
            document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });

            setTimeout(() => {
                document.querySelectorAll('.bar-fill, .domain-bar-fill').forEach(el => {
                    const w = el.style.width;
                    el.style.width = '0';
                    requestAnimationFrame(() => { el.style.width = w; });
                });
            }, 100);
        }
