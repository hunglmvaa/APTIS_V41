/* Aptis ESOL General speaking clock: official timing, drift-free countdown,
   optional practice extension, per-question focus and phase transitions.
   Standalone UMD-style browser module; injectable clock for deterministic tests.
*/
(function (root) {
  'use strict';
  const PART_SECONDS = Object.freeze({1:30, 2:45, 3:45, 4:120});
  const PREP_SECONDS = Object.freeze({1:0, 2:0, 3:0, 4:60});
  const integer = (x, fallback, min, max) => {
    const n = Number(x);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : fallback;
  };
  function partNumber(part) {
    const match = /\bpart\s*([1-4])\b/i.exec(String(part || ''));
    return match ? Number(match[1]) : 1;
  }
  function format(seconds) {
    const n = Math.max(0, Math.ceil(Number(seconds) || 0));
    return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  }
  function plan(part, questionCount, settings, mode) {
    const p = partNumber(part);
    const count = p === 4 ? 1 : integer(questionCount, 1, 1, 30);
    const overrides = settings || {};
    let prep = PREP_SECONDS[p];
    let speak = PART_SECONDS[p];
    if (mode === 'lesson') {
      prep = integer(overrides.prepSeconds, prep, 0, 300);
      speak = integer(overrides.speakSeconds, speak, 10, 600);
    }
    if (mode === 'relaxed') speak += 30;
    return {part:p, questionCount:count, prepSeconds:prep, speakSeconds:speak, mode:mode || 'exam'};
  }
  function createClock({now, schedule, unschedule, onUpdate, onCue} = {}) {
    const getNow = now || (() => performance.now());
    const addInterval = schedule || ((fn, ms) => setInterval(fn, ms));
    const removeInterval = unschedule || (id => clearInterval(id));
    const update = onUpdate || (() => {});
    const cue = onCue || (() => {});
    let config = null;
    let clock = null;
    let interval = null;
    function clearTick() {
      if (interval !== null) { removeInterval(interval); interval = null; }
    }
    function remaining() {
      return clock.running ? Math.max(0, clock.deadline - getNow()) : clock.remainingMs;
    }
    function snapshot() {
      if (!clock || !config) return null;
      const ms = Math.max(0, remaining());
      const seconds = Math.ceil(ms / 1000);
      const total = clock.phase === 'prepare' ? config.prepSeconds : config.speakSeconds;
      return {
        ...config,
        phase:clock.phase, running:clock.running, questionIndex:clock.questionIndex,
        remainingMs:ms, remainingSeconds:seconds, totalSeconds:total,
        progress:total > 0 ? Math.min(100, Math.max(0, ms / (total * 10))) : 100,
        warned:clock.warned, autoPrep:clock.autoPrep, autoNext:clock.autoNext,
        elapsedSeconds:Math.max(0, total - seconds)
      };
    }
    function emit() { update(snapshot()); }
    function init(cfg) {
      clearTick();
      config = plan(cfg.part, cfg.questionCount, cfg.settings, cfg.mode);
      clock = {
        phase:'ready', questionIndex:0, running:false,
        deadline:0, warned:false, remainingMs:0,
        autoPrep:cfg.autoPrep !== false,
        autoNext:cfg.autoNext === true
      };
      clock.remainingMs = (config.prepSeconds || config.speakSeconds) * 1000;
      emit();
      return snapshot();
    }
    function enter(phase) {
      if (!clock) return false;
      clearTick();
      const duration = phase === 'prepare' ? config.prepSeconds : config.speakSeconds;
      clock.phase = phase;
      clock.running = true;
      clock.remainingMs = duration * 1000;
      clock.deadline = getNow() + clock.remainingMs;
      clock.warned = false;
      interval = addInterval(tick, 150);
      emit();
      cue(phase === 'prepare' ? 'preparation-start' : 'speaking-start', snapshot());
      return true;
    }
    function tick() {
      if (!clock || !clock.running) return;
      const ms = remaining();
      if (clock.phase === 'speaking' && !clock.warned && ms <= 10000 && ms > 0) {
        clock.warned = true;
        cue('ten-seconds', snapshot());
      }
      if (ms > 0) { emit(); return; }
      clearTick();
      clock.running = false;
      clock.remainingMs = 0;
      const previous = clock.phase;
      emit();
      cue('phase-complete', snapshot());
      if (previous === 'prepare') {
        if (clock.autoPrep) enter('speaking');
        else {clock.phase = 'prepared'; emit();}
      } else if (previous === 'speaking') {
        if (clock.autoNext && clock.questionIndex + 1 < config.questionCount) {
          clock.questionIndex += 1;
          enter('speaking');
        } else {clock.phase = 'done'; emit();}
      }
    }
    function start() {
      if (!clock) return false;
      if (clock.running) return false;
      if (clock.phase === 'prepare' || clock.phase === 'speaking') return resume();
      if (clock.phase === 'prepared') return enter('speaking');
      if (clock.phase === 'done') return false;
      return enter(config.prepSeconds > 0 && clock.questionIndex === 0 ? 'prepare' : 'speaking');
    }
    function skipPreparation() {
      if (!clock || !config) return false;
      if (clock.phase === 'speaking') return false;
      return enter('speaking');
    }
    function pause() {
      if (!clock || !clock.running) return false;
      clock.remainingMs = remaining();
      clock.running = false;
      clearTick();emit();
      cue('pause', snapshot());
      return true;
    }
    function resume() {
      if (!clock || clock.running || !['prepare','speaking'].includes(clock.phase)) return false;
      if (clock.remainingMs <= 0) return false;
      clock.deadline = getNow() + clock.remainingMs;
      clock.running = true;
      interval = addInterval(tick, 150);
      emit();cue('resume', snapshot());
      return true;
    }
    function reset(keepQuestion=false) {
      if (!clock || !config) return false;
      clearTick();
      clock.phase = 'ready';
      clock.running = false;
      clock.deadline = 0;
      clock.warned = false;
      if (!keepQuestion) clock.questionIndex = 0;
      clock.remainingMs = (config.prepSeconds > 0 && clock.questionIndex === 0 ? config.prepSeconds : config.speakSeconds) * 1000;
      emit();return true;
    }
    function chooseQuestion(n) {
      if (!clock || !config || config.part === 4) return false;
      const next = integer(n, clock.questionIndex, 0, config.questionCount - 1);
      if (clock.questionIndex === next && clock.phase === 'ready') return false;
      clock.questionIndex = next;
      reset(true);
      cue('question-selected', snapshot());
      return true;
    }
    function next() {
      if (!clock || clock.questionIndex >= config.questionCount - 1) return false;
      return chooseQuestion(clock.questionIndex + 1);
    }
    function previous() {
      if (!clock || clock.questionIndex <= 0) return false;
      return chooseQuestion(clock.questionIndex - 1);
    }
    function options(next) {
      if (!clock) return false;
      if ('autoPrep' in next) clock.autoPrep = !!next.autoPrep;
      if ('autoNext' in next) clock.autoNext = !!next.autoNext;
      emit();return true;
    }
    function destroy() { clearTick();config=null;clock=null; }
    return {init,start,skipPreparation,pause,resume,reset,next,previous,chooseQuestion,options,tick,snapshot,destroy};
  }
  root.APT_SPEAK_CLOCK = Object.freeze({createClock,plan,partNumber,format,PART_SECONDS,PREP_SECONDS});
})(typeof window === 'undefined' ? globalThis : window);
