// Web Audio API — สังเคราะห์เสียงพลุโดยไม่โหลดไฟล์
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let lastBoomTime = 0;

window.playExplosion = function (volume = 0.6) {
    const now = audioCtx.currentTime;
    if (now - lastBoomTime < 0.12) return;
    lastBoomTime = now;

    const crackBuf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.06), audioCtx.sampleRate);
    const crackData = crackBuf.getChannelData(0);
    for (let i = 0; i < crackData.length; i++)
        crackData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / crackData.length, 4);
    const crackSrc = audioCtx.createBufferSource();
    crackSrc.buffer = crackBuf;
    const crackHp = audioCtx.createBiquadFilter();
    crackHp.type = 'highpass'; crackHp.frequency.value = 2000;
    const crackGain = audioCtx.createGain();
    crackGain.gain.setValueAtTime(volume, now);
    crackSrc.connect(crackHp); crackHp.connect(crackGain); crackGain.connect(audioCtx.destination);
    crackSrc.start(now);

    const boom = audioCtx.createOscillator();
    const boomGain = audioCtx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(90, now);
    boom.frequency.exponentialRampToValueAtTime(28, now + 0.35);
    boomGain.gain.setValueAtTime(volume * 1.2, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    boom.connect(boomGain); boomGain.connect(audioCtx.destination);
    boom.start(now); boom.stop(now + 0.5);

    const rumbleBuf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.6), audioCtx.sampleRate);
    const rumbleData = rumbleBuf.getChannelData(0);
    for (let i = 0; i < rumbleData.length; i++)
        rumbleData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rumbleData.length, 1.2);
    const rumbleSrc = audioCtx.createBufferSource();
    rumbleSrc.buffer = rumbleBuf;
    const rumbleBp = audioCtx.createBiquadFilter();
    rumbleBp.type = 'bandpass'; rumbleBp.frequency.value = 180; rumbleBp.Q.value = 0.4;
    const rumbleGain = audioCtx.createGain();
    rumbleGain.gain.setValueAtTime(volume * 0.5, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    rumbleSrc.connect(rumbleBp); rumbleBp.connect(rumbleGain); rumbleGain.connect(audioCtx.destination);
    rumbleSrc.start(now);
};

