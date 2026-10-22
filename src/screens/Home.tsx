import { useState } from 'react';
import { GRADES, WORDS, topicsOfGrade, wordsFor, type Grade } from '../data/words';
import { summarize, troubleWords } from '../lib/progress';
import { PROFILE_IDS, type AppData, type Profile, type ProfileId } from '../lib/storage';
import { TopBar } from '../components/ui';

export function Home(props: { data: AppData; onPick: (id: ProfileId) => void; onParents: () => void }) {
  return (
    <div className="screen home">
      <div className="home-title" aria-label="English Kids">
        <span className="home-title-line">English</span>
        <span className="home-title-line">Kids</span>
      </div>
      <p className="home-sub">Кто сегодня занимается?</p>
      <div className="profiles">
        {PROFILE_IDS.map((id) => {
          const p = props.data.profiles[id];
          const s = summarize(p, WORDS);
          return (
            <button
              key={id}
              type="button"
              className="profile-card"
              style={{ ['--kid' as string]: p.color }}
              onClick={() => props.onPick(id)}
            >
              <span className="profile-avatar" aria-hidden="true">
                {p.avatar}
              </span>
              <span className="profile-name">{p.name}</span>
              <span className="profile-meta">
                {s.learned > 0 ? `Выучено слов: ${s.learned}` : 'Пора начинать!'}
              </span>
            </button>
          );
        })}
      </div>
      <button type="button" className="btn ghost small" onClick={props.onParents}>
        Для родителей
      </button>
    </div>
  );
}

export type StartChoice =
  | { kind: 'write' | 'gaps' }
  | { kind: 'mistakes' }
  | { kind: 'dictation'; count: number };

export function Menu(props: {
  profile: Profile;
  onSelect: (grade: Grade, topicId: string) => void;
  onStart: (choice: StartChoice) => void;
  onProgress: () => void;
  onDictionary: () => void;
  onBack: () => void;
}) {
  const { profile } = props;
  const [dictation, setDictation] = useState(false);
  const topics = topicsOfGrade(profile.grade);
  const topicId = topics.some((t) => t.id === profile.topicId) ? profile.topicId : 'all';
  const pool = wordsFor(profile.grade, topicId);
  const mistakes = troubleWords(profile, WORDS).length;

  const chip = (id: string, label: string, emoji: string) => {
    const s = summarize(profile, wordsFor(profile.grade, id));
    return (
      <button
        key={id}
        type="button"
        className={`chip${topicId === id ? ' active' : ''}`}
        aria-pressed={topicId === id}
        onClick={() => props.onSelect(profile.grade, id)}
      >
        <span aria-hidden="true">{emoji}</span> {label}
        <small>
          {s.learned}/{s.total}
        </small>
      </button>
    );
  };

  return (
    <div className="screen" style={{ ['--kid' as string]: profile.color }}>
      <TopBar
        title={
          <>
            <span aria-hidden="true">{profile.avatar}</span> {profile.name}
          </>
        }
        onBack={props.onBack}
        backLabel="Сменить ребёнка"
      />

      <div className="segmented" role="group" aria-label="Класс">
        {GRADES.map((g) => (
          <button
            key={g}
            type="button"
            className={profile.grade === g ? 'active' : ''}
            aria-pressed={profile.grade === g}
            onClick={() => props.onSelect(g, 'all')}
          >
            {g} класс
          </button>
        ))}
      </div>

      <div className="chips" role="group" aria-label="Тема">
        {chip('all', 'Все темы', '📚')}
        {topics.map((t) => chip(t.id, t.title, t.emoji))}
      </div>

      <div className="modes">
        <button type="button" className="mode" onClick={() => props.onStart({ kind: 'write' })}>
          <span className="mode-icon" aria-hidden="true">✍️</span>
          <span className="mode-title">Напиши слово</span>
          <span className="mode-desc">Вижу по-русски — пишу по-английски</span>
        </button>
        <button type="button" className="mode" onClick={() => props.onStart({ kind: 'gaps' })}>
          <span className="mode-icon" aria-hidden="true">🔤</span>
          <span className="mode-title">Вставь буквы</span>
          <span className="mode-desc">Допиши пропущенные буквы</span>
        </button>
        <button
          type="button"
          className="mode"
          disabled={mistakes === 0}
          onClick={() => props.onStart({ kind: 'mistakes' })}
        >
          <span className="mode-icon" aria-hidden="true">🔁</span>
          <span className="mode-title">Работа над ошибками</span>
          <span className="mode-desc">
            {mistakes === 0 ? 'Трудных слов пока нет' : `Трудных слов: ${mistakes}`}
          </span>
        </button>
        <button
          type="button"
          className={`mode${dictation ? ' open' : ''}`}
          aria-expanded={dictation}
          onClick={() => setDictation((v) => !v)}
        >
          <span className="mode-icon" aria-hidden="true">📝</span>
          <span className="mode-title">Диктант</span>
          <span className="mode-desc">Без подсказок, ответы — в конце</span>
        </button>
        {dictation && (
          <div className="dictation-pick">
            <span>Сколько слов?</span>
            {[...new Set([10, 15, 20].map((n) => Math.min(n, pool.length)))].map((n) => (
              <button
                key={n}
                type="button"
                className="btn"
                disabled={pool.length === 0}
                onClick={() => props.onStart({ kind: 'dictation', count: n })}
              >
                {n}
              </button>
            ))}
            {pool.length < 20 && <small>Всего слов в теме: {pool.length}</small>}
          </div>
        )}
      </div>

      <div className="row">
        <button type="button" className="btn" onClick={props.onDictionary}>
          <span aria-hidden="true">📖</span>&nbsp;Словарь
        </button>
        <button type="button" className="btn" onClick={props.onProgress}>
          <span aria-hidden="true">📊</span>&nbsp;Мой прогресс
        </button>
      </div>
    </div>
  );
}
