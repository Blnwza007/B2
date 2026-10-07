function splitTitleText() {
  const title = document.getElementById('title');
  if (!title) return;

  title.innerHTML = [...title.textContent]
    .map((ch, i) => `<span style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`)
    .join('');
}

function initAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;

  if (!window.__audioCtx) {
    window.__audioCtx = new AudioCtor();
    window.__masterGain = window.__audioCtx.createGain();
    window.__masterGain.gain.value = window.__soundEnabled === false ? 0 : 1;
    window.__masterGain.connect(window.__audioCtx.destination);
  }

  return window.__audioCtx;
}

function playBirthdaySong() {
  const audioCtx = initAudio();
  if (!audioCtx || window.__birthdaySongStarted) return;

  window.__birthdaySongStarted = true;
  audioCtx.resume().then(() => {
    const notes = [
      [261.63, 0.28], [261.63, 0.28], [293.66, 0.56], [261.63, 0.56], [349.23, 0.56], [329.63, 0.84],
      [261.63, 0.28], [261.63, 0.28], [293.66, 0.56], [261.63, 0.56], [392.00, 0.56], [349.23, 0.84],
      [261.63, 0.28], [261.63, 0.28], [523.25, 0.56], [440.00, 0.56], [349.23, 0.56], [329.63, 0.56], [293.66, 0.84],
      [466.16, 0.28], [466.16, 0.28], [440.00, 0.56], [349.23, 0.56], [392.00, 0.56], [349.23, 0.84],
    ];

    let startAt = audioCtx.currentTime + 0.05;
    for (const [frequency, duration] of notes) {
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.connect(gain);
      gain.connect(window.__masterGain);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration);
      startAt += duration + 0.04;
    }
  }).catch(() => {
    window.__birthdaySongStarted = false;
  });
}

window.playExplosion = function (volume = 0.6) {
  const audioCtx = initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  if (audioCtx.lastBoomTime && now - audioCtx.lastBoomTime < 0.12) return;
  audioCtx.lastBoomTime = now;

  const crackBuffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.06), audioCtx.sampleRate);
  const crackData = crackBuffer.getChannelData(0);
  for (let i = 0; i < crackData.length; i++) {
    crackData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / crackData.length, 4);
  }

  const crackSource = audioCtx.createBufferSource();
  crackSource.buffer = crackBuffer;
  const crackHighPass = audioCtx.createBiquadFilter();
  crackHighPass.type = 'highpass';
  crackHighPass.frequency.value = 2000;
  const crackGain = audioCtx.createGain();
  crackGain.gain.setValueAtTime(volume, now);
  crackSource.connect(crackHighPass);
  crackHighPass.connect(crackGain);
  crackGain.connect(window.__masterGain);
  crackSource.start(now);

  const boom = audioCtx.createOscillator();
  const boomGain = audioCtx.createGain();
  boom.type = 'sine';
  boom.frequency.setValueAtTime(90, now);
  boom.frequency.exponentialRampToValueAtTime(28, now + 0.35);
  boomGain.gain.setValueAtTime(volume * 1.2, now);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  boom.connect(boomGain);
  boomGain.connect(window.__masterGain);
  boom.start(now);
  boom.stop(now + 0.5);

  const rumbleBuffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.6), audioCtx.sampleRate);
  const rumbleData = rumbleBuffer.getChannelData(0);
  for (let i = 0; i < rumbleData.length; i++) {
    rumbleData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rumbleData.length, 1.2);
  }

  const rumbleSource = audioCtx.createBufferSource();
  rumbleSource.buffer = rumbleBuffer;
  const rumbleBandPass = audioCtx.createBiquadFilter();
  rumbleBandPass.type = 'bandpass';
  rumbleBandPass.frequency.value = 180;
  rumbleBandPass.Q.value = 0.4;
  const rumbleGain = audioCtx.createGain();
  rumbleGain.gain.setValueAtTime(volume * 0.5, now);
  rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  rumbleSource.connect(rumbleBandPass);
  rumbleBandPass.connect(rumbleGain);
  rumbleGain.connect(window.__masterGain);
  rumbleSource.start(now);
};

