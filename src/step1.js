(function exposeStep1(global) {
  const MINING_TIMES = Object.freeze({ dirt: 0.8, stone: 2 });

  function createMiningState() {
    return {
      targetId: null,
      type: null,
      elapsed: 0,
      progress: 0,
      crackStage: -1,
      completed: false,
    };
  }

  function resetMining(state) {
    state.targetId = null;
    state.type = null;
    state.elapsed = 0;
    state.progress = 0;
    state.crackStage = -1;
    state.completed = false;
  }

  function beginMining(state, targetId, type) {
    if (state.targetId !== targetId || state.type !== type) resetMining(state);
    state.targetId = targetId;
    state.type = type;
  }

  function advanceMining(state, deltaSeconds) {
    if (!state.targetId || state.completed) return;
    const duration = MINING_TIMES[state.type];
    if (!duration) return;
    state.elapsed += Math.max(0, deltaSeconds);
    state.progress = Math.min(state.elapsed / duration, 1);
    state.crackStage = state.progress >= 1 ? 9 : Math.floor(state.progress * 10);
    state.completed = state.progress >= 1;
  }

  function releaseMining(state) {
    resetMining(state);
  }

  global.SkyIslandStep1 = Object.freeze({
    MINING_TIMES,
    createMiningState,
    beginMining,
    advanceMining,
    releaseMining,
  });
})(typeof window !== 'undefined' ? window : globalThis);
