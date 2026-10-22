import { useState, type ChangeEvent } from 'react';
import { WORDS } from '../data/words';
import {
  AVATARS, COLORS, PROFILE_IDS, exportJson, importJson, type AppData, type Profile, type ProfileId,
} from '../lib/storage';
import { Notice, TopBar } from '../components/ui';
import { speak, speechSupported } from '../lib/speech';

type Patch = Partial<Pick<Profile, 'name' | 'avatar' | 'color'>>;

export interface ParentsProps {
  data: AppData;
  onPatch: (id: ProfileId, patch: Patch) => void;
  onReset: (id: ProfileId) => void;
  onImport: (data: AppData) => void;
  onAutoSpeak: (on: boolean) => void;
  onBack: () => void;
}

/** Простая «родительская дверца», чтобы ребёнок случайно не сбросил прогресс. */
function Gate(props: { onPass: () => void; onBack: () => void }) {
  const [[a, b]] = useState(() => [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)]);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  return (
    <div className="screen">
      <TopBar title="Для родителей" onBack={props.onBack} />
      <form
        className="panel gate"
        onSubmit={(e) => {
          e.preventDefault();
          if (Number(value) === a * b) props.onPass();
          else setWrong(true);
        }}
      >
        <label htmlFor="gate">
          Сколько будет {a} × {b}?
        </label>
        <input
          id="gate"
          className="field"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setWrong(false);
          }}
        />
        {wrong && <Notice tone="warn">Неверно, попробуйте ещё раз.</Notice>}
        <button type="submit" className="btn primary">
          Открыть
        </button>
      </form>
    </div>
  );
}

function backupName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `english-kids-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}

async function saveBackup(text: string): Promise<string> {
  const name = backupName();
  const file = new File([text], name, { type: 'application/json' });
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
  if (mobile && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'English Kids: резервная копия' });
      return 'Резервная копия готова. Сохраните файл в «Файлы» или на Диск.';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return '';
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return `Файл ${name} сохранён в загрузки.`;
}

export function Parents(props: ParentsProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!open) return <Gate onPass={() => setOpen(true)} onBack={props.onBack} />;

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setMessage('');
    setError('');
    if (!file) return;
    try {
      if (file.size > 5_000_000) throw new Error('Файл слишком большой для резервной копии.');
      const data = importJson(await file.text());
      if (!window.confirm('Заменить текущий прогресс обоих детей данными из файла?')) return;
      props.onImport(data);
      setMessage('Прогресс восстановлен из резервной копии.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось прочитать файл.');
    }
  };

  return (
    <div className="screen">
      <TopBar title="Для родителей" onBack={props.onBack} />

      {PROFILE_IDS.map((id) => {
        const p = props.data.profiles[id];
        return (
          <section key={id} className="panel" style={{ ['--kid' as string]: p.color }}>
            <label className="label" htmlFor={`name-${id}`}>
              Имя
            </label>
            <input
              key={p.name}
              id={`name-${id}`}
              className="field"
              defaultValue={p.name}
              maxLength={24}
              autoComplete="off"
              onBlur={(e) => {
                const name = e.target.value.trim();
                if (name && name !== p.name) props.onPatch(id, { name });
                else e.target.value = p.name;
              }}
            />
            <div className="label">Значок</div>
            <div className="pick-row">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`pick${p.avatar === a ? ' active' : ''}`}
                  aria-pressed={p.avatar === a}
                  onClick={() => props.onPatch(id, { avatar: a })}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="label">Цвет</div>
            <div className="pick-row">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`pick swatch${p.color === c ? ' active' : ''}`}
                  aria-pressed={p.color === c}
                  aria-label={`Цвет ${c}`}
                  style={{ background: c }}
                  onClick={() => props.onPatch(id, { color: c })}
                />
              ))}
            </div>
            <button
              type="button"
              className="btn danger small"
              onClick={() => {
                if (window.confirm(`Удалить весь прогресс профиля «${p.name}»? Это нельзя отменить.`)) {
                  props.onReset(id);
                  setMessage(`Прогресс профиля «${p.name}» сброшен.`);
                }
              }}
            >
              Сбросить прогресс
            </button>
          </section>
        );
      })}

      <section className="panel">
        <h2>Озвучка</h2>
        {speechSupported() ? (
          <>
            <label className="toggle">
              <input
                type="checkbox"
                checked={props.data.settings.autoSpeak}
                onChange={(e) => props.onAutoSpeak(e.target.checked)}
              />
              <span>Произносить слово после ответа</span>
            </label>
            <p className="muted">
              Кнопка с динамиком есть всегда: в «Вставь буквы», после проверки, в результатах и в прогрессе. В «Напиши
              слово» и в диктанте звук до ответа не включается, чтобы не подсказывать.
            </p>
            <button type="button" className="btn small" onClick={() => speak('Hello! Let’s learn English.')}>
              Проверить звук
            </button>
            <p className="muted">
              Если звука нет: проверьте громкость и беззвучный режим. На Android может понадобиться английский голос в
              настройках «Синтез речи».
            </p>
          </>
        ) : (
          <p className="muted">Этот браузер не умеет озвучивать слова. Попробуйте Chrome или Safari.</p>
        )}
      </section>

      <section className="panel">
        <h2>Резервная копия</h2>
        <p className="muted">
          Прогресс хранится только на этом устройстве. Сохраните копию в файл, чтобы перенести её на другое
          устройство или не потерять при очистке браузера.
        </p>
        <div className="row">
          <button
            type="button"
            className="btn primary"
            onClick={async () => {
              setError('');
              setMessage(await saveBackup(exportJson(props.data)));
            }}
          >
            Сохранить в файл
          </button>
          <label className="btn">
            Загрузить из файла
            <input type="file" accept="application/json,.json" hidden onChange={onFile} />
          </label>
        </div>
        {message && <Notice>{message}</Notice>}
        {error && <Notice tone="warn">{error}</Notice>}
      </section>

      <section className="panel">
        <h2>О приложении</h2>
        <p className="muted">
          В словаре {WORDS.length} слов по темам 2, 3 и начала 4 класса. Подбор ориентирован на уровень учебников
          «Enjoy English» (М. З. Биболетова), но это не полная и не официальная копия учебника.
        </p>
        <p className="muted">
          Приложение не собирает личные данные, не показывает рекламу и работает без интернета. Имена детей
          хранятся только в браузере этого устройства.
        </p>
      </section>
    </div>
  );
}
