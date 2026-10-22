import { useRef, useState, type FormEvent } from 'react';
import type { Word } from '../data/words';
import { checkWritten } from '../lib/check';
import { newSessionId } from '../lib/progress';
import type { SessionRecord } from '../lib/storage';
import { Prompt, WriteField } from '../components/Copybook';
import { Notice, ProgressBar, SpeakButton, Stars, TopBar, praise } from '../components/ui';

interface Entry {
  word: Word;
  given: string;
  correct: boolean;
}

export interface DictationProps {
  words: Word[];
  grade: SessionRecord['grade'];
  topicId: string;
  onAnswer: (wordId: string, correct: boolean, sessionId: string) => void;
  onFinish: (record: SessionRecord) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function Dictation(props: DictationProps) {
  const [sessionId] = useState(() => newSessionId());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [text, setText] = useState('');
  const [notice, setNotice] = useState('');
  const lastSubmit = useRef(0);

  const pos = entries.length;
  const word = props.words[pos];
  const finished = pos >= props.words.length;

  const commit = (given: string, correct: boolean) => {
    const now = Date.now();
    // защита от двойного нажатия: один ответ — одна запись
    if (now - lastSubmit.current < 350 || entries.length !== pos || !word) return;
    lastSubmit.current = now;
    props.onAnswer(word.id, correct, sessionId);
    const nextEntries = [...entries, { word, given, correct }];
    setEntries(nextEntries);
    setText('');
    setNotice('');
    if (nextEntries.length === props.words.length) {
      props.onFinish({
        id: sessionId,
        date: now,
        mode: 'dictation',
        grade: props.grade,
        topicId: props.topicId,
        total: nextEntries.length,
        correct: nextEntries.filter((e) => e.correct).length,
      });
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!word) return;
    const res = checkWritten(word, text);
    if (res.status === 'empty') return setNotice('Напиши слово или нажми «Не знаю».');
    if (res.status === 'layout') return setNotice('Переключи клавиатуру на английский язык (EN).');
    commit(text.trim(), res.status === 'correct');
  };

  if (finished) {
    const correct = entries.filter((e) => e.correct).length;
    return (
      <div className="screen">
        <TopBar title="Диктант" onBack={props.onExit} />
        <section className="result">
          <Stars correct={correct} total={entries.length} />
          <p className="result-score">
            {correct} из {entries.length}
          </p>
          <p className="result-text">{praise(correct, entries.length)}</p>
          <div className="table-wrap">
            <table className="dictation-table">
              <thead>
                <tr>
                  <th>Слово</th>
                  <th>Твой ответ</th>
                  <th>Правильно</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.word.id} className={e.correct ? 'ok' : 'bad'}>
                    <td>{e.word.ru}</td>
                    <td className="given">{e.given || '—'}</td>
                    <td className="en">
                      {e.correct ? '✓' : e.word.en} <SpeakButton text={e.word.en} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row">
            <button type="button" className="btn primary" onClick={props.onRestart}>
              Новый диктант
            </button>
            <button type="button" className="btn" onClick={props.onExit}>
              В меню
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar
        title="Диктант"
        onBack={props.onExit}
        right={
          <span className="counter">
            {pos + 1}/{props.words.length}
          </span>
        }
      />
      <ProgressBar value={pos} max={props.words.length} label="Написано слов" />
      <form className="task" onSubmit={onSubmit} autoComplete="off" noValidate>
        <Prompt word={word} />
        <WriteField
          value={text}
          onChange={(v) => {
            setText(v);
            if (notice) setNotice('');
          }}
          readOnly={false}
          state="idle"
          focusKey={`${pos}`}
        />
        {notice && <Notice tone="warn">{notice}</Notice>}
        <button type="submit" className="btn primary big">
          {pos + 1 === props.words.length ? 'Закончить' : 'Дальше'}
        </button>
        <button type="button" className="btn ghost" onClick={() => commit('', false)}>
          Не знаю
        </button>
      </form>
    </div>
  );
}
