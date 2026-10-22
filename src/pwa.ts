import { registerSW } from 'virtual:pwa-register';

/**
 * Регистрация service worker с автообновлением.
 * Новая версия проверяется при запуске и каждый раз, когда приложение снова
 * открывают (возвращаются в него). Если она есть, страница перезагружается сама —
 * не нужно закрывать приложение несколько раз. Прогресс хранится отдельно и не теряется.
 */
export function setupPwa(): void {
  if (!('serviceWorker' in navigator)) return;
  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      const check = () => {
        if (navigator.onLine) registration.update().catch(() => undefined);
      };
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
      window.addEventListener('online', check);
    },
  });
}
