import { GRADES, WORDS, getTopic, topicsOfGrade, wordsFor } from '../data/words';
import { summarize, troubleWords } from '../lib/progress';
import type { Mode, Profile } from '../lib/storage';
import { ProgressBar, SpeakButton, TopBar } from '../components/ui';

const MODE_LABEL: Record<Mode, string> = {
  write: 'Напиши слово',
  gaps: 'Вставь буквы',
  mistakes: 'Работа над ошибками',
  dictation: 'Диктант',
};

const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function ProgressScreen(props: { profile: Profile; onBack: () => void }) {
  const { profile } = props;
  const all = summarize(profile, WORDS);
  const trouble = troubleWords(profile, WORDS).slice(0, 30);

  return (
    <div className="screen" style={{ ['--kid' as string]: profile.color }}>
      <TopBar title={`Прогресс: ${profile.name}`} onBack={props.onBack} />

      <section className="stat-grid" aria-label="Итоги">
        <div className="stat">
          <b>{all.learned}</b>
          <span>выучено</span>
        </div>
        <div className="stat">
          <b>{all.learning}</b>
          <span>изучаю</span>
        </div>
        <div className="stat">
          <b>{all.trouble}</b>
          <span>трудных</span>
        </div>
      </section>
      <p className="hint">Слово считается выученным после трёх верных ответов подряд в разных тренировках.</p>

      {GRADES.map((g) => {
        const s = summarize(profile, wordsFor(g, 'all'));
        return (
          <details key={g} className="grade-block" open={g === profile.grade}>
            <summary>
              <span>{g} класс</span>
              <span className="muted">
                {s.learned} из {s.total}
              </span>
            </summary>
            <ul className="topic-list">
              {topicsOfGrade(g).map((t) => {
                const ts = summarize(profile, wordsFor(g, t.id));
                return (
                  <li key={t.id}>
                    <span className="topic-name">
                      <span aria-hidden="true">{t.emoji}</span> {t.title}
                    </span>
                    <span className="muted">
                      {ts.learned}/{ts.total}
                    </span>
                    <ProgressBar value={ts.learned} max={ts.total} label={t.title} />
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}

      <section className="panel">
        <h2>Трудные слова</h2>
        {trouble.length === 0 ? (
          <p className="muted">Пока нет. Когда ошибёшься в слове, оно появится здесь и вернётся в тренировку.</p>
        ) : (
          <ul className="word-list">
            {trouble.map((w) => (
              <li key={w.id}>
                <span>{w.ru}</span>
                <b>
                  {w.en} <SpeakButton text={w.en} />
                </b>
                <small className="muted">ошибок: {profile.stats[w.id]?.wrong ?? 0}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>Последние тренировки</h2>
        {profile.history.length === 0 ? (
          <p className="muted">Здесь появятся результаты после первой тренировки.</p>
        ) : (
          <ul className="history">
            {profile.history.slice(0, 15).map((h) => (
              <li key={h.id}>
                <span>
                  {MODE_LABEL[h.mode]}
                  {h.topicId && h.topicId !== 'all' && getTopic(h.topicId) ? `, ${getTopic(h.topicId)?.title}` : ''}
                </span>
                <b>
                  {h.correct}/{h.total}
                </b>
                <small className="muted">{dateFmt.format(h.date)}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
