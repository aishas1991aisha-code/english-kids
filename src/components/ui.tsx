import type { ReactNode } from 'react';
import { speak, speechSupported } from '../lib/speech';

export function TopBar(props: { title: ReactNode; onBack?: () => void; backLabel?: string; right?: ReactNode }) {
  return (
    <header className="topbar">
      {props.onBack ? (
        <button type="button" className="topbar-back" onClick={props.onBack} aria-label={props.backLabel ?? 'Назад'}>
          ‹
        </button>
      ) : (
        <span className="topbar-spacer" />
      )}
      <h1 className="topbar-title">{props.title}</h1>
      <div className="topbar-right">{props.right}</div>
    </header>
  );
}

export function ProgressBar(props: { value: number; max: number; label?: string }) {
  const pct = props.max > 0 ? Math.round((props.value / props.max) * 100) : 0;
  return (
    <div
      className="bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={props.max}
      aria-valuenow={props.value}
      aria-label={props.label}
    >
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stars(props: { correct: number; total: number }) {
  const ratio = props.total > 0 ? props.correct / props.total : 0;
  const n = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
  return (
    <div className="stars" aria-label={`${n} из 3 звёзд`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? 'star on' : 'star'}>
          ★
        </span>
      ))}
    </div>
  );
}

export function praise(correct: number, total: number): string {
  const r = total > 0 ? correct / total : 0;
  if (r === 1) return 'Без единой ошибки!';
  if (r >= 0.8) return 'Отлично получилось!';
  if (r >= 0.5) return 'Хорошо! Трудные слова вернутся в следующий раз.';
  return 'Ничего страшного — потренируемся ещё.';
}

export function Notice(props: { children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <p className={`notice ${props.tone ?? 'info'}`} role="status">
      {props.children}
    </p>
  );
}

/** Кнопка «послушать слово». Не забирает фокус у поля ввода, чтобы не закрывалась клавиатура. */
export function SpeakButton(props: { text: string; size?: 'small' | 'big' }) {
  if (!speechSupported()) return null;
  return (
    <button
      type="button"
      className={`speak ${props.size ?? 'small'}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => speak(props.text)}
      aria-label={`Послушать: ${props.text}`}
      title="Послушать"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
