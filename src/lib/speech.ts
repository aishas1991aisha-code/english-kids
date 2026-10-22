/**
 * Озвучка английских слов через встроенный в браузер синтез речи (Web Speech API).
 * Бесплатно, без внешних сервисов и ключей.
 *
 * Качество зависит от голосов устройства и браузера, поэтому голос выбирается так:
 * 1) голос, который родитель выбрал в настройках;
 * 2) иначе — лучший из доступных: нейросетевые «Natural» (Edge на Windows),
 *    Google UK English (Chrome), улучшенные голоса iPhone; британские — раньше американских.
 * Если сетевой голос не сработал (нет интернета), слово повторяется локальным голосом.
 */

let preferredURI = '';
let listening = false;
const listeners = new Set<() => void>();

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

const isEnglish = (v: SpeechSynthesisVoice) => /^en([-_]|$)/i.test(v.lang);

/** Оценка голоса: чем больше, тем естественнее звучит. */
export function voiceScore(v: SpeechSynthesisVoice): number {
  let s = /^en[-_]gb/i.test(v.lang) ? 4 : /^en[-_]us/i.test(v.lang) ? 2 : 0;
  if (/natural/i.test(v.name)) s += 20; // нейросетевые голоса Microsoft Edge
  if (/google/i.test(v.name)) s += 10; // голоса Google в Chrome и на Android
  if (/premium|enhanced|siri/i.test(v.name)) s += 10; // улучшенные голоса Apple
  if (/^microsoft (david|zira|mark|hazel|george|susan)\b/i.test(v.name) && !/natural/i.test(v.name)) s -= 3;
  if (v.localService) s += 1;
  return s;
}

/** Английские голоса от лучшего к худшему. */
export function englishVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices.filter(isEnglish).sort((a, b) => voiceScore(b) - voiceScore(a));
}

/** Выбранный в настройках голос, иначе лучший английский. */
export function pickVoice(voices: SpeechSynthesisVoice[], preferred = ''): SpeechSynthesisVoice | null {
  const english = englishVoices(voices);
  return english.find((v) => v.voiceURI === preferred) ?? english[0] ?? null;
}

function synthVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return [];
  const synth = window.speechSynthesis;
  if (!listening) {
    listening = true;
    // На Android, в Chrome и Edge список голосов приходит не сразу.
    synth.addEventListener?.('voiceschanged', () => listeners.forEach((fn) => fn()));
  }
  return synth.getVoices();
}

/** Подписка на появление голосов (для списка в настройках). */
export function onVoicesChanged(fn: () => void): () => void {
  synthVoices();
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function availableEnglishVoices(): SpeechSynthesisVoice[] {
  return englishVoices(synthVoices());
}

/** Голос из настроек; пустая строка — выбирать автоматически. */
export function setPreferredVoice(uri: string): void {
  preferredURI = uri;
}

/** Произносит текст по-английски. Возвращает false, если озвучка недоступна. */
export function speak(text: string): boolean {
  if (!speechSupported() || !text.trim()) return false;
  try {
    const synth = window.speechSynthesis;
    const voices = synthVoices();
    const v = pickVoice(voices, preferredURI);
    const say = (voice: SpeechSynthesisVoice | null, fallback: boolean) => {
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? 'en-GB';
      u.rate = /natural|google/i.test(voice?.name ?? '') ? 0.9 : 0.85;
      if (fallback && voice && !voice.localService) {
        // Сетевой голос без интернета молчит — повторяем локальным.
        u.onerror = (e) => {
          if (e.error === 'canceled' || e.error === 'interrupted') return;
          say(englishVoices(voices).find((x) => x.localService) ?? null, false);
        };
      }
      synth.speak(u);
    };
    synth.cancel();
    say(v, true);
    return true;
  } catch {
    return false;
  }
}

/** Прогрев списка голосов при запуске приложения. */
export function warmUpSpeech(): void {
  synthVoices();
}
