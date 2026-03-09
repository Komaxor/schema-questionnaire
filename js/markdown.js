// js/markdown.js — Minimal markdown → HTML renderer for AI evaluation output
        function renderEvalMarkdown(md) {
            let h = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
            h = h.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
            h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
            h = h.replace(/^- (.+)$/gm, '<li>$1</li>');
            h = h.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
            h = h.split(/\n{2,}/).map(block => {
                block = block.trim();
                if (!block) return '';
                if (block.startsWith('<h3>') || block.startsWith('<ul>') || block.startsWith('<ol>')) return block;
                if (!block.startsWith('<')) return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
                return block;
            }).join('\n');
            return h;
        }
