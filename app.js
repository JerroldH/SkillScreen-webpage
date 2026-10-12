(() => {
  'use strict';
  const scene = document.querySelector('.mechanism');
  if (!scene) return;
  const modes = ['score', 'train', 'calibrate'];
  const buttons = [...document.querySelectorAll('.mode-controls [data-mode]')];
  const toggle = document.getElementById('motion-toggle');
  const description = document.getElementById('mode-description');
  const thresholdState = document.getElementById('threshold-state');
  const descriptions = {
    score: 'One forward pass scores the skill against the maliciousness hypothesis. Calibrate the NLI score, then apply the frozen review threshold.',
    train: 'Skill labels supervise the NLI outputs. Cross-entropy updates the LoRA adapters and classification head while the base weights stay frozen.',
    calibrate: 'Use validation data to calibrate scores and choose a threshold targeting 99% recall. Freeze the model, calibration and threshold before test scoring.'
  };
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let mode = 'score';
  let playing = !motionPreference.matches;
  let elapsed = 0;
  let lastTime = 0;
  let visible = true;
  const duration = 10500;

  function updatePlayback() {
    scene.classList.toggle('paused', !playing || !visible || document.hidden);
    toggle.innerHTML = playing ? 'Pause animation <span aria-hidden="true">Ⅱ</span>' : 'Play animation <span aria-hidden="true">▷</span>';
    toggle.setAttribute('aria-pressed', String(!playing));
  }

  function selectMode(next) {
    if (!modes.includes(next)) return;
    mode = next;
    elapsed = 0;
    scene.dataset.mode = next;
    scene.style.setProperty('--threshold', next === 'calibrate' && playing ? '72%' : '45%');
    description.textContent = descriptions[next];
    thresholdState.textContent = next === 'calibrate' && playing ? 'Selecting on validation' : 'Threshold frozen';
    for (const button of buttons) {
      const active = button.dataset.mode === next;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
    document.querySelector('.training-targets').setAttribute('aria-hidden', String(next !== 'train'));
  }

  for (const button of buttons) button.addEventListener('click', () => selectMode(button.dataset.mode));
  toggle.addEventListener('click', () => { playing = !playing; updatePlayback(); });
  motionPreference.addEventListener('change', event => {
    if (event.matches) { playing = false; updatePlayback(); }
  });
  document.addEventListener('visibilitychange', updatePlayback);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updatePlayback(); }, {threshold: 0.08}).observe(scene);

  function frame(time) {
    const delta = lastTime ? Math.min(time - lastTime, 100) : 0;
    lastTime = time;
    if (playing && visible && !document.hidden) {
      elapsed += delta;
      if (mode === 'calibrate') {
        const t = Math.min(elapsed / 3800, 1);
        const position = 45 + 27 * Math.pow(1 - t, 3);
        scene.style.setProperty('--threshold', `${position.toFixed(2)}%`);
        thresholdState.textContent = t < 1 ? 'Selecting on validation' : 'Frozen for test';
      }
      if (elapsed >= duration) selectMode(modes[(modes.indexOf(mode) + 1) % modes.length]);
    }
    requestAnimationFrame(frame);
  }
  selectMode('score');
  updatePlayback();
  requestAnimationFrame(frame);

})();
