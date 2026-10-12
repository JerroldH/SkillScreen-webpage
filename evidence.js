(() => {
  'use strict';

  const protocols = {
    sbr: {
      name: 'Source-Balanced Random',
      values: [6.6, 12.1, 28.1],
      gap: '21.4',
      question: 'Can a small model learn effective screening within familiar sources?',
      summary: 'Source-Balanced Random shares sources across training and test and permits shared attack families. At 99% recall, SkillScreen flags 6.6% of benign skills, compared with 12.1% for ModernBERT. Both neural models average five seeds trained for one epoch.',
    },
    msd: {
      name: 'Malicious-Structural-Disjoint',
      values: [22.6, 30.4, 45.6],
      gap: '23.0',
      question: 'Does detection transfer to attack structures absent from training?',
      summary: 'Malicious-Structural-Disjoint holds out malicious structural families while retaining familiar benign sources. SkillScreen reaches 99% recall at 22.6% FPR. Neural results average five seeds, with one epoch of training.',
    },
    sd: {
      name: 'Source-Disjoint',
      values: [50.5, 74.7, 82.2],
      gap: '31.7',
      question: 'Can detection stay selective when the skill sources change?',
      summary: 'Source-Disjoint holds out entire sources, including benign ones. At 99% recall, SkillScreen retains an advantage over both baselines while unfamiliar benign skills raise false positives. SkillScreen averages five seeds and ModernBERT five converged runs.',
    },
  };
  const models = ['SkillScreen', 'ModernBERT-large', 'Word-SVM'];

  function initializeEvidence() {
    const container = document.getElementById('results-bars');
    const summary = document.getElementById('protocol-summary');
    const status = document.getElementById('evidence-status');
    const buttons = Array.from(document.querySelectorAll('[data-protocol]'));
    if (!container || !summary) return;

    const rows = models.map((model, index) => {
      const row = document.createElement('div');
      row.className = 'result-row';

      const name = document.createElement('span');
      name.className = 'result-name';
      name.textContent = model;

      const track = document.createElement('div');
      track.className = 'result-track';
      track.setAttribute('aria-hidden', 'true');

      const bar = document.createElement('div');
      bar.className = index === 0 ? 'result-bar ours' : 'result-bar';
      track.appendChild(bar);

      const value = document.createElement('span');
      value.className = 'result-value';

      row.append(name, track, value);
      return { row, bar, value };
    });
    container.replaceChildren(...rows.map(({ row }) => row));

    function showProtocol(key, announce = true) {
      const protocol = protocols[key];
      if (!protocol) return;

      buttons.forEach((button) => {
        const selected = button.dataset.protocol === key;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('active', selected);
      });
      rows.forEach(({ bar, value }, index) => {
        const fpr = protocol.values[index];
        rows[index].row.hidden = fpr === null;
        if (fpr === null) return;
        bar.style.width = `${fpr}%`;
        value.textContent = `${fpr.toFixed(1)}%`;
      });
      summary.textContent = protocol.summary;
      document.getElementById('protocol-question').textContent = protocol.question;
      document.getElementById('comparison-gap').textContent = protocol.gap;
      if (status && announce) {
        status.textContent = `${protocol.name}. False-positive rates at matched 99% test recall: ${models.map((model, index) => protocol.values[index] === null ? `${model} not evaluated` : `${model} ${protocol.values[index].toFixed(1)}%`).join(', ')}.`;
      }
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => showProtocol(button.dataset.protocol));
    });
    showProtocol('sbr', false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEvidence, { once: true });
  } else {
    initializeEvidence();
  }
})();
