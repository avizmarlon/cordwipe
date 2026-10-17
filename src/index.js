import initUI from './cordwipe-ui.js';

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUI, { once: true });
else initUI();
