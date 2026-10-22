import { useRef, useState, type FormEvent } from 'react';
import type { Word } from '../data/words';
import { checkGaps, checkWritten, makeGaps, normalize, type GapPuzzle } from '../lib/check';
import { newSessionId } from '../lib/progress';
import type { Mode, SessionRecord } from '../lib/storage';
import { Answer, GapField, Prompt, WriteField } from '../components/Copybook';
import { Notice, ProgressBar, SpeakButton, Stars, TopBar, praise } from '../components/ui';
import { speak } from '../lib/speech';

interface Item {
  word: Word;
  retry: boolean;
}

interface Feedback {
  correct: boolean;
  capitalHint: boolean;
  wrongGaps: number[] | null;
}

export interface TrainingProps {
  title: string;
  /** Как вводится ответ: целое слово или пропущенные буквы. */
  input: 'write' | 'gaps';
  /** Под каким режимом сохранить тренировку в истории. */
  mode: Mode;
  words: Word[];
  /** Произносить правильное слово сразу после ответа. */
  autoSpeak: boolean;
  grade?: SessionRecord['grade'];
  topicId?: string;
  onAnswer: (wordId: string, correct: boolean, sessionId: string) => void;
  onFinish: (record: SessionRecord) => void;
  onRestart: () => void;
  onExit: () => void;
}

const LAYOUT_MSG = 'Переключи клавиатуру на английский язык (EN) и напиши ещё раз.';

