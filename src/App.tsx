import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { WORDS, getTopic, wordsFor, type Grade, type Word } from './data/words';
import {
  addSession, patchProfile, pickTrainingWords, recordAnswer, resetProgress, shuffle, troubleWords,
} from './lib/progress';
import { browserStorage, loadData, saveData, type AppData, type ProfileId } from './lib/storage';
import { Home, Menu, type StartChoice } from './screens/Home';
import { Training } from './screens/Training';
import { Dictation } from './screens/Dictation';
import { ProgressScreen } from './screens/ProgressScreen';
import { Parents } from './screens/Parents';
import { Notice } from './components/ui';
import { warmUpSpeech } from './lib/speech';

const SESSION_SIZE = 10;

type Screen =
  | { name: 'home' }
  | { name: 'parents' }
  | { name: 'menu' }
  | { name: 'progress' }
  | { name: 'train'; choice: StartChoice; words: Word[]; run: number };

/** Куда ведёт кнопка «Назад» (и системная кнопка «Назад» на Android). */
const parentOf = (s: Screen): Screen =>
  s.name === 'menu' || s.name === 'parents' || s.name === 'home' ? { name: 'home' } : { name: 'menu' };

const storage = browserStorage();
const initial = loadData(storage);

export default function App() {
  const [data, setData] = useState<AppData>(initial.data);
  const [warning, setWarning] = useState(initial.warning ?? '');
  const [profileId, setProfileId] = useState<ProfileId>('kid1');
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  const dataRef = useRef(data);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  /** Применяет изменение и сразу сохраняет его (после каждого ответа). */
  const update = useCallback((fn: (d: AppData) => AppData) => {
    const next = fn(dataRef.current);
    dataRef.current = next;
    setData(next);
    if (!saveData(storage, next)) {
      setWarning('Не удалось сохранить прогресс: память браузера недоступна или заполнена.');
    }
  }, []);

  useEffect(() => {
    warmUpSpeech();
  }, []);

  // История браузера: системная кнопка «Назад» поднимается на уровень выше, а не закрывает приложение.
  useEffect(() => {
    const onPop = () => setScreen(parentOf(screenRef.current));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const goDeeper = (s: Screen) => {
    window.history.pushState({ ek: true }, '');
    setScreen(s);
  };
  const goBack = () => {
    if (window.history.state?.ek) window.history.back();
    else setScreen(parentOf(screenRef.current));
  };

  const profile = data.profiles[profileId];

  const buildRun = (choice: StartChoice, run: number): Screen => {
    const p = dataRef.current.profiles[profileId];
    const topics = getTopic(p.topicId)?.grade === p.grade ? p.topicId : 'all';
    const pool = wordsFor(p.grade, topics);
    let words: Word[];
    if (choice.kind === 'mistakes') words = troubleWords(p, WORDS).slice(0, SESSION_SIZE);
    else if (choice.kind === 'dictation') words = shuffle(pool).slice(0, choice.count);
    else words = pickTrainingWords(p.stats, pool, SESSION_SIZE);
    return { name: 'train', choice, words: shuffle(words), run };
  };

  const onAnswer = (wordId: string, correct: boolean, sessionId: string) =>
    update((d) => recordAnswer(d, profileId, wordId, correct, sessionId));

  let content: ReactNode = null;
  switch (screen.name) {
    case 'home':
      content = (
        <Home
          data={data}
          onPick={(id) => {
            setProfileId(id);
            goDeeper({ name: 'menu' });
          }}
          onParents={() => goDeeper({ name: 'parents' })}
        />
      );
      break;
    case 'parents':
      content = (
        <Parents
          data={data}
          onPatch={(id, patch) => update((d) => patchProfile(d, id, patch))}
          onReset={(id) => update((d) => resetProgress(d, id))}
          onImport={(imported) => update(() => imported)}
          onAutoSpeak={(autoSpeak) => update((d) => ({ ...d, settings: { ...d.settings, autoSpeak } }))}
          onBack={goBack}
        />
      );
      break;
    case 'menu':
      content = (
        <Menu
          profile={profile}
          onSelect={(grade: Grade, topicId: string) => update((d) => patchProfile(d, profileId, { grade, topicId }))}
          onStart={(choice) => goDeeper(buildRun(choice, Date.now()))}
          onProgress={() => goDeeper({ name: 'progress' })}
          onBack={goBack}
        />
      );
      break;
    case 'progress':
      content = <ProgressScreen profile={profile} onBack={goBack} />;
      break;
    case 'train': {
      const { choice, words, run } = screen;
      const common = {
        words,
        autoSpeak: data.settings.autoSpeak,
        grade: profile.grade,
        topicId: profile.topicId,
        onAnswer,
        onFinish: (rec: Parameters<typeof addSession>[2]) => update((d) => addSession(d, profileId, rec)),
        onRestart: () => setScreen(buildRun(choice, run + 1)),
        onExit: goBack,
      };
      if (choice.kind === 'dictation') {
        content = <Dictation key={run} {...common} />;
      } else if (choice.kind === 'mistakes') {
        content = <Training key={run} {...common} title="Работа над ошибками" input="write" mode="mistakes" grade={undefined} topicId={undefined} />;
      } else {
        const title = choice.kind === 'write' ? 'Напиши слово' : 'Вставь буквы';
        content = <Training key={run} {...common} title={title} input={choice.kind} mode={choice.kind} />;
      }
      break;
    }
  }

  return (
    <div className="app">
      {warning && (
        <div className="banner">
          <Notice tone="warn">{warning}</Notice>
          <button type="button" className="btn ghost small" onClick={() => setWarning('')}>
            Понятно
          </button>
        </div>
      )}
      {content}
    </div>
  );
}
