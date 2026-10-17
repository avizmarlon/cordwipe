// Selector strategy informed by PurgeCord and Undiscord PR #769.
export function findToolbar(doc = document) {
  const root = doc.querySelector('#app-mount');
  if (!root) return null;
  for (const selector of [
    'section[aria-label="Channel header"] [role="toolbar"]',
    'section[aria-label="Channel header"] [class*="toolbar_"]',
    'section [role="toolbar"]',
    '[class^="toolbar_"], [class*=" toolbar_"], [class^="toolbar-"], [class*="-toolbar"]',
  ]) {
    const toolbar = [...root.querySelectorAll(selector)].find(el => el.getClientRects().length);
    if (toolbar) return toolbar;
  }
  return null;
}

export default function mountLauncher(button, panel) {
  let scheduled = false;
  const mount = () => {
    scheduled = false;
    if (!panel.isConnected) document.body.appendChild(panel);
    const target = findToolbar() || document.body;
    const fallback = target === document.body;
    if (button.classList.contains('cordwipe-floating') !== fallback) button.classList.toggle('cordwipe-floating', fallback);
    if (button.parentElement !== target) target.appendChild(button);
  };
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(mount);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'role', 'aria-label'] });
  mount();
  return () => observer.disconnect();
}