export function Training(props: TrainingProps) {
  const [sessionId] = useState(() => newSessionId());
  const [queue, setQueue] = useState<Item[]>(() => props.words.map((word) => ({ word, retry: false })));
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState<'answer' | 'feedback' | 'done'>('answer');
  const [text, setText] = useState('');
  const [gapValues, setGapValues] = useState<string[]>([]);
  const [puzzle, setPuzzle] = useState<GapPuzzle>(() => makeGaps(props.words[0]?.en ?? ''));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [notice, setNotice] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0, missed: [] as Word[] });

  const firstTry = useRef(new Map<string, boolean>());
  const locked = useRef(false);
  const feedbackAt = useRef(0);

  const item = queue[pos];

  if (!item) {
    return (
      <div className="screen">
        <TopBar title={props.title} onBack={props.onExit} />
        <Notice>{props.mode === 'mistakes' ? 'Трудных слов больше нет. Отличная работа!' : 'В этой теме пока нет слов.'}</Notice>
      </div>
    );
  }

  const submit = () => {
    if (locked.current || phase !== 'answer') return;
    const word = item.word;
    let correct: boolean;
    let capitalHint = false;
    let wrongGaps: number[] | null = null;

    if (props.input === 'write') {
      const res = checkWritten(word, text);
      if (res.status === 'empty') return setNotice('Сначала напиши слово.');
      if (res.status === 'layout') return setNotice(LAYOUT_MSG);
      correct = res.status === 'correct';
      capitalHint = Boolean(res.capitalHint);
    } else {
      const res = checkGaps(puzzle, gapValues);
      if (res.status === 'empty') return setNotice('Заполни все клеточки.');
      if (res.status === 'layout') return setNotice(LAYOUT_MSG);
      correct = res.status === 'correct';
      wrongGaps = res.wrongGaps;
    }

    locked.current = true;
    setNotice('');
    props.onAnswer(word.id, correct, sessionId);
    if (!firstTry.current.has(word.id)) firstTry.current.set(word.id, correct);
    if (!correct && !item.retry) setQueue((q) => [...q, { word, retry: true }]);
    // вызов внутри обработчика нажатия — так озвучка разрешена и на iPhone
    if (props.autoSpeak) speak(word.en);
    setFeedback({ correct, capitalHint, wrongGaps });
    feedbackAt.current = Date.now();
    setPhase('feedback');
  };

  const next = () => {
    if (phase !== 'feedback' || Date.now() - feedbackAt.current < 350) return;
    const nextPos = pos + 1;
    if (nextPos >= queue.length) {
      const entries = [...firstTry.current.entries()];
      const correct = entries.filter(([, ok]) => ok).length;
      const missed = props.words.filter((w) => firstTry.current.get(w.id) === false);
      setScore({ correct, total: entries.length, missed });
      props.onFinish({
        id: sessionId,
        date: Date.now(),
        mode: props.mode,
        grade: props.grade,
        topicId: props.topicId,
        total: entries.length,
        correct,
      });
      setPhase('done');
      return;
    }
    setPos(nextPos);
    setText('');
    setGapValues([]);
    setPuzzle(makeGaps(queue[nextPos].word.en));
    setFeedback(null);
    setPhase('answer');
    locked.current = false;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (phase === 'answer') submit();
    else next();
  };

  if (phase === 'done') {
    return (
      <div className="screen">
        <TopBar title={props.title} onBack={props.onExit} />
        <section className="result">
          <Stars correct={score.correct} total={score.total} />
          <p className="result-score">
            {score.correct} из {score.total} с первой попытки
          </p>
          <p className="result-text">{praise(score.correct, score.total)}</p>
          {score.missed.length > 0 && (
            <div className="result-list">
              <h2>Запомни, как пишется</h2>
              <ul>
                {score.missed.map((w) => (
                  <li key={w.id}>
                    <span className="ru">{w.ru}</span>
                    <span className="en">
                      {w.en} <SpeakButton text={w.en} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="row">
            <button type="button" className="btn primary" onClick={props.onRestart}>
              Ещё раз
            </button>
            <button type="button" className="btn" onClick={props.onExit}>
              В меню
            </button>
          </div>
        </section>
      </div>
    );
  }

  const done = pos + (phase === 'feedback' ? 1 : 0);
  const focusKey = `${pos}`;

  return (
    <div className="screen">
      <TopBar
        title={props.title}
        onBack={props.onExit}
        right={
          <span className="counter">
            {Math.min(pos + 1, queue.length)}/{queue.length}
          </span>
        }
      />
      <ProgressBar value={done} max={queue.length} label="Пройдено слов" />

      <form className="task" onSubmit={onSubmit} autoComplete="off" noValidate>
        {item.retry && <p className="retry-tag">Это слово уже встречалось — попробуй ещё раз</p>}
        <div className="prompt-row">
          <Prompt word={item.word} />
          {/* В «Напиши слово» звук до ответа был бы подсказкой, поэтому кнопка появляется только после проверки. */}
          {(props.input === 'gaps' || feedback) && <SpeakButton text={item.word.en} size="big" />}
        </div>

        {props.input === 'write' ? (
          <WriteField
            value={text}
            onChange={(v) => {
              setText(v);
              if (notice) setNotice('');
            }}
            readOnly={phase === 'feedback'}
            state={feedback ? (feedback.correct ? 'correct' : 'wrong') : 'idle'}
            focusKey={focusKey}
          />
        ) : (
          <GapField
            puzzle={puzzle}
            values={gapValues}
            onChange={(v) => {
              setGapValues(v);
              if (notice) setNotice('');
            }}
            readOnly={phase === 'feedback'}
            wrongGaps={feedback?.wrongGaps ?? null}
            focusKey={focusKey}
          />
        )}

        {notice && <Notice tone="warn">{notice}</Notice>}

        {feedback && (
          <div className={`feedback ${feedback.correct ? 'ok' : 'bad'}`} role="status">
            <strong>{feedback.correct ? 'Верно!' : 'Пока не так'}</strong>
            {feedback.correct && feedback.capitalHint && (
              <span>
                Это слово пишется с большой буквы: <Answer text={item.word.en} />
              </span>
            )}
            {!feedback.correct && (
              <span>
                Правильно: <Answer text={item.word.en} highlight={props.input === 'gaps' ? puzzle.hidden : undefined} />
              </span>
            )}
            {item.word.ipa && <span className="ipa">[{item.word.ipa}]</span>}
            {props.input === 'write' && <Variants word={item.word} given={text} />}
          </div>
        )}

        <button type="submit" className="btn primary big">
          {phase === 'answer' ? 'Проверить' : 'Дальше'}
        </button>
      </form>
    </div>
  );
}

/** Другие допустимые варианты: «Тоже верно: dad, daddy». */
function Variants(props: { word: Word; given: string }) {
  const all = [props.word.en, ...props.word.alt];
  const given = normalize(props.given);
  const others = all.filter((v) => normalize(v) !== given);
  if (props.word.alt.length === 0 || others.length === 0) return null;
  return <span className="variants">Тоже верно: {others.join(', ')}</span>;
}
