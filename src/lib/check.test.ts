import { describe, expect, it } from 'vitest';
import { WORDS, type Word } from '../data/words';
import { checkGaps, checkWritten, makeGaps, normalize } from './check';
import { pickVoice } from './speech';

const word = (en: string, alt: string[] = [], capital = false): Word => ({
  id: `t-${en}`, ru: 'тест', en, alt, grade: 2, topicId: 't', emoji: '', capital,
});

/** Детерминированный генератор для тестов. */
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

describe('normalize', () => {
  it('убирает регистр, лишние пробелы и точку в конце', () => {
    expect(normalize('  Teddy   Bear. ')).toBe('teddy bear');
  });
  it('приводит «умный» апостроф и длинное тире', () => {
    expect(normalize('don’t')).toBe("don't");
    expect(normalize('T—shirt')).toBe('t-shirt');
  });
});

describe('checkWritten — «Напиши слово»', () => {
  const cat = word('cat');
  it('принимает верный ответ без учёта регистра и пробелов', () => {
    expect(checkWritten(cat, 'cat').status).toBe('correct');
    expect(checkWritten(cat, '  CAT ').status).toBe('correct');
    expect(checkWritten(cat, 'Cat').status).toBe('correct');
  });
  it('отклоняет ошибку в написании', () => {
    expect(checkWritten(cat, 'kat').status).toBe('wrong');
    expect(checkWritten(cat, 'cats').status).toBe('wrong');
    expect(checkWritten(cat, 'ca t').status).toBe('wrong');
  });
  it('пустой ответ — не ошибка, а отдельный статус', () => {
    expect(checkWritten(cat, '').status).toBe('empty');
    expect(checkWritten(cat, '   ').status).toBe('empty');
  });
  it('замечает русскую раскладку (в том числе русскую «с» вместо c)', () => {
    expect(checkWritten(cat, 'сat').status).toBe('layout');
    expect(checkWritten(cat, 'кошка').status).toBe('layout');
  });
  it('принимает альтернативы из словаря', () => {
    const grey = word('grey', ['gray']);
    expect(checkWritten(grey, 'gray').status).toBe('correct');
    expect(checkWritten(grey, 'grey').status).toBe('correct');
    expect(checkWritten(grey, 'grai').status).toBe('wrong');
  });
  it('пробел и дефис в составных словах равнозначны', () => {
    const ice = word('ice cream', ['icecream']);
    expect(checkWritten(ice, 'ice-cream').status).toBe('correct');
    expect(checkWritten(ice, 'ice  cream').status).toBe('correct');
    expect(checkWritten(word('T-shirt'), 't shirt').status).toBe('correct');
  });
  it('разрешает артикль или to перед словом', () => {
    expect(checkWritten(cat, 'a cat').status).toBe('correct');
    expect(checkWritten(word('apple'), 'an apple').status).toBe('correct');
    expect(checkWritten(word('swim'), 'to swim').status).toBe('correct');
  });
  it('подсказывает про большую букву, но засчитывает ответ', () => {
    const monday = word('Monday', [], true);
    expect(checkWritten(monday, 'monday')).toEqual({ status: 'correct', capitalHint: true });
    expect(checkWritten(monday, 'Monday')).toEqual({ status: 'correct' });
  });
  it('каждое слово словаря принимает своё основное написание и альтернативы', () => {
    for (const w of WORDS) {
      expect(checkWritten(w, w.en).status).toBe('correct');
      for (const a of w.alt) expect(checkWritten(w, a).status).toBe('correct');
    }
  });
});

describe('makeGaps / checkGaps — «Вставь буквы»', () => {
  it('скрывает буквы по возрастанию и оставляет первую букву', () => {
    for (let seed = 1; seed < 200; seed++) {
      const p = makeGaps('elephant', seeded(seed));
      expect(p.hidden.length).toBe(3);
      expect(p.hidden).toEqual([...p.hidden].sort((a, b) => a - b));
      expect(new Set(p.hidden).size).toBe(p.hidden.length);
      expect(p.hidden).not.toContain(0);
    }
  });
  it('никогда не скрывает пробелы и дефисы', () => {
    for (let seed = 1; seed < 200; seed++) {
      const p = makeGaps('T-shirt teddy', seeded(seed));
      for (const i of p.hidden) expect(p.chars[i]).toMatch(/[a-z]/i);
    }
  });
  it('у коротких слов скрывает одну букву, но не все', () => {
    for (let seed = 1; seed < 50; seed++) {
      expect(makeGaps('ox', seeded(seed)).hidden.length).toBe(1);
      expect(makeGaps('cat', seeded(seed)).hidden.length).toBe(1);
    }
  });
  it('проверяет буквы строго по позициям', () => {
    const p = { chars: Array.from('apple'), hidden: [1, 2] }; // a _ _ l e
    expect(checkGaps(p, ['p', 'p']).status).toBe('correct');
    expect(checkGaps(p, ['P', 'p']).status).toBe('correct');
    expect(checkGaps(p, ['p', 'l'])).toEqual({ status: 'wrong', wrongGaps: [1] });
  });
  it('порядок важен: переставленные буквы — ошибка', () => {
    const p = { chars: Array.from('bird'), hidden: [1, 2] }; // b _ _ d
    expect(checkGaps(p, ['i', 'r']).status).toBe('correct');
    expect(checkGaps(p, ['r', 'i'])).toEqual({ status: 'wrong', wrongGaps: [0, 1] });
  });
  it('пустые клетки и русская раскладка не считаются ошибкой', () => {
    const p = { chars: Array.from('dog'), hidden: [1] };
    expect(checkGaps(p, ['']).status).toBe('empty');
    expect(checkGaps(p, []).status).toBe('empty');
    expect(checkGaps(p, ['о']).status).toBe('layout');
  });
  it('любая головоломка решается буквами из исходного слова', () => {
    for (const w of WORDS) {
      const p = makeGaps(w.en, seeded(w.id.length));
      expect(p.hidden.length).toBeGreaterThan(0);
      expect(checkGaps(p, p.hidden.map((i) => p.chars[i])).status).toBe('correct');
    }
  });
});

describe('выбор голоса для озвучки', () => {
  const v = (lang: string, localService = true) => ({ lang, localService, name: lang }) as SpeechSynthesisVoice;
  it('предпочитает британский, затем американский голос', () => {
    expect(pickVoice([v('ru-RU'), v('en-US'), v('en-GB')])?.lang).toBe('en-GB');
    expect(pickVoice([v('ru-RU'), v('en-US'), v('en-AU')])?.lang).toBe('en-US');
  });
  it('локальный голос важнее сетевого того же языка', () => {
    expect(pickVoice([v('en-GB', false), v('en-GB', true)])?.localService).toBe(true);
  });
  it('без английских голосов возвращает null', () => {
    expect(pickVoice([v('ru-RU'), v('de-DE')])).toBe(null);
    expect(pickVoice([])).toBe(null);
  });
});
