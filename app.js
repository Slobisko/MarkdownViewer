const { call, on, pathOf } = window.bridge;
const $ = s => document.querySelector(s);
const main = $('main');
let tabs = [];   // { path, text, scroll }
let active = -1;
let theme = 'light';

const save = () => call('saveState', { files: tabs.map(t => t.path), active: tabs[active]?.path, theme });
const fileName = p => p.split(/[\\/]/).pop();

async function open(paths) {
  for (const path of paths) {
    const i = tabs.findIndex(t => t.path.toLowerCase() === path.toLowerCase());
    if (i >= 0) { select(i); continue; }
    try { tabs.push({ path, text: await call('read', path) }); select(tabs.length - 1); } catch { /* missing file: skip */ }
  }
  render();
}

function select(i) {
  if (tabs[active]) tabs[active].scroll = main.scrollTop;
  active = i;
  render();
}

function close(i) {
  tabs.splice(i, 1);
  if (i < active || active === tabs.length) active--;
  render();
}

async function reload() {
  const t = tabs[active];
  if (!t) return;
  try { t.text = await call('read', t.path); t.scroll = main.scrollTop; render(); } catch { /* deleted meanwhile */ }
}

function render() {
  $('#tabs').replaceChildren(...tabs.map((t, i) => {
    const el = document.createElement('div');
    el.className = 'tab' + (i === active ? ' active' : '');
    el.title = t.path;
    el.innerHTML = '<span></span><button title="Zavřít (Ctrl+W)">×</button>';
    el.firstChild.textContent = fileName(t.path);
    el.onclick = () => select(i);
    el.onauxclick = e => e.button === 1 && close(i);
    el.lastChild.onclick = e => { e.stopPropagation(); close(i); };
    return el;
  }));
  const t = tabs[active];
  $('base').href = t ? 'file:///' + encodeURI(t.path.replace(/\\/g, '/')) : '';  // relative images/links
  $('#content').innerHTML = t ? marked.parse(t.text)
    : '<p class="empty">Otevřete soubor přes <b>+</b> nebo <kbd>Ctrl+O</kbd>, případně ho sem přetáhněte.</p>';
  main.scrollTop = t?.scroll || 0;
  document.title = t ? `${fileName(t.path)} – Markdown Viewer` : 'Markdown Viewer';
  save();
}

// Links: .md opens in a new tab, everything else in the default app/browser.
$('#content').onclick = e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  e.preventDefault();
  const href = a.getAttribute('href');
  if (href.startsWith('#')) return document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView();
  if (a.protocol === 'file:' && /\.(md|markdown)$/i.test(a.pathname)) return open([decodeURIComponent(a.pathname.slice(1)).replace(/\//g, '\\')]);
  call('openExternal', a.href);
};

const pick = async () => open(await call('pick'));
$('#openBtn').onclick = pick;
$('#theme').onclick = () => { theme = theme === 'dark' ? 'light' : 'dark'; call('setTheme', theme); save(); };

const shortcuts = {
  o: pick,
  w: () => active >= 0 && close(active),
  Tab: e => tabs.length && select((active + (e.shiftKey ? -1 : 1) + tabs.length) % tabs.length),
};
onkeydown = e => {
  const fn = e.ctrlKey ? shortcuts[e.key] : e.key === 'F5' && reload;
  if (fn) { e.preventDefault(); fn(e); }
};
onfocus = reload;
ondragover = e => e.preventDefault();
ondrop = e => { e.preventDefault(); open([...e.dataTransfer.files].map(pathOf)); };
on('open', open);

(async () => {
  const s = await call('loadState');
  theme = s.theme === 'dark' ? 'dark' : 'light';
  await open([...(s.files || []), s.active].filter(Boolean));
  await open(await call('argFiles'));
})();
