(function () {
  "use strict";
  const KEY = "operacao-gata-save-v1";
  const fresh = () => ({
    started: false, phase: 0, health: 100, love: 0, xp: 0, position: 0.5,
    inventory: [], achievements: [], powers: [], openedMemories: [], completedObjects: [], completedPhases: [], qualities: [],
    flags: { greeted: false, hugged: false, peidaru: false, finalRead: false, finalCelebrated: false }
  });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") throw new Error("Formato de progresso inválido.");
      const initial = fresh();
      const phase = Number.isInteger(saved.phase) && saved.phase >= 0 && saved.phase < 6 ? saved.phase : 0;
      const bounded = (value, fallback, maximum) => Number.isFinite(value) ? Math.min(maximum, Math.max(0, value)) : fallback;
      return {
        ...initial, ...saved,
        phase,
        health: bounded(saved.health, initial.health, 100),
        love: bounded(saved.love, initial.love, 100),
        xp: bounded(saved.xp, initial.xp, Number.MAX_SAFE_INTEGER),
        position: Number.isFinite(saved.position) ? Math.min(.96, Math.max(.04, saved.position)) : initial.position,
        started: Boolean(saved.started),
        moving: false,
        pose: "idle",
        flags: { ...initial.flags, ...(saved.flags || {}) },
        inventory: Array.isArray(saved.inventory) ? saved.inventory : [],
        achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
        powers: Array.isArray(saved.powers) ? saved.powers : [],
        openedMemories: Array.isArray(saved.openedMemories) ? saved.openedMemories : [],
        completedObjects: Array.isArray(saved.completedObjects) ? saved.completedObjects : [],
        completedPhases: Array.isArray(saved.completedPhases) ? saved.completedPhases : [],
        qualities: Array.isArray(saved.qualities) ? saved.qualities : []
      };
    } catch (error) {
      console.error("Não foi possível carregar o progresso salvo:", error);
      return fresh();
    }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (error) { console.error("Não foi possível salvar o progresso:", error); return false; }
  }
  function reset() {
    try { localStorage.removeItem(KEY); }
    catch (error) { console.error("Não foi possível apagar o progresso:", error); }
    return fresh();
  }
  window.GameStorage = { load, save, reset };
})();
