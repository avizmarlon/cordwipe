import initUI from './cordwipe-ui.js';

// Discord can enter channels through SPA navigation from /app or /login.
// Wait for the channel view; never read session data on an entry/login page.
function start() {
  const observer = new MutationObserver(tryInit);
  function tryInit() {
    if (!/^\/channels\/(?:@me|\d+)(?:\/|$)/.test(location.pathname)) return;
    observer.disconnect();
    removeEventListener('popstate', tryInit);
    initUI();
  }
  observer.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('popstate', tryInit);
  tryInit();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
