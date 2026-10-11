// My Saved Posts (PRD 11). A list of post slugs in localStorage, nothing sent anywhere.
// Every read and write is wrapped in try/catch so the site works if storage is blocked.

const KEY = 'fp-saved-posts';

export function getSaved(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export function setSaved(list: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(list))));
  } catch {
    /* storage blocked: the page still works, nothing is saved */
  }
  document.dispatchEvent(new CustomEvent('fp:saved-changed'));
}

export function isSaved(slug: string): boolean {
  return getSaved().includes(slug);
}

export function toggleSaved(slug: string): boolean {
  const list = getSaved();
  const i = list.indexOf(slug);
  if (i >= 0) list.splice(i, 1);
  else list.push(slug);
  setSaved(list);
  return i < 0;
}

export function refreshSaveButtons(root: ParentNode = document) {
  const saved = new Set(getSaved());
  root.querySelectorAll<HTMLElement>('[data-save]').forEach((btn) => {
    const on = saved.has(btn.dataset.save || '');
    btn.setAttribute('aria-pressed', String(on));
    const label = btn.querySelector('[data-save-label]');
    if (label) label.textContent = on ? 'Saved' : 'Save';
    const title = btn.dataset.saveTitle || 'this post';
    btn.setAttribute('aria-label', on ? `Remove "${title}" from saved posts` : `Save "${title}"`);
  });
  const n = saved.size;
  document.querySelectorAll<HTMLElement>('[data-saved-count]').forEach((el) => {
    el.textContent = n ? ` (${n})` : '';
  });
}

function init() {
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-save]');
    if (!btn) return;
    e.preventDefault();
    toggleSaved(btn.dataset.save || '');
  });
  document.addEventListener('fp:saved-changed', () => refreshSaveButtons());
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) refreshSaveButtons();
  });
  refreshSaveButtons();
}

init();
