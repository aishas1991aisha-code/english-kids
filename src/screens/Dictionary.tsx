import { useMemo, useState } from 'react';
import { GRADES, WORDS, topicsOfGrade, type Grade, type Word } from '../data/words';
import { wordStatus } from '../lib/progress';
import type { Profile } from '../lib/storage';
import { SpeakButton, TopBar } from '../components/ui';

const STATUS_LABEL = { learned: 'Выучено', trouble: 'Трудное', learning: 'Изучаю', new: '' } as const;

function matches(w: Word, q: string): boolean {
  return [w.en, w.ru, ...w.alt].some((s) => s.toLowerCase().replace(/ё/g, 'е').includes(q));
}

/** Словарь: английское слово, транскрипция, перевод, варианты и озвучка. */
export function Dictionary(props: { profile: Profile; onBack: () => void }) {
  const { profile } = props;
  const [grade, setGrade] = useState<Grade>(profile.grade);
  const [topicId, setTopicId] = useState('all');
  const [query, setQuery] = useState('');
  const topics = topicsOfGrade(grade);

  const q = query.trim().toLowerCase().replace(/ё/g, 'е');
  const list = useMemo(
    () =>
      q
        ? WORDS.filter((w) => matches(w, q))
        : WORDS.filter((w) => w.grade === grade && (topicId === 'all' || w.topicId === topicId)),
    [q, grade, topicId],
  );

  return (
    <div className="screen" style={{ ['--kid' as string]: profile.color }}>
      <TopBar title="Словарь" onBack={props.onBack} />

      <input
        className="field"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Найти: cat или кошка"
        aria-label="Поиск слова"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
      />

      {!q && (
        <>
          <div className="segmented" role="group" aria-label="Класс">
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                className={grade === g ? 'active' : ''}
                aria-pressed={grade === g}
                onClick={() => {
                  setGrade(g);
                  setTopicId('all');
                }}
              >
                {g} класс
              </button>
            ))}
          </div>
          <div className="chips" role="group" aria-label="Тема">
            {[{ id: 'all', title: 'Все темы', emoji: '📚' }, ...topics].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`chip${topicId === t.id ? ' active' : ''}`}
                aria-pressed={topicId === t.id}
                onClick={() => setTopicId(t.id)}
              >
                <span aria-hidden="true">{t.emoji}</span> {t.title}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="hint">
        {q ? `Найдено слов: ${list.length}` : `Слов: ${list.length}`}. Нажми на динамик, чтобы послушать.
      </p>

      <ul className="dict">
        {list.map((w) => {
          const status = wordStatus(profile.stats[w.id]);
          return (
            <li key={w.id} className="dict-row">
              <span className="dict-emoji" aria-hidden="true">
                {w.emoji}
              </span>
              <div className="dict-main">
                <div className="dict-en">
                  <b>{w.en}</b>
                  {w.ipa && <span className="ipa">[{w.ipa}]</span>}
                </div>
                <div className="dict-ru">{w.ru}</div>
                {w.alt.length > 0 && <div className="variants">Также: {w.alt.join(', ')}</div>}
                {(status === 'learned' || status === 'trouble') && (
                  <span className={`badge ${status}`}>{STATUS_LABEL[status]}</span>
                )}
              </div>
              <SpeakButton text={w.en} />
            </li>
          );
        })}
      </ul>
      {list.length === 0 && <p className="muted">Такого слова в словаре нет.</p>}
    </div>
  );
}
