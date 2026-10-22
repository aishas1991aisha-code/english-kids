import { describe, expect, it } from 'vitest';
import { recordAnswer } from './progress';
import {
  STORAGE_KEY, defaultData, exportJson, importJson, loadData, saveData, type KVStorage,
} from './storage';

function memoryStorage(initial: Record<string, string> = {}): KVStorage & { map: Map<string, string> } {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

describe('сохранение', () => {
  it('сохраняет и загружает данные обоих профилей отдельно', () => {
    const s = memoryStorage();
    let d = recordAnswer(defaultData(), 'kid1', 'g2-animals-cat', true, 's1');
    d = recordAnswer(d, 'kid2', 'g2-animals-dog', false, 's2');
    expect(saveData(s, d)).toBe(true);
    const { data, warning } = loadData(s);
    expect(warning).toBeUndefined();
    expect(Object.keys(data.profiles.kid1.stats)).toEqual(['g2-animals-cat']);
    expect(Object.keys(data.profiles.kid2.stats)).toEqual(['g2-animals-dog']);
  });
  it('повреждённый JSON не роняет приложение и откладывается в резервную копию', () => {
    const s = memoryStorage({ [STORAGE_KEY]: '{oops' });
    const { data, warning } = loadData(s);
    expect(data).toEqual(defaultData());
    expect(warning).toBeTruthy();
    expect([...s.map.keys()].some((k) => k.includes('broken'))).toBe(true);
  });
  it('чужие или кривые поля заменяются значениями по умолчанию', () => {
    const s = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 1,
        profiles: { kid1: { name: 42, grade: 9, stats: { a: { correct: -1, wrong: 'x' }, b: 'bad' } } },
      }),
    });
    const { data } = loadData(s);
    expect(data.profiles.kid1.name).toBe('Ребёнок 1');
    expect(data.profiles.kid1.grade).toBe(2);
    expect(data.profiles.kid1.stats).toEqual({ a: { correct: 0, wrong: 0, streak: 0, lastSeen: 0 } });
    expect(data.profiles.kid2.name).toBe('Ребёнок 2');
  });
  it('настройки озвучки сохраняются, старые данные без настроек получают значение по умолчанию', () => {
    const s = memoryStorage();
    saveData(s, { ...defaultData(), settings: { autoSpeak: false } });
    expect(loadData(s).data.settings.autoSpeak).toBe(false);
    const old = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ version: 1, profiles: {} }) });
    expect(loadData(old).data.settings.autoSpeak).toBe(true);
  });
  it('если хранилище недоступно — работает без падения', () => {
    const broken: KVStorage = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('quota'); },
      removeItem: () => undefined,
    };
    expect(loadData(broken).data).toEqual(defaultData());
    expect(saveData(broken, defaultData())).toBe(false);
    expect(loadData(null).warning).toBeTruthy();
  });
});

describe('экспорт и импорт', () => {
  it('резервная копия восстанавливается без потерь', () => {
    const d = recordAnswer(defaultData(), 'kid2', 'g3-food-apple', true, 's1', 1000);
    expect(importJson(exportJson(d))).toEqual(d);
  });
  it('понятная ошибка на чужой файл', () => {
    expect(() => importJson('not json')).toThrow(/JSON/);
    expect(() => importJson('{"hello":1}')).toThrow(/English Kids/);
  });
});
