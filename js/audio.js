(function () {
  "use strict";
  let context = null, enabled = false, musicTimer = null, noteIndex = 0, musicMode = "adventure";
  const defaultMelodies = {
    adventure: [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 392],
    romance: [261.63, 329.63, 392, 440, 392, 329.63, 293.66, 329.63]
  };
  function melody(mode) {
    const configured = window.GATA_CONFIG.music && window.GATA_CONFIG.music[mode];
    return Array.isArray(configured) && configured.length && configured.every(note => Number.isFinite(note) && note > 0)
      ? configured : defaultMelodies[mode];
  }
  function getContext() {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error("Este navegador não oferece suporte a áudio Web Audio.");
      context = new AudioContext();
    }
    if (context.state === "suspended") context.resume().catch(error => console.error("Não foi possível ativar o áudio:", error));
    return context;
  }
  function tone(frequency, duration, type, volume, delay = 0) {
    if (!enabled) return;
    try {
      const ctx = getContext(), oscillator = ctx.createOscillator(), gain = ctx.createGain();
      oscillator.type = type || "sine"; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume || .04), ctx.currentTime + delay + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + delay + duration);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(ctx.currentTime + delay); oscillator.stop(ctx.currentTime + delay + duration + .03);
    } catch (error) { console.error("Falha ao reproduzir áudio:", error); }
  }
  function musicStep() {
    if (!enabled) return;
    const notes = melody(musicMode);
    tone(notes[noteIndex % notes.length], .8, "sine", .018);
    if (noteIndex % 2 === 0) tone(notes[(noteIndex + 2) % notes.length] / 2, 1.2, "triangle", .012, .04);
    noteIndex++;
  }
  function startMusic() {
    stopMusic();
    musicTimer = window.setInterval(musicStep, 850);
    musicStep();
  }
  function stopMusic() { if (musicTimer) window.clearInterval(musicTimer); musicTimer = null; }
  function setEnabled(value) {
    enabled = Boolean(value);
    if (enabled) { getContext(); startMusic(); } else stopMusic();
    return enabled;
  }
  function setMode(mode) { musicMode = mode === "romance" ? "romance" : "adventure"; if (enabled) startMusic(); }
  function effect(kind) {
    if (kind === "click") { tone(540, .09, "triangle", .035); }
    else if (kind === "achievement") { tone(523, .18, "sine", .05); tone(659, .24, "sine", .05, .12); tone(784, .34, "sine", .05, .25); }
    else if (kind === "magic") { tone(420, .18, "sine", .04); tone(620, .35, "sine", .05, .13); tone(880, .5, "triangle", .035, .28); }
    else if (kind === "peidaru") {
      [150, 100, 190, 75, 135].forEach((frequency, index) => tone(frequency, .22, "sawtooth", .045, index * .12));
      tone(523, .6, "triangle", .04, .65);
    }
  }
  window.GameAudio = { setEnabled, setMode, effect, get enabled() { return enabled; } };
})();
