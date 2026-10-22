import type { Word } from '../data/words';

export type CheckStatus = 'correct' | 'wrong' | 'empty' | 'layout';

export interface CheckResult {
  status: CheckStatus;
  /** Ответ верный, но слово пишется с большой буквы (Monday, January). */
  capitalHint?: boolean;
}

const CYRILLIC = /[а-яё]/i;

/** Убирает регистр, лишние пробелы, «умные» апострофы и разные виды дефисов. */
export function normalize(input: string): string {
  return input
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\u2018\u2019\u0060\u00b4]/g, "'")
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?,;:]+$/, '')
    .trim();
}

/** Сравнительная форма: дефис = пробел, необязательные a / an / the / to в начале. */
function comparable(input: string): string {
  return normalize(input)
    .replace(/\s*-\s*/g, ' ')
    .replace(/^(a|an|the|to) (?=\S)/, '');
}

export function acceptedAnswers(word: Word): string[] {
  return [word.en, ...word.alt];
}

/** Проверка режима «Напиши слово» и диктанта. */
export function checkWritten(word: Word, input: string): CheckResult {
  const raw = input.trim();
  if (raw === '') return { status: 'empty' };
  if (CYRILLIC.test(raw)) return { status: 'layout' };

  const answer = comparable(raw);
  const ok = acceptedAnswers(word).some((a) => comparable(a) === answer);
  if (!ok) return { status: 'wrong' };

  const capitalHint = word.capital && raw.replace(/^(a|an|the|to)\s+/i, '')[0] !== word.en[0];
  return capitalHint ? { status: 'correct', capitalHint: true } : { status: 'correct' };
}

// ───────────── Режим «Вставь буквы» ─────────────

export interface GapPuzzle {
  /** Все символы слова в исходном порядке. */
  chars: string[];
  /** Индексы скрытых букв по возрастанию. */
  hidden: number[];
}

export type Rng = () => number;

function gapCount(letters: number): number {
  if (letters <= 1) return 1;
  if (letters <= 3) return 1;
  if (letters <= 5) return 2;
  if (letters <= 8) return 3;
  return 4;
}

/** Скрывает несколько букв. Первая буква по возможности остаётся видимой. */
export function makeGaps(word: string, rng: Rng = Math.random): GapPuzzle {
  const chars = Array.from(word);
  const letters = chars.flatMap((c, i) => (/[a-z]/i.test(c) ? [i] : []));
  if (letters.length === 0) return { chars, hidden: [] };

  const count = Math.min(gapCount(letters.length), Math.max(1, letters.length - 1));
  const candidates = letters.length > count + 1 ? letters.slice(1) : letters.slice();

  const hidden: number[] = [];
  while (hidden.length < count && candidates.length > 0) {
    const k = Math.floor(rng() * candidates.length) % candidates.length;
    hidden.push(candidates.splice(k, 1)[0]);
  }
  hidden.sort((a, b) => a - b);
  return { chars, hidden };
}

export interface GapResult {
  status: CheckStatus;
  /** Номера пропусков (0, 1, 2…), заполненных неверно. */
  wrongGaps: number[];
}

/** inputs[i] — буква, введённая в i-й пропуск (слева направо). */
export function checkGaps(puzzle: GapPuzzle, inputs: string[]): GapResult {
  const values = puzzle.hidden.map((_, i) => (inputs[i] ?? '').trim());
  if (values.some((v) => v === '')) return { status: 'empty', wrongGaps: [] };
  if (values.some((v) => CYRILLIC.test(v))) return { status: 'layout', wrongGaps: [] };

  const wrongGaps = puzzle.hidden.flatMap((pos, i) =>
    values[i].toLowerCase() === puzzle.chars[pos].toLowerCase() ? [] : [i],
  );
  return { status: wrongGaps.length === 0 ? 'correct' : 'wrong', wrongGaps };
}
