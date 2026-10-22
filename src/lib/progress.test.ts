import { describe, expect, it } from 'vitest';
import { WORDS, type Word } from '../data/words';
import {
  LEARNED_STREAK, addSession, patchProfile, pickTrainingWords, recordAnswer, resetProgress, wordStatus,
} from './progress';
import { defaultData, type WordStat } from './storage';

const W = (id: string): Word => ({ id, ru: id, en: id, alt: [], grade: 2, topicId: 't', emoji: '', ipa: '', capital: false });

describe('изоляция профилей', () => {
  it('ответ одного ребёнка не меняет данные другого', () => {
    const before = defaultData();
    const after = recordAnswer(before, 'kid1', 'g2-animals-cat', true, 's1');
    expect(after.profiles.kid1.stats['g2-animals-cat'].correct).toBe(1);
    expect(after.profiles.kid2.stats).toEqual({});
    expect(after.profiles.kid2).toBe(before.profiles.kid2);
  });
  it('история, имя и сброс касаются только выбранного профиля', () => {
    let d = defaultData();
    d = recordAnswer(d, 'kid1', 'a', true, 's1');
    d = recordAnswer(d, 'kid2', 'a', false, 's2');
    d = addSession(d, 'kid2', { id: 's2', date: 1, mode: 'write', total: 1, correct: 0 });
    d = patchProfile(d, 'kid1', { name: 'Маша' });
    d = resetProgress(d, 'kid1');
    expect(d.profiles.kid1.name).toBe('Маша');
    expect(d.profiles.kid1.stats).toEqual({});
    expect(d.profiles.kid2.name).toBe('Ребёнок 2');
    expect(d.profiles.kid2.stats.a.wrong).toBe(1);
    expect(d.profiles.kid2.history).toHaveLength(1);
    expect(d.profiles.kid1.history).toHaveLength(0);
  });
  it('исходный объект не изменяется (без мутаций)', () => {
    const d = defaultData();
    const snapshot = JSON.stringify(d);
    recordAnswer(d, 'kid1', 'x', false, 's');
    expect(JSON.stringify(d)).toBe(snapshot);
  });
});

describe('выучено ли слово', () => {
  it('одного верного ответа недостаточно', () => {
    const d = recordAnswer(defaultData(), 'kid1', 'cat', true, 's1');
    expect(wordStatus(d.profiles.kid1.stats.cat)).toBe('learning');
  });
  it(`выучено после ${LEARNED_STREAK} верных ответов в разных тренировках`, () => {
    let d = defaultData();
    for (let i = 1; i <= LEARNED_STREAK; i++) d = recordAnswer(d, 'kid1', 'cat', true, `s${i}`);
    expect(wordStatus(d.profiles.kid1.stats.cat)).toBe('learned');
  });
  it('повторы в одной тренировке не накручивают серию', () => {
    let d = defaultData();
    for (let i = 0; i < 5; i++) d = recordAnswer(d, 'kid1', 'cat', true, 'same');
    expect(d.profiles.kid1.stats.cat.streak).toBe(1);
  });
  it('ошибка сбрасывает серию и делает слово трудным', () => {
    let d = defaultData();
    d = recordAnswer(d, 'kid1', 'cat', true, 's1');
    d = recordAnswer(d, 'kid1', 'cat', true, 's2');
    d = recordAnswer(d, 'kid1', 'cat', false, 's3');
    d = recordAnswer(d, 'kid1', 'cat', true, 's3'); // исправился в той же тренировке
    const st = d.profiles.kid1.stats.cat;
    expect(st.streak).toBe(0);
    expect(wordStatus(st)).toBe('trouble');
  });
});

describe('подбор слов для тренировки', () => {
  const pool = Array.from({ length: 20 }, (_, i) => W(`w${i}`));
  const stats: Record<string, WordStat> = {
    w0: { correct: 0, wrong: 3, streak: 0, lastSeen: 1 },
    w1: { correct: 1, wrong: 1, streak: 0, lastSeen: 1 },
    w2: { correct: 5, wrong: 0, streak: 5, lastSeen: 1 },
  };
  it('трудные слова возвращаются в тренировку', () => {
    for (let i = 0; i < 30; i++) {
      const ids = pickTrainingWords(stats, pool, 10).map((w) => w.id);
      expect(ids).toContain('w0');
      expect(ids).toContain('w1');
      expect(new Set(ids).size).toBe(10);
    }
  });
  it('выученные слова идут последними', () => {
    const ids = pickTrainingWords(stats, pool, 10).map((w) => w.id);
    expect(ids).not.toContain('w2');
  });
  it('не берёт больше слов, чем есть в теме', () => {
    expect(pickTrainingWords({}, pool.slice(0, 4), 10)).toHaveLength(4);
  });
});

describe('словарь', () => {
  it('ID уникальны', () => {
    expect(new Set(WORDS.map((w) => w.id)).size).toBe(WORDS.length);
  });
  it('английские написания содержат только латиницу, пробел, дефис', () => {
    for (const w of WORDS) {
      for (const s of [w.en, ...w.alt]) expect(s).toMatch(/^[A-Za-z]+([ -][A-Za-z]+)*$/);
      expect(w.ru).toMatch(/[а-яё]/i);
    }
  });
  it('у каждого слова есть транскрипция без русских букв', () => {
    for (const w of WORDS) {
      expect(w.ipa.length).toBeGreaterThan(0);
      expect(/[а-яё]/i.test(w.ipa)).toBe(false);
    }
  });
  it('одно русское задание не ведёт к двум разным словам', () => {
    const seen = new Map<string, string>();
    for (const w of WORDS) {
      expect(seen.get(w.ru) === undefined || seen.get(w.ru) === w.en).toBe(true);
      seen.set(w.ru, w.en);
    }
  });
  it('в каждом классе есть слова', () => {
    for (const g of [2, 3, 4]) expect(WORDS.some((w) => w.grade === g)).toBe(true);
  });
});
