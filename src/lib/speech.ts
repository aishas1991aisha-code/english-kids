/**
 * Озвучка английских слов через встроенный в браузер синтез речи (Web Speech API).
 * Бесплатно, без внешних сервисов. Используются голоса, установленные на устройстве,
 * поэтому офлайн работают только локальные голоса (на iPhone и большинстве Android они есть).
 */

let cachedVoice: SpeechSynthesisVoice | null = null;
let listening = false;

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** Британский голос в приоритете (как в учебнике), затем американский; локальные — раньше сетевых. */
export function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const score = (v: SpeechSynthesisVoice) =>
    (/^en[-_]gb/i.test(v.lang) ? 4 : /^en[-_]us/i.test(v.lang) ? 2 : 0) + (v.localService ? 1 : 0);
  return english.sort((a, b) => score(b) - score(a))[0] ?? null;
}

function voice(): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  const synth = window.speechSynthesis;
  if (!listening) {
    listening = true;
    // На Android и в Chrome список голосов приходит не сразу.
    synth.addEventListener?.('voiceschanged', () => {
      cachedVoice = pickVoice(synth.getVoices());
    });
  }
  if (!cachedVoice) cachedVoice = pickVoice(synth.getVoices());
  return cachedVoice;
}

/** Произносит текст по-английски. Возвращает false, если озвучка недоступна. */
export function speak(text: string): boolean {
  if (!speechSupported() || !text.trim()) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voice();
    if (v) u.voice = v;
    u.lang = v?.lang ?? 'en-GB';
    u.rate = 0.85;
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

/** Прогрев списка голосов при запуске приложения. */
export function warmUpSpeech(): void {
  voice();
}
