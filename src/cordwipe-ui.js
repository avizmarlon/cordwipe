// Derived from Undiscord, Copyright (c) 2019-2025 Victornpb and contributors.
// https://github.com/victornpb/undiscord - see LICENSE.

import { VERSION } from 'process.env';

import themeCss from './ui/theme.css';
import mainCss from './ui/main.css';
import dragCss from './ui/drag.css';
import buttonHtml from './ui/cordwipe-button.html';
import cordwipeTemplate from './ui/cordwipe.html';

import CordWipeCore from './cordwipe-core.js';
import mountLauncher from './utils/mountLauncher.js';
import Drag from './utils/drag';
import createElm from './utils/createElm';
import insertCss from './utils/insertCss';
import messagePicker from './utils/messagePicker';
import { getAuthorId, getGuildId, getChannelId, fillToken } from './utils/getIds';

import { log, setLogFn } from './utils/log.js';
import { replaceInterpolations } from './utils/helpers';

// -------------------------- User interface ------------------------------- //

// links
const HOME = 'https://github.com/avizmarlon/cordwipe';
const WIKI = HOME + '/blob/main/README.md#how-to-use';

const cordwipeCore = new CordWipeCore();


const ui = {
  cordwipeWindow: null,
  cordwipeBtn: null,
  logArea: null,
  autoScroll: null,

  // progress handler
  progressMain: null,
  progressIcon: null,
  percent: null,
};
const $ = s => ui.cordwipeWindow.querySelector(s);
const hasConsent = () => {
  if ($('#dataConsent').checked) return true;
  log.warn('Allow session and message access in the privacy notice before using CordWipe.');
  return false;
};

function initUI() {
  if (document.getElementById('cordwipe')) return;
  messagePicker.init();

  insertCss(themeCss);
  insertCss(mainCss);
  insertCss(dragCss);

  // create cordwipe window
  const cordwipeUI = replaceInterpolations(cordwipeTemplate, {
    VERSION,
    HOME,
    WIKI,
  });
  ui.cordwipeWindow = createElm(cordwipeUI);
  document.body.appendChild(ui.cordwipeWindow);

  // enable drag and resize on cordwipe window
  new Drag({ elm: ui.cordwipeWindow, moveHandle: $('.header') });

  // create cordwipe Trash icon
  ui.cordwipeBtn = createElm(buttonHtml);
  ui.cordwipeBtn.onclick = toggleWindow;
  mountLauncher(ui.cordwipeBtn, ui.cordwipeWindow);

  function toggleWindow() {
    if (ui.cordwipeWindow.style.display !== 'none') {
      ui.cordwipeWindow.style.display = 'none';
      ui.cordwipeBtn.setAttribute('aria-expanded', 'false');
      ui.cordwipeBtn.focus();

    }
    else {
      ui.cordwipeWindow.style.display = '';
      ui.cordwipeBtn.setAttribute('aria-expanded', 'true');
      $('#hide').focus();

    }
  }

  // cached elements
  ui.logArea = $('#logArea');
  ui.autoScroll = $('#autoScroll');
  ui.progressMain = $('#progressBar');
  ui.progressIcon = ui.cordwipeBtn.querySelector('progress');
  ui.percent = $('#progressPercent');

  // register event listeners
  $('#hide').onclick = toggleWindow;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ui.cordwipeWindow.style.display !== 'none') toggleWindow();
  });
  $('#toggleSidebar').onclick = ()=> ui.cordwipeWindow.classList.toggle('hide-sidebar');
  $('#dataConsent').onchange = () => {
    if (!$('#dataConsent').checked && (cordwipeCore._active || cordwipeCore._batchActive)) cordwipeCore.stop();
  };
  $('button#start').onclick = startAction;
  $('button#stop').onclick = stopAction;
  $('button#clear').onclick = () => ui.logArea.innerHTML = '';
  $('button#getAuthor').onclick = () => {
    if (hasConsent()) $('input#authorId').value = getAuthorId();
  };
  $('button#getGuild').onclick = () => {
    if (!hasConsent()) return;
    const guildId = $('input#guildId').value = getGuildId();
    if (guildId === '@me') $('input#channelId').value = getChannelId();
  };
  $('button#getChannel').onclick = () => {
    if (!hasConsent()) return;
    $('input#channelId').value = getChannelId();
    $('input#guildId').value = getGuildId();
  };
  $('#redact').onchange = () => {
    const b = ui.cordwipeWindow.classList.toggle('redact');
    if (b) alert('This mode will attempt to hide personal information, so you can screen share / take screenshots.\nAlways double check you are not sharing sensitive information!');
  };
  $('#pickMessageAfter').onclick = async () => {
    if (!hasConsent()) return;
    alert('Select the exclusive lower message boundary. Press Escape to cancel.');
    toggleWindow();
    const id = await messagePicker.grab('after');
    if (id) $('input#minId').value = id;
    toggleWindow();
  };
  $('#pickMessageBefore').onclick = async () => {
    if (!hasConsent()) return;
    alert('Select the exclusive upper message boundary. Press Escape to cancel.');
    toggleWindow();
    const id = await messagePicker.grab('before');
    if (id) $('input#maxId').value = id;
    toggleWindow();
  };
  for (const name of ['searchDelay', 'deleteDelay']) {
    const input = $('input#' + name);
    const sync = () => $('div#' + name + 'Value').textContent = input.value + 'ms';
    input.addEventListener('input', sync);
    sync();
  }

  // redirect console logs to inside the window after setting up the UI
  setLogFn(printLog);

  setupCordWipeCore();
}

