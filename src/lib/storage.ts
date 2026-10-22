import type { Grade } from '../data/words';

export type ProfileId = 'kid1' | 'kid2';
export const PROFILE_IDS: ProfileId[] = ['kid1', 'kid2'];

export type Mode = 'write' | 'gaps' | 'mistakes' | 'dictation';

export interface WordStat {
  correct: number;
  wrong: number;
  /** Верных ответов подряд (не больше одного зачёта за тренировку). */
  streak: number;
  lastSeen: number;
  lastSessionId?: string;
}

export interface SessionRecord {
  id: string;
  date: number;
  mode: Mode;
  grade?: Grade;
  topicId?: string;
  total: number;
  correct: number;
}

export interface Profile {
  id: ProfileId;
  name: string;
  avatar: string;
  color: string;
  grade: Grade;
  topicId: string;
  stats: Record<string, WordStat>;
  history: SessionRecord[];
}

export interface Settings {
  /** Произносить слово после ответа автоматически. */
  autoSpeak: boolean;
  /** voiceURI выбранного голоса; пустая строка — автоматически. */
  voice: string;
}

export interface AppData {
  version: 1;
  profiles: Record<ProfileId, Profile>;
  settings: Settings;
}

export const STORAGE_KEY = 'english-kids:v1';
export const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🦉', '🐰', '🐨', '🦁'];
export const COLORS = ['#2F6FED', '#E0457B', '#1F9D6B', '#E58A00', '#7C4DDB'];

export interface KVStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function defaultProfile(id: ProfileId): Profile {
  const n = id === 'kid1' ? 0 : 1;
  return {
    id,
    name: `Ребёнок ${n + 1}`,
    avatar: AVATARS[n],
    color: COLORS[n],
    grade: 2,
    topicId: 'all',
    stats: {},
    history: [],
  };
}

export function defaultData(): AppData {
  return {
    version: 1,
    profiles: { kid1: defaultProfile('kid1'), kid2: defaultProfile('kid2') },
    settings: { autoSpeak: true, voice: '' },
  };
}

// ───────────── Проверка данных ─────────────

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, d = 0): number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : d;
const str = (v: unknown, d: string, max = 40): string =>
  typeof v === 'string' && v.trim() !== '' ? v.trim().slice(0, max) : d;
const isGrade = (v: unknown): v is Grade => v === 2 || v === 3 || v === 4;
const MODES: Mode[] = ['write', 'gaps', 'mistakes', 'dictation'];

function sanitizeStat(v: unknown): WordStat | null {
  if (!isObj(v)) return null;
  const stat: WordStat = {
    correct: num(v.correct),
    wrong: num(v.wrong),
    streak: num(v.streak),
    lastSeen: num(v.lastSeen),
  };
  if (typeof v.lastSessionId === 'string') stat.lastSessionId = v.lastSessionId;
  return stat;
}

function sanitizeSession(v: unknown): SessionRecord | null {
  if (!isObj(v) || !MODES.includes(v.mode as Mode)) return null;
  const rec: SessionRecord = {
    id: str(v.id, `s${num(v.date)}`, 60),
    date: num(v.date),
    mode: v.mode as Mode,
    total: num(v.total),
    correct: num(v.correct),
  };
  if (isGrade(v.grade)) rec.grade = v.grade;
  if (typeof v.topicId === 'string') rec.topicId = v.topicId;
  return rec;
}

function sanitizeProfile(v: unknown, id: ProfileId): Profile {
  const base = defaultProfile(id);
  if (!isObj(v)) return base;
  const stats: Record<string, WordStat> = {};
  if (isObj(v.stats)) {
    for (const [wordId, s] of Object.entries(v.stats)) {
      const clean = sanitizeStat(s);
      if (clean) stats[wordId] = clean;
    }
  }
  const history = Array.isArray(v.history)
    ? v.history.map(sanitizeSession).filter((s): s is SessionRecord => s !== null).slice(0, 30)
    : [];
  return {
    id,
    name: str(v.name, base.name, 24),
    avatar: typeof v.avatar === 'string' && AVATARS.includes(v.avatar) ? v.avatar : base.avatar,
    color: typeof v.color === 'string' && COLORS.includes(v.color) ? v.color : base.color,
    grade: isGrade(v.grade) ? v.grade : base.grade,
    topicId: str(v.topicId, 'all', 60),
    stats,
    history,
  };
}

/** Приводит неизвестные данные к корректному виду. null — если это не наши данные. */
export function sanitizeData(raw: unknown): AppData | null {
  if (!isObj(raw) || raw.version !== 1 || !isObj(raw.profiles)) return null;
  const profiles = raw.profiles;
  return {
    version: 1,
    profiles: {
      kid1: sanitizeProfile(profiles.kid1, 'kid1'),
      kid2: sanitizeProfile(profiles.kid2, 'kid2'),
    },
    settings: {
      autoSpeak: isObj(raw.settings) && typeof raw.settings.autoSpeak === 'boolean' ? raw.settings.autoSpeak : true,
      voice: isObj(raw.settings) && typeof raw.settings.voice === 'string' ? raw.settings.voice.slice(0, 300) : '',
    },
  };
}

// ───────────── Чтение и запись ─────────────

export interface LoadResult {
  data: AppData;
  warning?: string;
}

export function loadData(storage: KVStorage | null): LoadResult {
  if (!storage) {
    return { data: defaultData(), warning: 'Память браузера недоступна — прогресс не сохранится.' };
  }
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: defaultData(), warning: 'Не удалось прочитать сохранённый прогресс.' };
  }
  if (raw === null) return { data: defaultData() };

  try {
    const data = sanitizeData(JSON.parse(raw));
    if (data) return { data };
  } catch {
    /* повреждённый JSON — обработаем ниже */
  }
  try {
    storage.setItem(`${STORAGE_KEY}:broken-${Date.now()}`, raw);
  } catch {
    /* нет места — пропускаем резервную копию */
  }
  return {
    data: defaultData(),
    warning: 'Сохранённые данные повреждены. Начат новый прогресс, старые данные отложены в резервную копию.',
  };
}

export function saveData(storage: KVStorage | null, data: AppData): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function browserStorage(): KVStorage | null {
  try {
    const s = window.localStorage;
    const probe = `${STORAGE_KEY}:probe`;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

// ───────────── Экспорт и импорт ─────────────

export function exportJson(data: AppData, now = Date.now()): string {
  return JSON.stringify({ app: 'english-kids', exportedAt: new Date(now).toISOString(), data }, null, 2);
}

export function importJson(text: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Файл не похож на резервную копию: это не JSON.');
  }
  const payload = isObj(parsed) && parsed.app === 'english-kids' ? parsed.data : parsed;
  const data = sanitizeData(payload);
  if (!data) throw new Error('В файле нет прогресса English Kids.');
  return data;
}