function buildCake() {
  const NS = 'http://www.w3.org/2000/svg';
  const wrap = document.getElementById('cakeWrap');
  const candlesG = document.getElementById('candles');
  const dots = document.getElementById('dots');
  const pearls = document.getElementById('pearls');

  if (!wrap || !candlesG || !dots || !pearls) {
    return;
  }

  const xs = [140, 170, 200, 230, 260];
  const colors = [['#ff7aa8', '#fff'], ['#7ad0ff', '#fff'], ['#ffd84a', '#fff'], ['#9be07a', '#fff'], ['#c58bff', '#fff']];

  xs.forEach((x, i) => {
    const y = 160 + (i % 2 ? 6 : 0);
    const h = 52 + (i % 3) * 6;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'candle');
    g.innerHTML = `
      <ellipse cx="${x}" cy="${y + 2}" rx="8" ry="3" fill="#000" opacity="0.25"></ellipse>
      <rect x="${x - 5}" y="${y - h}" width="10" height="${h}" rx="2" fill="url(#wax)"></rect>
      <rect x="${x - 5}" y="${y - h}" width="10" height="${h}" rx="2" fill="${colors[i][0]}" opacity="0.55" style="mask:repeating-linear-gradient(-30deg,#000 0 6px,transparent 6px 12px)"></rect>
      <ellipse cx="${x}" cy="${y - h}" rx="5" ry="1.8" fill="#fff" opacity="0.9"></ellipse>
      <path d="M${x} ${y - h} q1 -4 0 -7" stroke="#2a2018" stroke-width="1.4" fill="none" stroke-linecap="round"></path>
      <path class="smoke" d="M${x} ${y - h - 8} C${x - 7} ${y - h - 18} ${x + 7} ${y - h - 28} ${x} ${y - h - 40} C${x - 6} ${y - h - 50} ${x + 5} ${y - h - 58} ${x} ${y - h - 68}"></path>
      <circle class="halo" cx="${x}" cy="${y - h - 20}" r="34" fill="url(#glow)"></circle>
      <g transform="translate(${x} ${y - h - 7})">
        <g class="flame">
          <g class="shape">
            <path d="M0 3 C-8 0 -9 -12 0 -29 C9 -12 8 0 0 3Z" fill="url(#outer)"></path>
            <path d="M0 3 C-4 1 -5 -6 0 -17 C5 -6 4 1 0 3Z" fill="url(#inner)"></path>
          </g>
        </g>
      </g>
    `;
    candlesG.appendChild(g);
  });

  const sprinkleColors = ['#ff6b9a', '#ffd84a', '#6ad6ff', '#8be28b', '#c58bff'];
  for (let i = 0; i < 38; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random());
    const x = 200 + Math.cos(a) * r * 92;
    const y = 168 + Math.sin(a) * r * 17;
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', x - 3);
    rect.setAttribute('y', y - 1);
    rect.setAttribute('width', 6);
    rect.setAttribute('height', 2.2);
    rect.setAttribute('rx', 1.1);
    rect.setAttribute('fill', sprinkleColors[i % sprinkleColors.length]);
    rect.setAttribute('transform', `rotate(${Math.random() * 180} ${x} ${y})`);
    dots.appendChild(rect);
  }

  for (let x = 62; x <= 338; x += 19) {
    const y = 296 + Math.sin(((x - 50) / 300) * Math.PI) * 15;
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 4.2);
    pearls.appendChild(circle);
  }

  let blown = false;
  wrap.addEventListener('click', () => {
    if (blown) return;
    blown = true;
    playBirthdaySong();

    const main = document.querySelector('main');
    if (main) {
      main.classList.add('hidden-title');
    }

    wrap.classList.add('out');
    const candles = [...document.querySelectorAll('.candle')];
    candles.forEach((candle, index) => {
      setTimeout(() => candle.classList.add('off'), index * 140);
    });

    const cakeHideDelay = candles.length * 140 + 900;
    setTimeout(() => {
      wrap.classList.add('gone');
      if (window.celebrate) window.celebrate();
    }, cakeHideDelay);

    setTimeout(() => {
      const card = document.getElementById('card');
      if (card) {
        card.classList.add('show');
      }
    }, cakeHideDelay + 600);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  splitTitleText();
  buildCake();
  if (typeof window.__soundEnabled !== 'boolean') {
    window.__soundEnabled = true;
  }

  const audioCtx = initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      window.__soundEnabled = !window.__soundEnabled;
      const audioCtx = initAudio();
      if (audioCtx && window.__masterGain) {
        if (window.__soundEnabled && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        window.__masterGain.gain.setTargetAtTime(
          window.__soundEnabled ? 1 : 0,
          audioCtx.currentTime,
          0.04
        );
      }
      soundToggle.textContent = window.__soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง';
      soundToggle.setAttribute('aria-pressed', String(window.__soundEnabled));
    });
  }

  const homeButton = document.getElementById('homeButton');
  if (homeButton) {
    homeButton.addEventListener('click', () => window.location.reload());
  }

  document.addEventListener('click', () => {
    const audioCtx = initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }, { once: true });
});
