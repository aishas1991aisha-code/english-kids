import { useEffect, useRef } from 'react';
import type { GapPuzzle } from '../lib/check';
import type { Word } from '../data/words';

/** Карточка задания: картинка-эмодзи и русское слово. */
export function Prompt(props: { word: Word }) {
  const { word } = props;
  return (
    <div className="prompt">
      {word.emoji && (
        <span className="prompt-emoji" aria-hidden="true">
          {word.emoji}
        </span>
      )}
      <span className="prompt-ru">{word.ru}</span>
    </div>
  );
}

const inputProps = {
  autoCapitalize: 'none',
  autoCorrect: 'off',
  autoComplete: 'off',
  spellCheck: false,
  lang: 'en',
  inputMode: 'text',
} as const;

/** Поле ответа в виде строки английской прописи (четыре линейки). */
export function WriteField(props: {
  value: string;
  onChange: (v: string) => void;
  readOnly: boolean;
  state: 'idle' | 'correct' | 'wrong';
  focusKey: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [props.focusKey]);

  return (
    <div className={`copybook ${props.state}`}>
      <input
        ref={ref}
        className="copybook-input"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        readOnly={props.readOnly}
        enterKeyHint={props.readOnly ? 'next' : 'done'}
        aria-label="Напиши слово по-английски"
        maxLength={40}
        {...inputProps}
      />
    </div>
  );
}

/** Слово с пропусками: видимые буквы и клетки для недостающих. */
export function GapField(props: {
  puzzle: GapPuzzle;
  values: string[];
  onChange: (values: string[]) => void;
  readOnly: boolean;
  wrongGaps: number[] | null;
  focusKey: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const { puzzle, values } = props;

  useEffect(() => {
    refs.current[0]?.focus({ preventScroll: true });
  }, [props.focusKey]);

  const setAt = (gap: number, raw: string) => {
    const letter = raw.replace(/\s/g, '').slice(-1);
    const next = puzzle.hidden.map((_, i) => (i === gap ? letter : values[i] ?? ''));
    props.onChange(next);
    if (letter && gap + 1 < puzzle.hidden.length) refs.current[gap + 1]?.focus();
  };

  let gapIndex = -1;
  return (
    <div className="copybook gaps" aria-label="Вставь пропущенные буквы">
      {puzzle.chars.map((ch, i) => {
        if (!puzzle.hidden.includes(i)) {
          return (
            <span key={i} className={ch === ' ' ? 'gap-space' : 'gap-letter'}>
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          );
        }
        gapIndex += 1;
        const g = gapIndex;
        const wrong = props.wrongGaps?.includes(g);
        const right = props.wrongGaps !== null && !wrong;
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[g] = el;
            }}
            className={`gap-cell${wrong ? ' wrong' : ''}${right ? ' right' : ''}`}
            value={values[g] ?? ''}
            readOnly={props.readOnly}
            onChange={(e) => setAt(g, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !(values[g] ?? '') && g > 0) {
                e.preventDefault();
                refs.current[g - 1]?.focus();
              }
            }}
            enterKeyHint={g + 1 < puzzle.hidden.length ? 'next' : 'done'}
            aria-label={`Пропуск ${g + 1} из ${puzzle.hidden.length}`}
            size={1}
            {...inputProps}
          />
        );
      })}
    </div>
  );
}

/** Правильное написание; в режиме пропусков недостающие буквы выделены. */
export function Answer(props: { text: string; highlight?: number[] }) {
  return (
    <span className="answer-word">
      {Array.from(props.text).map((ch, i) => (
        <span key={i} className={props.highlight?.includes(i) ? 'hl' : undefined}>
          {ch}
        </span>
      ))}
    </span>
  );
}
