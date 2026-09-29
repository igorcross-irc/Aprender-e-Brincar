const MODES = new Set(['explore','evaluate']);

function finite(value, fallback=0){
  const n=Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeExperienceResult(result = {}){
  const mode = result.mode === 'explore' ? 'explore' : 'evaluate';
  const attempts = Math.max(0, Math.round(finite(result.attempts, finite(result.rounds, 0))));
  const correct = Math.max(0, Math.round(finite(result.correct, finite(result.score, 0))));
  const maxScore = Math.max(0, Math.round(finite(result.maxScore, Math.max(attempts, finite(result.rounds, 0)))));
  const completedRounds = Math.max(0, Math.round(finite(result.completedRounds, finite(result.rounds, maxScore))));
  const boundedCorrect = Math.min(correct, Math.max(attempts, maxScore, completedRounds));
  return {
    mode,
    correct: boundedCorrect,
    attempts,
    maxScore,
    completedRounds,
    assistance: Math.max(0, Math.round(finite(result.assistance, 0))),
    durationMs: Math.max(0, Math.round(finite(result.durationMs, 0))),
    difficulty: result.difficulty == null ? null : Math.max(1, Math.min(5, Math.round(finite(result.difficulty, 1)))),
    score: Math.max(0, finite(result.score, boundedCorrect)),
    rounds: Math.max(0, finite(result.rounds, completedRounds))
  };
}

export function getAccuracy(result){
  const normalized = normalizeExperienceResult(result);
  if(normalized.mode === 'explore' || normalized.attempts <= 0) return null;
  return Math.round((Math.min(normalized.correct, normalized.attempts) / normalized.attempts) * 100);
}

export { MODES };