function printLog(type = '', args) {
  const line = document.createElement('div');
  line.className = 'log log-' + type;
  line.textContent = Array.from(args).join('\t');
  ui.logArea.appendChild(line);
  while (ui.logArea.children.length > 1000) ui.logArea.firstElementChild.remove();
  if (ui.autoScroll.checked) line.scrollIntoView?.(false);
}

function setupCordWipeCore() {

  cordwipeCore.onStart = (state, stats) => {
    for (const control of ui.cordwipeWindow.querySelectorAll('.sidebar input, .sidebar button')) control.disabled = true;
    $('#start').disabled = true;
    $('#stop').disabled = false;

    ui.cordwipeBtn.classList.add('running');
    ui.progressMain.style.display = 'block';
    ui.percent.style.display = 'block';
  };

  cordwipeCore.onProgress = state => {
    // Search totals include skipped hits and shrink during deletion; they are not a denominator.
    ui.percent.textContent = `Scanned: ${state.scannedCount}; deleted: ${state.delCount}; already absent: ${state.missingCount}; failed: ${state.failCount}`;
    ui.progressIcon.removeAttribute('value');
    ui.progressMain.removeAttribute('value');
  };

  cordwipeCore.onStop = (state, stats) => {
    for (const control of ui.cordwipeWindow.querySelectorAll('.sidebar input, .sidebar button')) control.disabled = false;
    ui.percent.textContent = `${state.status}: ${state.delCount} deleted, ${state.missingCount} already absent, ${state.failCount} failed; ${state.skippedCount} skipped`;
    $('#start').disabled = false;
    $('#stop').disabled = true;
    ui.cordwipeBtn.classList.remove('running');
    ui.progressMain.style.display = 'none';
    ui.percent.style.display = 'block';
  };
}

async function startAction() {
  if (cordwipeCore._active || cordwipeCore._batchActive) return;
  if (!hasConsent()) return;
  const read = id => $('#' + id).value.trim();
  const checked = id => $('#' + id).checked;
  const channelIds = [...new Set(read('channelId').split(/\s*,\s*/))];
  if (channelIds.length > 1 && channelIds.some(id => !id)) return log.error('Remove empty Channel IDs.');
  if ((read('minId') || read('maxId')) && (read('minDate') || read('maxDate'))) {
    return log.error('Choose either a message interval or a date interval, not both.');
  }
  const options = {
    authorId: read('authorId'), guildId: read('guildId'),
    channelId: channelIds[0], content: read('search'), pattern: read('pattern'),
    minId: read('minId') || read('minDate'), maxId: read('maxId') || read('maxDate'),
    hasLink: checked('hasLink'), hasFile: checked('hasFile'),
    includePinned: checked('includePinned'), includeNsfw: checked('includeNsfw'),
    searchDelay: Number(read('searchDelay')), deleteDelay: Number(read('deleteDelay')),
  };
  // Validate every target before attempting credential retrieval or network access.
  try {
    for (const channelId of channelIds) cordwipeCore.validate({ ...options, channelId, authToken: 'validation-only' });
  } catch (error) { return log.error(error.message); }
  const authToken = fillToken();
  if (!authToken) return;
  ui.logArea.textContent = '';
  cordwipeCore.resetState();
  cordwipeCore.options = { ...options, authToken };
  try {
    if (channelIds.length > 1) await cordwipeCore.runBatch(channelIds.map(channelId => ({ channelId })));
    else await cordwipeCore.run();
  } catch { log.error('Could not start. Check the selected fields and try again.'); }
  finally { cordwipeCore.options.authToken = null; }
}

function stopAction() {

  cordwipeCore.stop();
}

export default initUI;

// ---- END CordWipe ----
