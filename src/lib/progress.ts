import type { Word } from '../data/words';
import type { AppData, Profile, ProfileId, SessionRecord, WordStat } from './storage';
import type { Rng } from './check';

/** Сколько верных ответов подряд (в разных тренировках) нужно, чтобы слово считалось выученным. */
export const LEARNED_STREAK = 3;
export const HISTORY_LIMIT = 30;

export type WordStatus = 'new' | 'learning' | 'trouble' | 'learned';

export function wordStatus(stat: WordStat | undefined): WordStatus {
  if (!stat || stat.correct + stat.wrong === 0) return 'new';
  if (stat.streak >= LEARNED_STREAK) return 'learned';
  if (stat.wrong > 0) return 'trouble';
  return 'learning';
}

function updateProfile(data: AppData, id: ProfileId, fn: (p: Profile) => Profile): AppData {
  return { ...data, profiles: { ...data.profiles, [id]: fn(data.profiles[id]) } };
}

/**
 * Записывает ответ. Меняется только профиль `profileId`.
 * В одной тренировке серия растёт только за первую попытку: повтор
 * после ошибки не делает слово «выученным».
 */
export function recordAnswer(
  data: AppData,
  profileId: ProfileId,
  wordId: string,
  correct: boolean,
  sessionId: string,
  now = Date.now(),
): AppData {
  return updateProfile(data, profileId, (p) => {
    const prev = p.stats[wordId] ?? { correct: 0, wrong: 0, streak: 0, lastSeen: 0 };
    const firstInSession = prev.lastSessionId !== sessionId;
    const next: WordStat = correct
      ? { ...prev, correct: prev.correct + 1, streak: firstInSession ? prev.streak + 1 : prev.streak }
      : { ...prev, wrong: prev.wrong + 1, streak: 0 };
    next.lastSeen = now;
    next.lastSessionId = sessionId;
    return { ...p, stats: { ...p.stats, [wordId]: next } };
  });
}

export function addSession(data: AppData, profileId: ProfileId, record: SessionRecord): AppData {
  return updateProfile(data, profileId, (p) => ({
    ...p,
    history: [record, ...p.history.filter((h) => h.id !== record.id)].slice(0, HISTORY_LIMIT),
  }));
}

export function patchProfile(
  data: AppData,
  profileId: ProfileId,
  patch: Partial<Pick<Profile, 'name' | 'avatar' | 'color' | 'grade' | 'topicId'>>,
): AppData {
  return updateProfile(data, profileId, (p) => ({ ...p, ...patch }));
}

export function resetProgress(data: AppData, profileId: ProfileId): AppData {
  return updateProfile(data, profileId, (p) => ({ ...p, stats: {}, history: [] }));
}

export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Подбор слов для тренировки: до половины — трудные слова, затем изучаемые,
 * новые, и в конце — уже выученные (давно не повторявшиеся).
 */
export function pickTrainingWords(
  stats: Record<string, WordStat>,
  pool: Word[],
  count: number,
  rng: Rng = Math.random,
): Word[] {
  const groups: Record<WordStatus, Word[]> = { trouble: [], learning: [], new: [], learned: [] };
  for (const w of shuffle(pool, rng)) groups[wordStatus(stats[w.id])].push(w);

  const seen = (w: Word) => stats[w.id]?.lastSeen ?? 0;
  groups.trouble.sort((a, b) => (stats[b.id]?.wrong ?? 0) - (stats[a.id]?.wrong ?? 0));
  groups.learned.sort((a, b) => seen(a) - seen(b));

  const n = Math.min(count, pool.length);
  const trouble = groups.trouble.slice(0, Math.ceil(n / 2));
  const rest = [
    ...groups.learning,
    ...groups.new,
    ...groups.trouble.slice(trouble.length),
    ...groups.learned,
  ];
  return shuffle([...trouble, ...rest.slice(0, n - trouble.length)], rng);
}

/** Слова с ошибками, которые ещё не выучены (по всем классам). */
export function troubleWords(profile: Profile, words: Word[]): Word[] {
  return words
    .filter((w) => wordStatus(profile.stats[w.id]) === 'trouble')
    .sort((a, b) => (profile.stats[b.id]?.wrong ?? 0) - (profile.stats[a.id]?.wrong ?? 0));
}

export interface Summary {
  total: number;
  learned: number;
  learning: number;
  trouble: number;
}

export function summarize(profile: Profile, words: Word[]): Summary {
  const s: Summary = { total: words.length, learned: 0, learning: 0, trouble: 0 };
  for (const w of words) {
    const st = wordStatus(profile.stats[w.id]);
    if (st === 'learned') s.learned++;
    else if (st === 'learning') s.learning++;
    else if (st === 'trouble') s.trouble++;
  }
  return s;
}

export function newSessionId(now = Date.now()): string {
  return `s${now.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}
